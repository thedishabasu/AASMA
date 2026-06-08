"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    BarChart,
    Scale,
    Info
} from "lucide-react";
import { initiateActiveLearning } from "@/app/actions/ai-actions";
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

const genderData = [
    { group: "Male", accuracy: 94 },
    { group: "Female", accuracy: 92 },
    { group: "Non-Binary", accuracy: 78 },
];

const ageData = [
    { group: "18-35", accuracy: 96 },
    { group: "36-55", accuracy: 93 },
    { group: "56-75", accuracy: 89 },
    { group: "75+", accuracy: 72 },
];

export default function FairnessPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">Fairness Monitoring</h1>
                    <p className="text-slate-400 mt-1">Real-time demographic parity analysis and bias detection.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1.5 border-rose-500/30 text-rose-500 bg-rose-500/5 font-semibold">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Bias Detected: Action Required
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Disparity Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-500">22.4%</div>
                        <p className="text-xs text-rose-500/70 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Exceeds threshold (15%)
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Groups Monitored</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-100">8</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Gender, Age, Ethnicity
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Privacy Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-400">Differential</div>
                        <p className="text-xs text-blue-400/70 mt-1 flex items-center gap-1">
                            <Scale className="w-3 h-3" />
                            ϵ = 0.5 (High)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Scale className="w-5 h-5 text-emerald-400" />
                            Gender Parity (Model Accuracy)
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Comparing AUC-ROC metrics across gender identities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={genderData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis
                                    dataKey="group"
                                    type="category"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                                />
                                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.accuracy < 85 ? "#f43f5e" : "#10b981"} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-blue-400" />
                            Age Disparity Metrics
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Identifying performance degradation in older demographic brackets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="group"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                                />
                                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} barSize={40}>
                                    {ageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.accuracy < 80 ? "#f43f5e" : "#3b82f6"} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                    <AlertCircle className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Active Debiasing Needed</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                    Disparity detected in the 75+ age group (72% accuracy vs 96% in 18-35). This suggests under-representation
                    of elderly physiological variants in the multimodal training set. Recommendation: Prioritize retrospective
                    data collection for age brackets &gt; 70 for the next Active Learning cycle.
                </p>
                <div className="flex items-center gap-4 pt-2">
                    <Button
                        onClick={async () => {
                            const btn = document.getElementById("initiate-al-btn");
                            if (btn) btn.innerText = "Initiating...";
                            const res = await initiateActiveLearning();
                            alert(res.message || res.error);
                            if (btn) btn.innerText = "Initiate Active Learning";
                        }}
                        id="initiate-al-btn"
                        className="bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold px-6"
                    >
                        Initiate Active Learning
                    </Button>
                    <Button variant="ghost" className="text-slate-400 hover:text-slate-200">
                        <Info className="w-4 h-4 mr-2" />
                        View Full Audit Log
                    </Button>
                </div>
            </div>
        </div>
    );
}
