from fastapi import APIRouter
from pydantic import BaseModel
from app.services.razorpay_service import create_payment_link

router = APIRouter()

class PaymentRequest(BaseModel):
    amount: int
    currency: str = "INR"

@router.post("/api/v1/payment_links")
def generate_payment_link(req: PaymentRequest):
    link = create_payment_link(req.amount)
    return {"payment_link": link}
