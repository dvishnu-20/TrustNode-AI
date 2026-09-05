from sqlalchemy.orm import Session
from app.models.telemetry import TelemetryEvent
from app.database.models import TelemetryEventDB, CheckoutSession
from app.database.connection import SessionLocal
from app.services.anomaly_detector import anomaly_detector
from app.services.device_risk import device_risk_engine

class RiskEngine:
    def evaluate(self, event: TelemetryEvent) -> dict:
        db = SessionLocal()
        try:
            # 1. Get or create session
            db_session = db.query(CheckoutSession).filter(CheckoutSession.session_ref == event.session_id).first()
            if not db_session:
                db_session = CheckoutSession(session_ref=event.session_id)
                db.add(db_session)
                db.commit()
                db.refresh(db_session)

            # 2. Store telemetry event
            telemetry_db = TelemetryEventDB(
                session_id=db_session.id,
                event_type=event.event_type,
                field_name=event.field,
                event_value=str(event.value_length) if getattr(event, "value_length", None) else None,
                timestamp=event.timestamp,
                metadata_json={"duration": event.duration} if getattr(event, "duration", None) else None
            )
            db.add(telemetry_db)
            db.commit()

            # 3. Re-evaluate heuristics
            all_events = db.query(TelemetryEventDB).filter(TelemetryEventDB.session_id == db_session.id).all()
            
            behavior_score = 10
            reasons = []
            paste_count = 0
            checkout_attempts = 0
            durations = []
            
            for e in all_events:
                if e.event_type == "paste":
                    behavior_score += 25
                    paste_count += 1
                    if "Rapid paste detected" not in reasons:
                        reasons.append("Rapid paste detected")
                if e.event_type == "keydown" and e.metadata_json and "duration" in e.metadata_json:
                    dur = e.metadata_json["duration"]
                    durations.append(dur)
                    if dur < 20:
                        behavior_score += 5
                        if "Automated typing cadence" not in reasons:
                            reasons.append("Automated typing cadence")
                if e.event_type == "submit":
                    checkout_attempts += 1
                    if checkout_attempts > 1:
                        behavior_score += 30
                        if "High checkout velocity" not in reasons:
                            reasons.append("High checkout velocity")
                if e.event_type == "cod_selected":
                    behavior_score += 10
                    if "COD attempt on risky session" not in reasons:
                        reasons.append("COD attempt on risky session")
            
            behavior_score = min(100, behavior_score)
            
            # 4. Get ML Anomaly Score
            features = {
                "avg_key_interval_ms": sum(durations)/len(durations) if durations else 150,
                "paste_count": paste_count,
                "time_on_page_s": (all_events[-1].timestamp - all_events[0].timestamp)/1000 if len(all_events) > 1 else 0,
                "checkout_attempts": checkout_attempts
            }
            anomaly_res = anomaly_detector.analyze_behavior(features)
            ml_score = anomaly_res["anomaly_score"] * 100
            
            if anomaly_res["anomaly_level"] == "HIGH":
                reasons.append("ML Model flagged behavior as highly anomalous")
                
            # 5. Get Device Risk
            device_id = "DEV-UNKNOWN"
            if db_session.device and db_session.device.device_ref:
                device_id = db_session.device.device_ref
            
            device_res = device_risk_engine.evaluate_device(device_id)
            device_score = device_res["risk_score"]
            if device_score > 60:
                 reasons.extend(device_res["signals"])
                 
            # Final Score Aggregation (55% behavior, 30% ML, 15% Device)
            final_score = (0.55 * behavior_score) + (0.30 * ml_score) + (0.15 * device_score)
            final_score = min(100, int(final_score))
            
            db_session.final_risk_score = final_score
            db.commit()
            
            return {
                "score": final_score,
                "reasons": list(set(reasons))
            }
        finally:
            db.close()

risk_engine = RiskEngine()
