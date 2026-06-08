export type NudgeStrategy = "reminder" | "social proof" | "doctor-voice" | "loss aversion";

export interface PatientBehavior {
    medicationAdherenceRate: number; // 0-1
    lastActivityTimestamp: Date;
    responsivenessHistory: number; // 0-1
}

export interface NudgeRecommendation {
    type: NudgeStrategy;
    message: string;
    intensity: "Low" | "Medium" | "High";
}

export class BehavioralNudgingService {
    /**
     * Recommends personalized nudges based on patient behavior patterns.
     */
    public static getNudge(behavior: PatientBehavior): NudgeRecommendation {
        if (behavior.medicationAdherenceRate < 0.6) {
            return {
                type: "loss aversion",
                message: "Missing your doses today increases your risk of hospital readmission by 20%. Stay on track for your health.",
                intensity: "High",
            };
        }

        if (behavior.medicationAdherenceRate < 0.85) {
            return {
                type: "doctor-voice",
                message: "Dr. Smith noticed you missed your morning pill. It's important for your heart health to take it regularly.",
                intensity: "Medium",
            };
        }

        if (behavior.responsivenessHistory < 0.5) {
            return {
                type: "social proof",
                message: "95% of patients in your age group find that setting a morning alarm helps them stay healthy.",
                intensity: "Low",
            };
        }

        return {
            type: "reminder",
            message: "Time for your scheduled health check-in. You're doing great!",
            intensity: "Low",
        };
    }
}
