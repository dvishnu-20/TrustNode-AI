from app.adapters.base import RiskSignalAdapter
import random

class ThirdwatchAdapter(RiskSignalAdapter):
    def normalize(self, external_response: dict) -> dict:
        """
        Expects Thirdwatch response like:
        {
            "thirdwatch_score": 74,
            "flags": ["high_velocity", "new_device"]
        }
        """
        score = external_response.get("thirdwatch_score", 0)
        flags = external_response.get("flags", [])
        
        signals = []
        for flag in flags:
            signals.append({
                "type": flag,
                "score": score
            })
            
        return {
            "provider": "Thirdwatch",
            "risk_score": float(score),
            "signals": signals
        }
        
    def mock_fetch(self, session_id: str) -> dict:
        """
        Simulates fetching from Thirdwatch API
        """
        score = random.randint(10, 85)
        flags = []
        if score > 50:
            flags.append("device_risk")
        if score > 70:
            flags.append("order_velocity")
            
        raw_response = {
            "thirdwatch_score": score,
            "flags": flags
        }
        return self.normalize(raw_response)

thirdwatch_adapter = ThirdwatchAdapter()
