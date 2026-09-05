from pydantic import BaseModel
from typing import List

class RiskDecision(BaseModel):
    risk_score: int
    zone: str  # "GREEN", "YELLOW", "RED"
    action: str  # "ALLOW_ALL", "RESTRICT_CARD", "REQUIRE_COD_DEPOSIT"
    reasons: List[str]
