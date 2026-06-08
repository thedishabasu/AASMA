import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score

def uncertainty_sampling(model, df, top_n=5):
    """
    Selects the most informative cases (where probability is closest to 0.5).
    """
    # Drop non-model features before prediction
    X = df.drop(columns=["multimodal_f_score", "uncertainty", "age_group"], errors="ignore")
    probs = model.predict_proba(X)[:, 1]
    
    # Calculate uncertainty as distance from 0.5
    df_copy = df.copy()
    df_copy["uncertainty"] = np.abs(probs - 0.5)
    
    # Sort by lowest uncertainty (closest to 0.5)
    informative_cases = df_copy.nsmallest(top_n, "uncertainty")
    return informative_cases

def simulate_clinician_feedback(informative_cases):
    """
    Simulates clinician feedback on the informative cases.
    We just flip or keep the labels based on some 'clinical' rule.
    """
    feedback = []
    for _, row in informative_cases.iterrows():
        # Clinician might see something the model missed
        # For simplicity, we assume clinician identifies the true label
        # In this simulation, we'll just say the clinician 'approves' 80% of them
        # and 'corrects' 20%
        if np.random.random() > 0.2:
            feedback.append("Approved")
        else:
            feedback.append("Corrected (High Risk)")
            
    informative_cases["clinician_feedback"] = feedback
    return informative_cases

def adjust_model_weights(model, X_train, y_train, feedback_samples):
    """
    Simulates model weight adjustment based on feedback.
    In a real scenario, we would retrain with the new labels.
    """
    print(f"[Active Learning] adjusting model weights with {len(feedback_samples)} samples...")
    # Simulation: return a slightly 'improved' accuracy metric
    return 0.932 # Placeholder for improved accuracy

if __name__ == "__main__":
    from risk_prediction import train_and_evaluate_xgboost
    df, model, _, _ = train_and_evaluate_xgboost()
    
    print("\n--- Running Active Learning Cycle ---")
    samples = uncertainty_sampling(model, df)
    results = simulate_clinician_feedback(samples)
    print("Selected informative cases for review:")
    print(results[["heart_rate", "systolic_bp", "uncertainty", "clinician_feedback"]])
