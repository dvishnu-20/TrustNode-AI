from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.models.telemetry import TelemetryEvent
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])

@router.post("")
async def receive_telemetry(event: TelemetryEvent) -> Dict[str, Any]:
    """
    Receives behavioral telemetry events from the frontend checkout page.
    """
    try:
        # Pass to risk engine to evaluate
        risk_result = risk_engine.evaluate(event)
        
        # In a real app we'd save this to DB here asynchronously
        return {"status": "received", "event_id": event.session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
