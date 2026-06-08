"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BrainCircuit,
    Layers,
    Network,
    Database,
    TrendingUp,
    Fingerprint,
    Stethoscope
} from "lucide-react";

export default function InsightsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">AI Intelligence Layer</h1>
                <p className="text-slate-400 mt-1">Deep analysis of the underlying model ensemble and predictive engines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InsightCard
                    title="Multimodal Fusion Status"
                    icon={Layers}
                    status="Optimized"
                    description="EHR, Wearable, and Environmental streams are synchronized with a latencies < 15ms."
                    metrics={["Data Points: 1.2M", "Fusion Accuracy: 96.8%"]}
                    color="emerald"
                />
                <InsightCard
                    title="Federated Learning Hub"
                    icon={Network}
                    status="Aggregating"
                    description="Simulated multi-hospital coordination active. Currently syncing with 4 virtual nodes."
                    metrics={["Nodes: 4", "Global Update: 2m ago"]}
                    color="blue"
                />
                <InsightCard
                    title="Active Learning"
                    icon={Stethoscope}
                    status="Awaiting Review"
                    description="12 edge cases identified where model uncertainty crosses critical threshold (0.85)."
                    metrics={["Queue: 12", "Review Priority: High"]}
                    color="amber"
                />
            </div>

            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-emerald-400" />
                        Personalized Baseline Anomaly Engine
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-3">Model Logic (XGBoost)</h4>
                            <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                The engine calculates a dynamic Z-score and 6-hour trend analysis from 13 clinical features. It utilizes an XGBoost classifier (100 estimators, depth 4) trained on a robust cross-validated profile base.
                            </p>
                            <div className="flex flex-wrap gap-2 text-[10px] mt-2 font-mono text-slate-500">
                                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700">features=13</span>
                                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700">fusion=0.6_EHR+0.4_Wear</span>
                                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700">target_AUROC=0.943</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-3">Recent Performance</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Target Accuracy</span>
                                    <span className="text-xs font-mono text-emerald-400">91.7%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-700 rounded-full">
                                    <div className="h-full w-[91.7%] bg-emerald-500 rounded-full" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">AUROC Achievement</span>
                                    <span className="text-xs font-mono text-blue-400">0.943</span>
                                </div>
                                <div className="w-full h-1 bg-slate-700 rounded-full">
                                    <div className="h-full w-[94.3%] bg-blue-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function InsightCard({ title, icon: Icon, status, description, metrics, color }: any) {
    const themes = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800 border-l-4 border-l-emerald-500/50 hover:border-l-emerald-400 transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-2 rounded-lg", themes[color as keyof typeof themes])}>
                        <Icon size={20} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", themes[color as keyof typeof themes])}>
                        {status}
                    </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-100">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    "{description}"
                </p>
                <div className="pt-4 border-t border-slate-800 space-y-2">
                    {metrics.map((m: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                            <Database className="w-3 h-3" />
                            {m}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
