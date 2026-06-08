import { EnvironmentalData } from "./fusion-engine";

export interface HealthAlert {
    id: string;
    severity: "Low" | "Medium" | "High";
    title: string;
    message: string;
    timestamp: Date;
}

export class EnvironmentalAlertingService {
    /**
     * Generates health alerts when AQI or weather exposure crosses risk thresholds.
     */
    public static checkAlerts(env: EnvironmentalData, patientVulnerabilities: string[]): HealthAlert[] {
        const alerts: HealthAlert[] = [];

        if (env.aqi > 150) {
            alerts.push({
                id: `aqi-${Date.now()}`,
                severity: "High",
                title: "Very Unhealthy Air Quality",
                message: "AQI is dangerously high. Avoid all outdoor activities.",
                timestamp: new Date(),
            });
        } else if (env.aqi > 100) {
            const isVulnerable = patientVulnerabilities.includes("asthma") || patientVulnerabilities.includes("COPD");
            alerts.push({
                id: `aqi-${Date.now()}`,
                severity: isVulnerable ? "High" : "Medium",
                title: "Poor Air Quality",
                message: isVulnerable
                    ? "Stay indoors. High risk for respiratory irritation."
                    : "Sensitive groups should reduce outdoor exertion.",
                timestamp: new Date(),
            });
        }

        if (env.temperature > 35) {
            alerts.push({
                id: `temp-${Date.now()}`,
                severity: "Medium",
                title: "Extreme Heat Warning",
                message: "Stay hydrated and cool. Limit direct sun exposure.",
                timestamp: new Date(),
            });
        }

        return alerts;
    }
}
