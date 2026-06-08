import random

# Simulated Knowledge Graph for Drug Repositioning
# Mapping comorbidities -> [Primary Drug, Repositioned Candidate, Benefit]
DRUG_KG = {
    "Type 2 Diabetes": {
        "primary": "Metformin",
        "repositioned": "SGLT2 Inhibitors",
        "benefit": "Reduction in chronic kidney disease progression (Renal Protective)"
    },
    "Hypertension": {
        "primary": "Lisinopril",
        "repositioned": "Spironolactone",
        "benefit": "Evidence in resistant hypertension and heart failure prevention"
    },
    "Asthma": {
        "primary": "Albuterol",
        "repositioned": "Tiotropium",
        "benefit": "Long-acting muscarinic antagonist showing efficacy in COPD-overlap"
    },
    "Chronic Kidney Disease": {
        "primary": "Furosemide",
        "repositioned": "Finerenone",
        "benefit": "Non-steroidal mineralocorticoid receptor antagonist for T2D-related CKD"
    }
}

def suggest_repositioned_drugs(comorbidities):
    """
    Accepts a list or string of comorbidities and matches against the KG.
    """
    if isinstance(comorbidities, str):
        comorbidities = [c.strip() for c in comorbidities.split(",")]
    
    suggestions = []
    for condition in comorbidities:
        if condition in DRUG_KG:
            suggestions.append({
                "condition": condition,
                "suggestion": DRUG_KG[condition]["repositioned"],
                "evidence": DRUG_KG[condition]["benefit"]
            })
    
    # If no exact match, return a generic preventative suggestion
    if not suggestions:
        return [{
            "condition": "General Risk",
            "suggestion": "Low-dose Aspirin",
            "evidence": "Primary prevention in high-risk cardiovascular profiles"
        }]
        
    return suggestions

if __name__ == "__main__":
    test_case = "Type 2 Diabetes, Hypertension"
    print(f"Testing Drug Repositioning for: {test_case}")
    print(suggest_repositioned_drugs(test_case))
