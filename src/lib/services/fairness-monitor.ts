export interface DemographicPerformance {
    group: string;
    accuracy: number;
    falsePositiveRate: number;
    sampleSize: number;
}

export interface FairnessReport {
    isFair: boolean;
    disparityScore: number;
    flaggedGroups: string[];
    metrics: DemographicPerformance[];
}

export class FairnessMonitor {
    private static DISPARITY_THRESHOLD = 0.15; // 15% disparity allowed

    /**
     * Compares model performance across gender and age groups and flags bias.
     */
    public static monitor(metrics: DemographicPerformance[]): FairnessReport {
        const flagship = metrics[0]; // Assume first is baseline (e.g., Male or Age 18-45)
        const flaggedGroups: string[] = [];
        let maxDisparity = 0;

        metrics.forEach((m) => {
            const disparity = Math.abs(flagship.accuracy - m.accuracy);
            if (disparity > maxDisparity) maxDisparity = disparity;

            if (disparity > this.DISPARITY_THRESHOLD) {
                flaggedGroups.push(m.group);
            }
        });

        return {
            isFair: flaggedGroups.length === 0,
            disparityScore: maxDisparity,
            flaggedGroups,
            metrics,
        };
    }
}
