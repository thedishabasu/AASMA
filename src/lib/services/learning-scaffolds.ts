export interface NodeModelUpdate {
    nodeId: string;
    gradientWeights: number[];
    sampleCount: number;
}

export class FederatedLearningScaffold {
    /**
     * Simulates multi-hospital training coordination without sharing raw patient data.
     */
    public static aggregateUpdates(updates: NodeModelUpdate[]): number[] {
        if (updates.length === 0) return [];

        const totalSamples = updates.reduce((acc, u) => acc + u.sampleCount, 0);
        const weightLength = updates[0].gradientWeights.length;
        const globalWeights = new Array(weightLength).fill(0);

        // Weighted average of gradients
        globalWeights.forEach((_, i) => {
            let sum = 0;
            updates.forEach((u) => {
                sum += u.gradientWeights[i] * (u.sampleCount / totalSamples);
            });
            globalWeights[i] = sum;
        });

        return globalWeights;
    }
}

export interface UncertainCase {
    patientId: string;
    prediction: number;
    uncertaintyScore: number;
}

export class ActiveLearningModule {
    /**
     * Collects cases where model is uncertain for clinician review.
     */
    public static getUncertainCases(cases: UncertainCase[], threshold = 0.7): UncertainCase[] {
        return cases.filter((c) => c.uncertaintyScore > threshold);
    }

    public static incorporateFeedback(patientId: string, feedback: "correct" | "incorrect"): string {
        return `Case ${patientId} marked for retraining with ${feedback} label.`;
    }
}
