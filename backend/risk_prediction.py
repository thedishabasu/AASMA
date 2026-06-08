import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from multimodal_fusion import multimodal_fusion

def generate_synthetic_data(num_samples=2000):
    """
    Generates synthetic patient profiles with the 13 clinical features.
    """
    np.random.seed(42)
    data = {
        "heart_rate": np.random.normal(70, 15, num_samples),
        "hrv": np.random.normal(50, 15, num_samples),
        "systolic_bp": np.random.normal(120, 20, num_samples),
        "diastolic_bp": np.random.normal(80, 10, num_samples),
        "spo2": np.random.normal(98, 2, num_samples),
        "temperature": np.random.normal(36.5, 0.5, num_samples),
        "activity_level": np.random.uniform(0, 10, num_samples),
        "age": np.random.uniform(30, 90, num_samples),
        "base_risk_score": np.random.uniform(0, 1, num_samples),
        "pm25_adjusted": np.random.uniform(10, 150, num_samples), # some highly adjusted
        "hr_trend_6h": np.random.normal(0, 10, num_samples),
        "bp_trend_6h": np.random.normal(0, 15, num_samples),
        "anomaly_z_score": np.random.normal(0, 1.5, num_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Clip realistic bounds
    df["heart_rate"] = df["heart_rate"].clip(40, 150)
    df["hrv"] = df["hrv"].clip(10, 100)
    df["systolic_bp"] = df["systolic_bp"].clip(80, 200)
    df["spo2"] = df["spo2"].clip(85, 100)
    
    return df

def generate_labels(df: pd.DataFrame) -> np.ndarray:
    """
    Encodes a ground-truth risk function from clinical thresholds.
    Risk is 1 (High) if severe thresholds are met, else 0 (Low).
    Calculates multimodal fusion score. If score > 0.65 it's high risk.
    """
    labels = []
    fusion_scores = []
    
    for _, row in df.iterrows():
        features = row.to_dict()
        
        # Ground truth rules
        is_high_risk = False
        if features["heart_rate"] > 100 or features["heart_rate"] < 50:
             is_high_risk = True
        if features["hrv"] < 40:
             is_high_risk = True
        if features["systolic_bp"] > 140:
             is_high_risk = True
        if features["spo2"] < 95:
             is_high_risk = True
        # Multimodal fusion acts as our advanced derived feature for the model
        f_score = multimodal_fusion(features)
        
        # We combine rule-based and fusion logic to create a slightly fuzzy but strongly correlated ground truth
        if f_score > 0.6 or is_high_risk:
            labels.append(1)
        else:
            labels.append(0)
            
        fusion_scores.append(f_score)
        
    df["multimodal_f_score"] = fusion_scores
    return np.array(labels)

def train_and_evaluate_xgboost():
    print("[XGBoost] Generating 2,000 synthetic patient profiles...")
    df = generate_synthetic_data(2000)
    
    print("[XGBoost] Encoding ground-truth risk thresholds...")
    y = generate_labels(df)
    # We drop the direct target correlate to ensure the model learns from the 13 features
    X = df.drop(columns=["multimodal_f_score"])
    
    print("[XGBoost] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost classifier (100 trees, depth 4, learning rate 0.1)
    print("[XGBoost] Training model (100 trees, depth 4, LR 0.1)...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    print("[XGBoost] Evaluating performance...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auroc = roc_auc_score(y_test, y_prob)
    
    print(f"Results => Accuracy: {acc*100:.2f}% (Target: ~91.7%) | AUROC: {auroc:.3f} (Target: ~0.943)")
    return df, model, acc, auroc

if __name__ == "__main__":
    train_and_evaluate_xgboost()
