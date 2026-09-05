from fastapi import APIRouter
from app.services.rto_predictor import rto_predictor

router = APIRouter()

@router.post("/api/v1/orders/predict-rto")
def predict_rto(features: dict):
    return rto_predictor.predict(features)
