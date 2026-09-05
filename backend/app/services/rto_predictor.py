import numpy as np
from sklearn.linear_model import LogisticRegression

class RTOPredictor:
    def __init__(self):
        self.model = LogisticRegression(random_state=42)
        self.is_trained = False
        self._train_mock_model()
        
    def _train_mock_model(self):
        # Synthetic data: [risk_score (0-100), device_risk (0-100), previous_orders, previous_rtos, order_value_normalized]
        # Target: 0 (No RTO), 1 (RTO)
        X = np.array([
            [10, 5, 8, 0, 0.2],  # Low risk, good history -> No RTO
            [85, 80, 2, 1, 0.8], # High risk, bad history, high value -> RTO
            [20, 10, 5, 0, 0.5], # Normal -> No RTO
            [90, 85, 1, 0, 0.9], # Very high risk, new account -> RTO
            [30, 20, 10, 1, 0.3],# Medium risk, some RTOs but many orders -> No RTO
            [75, 60, 3, 2, 0.7], # High risk, multiple RTOs -> RTO
            [15, 5,  1, 0, 0.1], # Low risk, new -> No RTO
            [60, 70, 2, 1, 0.4]  # Med-High risk -> RTO
        ])
        y = np.array([0, 1, 0, 1, 0, 1, 0, 1])
        
        self.model.fit(X, y)
        self.is_trained = True
        
    def predict(self, features: dict) -> dict:
        """
        Features dict should include:
        {
            "risk_score": 87,
            "device_risk": 79,
            "previous_orders": 4,
            "previous_rtos": 3,
            "order_value": 2800
        }
        """
        if not self.is_trained:
            return {"rto_probability": 0.0, "risk_level": "UNKNOWN", "recommendation": "ALLOW_COD"}
            
        risk_score = features.get("risk_score", 0)
        device_risk = features.get("device_risk", 0)
        prev_orders = features.get("previous_orders", 0)
        prev_rtos = features.get("previous_rtos", 0)
        order_val = features.get("order_value", 500)
        
        # Normalize order value roughly (assuming max ~10k)
        normalized_val = min(1.0, order_val / 10000.0)
        
        x_input = np.array([[risk_score, device_risk, prev_orders, prev_rtos, normalized_val]])
        
        probability = self.model.predict_proba(x_input)[0][1] # Probability of class 1 (RTO)
        
        risk_level = "LOW"
        recommendation = "ALLOW_COD"
        
        if probability > 0.7:
            risk_level = "HIGH"
            recommendation = "REQUIRE_DEPOSIT"
        elif probability > 0.4:
            risk_level = "MEDIUM"
            recommendation = "REQUIRE_UPI"
            
        return {
            "rto_probability": round(float(probability), 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "model_version": "v1-logistic"
        }

rto_predictor = RTOPredictor()
