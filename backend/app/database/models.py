from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    customer_ref = Column(String, unique=True, index=True)
    phone_hash = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sessions = relationship("CheckoutSession", back_populates="customer")
    orders = relationship("Order", back_populates="customer")


class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    device_ref = Column(String, unique=True, index=True)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    risk_score = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    failed_payments = Column(Integer, default=0)
    cod_orders = Column(Integer, default=0)
    cod_returns = Column(Integer, default=0)
    accounts_seen = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sessions = relationship("CheckoutSession", back_populates="device")
    orders = relationship("Order", back_populates="device")


class CheckoutSession(Base):
    __tablename__ = "checkout_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_ref = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    final_risk_score = Column(Float, nullable=True)
    risk_zone = Column(String, nullable=True)
    final_action = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="sessions")
    device = relationship("Device", back_populates="sessions")
    telemetry_events = relationship("TelemetryEventDB", back_populates="session")
    risk_assessments = relationship("RiskAssessment", back_populates="session")
    third_party_signals = relationship("ThirdPartySignal", back_populates="session")
    friction_actions = relationship("FrictionAction", back_populates="session")
    model_predictions = relationship("ModelPrediction", back_populates="session")
    orders = relationship("Order", back_populates="session")


class TelemetryEventDB(Base):
    __tablename__ = "telemetry_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"))
    event_type = Column(String, index=True)
    field_name = Column(String, nullable=True)
    event_value = Column(String, nullable=True)
    timestamp = Column(Float)
    metadata_json = Column(JSON, nullable=True)

    session = relationship("CheckoutSession", back_populates="telemetry_events")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"))
    behavior_score = Column(Float, nullable=True)
    ml_anomaly_score = Column(Float, nullable=True)
    device_score = Column(Float, nullable=True)
    third_party_score = Column(Float, nullable=True)
    rto_probability = Column(Float, nullable=True)
    final_risk_score = Column(Float, nullable=True)
    risk_zone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("CheckoutSession", back_populates="risk_assessments")
    signals = relationship("RiskSignal", back_populates="assessment")


class RiskSignal(Base):
    __tablename__ = "risk_signals"
    id = Column(Integer, primary_key=True, index=True)
    risk_assessment_id = Column(Integer, ForeignKey("risk_assessments.id"))
    signal_type = Column(String)
    signal_value = Column(Float)
    weight = Column(Float)
    description = Column(String)

    assessment = relationship("RiskAssessment", back_populates="signals")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_ref = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"), nullable=True)
    amount = Column(Float)
    payment_method = Column(String)
    risk_score = Column(Float, nullable=True)
    rto_probability = Column(Float, nullable=True)
    order_status = Column(String, default="PENDING")
    rto_status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="orders")
    device = relationship("Device", back_populates="orders")
    session = relationship("CheckoutSession", back_populates="orders")
    payment_attempts = relationship("PaymentAttempt", back_populates="order")
    rto_predictions = relationship("RtoPrediction", back_populates="order")


class PaymentAttempt(Base):
    __tablename__ = "payment_attempts"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    payment_method = Column(String)
    amount = Column(Float)
    status = Column(String)
    provider = Column(String)
    provider_reference = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="payment_attempts")


class RtoPrediction(Base):
    __tablename__ = "rto_predictions"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    probability = Column(Float)
    risk_level = Column(String)
    model_version = Column(String)
    features_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="rto_predictions")


class ThirdPartySignal(Base):
    __tablename__ = "third_party_signals"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"))
    provider = Column(String)
    external_risk_score = Column(Float)
    signal_data = Column(JSON, nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("CheckoutSession", back_populates="third_party_signals")


class FrictionAction(Base):
    __tablename__ = "friction_actions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"))
    action_type = Column(String)
    triggered_by = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    result = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("CheckoutSession", back_populates="friction_actions")


class ModelPrediction(Base):
    __tablename__ = "model_predictions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("checkout_sessions.id"))
    model_type = Column(String)
    model_version = Column(String)
    prediction = Column(Float)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("CheckoutSession", back_populates="model_predictions")
