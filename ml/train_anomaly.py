import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

def generate_dummy_behavioral_data(n_samples=1000, anomaly_fraction=0.1):
    # Features:
    # 0: avg_key_interval (ms)
    # 1: std_key_interval (ms)
    # 2: paste_count (int)
    # 3: time_on_page (s)
    # 4: click_count (int)
    
    np.random.seed(42)
    n_anomalies = int(n_samples * anomaly_fraction)
    n_normal = n_samples - n_anomalies

    # Normal behavior (human-like)
    normal_data = np.zeros((n_normal, 5))
    normal_data[:, 0] = np.random.normal(loc=150, scale=30, size=n_normal) # key interval
    normal_data[:, 1] = np.random.normal(loc=40, scale=10, size=n_normal)  # key interval std
    normal_data[:, 2] = np.random.poisson(lam=0.1, size=n_normal)          # rare pasting
    normal_data[:, 3] = np.random.normal(loc=120, scale=30, size=n_normal) # time on page
    normal_data[:, 4] = np.random.normal(loc=15, scale=5, size=n_normal)   # clicks

    # Anomalous behavior (bot-like or rapid)
    anomaly_data = np.zeros((n_anomalies, 5))
    anomaly_data[:, 0] = np.random.normal(loc=15, scale=5, size=n_anomalies)   # too fast typing
    anomaly_data[:, 1] = np.random.normal(loc=2, scale=1, size=n_anomalies)    # too uniform
    anomaly_data[:, 2] = np.random.poisson(lam=3.0, size=n_anomalies)          # lots of pasting
    anomaly_data[:, 3] = np.random.normal(loc=15, scale=5, size=n_anomalies)   # too fast checkout
    anomaly_data[:, 4] = np.random.normal(loc=40, scale=15, size=n_anomalies)  # rapid clicking

    data = np.vstack([normal_data, anomaly_data])
    return data

if __name__ == "__main__":
    print("Generating dummy behavioral data for anomaly detection...")
    X = generate_dummy_behavioral_data(n_samples=1000)
    
    print("Training Isolation Forest model...")
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X)
    
    output_path = os.path.join(os.path.dirname(__file__), "anomaly_model.pkl")
    print(f"Saving model to {output_path}...")
    joblib.dump(model, output_path)
    print("Done!")
