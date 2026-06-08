"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Server,
    Zap,
    Cpu,
    Network,
    Clock,
    CheckCircle2
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

const performanceData = [
    { time: "14:00", latency: 12, cpu: 22, memory: 45 },
    { time: "14:10", latency: 15, cpu: 25, memory: 48 },
    { time: "14:20", latency: 11, cpu: 20, memory: 42 },
    { time: "14:30", latency: 18, cpu: 30, memory: 55 },
    { time: "14:40", latency: 14, cpu: 24, memory: 47 },
    { time: "14:50", latency: 13, cpu: 21, memory: 44 },
];

export default function MonitoringPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">System Monitoring</h1>
                    <p className="text-slate-400 mt-1">Real-time infrastructure health and model performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        All Pods Healthy
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard title="Backend Latency" value="14ms" sub="Avg (P95)" icon={Clock} color="text-blue-500" />
                <StatusCard title="CPU Utilization" value="24%" sub="4 Nodes" icon={Cpu} color="text-amber-500" />
                <StatusCard title="Memory Load" value="4.2GB" sub="Distributed" icon={Server} color="text-purple-500" />
                <StatusCard title="Kafka Throughput" value="1.2k" sub="msgs/sec" icon={Network} color="text-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            API Latency (ms)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Resource Consumption (%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Line type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} dot={false} name="CPU" />
                                <Line type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} dot={false} name="Memory" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatusCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <Card className="bg-slate-900/40 border-slate-800 shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-slate-800/50 ${color}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
                            <span className="text-[10px] text-slate-500 font-mono">{sub}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
