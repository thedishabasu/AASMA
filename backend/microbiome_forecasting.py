import numpy as np

def forecast_microbiome_risk(dietary_fiber_grams):
    """
    Accepts dietary fiber intake (grams) and outputs a dysbiosis risk score.
    Higher fiber generally correlates with lower dysbiosis risk.
    """
    fiber = float(dietary_fiber_grams)
    
    # Simple non-linear model: Risk decreases exponentially with fiber intake
    # Base risk is high (0.9) at low fiber, drops to ~0.1 at 35g fiber (target)
    # R(f) = 0.9 * e^(-(f-5)/15) clamped between 0 and 1
    
    if fiber < 5:
        risk = 0.95
    else:
        risk = 0.9 * np.exp(-(fiber - 5) / 15)
    
    risk = max(0.05, min(0.95, risk))
    
    status = "Healthy" if risk < 0.3 else "Observation" if risk < 0.6 else "High Dysbiosis Risk"
    
    return {
        "fiber_intake": fiber,
        "dysbiosis_score": round(risk, 2),
        "status": status,
        "recommendation": "Increase prebiotic fiber intake (Target > 30g)" if risk > 0.3 else "Microbiome stability maintained."
    }

if __name__ == "__main__":
    print("Testing Microbiome for 10g fiber:")
    print(forecast_microbiome_risk(10))
    print("\nTesting Microbiome for 35g fiber:")
    print(forecast_microbiome_risk(35))
