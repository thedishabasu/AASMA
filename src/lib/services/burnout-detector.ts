export interface ClinicianWorkload {
    shiftHours: number;
    patientsAssigned: number;
    urgentAlertsHandled: number;
    breakTimeMinutes: number;
}

export interface BurnoutAssessment {
    burnoutScore: number; // 0-100
    riskLevel: "Low" | "Moderate" | "High" | "Critical";
    recommendations: string[];
}

export class BurnoutDetector {
    /**
     * Simulates clinician burnout risk based on workload and shift data.
     */
    public static assess(workload: ClinicianWorkload): BurnoutAssessment {
        let score = 0;

        // 1. Shift Duration Impact
        if (workload.shiftHours > 12) score += 40;
        else if (workload.shiftHours > 8) score += 20;

        // 2. Patient Load Impact
        if (workload.patientsAssigned > 15) score += 30;
        else if (workload.patientsAssigned > 10) score += 15;

        // 3. Cognitive Load (Alerts)
        if (workload.urgentAlertsHandled > 5) score += 20;

        // 4. Recovery (Breaks)
        if (workload.breakTimeMinutes < 30) score += 15;
        else score -= 10;

        // Normalize
        score = Math.min(100, Math.max(0, score));

        const level = this.getRiskLevel(score);
        const recommendations = this.getRecommendations(level, workload);

        return {
            burnoutScore: score,
            riskLevel: level,
            recommendations,
        };
    }

    private static getRiskLevel(score: number): "Low" | "Moderate" | "High" | "Critical" {
        if (score < 30) return "Low";
        if (score < 60) return "Moderate";
        if (score < 85) return "High";
        return "Critical";
    }

    private static getRecommendations(level: string, workload: ClinicianWorkload): string[] {
        const recs: string[] = [];
        if (level === "High" || level === "Critical") {
            recs.push("Mandatory 15-minute break suggested immediately.");
            recs.push("Review task distribution with supervisor.");
        }
        if (workload.shiftHours > 10) {
            recs.push("Ensure 8+ hours of rest before next shift.");
        }
        if (recs.length === 0) recs.push("Maintain current workload balanced with wellness checks.");
        return recs;
    }
}
