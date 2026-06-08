import numpy as np

def calculate_ehr_score(features: dict) -> float:
    """Calculates a normalized EHR risk score based on age and base risk.
    Range: [0.0, 1.0].
    """
    age = features.get("age", 50)
    base_score = features.get("base_risk_score", 0.0)
    
    # Simple normalization: age risk + base risk
    age_risk = min(max((age - 45) / 45.0, 0.0), 1.0)
    
    ehr_score = (0.3 * age_risk) + (0.7 * base_score)
    return max(0.0, min(1.0, ehr_score))

def calculate_wearable_score(features: dict) -> float:
    """Calculates a normalized wearable physiological score based on vitals.
    Range: [0.0, 1.0].
    """
    # Threshold based risk calculation
    hr = features.get("heart_rate", 70)
    hrv = features.get("hrv", 50)
    sbp = features.get("systolic_bp", 120)
    spo2 = features.get("spo2", 98)
    activity = features.get("activity_level", 5)

    risk_points = 0.0
    
    if hr > 100 or hr < 50: risk_points += 0.2
    if hrv < 40: risk_points += 0.2
    if sbp > 140 or sbp < 90: risk_points += 0.2
    if spo2 < 95: risk_points += 0.3
    if activity < 2.0: risk_points += 0.1
    
    # Adding trend risks
    if abs(features.get("hr_trend_6h", 0)) > 15: risk_points += 0.15
    if features.get("anomaly_z_score", 0) > 2.0: risk_points += 0.2
    
    return max(0.0, min(1.0, risk_points))

def multimodal_fusion(features: dict) -> float:
    """
    Fuses EHR-derived risk scores and wearable-derived physiological scores
    using weighted linear combination: F = 0.6 * S_EHR + 0.4 * S_wearable.
    Clamps the output between [0.0, 1.0].
    """
    s_ehr = calculate_ehr_score(features)
    s_wearable = calculate_wearable_score(features)
    
    # Weighted linear combination
    f_score = 0.6 * s_ehr + 0.4 * s_wearable
    
    # Clamp the output
    f_score_clamped = max(0.0, min(1.0, f_score))
    
    return f_score_clamped
