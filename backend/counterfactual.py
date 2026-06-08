import numpy as np
import pandas as pd

def simulate_counterfactuals(model, patient_df, perturbations):
    """
    Given a single patient representation DataFrame (1 row), and a dictionary of
    perturbations, e.g. {"hr": -10, "pm25": -5.0, "sbp": -15}, this generates a new
    feature representation and inferences the model to expose the "what if" risk scenario.
    
    Returns the (Original Probability, New Probability, Delta)
    """
    # 1. Capture Original State Prediction
    original_prob = model.predict_proba(patient_df)[:, 1][0]
    
    # 2. Apply Perturbations
    simulated_df = patient_df.copy()
    
    for feature, delta in perturbations.items():
        if feature in simulated_df.columns:
            simulated_df[feature] += delta
            
    # Optional Re-Derive Trends (Normally we would hook back into feature_engineering.py here)
    # For speed simulation, we assume applying the delta impacts the direct feature linearly.
    
    # 3. Predict New State
    new_prob = model.predict_proba(simulated_df)[:, 1][0]
    
    delta = new_prob - original_prob
    
    return {
        "original_risk": round(original_prob, 3),
        "simulated_risk": round(new_prob, 3),
        "risk_reduction": round(delta, 3)
    }
