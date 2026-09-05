from datetime import datetime, timezone
import hashlib

class DeviceRiskEngine:
    def __init__(self):
        # Mock database of high-risk devices
        self.high_risk_devices = {
            "DEV-SUSPICIOUS-1": {
                "orders": 17,
                "failed_payments": 8,
                "cod_orders": 10,
                "cod_cancellations": 6,
                "accounts_seen": 5
            }
        }
    
    def evaluate_device(self, device_id: str) -> dict:
        """
        Returns a simulated risk profile for a given device ID.
        """
        # If we have it in our mock high-risk set
        if device_id in self.high_risk_devices:
            data = self.high_risk_devices[device_id]
            risk_score = 85
            signals = ["high_order_velocity", "multiple_accounts", "high_cod_cancellation_rate"]
            return {
                "device_id": device_id,
                "risk_score": risk_score,
                "signals": signals,
                "history": data
            }
        
        # Determine risk deterministically based on device_id string hash
        hash_val = int(hashlib.md5(device_id.encode()).hexdigest(), 16)
        
        # Random but consistent profile
        orders = (hash_val % 10) + 1
        failed_payments = (hash_val % 3)
        cod_orders = (hash_val % 4)
        cod_cancellations = (hash_val % 2)
        accounts_seen = (hash_val % 2) + 1
        
        base_risk = 10
        signals = []
        
        if failed_payments > orders / 2:
            base_risk += 30
            signals.append("high_payment_failure_rate")
            
        if accounts_seen > 1:
            base_risk += 15
            signals.append("multiple_accounts_on_device")
            
        if cod_cancellations > 0 and cod_cancellations >= cod_orders / 2:
            base_risk += 25
            signals.append("high_cod_cancellation_rate")
            
        risk_score = min(100, base_risk + (hash_val % 10))
        
        return {
            "device_id": device_id,
            "risk_score": risk_score,
            "signals": signals,
            "history": {
                "orders": orders,
                "failed_payments": failed_payments,
                "cod_orders": cod_orders,
                "cod_cancellations": cod_cancellations,
                "accounts_seen": accounts_seen
            }
        }

device_risk_engine = DeviceRiskEngine()
