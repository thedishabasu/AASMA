export interface Medication {
    name: string;
    category: string;
    sideEffects: string[];
}

export interface DrugSymptomProfile {
    diagnosis: string[];
    currentMedications: string[];
}

export interface RecommendationResult {
    suggestedAlternatives: string[];
    reasoning: string;
}

export class DrugRepositioningService {
    /**
     * Suggests alternative medication options for patients with multiple conditions using rule-based logic.
     */
    public static suggestAlternatives(profile: DrugSymptomProfile): RecommendationResult {
        const suggestions: string[] = [];
        let reasoning = "Analysis based on patient's multi-morbidity profile: ";

        if (profile.diagnosis.includes("diabetes") && profile.diagnosis.includes("hypertension")) {
            suggestions.push("ACE inhibitors (e.g., Lisinopril)");
            reasoning += "ACE inhibitors are preferred for hypertensive diabetic patients as they provide renal protection.";
        }

        if (profile.diagnosis.includes("asthma") && profile.currentMedications.includes("Propranolol")) {
            suggestions.push("Cardioselective beta-blockers (e.g., Metoprolol)");
            reasoning += " Switching from non-selective Propranolol to Metoprolol reduces risk of bronchospasm.";
        }

        if (suggestions.length === 0) {
            reasoning = "No automated drug repositioning flags identified for this specific profile.";
        }

        return {
            suggestedAlternatives: suggestions,
            reasoning,
        };
    }
}
