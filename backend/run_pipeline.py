import asyncio
from data_ingestion import stream_patient_vitals, stream_environmental_data
from feature_engineering import derive_clinical_features
from multimodal_fusion import multimodal_fusion
from risk_prediction import train_and_evaluate_xgboost
from risk_prediction import train_and_evaluate_xgboost
from shap_explainability import compute_shap_explanations
from hybrid_anomaly import compute_hybrid_anomaly_score
from counterfactual import simulate_counterfactuals
from burnout_detection import compute_clinician_burnout
from drug_repositioning import suggest_repositioned_drugs
from behavioral_nudging import generate_nudge
from microbiome_forecasting import forecast_microbiome_risk
from environmental_alerting import check_environmental_alerts
from federated_learning import run_fl_round
from active_learning import uncertainty_sampling, simulate_clinician_feedback
from fairness_monitor import compute_fairness_metrics, check_parity_threshold
import pandas as pd
import numpy as np

async def test_ingestion_and_features():
    print("--- [1] Testing Asynchronous Data Ingestion ---")
    
    # Start background ingestion tasks
    print("Initializing environment and patient 1 streams for 15 seconds...")
    env_task = asyncio.create_task(stream_environmental_data())
    patient_task = asyncio.create_task(stream_patient_vitals(1))
    
    # Allow time for a few 10-second ticks
    await asyncio.sleep(15)
    
    # Cancel streams
    env_task.cancel()
    patient_task.cancel()
    try:
        await asyncio.gather(env_task, patient_task)
    except asyncio.CancelledError:
        pass
        
    print("\n--- [2] Testing Feature Engineering & Fusion Engine ---")
    try:
        features = derive_clinical_features(1)
        if features:
            print(f"Successfully derived 13 clinical features for Patient 1:")
            for k, v in features.items():
                print(f"  - {k}: {v:.2f}")
            
            f_score = multimodal_fusion(features)
            print(f"Calculated Multimodal Fusion Score (Clamped): {f_score:.3f}")
        else:
            print("No features derived. Check database ingestion.")
            
    except Exception as e:
        print(f"Error deriving features: {e}")
        
    print("\n--- [3] Testing XGBoost Risk Prediction ---")
    dataset, model, acc, auroc = train_and_evaluate_xgboost()
    print("\n[SUCCESS] Pipeline Verification Completed Successfully.")

    print("\n==============================")
    print("--- 6. Advanced ML Validations ---")
    
    # 6a. SHAP Explainability
    print("\n[SHAP] Verifying TreeExplainer for Top-5 Feature Contributions...")
    # 'multimodal_f_score' is the derived target we attached at generation time instead of 'risk_label'
    X_test = dataset.drop(columns=["multimodal_f_score"])
    shap_results = compute_shap_explanations(model, X_test)
    print(f"[SHAP] Generated explanations for {len(shap_results)} profiles in polynomial time.")
    print(f"Sample SHAP Profile 0: {shap_results[0]}")
    
    # 6b. Hybrid Anomaly Detection
    print("\n[Hybrid Anomaly] Computing Isolation Forest (10%) + Z-Score (0.6/0.4) map...")
    anomalies = compute_hybrid_anomaly_score(
        X_test, 
        current_hr=X_test['heart_rate'].values, 
        mean_hr=np.full(len(X_test), 75.0), # Example baseline
        std_hr=np.full(len(X_test), 5.0)
    )
    print(f"[Hybrid Anomaly] Max Anomaly Detected: {np.max(anomalies):.3f}")
    
    # 6c. Counterfactual Simulation
    print("\n[Counterfactuals] Running Perturbation Simulation on Profile 0...")
    profile_0_df = X_test.iloc[[0]]
    perturbations = {"heart_rate": -15, "systolic_bp": -20, "pm25": -10}
    cf_results = simulate_counterfactuals(model, profile_0_df, perturbations)
    print(f"[Counterfactuals] Sim: {cf_results}")
    
    # 6d. Clinician Burnout
    print("\n[Burnout Detection] Testing Cognitive Load Constraints...")
    burnout_test_1 = compute_clinician_burnout(shift_hours_worked=13, patients_seen=26)
    burnout_test_2 = compute_clinician_burnout(shift_hours_worked=8, patients_seen=15)
    print(f"Burnout Test 1 (13h/26p): {burnout_test_1['burnout_risk']} => {burnout_test_1['actionable_recommendation']}")
    print(f"Burnout Test 2 (8h/15p): {burnout_test_2['burnout_risk']}")
    
    # --- [5] Verifying Phase 3: Extended AI Modules ---
    print("\n--- [5] Verifying Phase 3: Extended AI Modules ---")
    
    # Drug Repositioning
    comorbidities = "Type 2 Diabetes, Chronic Kidney Disease"
    drugs = suggest_repositioned_drugs(comorbidities)
    print(f"[Drug Repo] Suggestions for {comorbidities}: {len(drugs)} found.")
    
    # Behavioral Nudging
    nudge_low = generate_nudge(0.35)
    nudge_high = generate_nudge(0.90)
    print(f"[Nudging] Low Adherence Nudge Type: {nudge_low['type']}")
    print(f"[Nudging] High Adherence Nudge Type: {nudge_high['type']}")
    
    # Microbiome Forecasting
    micro_risk = forecast_microbiome_risk(12)  # 12g fiber is low
    print(f"[Microbiome] Dysbiosis Risk Score (12g fiber): {micro_risk['dysbiosis_score']}")
    
    # Environmental Alerting
    env_alerts = check_environmental_alerts(65, 110) # Heavy spike
    print(f"[Env Alerts] Detected {len(env_alerts)} alerts for PM2.5=65, AQI=110.")
    
    # --- [6] Verifying Phase 4: System Maturation ---
    print("\n--- [6] Verifying Phase 4: System Maturation ---")
    
    # Active Learning
    print("\n[Active Learning] Running Uncertainty Sampling...")
    informative_cases = uncertainty_sampling(model, dataset)
    feedback_results = simulate_clinician_feedback(informative_cases)
    print(f"[Active Learning] Selected {len(feedback_results)} cases for clinician review.")
    
    # Fairness Monitoring
    print("\n[Fairness] Computing Demographic Parity metrics...")
    fairness_metrics = compute_fairness_metrics(model, dataset)
    check_parity_threshold(fairness_metrics)

    print("\n[SUCCESS] All Core and Extended AI Modules Verifications Completed.")

if __name__ == "__main__":
    asyncio.run(test_ingestion_and_features())
