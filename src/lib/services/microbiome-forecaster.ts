export interface MicrobiomeEntry {
    timestamp: Date;
    diversityIndex: number; // 0-1
    beneficialStrainRatio: number; // 0-1
}

export interface ForecastingResult {
    dysbiosisRisk: number; // 0-100
    predictionTimeframe: string;
    topConcern: string;
}

export class MicrobiomeForecaster {
    /**
     * Predicts microbiome imbalance (dysbiosis) risk from historical trends.
     */
    public static forecastRisk(history: MicrobiomeEntry[]): ForecastingResult {
        if (history.length < 2) {
            return { dysbiosisRisk: 5, predictionTimeframe: "7 days", topConcern: "Insufficient baseline data" };
        }

        const latest = history[history.length - 1];
        const previous = history[history.length - 2];

        const diversityDrop = previous.diversityIndex - latest.diversityIndex;
        let risk = 10;

        if (diversityDrop > 0.1) risk += 40;
        if (latest.beneficialStrainRatio < 0.3) risk += 30;

        risk = Math.min(100, Math.max(0, risk));

        return {
            dysbiosisRisk: risk,
            predictionTimeframe: "7 days",
            topConcern: risk > 50 ? "Rapid decline in microbial diversity" : "Maintaining stable balance",
        };
    }
}
