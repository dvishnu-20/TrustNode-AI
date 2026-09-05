from abc import ABC, abstractmethod
from typing import Dict, Any

class RiskSignalAdapter(ABC):
    @abstractmethod
    def normalize(self, external_response: dict) -> dict:
        """
        Converts provider-specific response into TrustNode standard format:
        {
            "provider": str,
            "risk_score": float,
            "signals": [
                {"type": str, "score": float}
            ]
        }
        """
        pass
