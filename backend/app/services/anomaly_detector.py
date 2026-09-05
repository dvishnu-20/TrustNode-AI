import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        self._train_mock_model()

    def _train_mock_model(self):
        # Synthetic data representing "normal" checkout behavior
        # Features: [avg_key_interval_ms, paste_count, time_on_page_s, checkout_attempts]
        normal_data = np.array([
            [150, 0, 90, 1],
            [140, 0, 85, 1],
            [160, 0, 95, 1],
            [130, 0, 100, 1],
            [155, 0, 88, 1],
            [180, 1, 120, 1], # slightly slower, one paste
            [120, 0, 60, 1],
            [145, 0, 92, 1],
            [150, 0, 80, 1],
            [160, 0, 110, 1]
        ])
        self.model.fit(normal_data)
        self.is_trained = True

    def analyze_behavior(self, features: dict) -> dict:
        """
        Expects features dict like:
        {
            "avg_key_interval_ms": 150,
            "paste_count": 0,
            "time_on_page_s": 90,
            "checkout_attempts": 1
        }
        """
        if not self.is_trained:
            return {"anomaly_score": 0.0, "anomaly_level": "UNKNOWN", "model_version": "v1-mock"}

        x_input = np.array([[
            features.get("avg_key_interval_ms", 150),
            features.get("paste_count", 0),
            features.get("time_on_page_s", 90),
            features.get("checkout_attempts", 1)
        ]])

        # Returns -1 for outliers and 1 for inliers
        prediction = self.model.predict(x_input)[0]
        # Anomaly score (lower is more anomalous, we reverse it to 0-1 where 1 is highest anomaly)
        raw_score = self.model.score_samples(x_input)[0]
        
        # Normalize score roughly to 0-1 range for the mock (raw score is usually negative)
        normalized_score = float(max(0, min(1, abs(raw_score))))
        
        # If the model explicitly predicts outlier (-1), boost the anomaly score
        if prediction == -1:
            anomaly_score = min(1.0, normalized_score + 0.4)
            anomaly_level = "HIGH"
        else:
            anomaly_score = normalized_score * 0.5
            anomaly_level = "LOW" if anomaly_score < 0.3 else "MEDIUM"
            
        return {
            "anomaly_score": round(anomaly_score, 2),
            "anomaly_level": anomaly_level,
            "model_version": "v1-isolation-forest"
        }

anomaly_detector = AnomalyDetector()
