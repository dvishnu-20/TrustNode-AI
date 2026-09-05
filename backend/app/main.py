from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import websocket, payment

app = FastAPI(title="TrustNode AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
from app.api import analytics, orders
app.include_router(analytics.router)
app.include_router(orders.router)
app.include_router(payment.router)

@app.get("/")
def read_root():
    return {"message": "TrustNode AI API is running"}
