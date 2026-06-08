export interface EHRData {
  age: number;
  gender: string;
  medicalHistory: string[];
  lastCheckup: Date;
}

export interface WearableMetrics {
  heartRate: number;
  oxygenLevel: number; // SpO2 percentage
  activityLevel: number; // steps or active calories
}

export interface EnvironmentalData {
  aqi: number;
  temperature: number;
  humidity: number;
}

export interface RiskScoreResult {
  score: number; // 0-100
  confidence: number; // 0-1
  factors: string[];
  timestamp: Date;
}

export class MultimodalFusionEngine {
  /**
   * Calculates a unified patient risk score based on fused data streams.
   */
  public static calculateRisk(
    ehr: EHRData,
    wearable: WearableMetrics,
    env: EnvironmentalData
  ): RiskScoreResult {
    let score = 0;
    const factors: string[] = [];

    // 1. Wearable Analysis (High Weight)
    if (wearable.heartRate > 100 || wearable.heartRate < 50) {
      score += 25;
      factors.push("Abnormal Heart Rate");
    }
    if (wearable.oxygenLevel < 94) {
      score += 30;
      factors.push("Low Oxygen Saturation");
    }

    // 2. Environmental Analysis
    if (env.aqi > 100) {
      score += 15;
      factors.push("Poor Air Quality (AQI)");
    }

    // 3. EHR Context
    if (ehr.age > 65) {
      score += 10;
      factors.push("Advanced Age Risk");
    }
    if (ehr.medicalHistory.includes("hypertension")) {
      score += 10;
      factors.push("History of Hypertension");
    }

    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score));

    // Confidence Level based on data completeness/consistency
    const confidence = this.calculateConfidence(wearable, env);

    return {
      score,
      confidence,
      factors,
      timestamp: new Date(),
    };
  }

  private static calculateConfidence(
    wearable: WearableMetrics,
    env: EnvironmentalData
  ): number {
    // Simple heuristic for demo: more realistic sensor data -> higher confidence
    if (wearable.heartRate === 0 || wearable.oxygenLevel === 0) return 0.5;
    return 0.92; // High confidence for valid telemetry
  }
}
