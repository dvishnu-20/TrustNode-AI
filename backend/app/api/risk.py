from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.risk_engine import risk_engine
from app.database.connection import SessionLocal
from app.database.models import CheckoutSession, Device

router = APIRouter(prefix="/api/v1", tags=["risk"])

@router.get("/risk/{session_id}")
async def get_session_risk(session_id: str) -> Dict[str, Any]:
    """
    Returns the current risk assessment for a given session.
    """
    # Fetch from risk engine memory/cache
    if session_id in risk_engine.session_profiles:
        profile = risk_engine.session_profiles[session_id]
        score = profile.risk_score
        
        from app.services.policy_engine import get_decision
        decision = get_decision(score=score, reasons=[])
        
        return {
            "session_id": session_id,
            "risk_score": score,
            "zone": decision.zone,
            "action": decision.action
        }
        
    # fallback to DB
    db = SessionLocal()
    try:
        db_session = db.query(CheckoutSession).filter(CheckoutSession.session_ref == session_id).first()
        if db_session and db_session.final_risk_score is not None:
            return {
                "session_id": session_id,
                "risk_score": db_session.final_risk_score,
                "zone": db_session.risk_zone,
                "action": db_session.final_action
            }
        raise HTTPException(status_code=404, detail="Session not found or no risk score")
    finally:
        db.close()

@router.get("/device-risk/{device_id}")
async def get_device_risk(device_id: str) -> Dict[str, Any]:
    """
    Returns the risk assessment for a specific device.
    """
    db = SessionLocal()
    try:
        device = db.query(Device).filter(Device.device_ref == device_id).first()
        if not device:
            return {"device_id": device_id, "risk_score": 0, "status": "new"}
            
        return {
            "device_id": device_id,
            "risk_score": device.risk_score,
            "history": {
                "total_orders": device.total_orders,
                "failed_payments": device.failed_payments,
                "cod_orders": device.cod_orders,
                "cod_returns": device.cod_returns
            }
        }
    finally:
        db.close()
