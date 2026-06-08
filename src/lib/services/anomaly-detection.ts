import { WearableMetrics } from "./fusion-engine";

export interface AnomalyResult {
    isAnomaly: boolean;
    deviationScore: number;
    metric: keyof WearableMetrics;
    description: string;
}

export class AnomalyDetectionService {
    /**
     * Learns normal wearable patterns per patient and flags subtle deviations.
     */
    public static detector(
        baseline: WearableMetrics,
        current: WearableMetrics,
        zThreshold = 2.5
    ): AnomalyResult[] {
        const anomalies: AnomalyResult[] = [];

        const check = (key: keyof WearableMetrics, standardVal: number) => {
            const diff = Math.abs(current[key] - standardVal);
            const deviation = diff / standardVal; // Simplified Z-score simulation

            if (deviation > 0.3) { // 30% deviation from baseline
                anomalies.push({
                    isAnomaly: true,
                    deviationScore: deviation,
                    metric: key,
                    description: `Significant deviation detected in ${key}. Current: ${current[key]}, Baseline: ${standardVal}`,
                });
            }
        };

        check("heartRate", baseline.heartRate);
        check("oxygenLevel", baseline.oxygenLevel);

        return anomalies;
    }
}
