import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def generate_dummy_rto_data(n_samples=2000):
    # Features:
    # 0: risk_score (0-100)
    # 1: device_risk (0-100)
    # 2: previous_orders (int)
    # 3: previous_rtos (int)
    # 4: order_value (float in INR)
    
    np.random.seed(42)
    
    risk_score = np.random.uniform(0, 100, n_samples)
    device_risk = np.random.uniform(0, 100, n_samples)
    previous_orders = np.random.poisson(lam=2, size=n_samples)
    previous_rtos = np.random.poisson(lam=0.5, size=n_samples)
    order_value = np.random.exponential(scale=2000, size=n_samples) + 500
    
    X = np.column_stack([risk_score, device_risk, previous_orders, previous_rtos, order_value])
    
    # Simple probability function for dummy logic
    logits = (
        (risk_score * 0.05) + 
        (device_risk * 0.04) + 
        (previous_rtos * 1.5) - 
        (previous_orders * 0.5) + 
        (order_value * 0.0001) - 4
    )
    
    # sigmoid
    probs = 1 / (1 + np.exp(-logits))
    
    # labels
    y = (probs > np.random.uniform(0, 1, n_samples)).astype(int)
    
    return X, y

if __name__ == "__main__":
    print("Generating dummy data for RTO prediction...")
    X, y = generate_dummy_rto_data(n_samples=2000)
    
    print("Training Random Forest classifier for RTO...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    output_path = os.path.join(os.path.dirname(__file__), "rto_model.pkl")
    print(f"Saving model to {output_path}...")
    joblib.dump(model, output_path)
    print("Done!")
