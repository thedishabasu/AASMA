from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd

def compute_hybrid_anomaly_score(df_features, current_hr, mean_hr, std_hr):
    """
    Computes a hybrid anomaly score combining an Isolation Forest (multivariate population outliers)
    with a personalized Z-score baseline for Heart Rate.
    
    Returns the array of 0-1 normalized final A-scores.
    """
    X = df_features.values
    
    # 1. Stage 1: Isolation Forest
    # Detects multivariate population-level outliers with 10% contamination.
    iso_forest = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    
    # Fit & Predict. Isolation forest outputs:
    # 1 for inliers, -1 for outliers
    # We want anomaly scores, so we use decision_function (lower = more anomalous).
    # We invert it so higher = more anomalous, then normalize to [0,1].
    iso_scores_raw = iso_forest.fit_predict(X)
    raw_decision = iso_forest.decision_function(X) # Higher score -> more normal
    
    # Invert and normalize to [0, 1] range mapping 
    max_d = np.max(raw_decision)
    min_d = np.min(raw_decision)
    
    # Avoid division by zero
    if max_d == min_d:
        iso_normalized = np.zeros(len(X))
    else:
        # We invert so negative becomes closer to 1 (anomaly), positive towards 0 (normal)
        iso_normalized = (max_d - raw_decision) / (max_d - min_d)
        
    # 2. Stage 2: Z-score Baseline
    # Computes per-patient HR deviation (|current HR - mean| / std) normalized by dividing by 5
    # Protect against 0 std deviation
    std_safe = np.where(std_hr == 0, 1e-9, std_hr)
    raw_z_score = np.abs(current_hr - mean_hr) / std_safe
    
    # Normalize by 5, cap at 1.0
    z_score_normalized = np.clip(raw_z_score / 5.0, 0.0, 1.0)
    
    # 3. Final Score
    # Final score: A = 0.6 * IF + 0.4 * z-score
    hybrid_scores = (0.6 * iso_normalized) + (0.4 * z_score_normalized)
    
    return np.clip(hybrid_scores, 0.0, 1.0)
