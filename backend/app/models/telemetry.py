from pydantic import BaseModel
from typing import Optional, List, Dict

class TelemetryEvent(BaseModel):
    session_id: str
    event_type: str  # "paste", "keydown", "click", "focus", "blur", "page_load", "submit"
    field: Optional[str] = None
    timestamp: float
    duration: Optional[float] = None
    value_length: Optional[int] = None
