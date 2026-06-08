import { MultimodalFusionEngine, RiskScoreResult } from "./fusion-engine";

export interface TrendData {
    timestamp: Date;
    score: number;
}

export class RiskPredictionService {
    /**
     * Continuously updates risk score and predicts future trends.
     */
    public static updateTrend(
        history: TrendData[],
        newResult: RiskScoreResult
    ): TrendData[] {
        const updatedHistory = [...history, { timestamp: newResult.timestamp, score: newResult.score }];

        // Keep only last 30 readings for trend
        if (updatedHistory.length > 30) {
            updatedHistory.shift();
        }

        return updatedHistory;
    }

    /**
     * Predicts the next risk score based on simple linear regression or moving average.
     */
    public static predictNext(history: TrendData[]): number {
        if (history.length < 3) return 50; // Baseline if not enough data

        const lastThree = history.slice(-3);
        const average = lastThree.reduce((acc, curr) => acc + curr.score, 0) / 3;

        return Math.round(average);
    }
}
