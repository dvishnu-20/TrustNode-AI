from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

from app.models.telemetry import TelemetryEvent
from app.services.risk_engine import risk_engine
from app.services.policy_engine import get_decision

router = APIRouter()

# Keep track of connected clients
class ConnectionManager:
    def __init__(self):
        self.checkout_clients: Dict[str, WebSocket] = {}
        self.dashboard_clients: List[WebSocket] = []

    async def connect_checkout(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.checkout_clients[session_id] = websocket

    def disconnect_checkout(self, session_id: str):
        if session_id in self.checkout_clients:
            del self.checkout_clients[session_id]

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_clients.append(websocket)

    def disconnect_dashboard(self, websocket: WebSocket):
        if websocket in self.dashboard_clients:
            self.dashboard_clients.remove(websocket)

    async def broadcast_to_dashboards(self, message: dict):
        for connection in self.dashboard_clients:
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def send_to_checkout(self, session_id: str, message: dict):
        if session_id in self.checkout_clients:
            try:
                await self.checkout_clients[session_id].send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/checkout/{session_id}")
async def websocket_checkout_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect_checkout(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            event_dict = json.loads(data)
            
            # The client might just be sending a ping
            if event_dict.get("type") == "ping":
                continue
                
            try:
                event = TelemetryEvent(**event_dict)
            except Exception as e:
                print("Invalid event:", e)
                continue

            # Process event through risk engine
            risk_result = risk_engine.evaluate(event)
            
            # Predict RTO
            from app.services.rto_predictor import rto_predictor
            from app.adapters.thirdwatch import thirdwatch_adapter
            
            rto_res = rto_predictor.predict({
                "risk_score": risk_result["score"],
                "device_risk": risk_result.get("components", {}).get("device_score", 0),
                "previous_orders": 0,
                "previous_rtos": 0,
                "order_value": 2999
            })
            
            # Thirdwatch
            tw_res = thirdwatch_adapter.mock_fetch(session_id)
            if tw_res["risk_score"] > 70:
                risk_result["reasons"].append("Thirdwatch flagged high risk")
            
            # Get policy decision
            decision = get_decision(
                score=risk_result["score"], 
                reasons=risk_result["reasons"],
                payment_method=event_dict.get("payment_method"),
                rto_probability=rto_res["rto_probability"]
            )
            
            # Save final action and zone to database
            from app.database.connection import SessionLocal
            from app.database.models import CheckoutSession
            db = SessionLocal()
            try:
                db_session = db.query(CheckoutSession).filter(CheckoutSession.session_ref == session_id).first()
                if not db_session:
                    db_session = CheckoutSession(session_ref=session_id)
                    db.add(db_session)
                
                db_session.final_action = decision.action
                db_session.risk_zone = decision.zone
                db_session.final_risk_score = decision.risk_score
                db.commit()
            finally:
                db.close()
            
            response = decision.dict()
            response["session_id"] = session_id

            # Send back to checkout
            await manager.send_to_checkout(session_id, response)
            
            # Broadcast to all dashboards
            await manager.broadcast_to_dashboards({
                "type": "risk_update",
                "data": response
            })
            
    except WebSocketDisconnect:
        manager.disconnect_checkout(session_id)
        # Notify dashboards that session ended
        await manager.broadcast_to_dashboards({
            "type": "session_end",
            "session_id": session_id
        })

@router.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    await manager.connect_dashboard(websocket)
    
    # Send current state of all sessions from DB
    from app.database.connection import SessionLocal
    from app.database.models import CheckoutSession
    
    initial_state = []
    db = SessionLocal()
    try:
        sessions = db.query(CheckoutSession).order_by(CheckoutSession.id.desc()).limit(20).all()
        for s in sessions:
            if s.final_risk_score is not None:
                decision = get_decision(score=s.final_risk_score, reasons=[])
                state = decision.dict()
                state["session_id"] = s.session_ref
                initial_state.append(state)
    finally:
        db.close()
        
    await websocket.send_json({"type": "initial_state", "data": initial_state})
    
    try:
        while True:
            data = await websocket.receive_text() # keep connection open
    except WebSocketDisconnect:
        manager.disconnect_dashboard(websocket)
