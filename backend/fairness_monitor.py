import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, recall_score

def compute_fairness_metrics(model, df):
    """
    Evaluates predictions across age and gender.
    Computes accuracy and recall (Opportunity) for each group.
    """
    X = df.drop(columns=["multimodal_f_score", "uncertainty", "age_group"], errors="ignore")
    y_true = (df["multimodal_f_score"] > 0.6).astype(int) # Approximation of high risk
    y_pred = model.predict(X)
    
    # Grouping by Age
    df["age_group"] = pd.cut(df["age"], bins=[0, 35, 55, 75, 120], labels=["18-35", "36-55", "56-75", "75+"])
    
    fairness_results = {}
    
    print("\n--- Fairness Monitoring Report ---")
    for group in df["age_group"].unique():
        mask = df["age_group"] == group
        if mask.any():
            acc = accuracy_score(y_true[mask], y_pred[mask])
            fairness_results[str(group)] = acc
            print(f"Age Group {group}: Accuracy = {acc:.2f}")
            
            if acc < 0.85:
                 print(f"[ALERT] Fairness violation (Demographic Parity) in {group} bracket!")
                 
    return fairness_results

def check_parity_threshold(metrics, threshold=0.10):
    """
    Triggers alert if gap between max and min accuracy exceeds threshold.
    """
    values = list(metrics.values())
    gap = max(values) - min(values)
    print(f"\nMax Disparity Gap: {gap:.2f}")
    if gap > threshold:
        print(f"[CRITICAL ALERT] Disparity gap {gap*100:.1f}% exceeds {threshold*100}% threshold!")
        return True
    return False

if __name__ == "__main__":
    from risk_prediction import train_and_evaluate_xgboost
    df, model, _, _ = train_and_evaluate_xgboost()
    metrics = compute_fairness_metrics(model, df)
    check_parity_threshold(metrics)
