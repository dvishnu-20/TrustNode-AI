from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.database.connection import get_db
from app.database.models import CheckoutSession, Order, FrictionAction

router = APIRouter()

@router.get("/api/v1/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_sessions = db.query(CheckoutSession).count()
    
    # Risk Distribution
    green_count = db.query(CheckoutSession).filter(CheckoutSession.final_risk_score < 40).count()
    yellow_count = db.query(CheckoutSession).filter(CheckoutSession.final_risk_score >= 40, CheckoutSession.final_risk_score < 75).count()
    red_count = db.query(CheckoutSession).filter(CheckoutSession.final_risk_score >= 75).count()
    
    # Friction Actions
    friction_count = db.query(CheckoutSession).filter(CheckoutSession.final_risk_score >= 40).count()
    
    return {
        "risk_events": total_sessions,
        "green_events": green_count,
        "yellow_events": yellow_count,
        "red_events": red_count,
        "friction_actions": friction_count
    }

@router.get("/api/v1/analytics/trend")
def get_risk_trend(db: Session = Depends(get_db)):
    # Very simplified trend: return the last 20 sessions' scores
    sessions = db.query(CheckoutSession).filter(CheckoutSession.final_risk_score != None).order_by(CheckoutSession.id.desc()).limit(20).all()
    sessions.reverse() # chronological
    
    trend = []
    for s in sessions:
        trend.append({
            "session_id": s.session_ref,
            "risk_score": s.final_risk_score
        })
        
    return {"trend": trend}

@router.get("/api/v1/analytics/conversion")
def get_payment_conversion(db: Session = Depends(get_db)):
    total = db.query(CheckoutSession).count()
    if total == 0:
        return {"UPI": 0, "Card": 0, "COD": 0}
        
    # Since this is a demo without a real order backend, 
    # we simulate distribution based on real active session volume.
    return {
        "UPI": int(total * 0.52),
        "Card": int(total * 0.31),
        "COD": total - int(total * 0.52) - int(total * 0.31)
    }

@router.get("/api/v1/analytics/friction")
def get_friction_effectiveness(db: Session = Depends(get_db)):
    card_restrictions = db.query(CheckoutSession).filter(CheckoutSession.final_action == "RESTRICT_CARD").count()
    deposits_required = db.query(CheckoutSession).filter(CheckoutSession.final_action == "REQUIRE_COD_DEPOSIT").count()
    
    # We don't have a real payment processing integration to track successful payments,
    # so we simulate the conversion rate based on the real database action counts.
    upi_conversions = int(card_restrictions * 0.68)
    deposits_completed = int(deposits_required * 0.79)
    
    conversion_rate = 0
    if deposits_required > 0:
        conversion_rate = round((deposits_completed / deposits_required) * 100, 1)

    return {
        "card_restrictions": card_restrictions,
        "upi_conversions": upi_conversions,
        "cod_deposits_required": deposits_required,
        "deposits_completed": deposits_completed,
        "conversion_rate": conversion_rate
    }
