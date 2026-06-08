import shap
import pandas as pd
import numpy as np

def compute_shap_explanations(model, X_df):
    """
    Given a trained XGBoost model and a Pandas DataFrame of patient features,
    this function computes the SHAP values (in polynomial time via TreeExplainer).

    Returns a dict mapping patient_id (or index) to their top 5 contributing
    feature percentages.
    """
    # 1. Initialize the Explainer.
    # We use shap.Explainer which automatically chooses the best method (Tree/Linear/Kernel).
    # This is more robust against newer XGBoost versions that might cause TreeExplainer to fail.
    try:
        explainer = shap.Explainer(model)
        shap_values = explainer(X_df).values
    except Exception as e:
        print(f"[SHAP Error] Standard explainer failed: {e}. Falling back to TreeExplainer with data...")
        try:
            # Sometime passing data explicitly helps TreeExplainer with newer XGBoost versions
            explainer = shap.TreeExplainer(model, data=X_df)
            shap_values = explainer.shap_values(X_df)
        except Exception as e2:
            print(f"[SHAP Error] Fallback explainer also failed: {e2}. Returning empty features.")
            return {i: {} for i in range(len(X_df))}
    
    # 2. Get the raw SHAP values. Shape: (num_samples, num_features)
    shap_values = explainer.shap_values(X_df)
    
    results = {}
    
    # 3. Process each patient to compute the top 5 percentage contributions.
    for i in range(len(X_df)):
        patient_shap = shap_values[i]
        
        # We care about the magnitude of the contribution (positive or negative risk push)
        abs_shap = np.abs(patient_shap)
        total_abs_shap = np.sum(abs_shap)
        
        # Edge case: model predicts near perfectly flat (no SHAP push)
        if total_abs_shap == 0:
            results[i] = []
            continue
            
        # Calculate percentage contribution for each feature
        percentages = (abs_shap / total_abs_shap) * 100
        
        # Create a list of tuples: (Feature Name, Percentage)
        feature_contributions = list(zip(X_df.columns, percentages))
        
        # Sort by percentage descending
        feature_contributions.sort(key=lambda x: x[1], reverse=True)
        
        # Take Top 5 and format as a dictionary for easier JSON serialization
        top_5 = {feat: f"{pct:.1f}%" for feat, pct in feature_contributions[:5]}
        
        results[i] = top_5
        
    return results
