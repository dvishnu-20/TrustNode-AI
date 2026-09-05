from app.models.risk import RiskDecision

def get_decision(score: int, reasons: list, payment_method: str = None, rto_probability: float = 0.0) -> RiskDecision:
    zone = "GREEN"
    action = "ALLOW_ALL"
    
    if score >= 75:
        zone = "RED"
        if payment_method == "cod" or rto_probability > 0.5:
            action = "REQUIRE_COD_DEPOSIT"
        else:
            action = "RESTRICT_CARD"
    elif score >= 40:
        zone = "YELLOW"
        action = "RESTRICT_CARD"
        
    return RiskDecision(
        risk_score=score,
        zone=zone,
        action=action,
        reasons=reasons
    )
