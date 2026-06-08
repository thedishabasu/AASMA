import numpy as np
from datetime import datetime, timedelta
from database import SessionLocal, Patient, Vitals, EnvironmentalData
from sqlalchemy import desc

def compute_z_score(current_value, historical_values):
    """Calculates the z-score of the current value based on historical data."""
    if not historical_values or len(historical_values) < 2:
        return 0.0
    mean = np.mean(historical_values)
    std = np.std(historical_values)
    if std == 0:
        return 0.0
    return (current_value - mean) / std

def derive_clinical_features(patient_id: int) -> dict:
    """Derives 13 clinical features from raw vitals, EHR data, and environmental data."""
    with SessionLocal() as db:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise ValueError(f"Patient {patient_id} not found.")

        # Get latest vitals
        latest_vital = db.query(Vitals).filter(Vitals.patient_id == patient_id).order_by(desc(Vitals.timestamp)).first()
        if not latest_vital:
             # Return defaults if no vitals yet
             return None

        # Get historical vitals (last 6 hours)
        six_hours_ago = datetime.utcnow() - timedelta(hours=6)
        historical_vitals = db.query(Vitals).filter(
            Vitals.patient_id == patient_id,
            Vitals.timestamp >= six_hours_ago
        ).all()

        historical_hr = [v.heart_rate for v in historical_vitals]
        historical_sbp = [v.systolic_bp for v in historical_vitals]

        # Calculate trends
        hr_trend = (latest_vital.heart_rate - historical_hr[0]) if historical_hr else 0.0
        bp_trend = (latest_vital.systolic_bp - historical_sbp[0]) if historical_sbp else 0.0
        
        # Calculate anomaly z-score (using HR as an example metric for anomaly)
        anomaly_z = compute_z_score(latest_vital.heart_rate, historical_hr)

        # Get latest environmental data
        latest_env = db.query(EnvironmentalData).order_by(desc(EnvironmentalData.timestamp)).first()
        pm25 = latest_env.pm25 if latest_env else 0.0
        aqi = latest_env.aqi if latest_env else 0.0

        # PM2.5 Risk Multiplier logic (multiplier x 2.3 when > 55)
        # We will represent this as adjusted PM2.5 or just pass the flag
        pm25_adjusted = pm25 * 2.3 if pm25 > 55.0 else pm25

        features = {
            # Direct wearable signals
            "heart_rate": latest_vital.heart_rate,
            "hrv": latest_vital.hrv,
            "systolic_bp": latest_vital.systolic_bp,
            "diastolic_bp": latest_vital.diastolic_bp,
            "spo2": latest_vital.spo2,
            "temperature": latest_vital.temperature,
            "activity_level": latest_vital.activity_level,
            
            # EHR features
            "age": patient.age,
            "base_risk_score": patient.base_risk_score,
            
            # Environmental
            "pm25_adjusted": pm25_adjusted,
            
            # Derived trends
            "hr_trend_6h": hr_trend,
            "bp_trend_6h": bp_trend,
            "anomaly_z_score": anomaly_z
        }
        
    return features
