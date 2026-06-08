"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    Shield,
    Save,
    RefreshCcw,
    Database,
    CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState("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");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const handleSave = () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">System Settings</h1>
                    <p className="text-slate-400 mt-1">Configure AI Agent Mesh credentials and compliance thresholds.</p>
                </div>
                {saveSuccess && (
                    <Badge className="bg-emerald-500 text-slate-950 font-bold px-3 py-1">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Settings Saved
                    </Badge>
                )}
            </div>

            <div className="grid gap-6">
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl border-l-4 border-l-emerald-500/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <Key className="w-5 h-5" />
                            NVIDIA NIM Integration
                        </CardTitle>
                        <CardDescription className="text-slate-500">Global API key for Qwen-3.5 and Llama-3 endpoints.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">API Authorization Key</label>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="bg-slate-950/50 border-slate-700 text-slate-100 font-mono text-sm h-12"
                                />
                                <Button variant="outline" className="border-slate-700 h-12 w-12 p-0 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                                    <RefreshCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl border-l-4 border-l-blue-500/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Shield className="w-5 h-5" />
                            PII & HIPAA Guardrails
                        </CardTitle>
                        <CardDescription className="text-slate-500">Data anonymization and retention policies.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all group">
                            <div>
                                <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Patient Data Scrubbing</p>
                                <p className="text-xs text-slate-500 italic">"Always anonymize EHR data before cloud inference"</p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">ENABLED</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl border-l-4 border-l-purple-500/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-400">
                            <Database className="w-5 h-5" />
                            Mesh Persistence
                        </CardTitle>
                        <CardDescription className="text-slate-500">Manage local vector database and telemetry cache.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                        <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-slate-200 flex-1 hover:bg-slate-800 transition-all">
                            Purge Cache
                        </Button>
                        <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-slate-200 flex-1 hover:bg-slate-800 transition-all">
                            Verify DB Integrity
                        </Button>
                    </CardContent>
                </Card>

                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold h-14 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Apply & Cloud Sync Configuration
                    </Button>
                    <p className="text-center text-[10px] text-slate-600 mt-4 uppercase font-bold tracking-widest">
                        Syncing with AASMA-NODE-01 (Active)
                    </p>
                </div>
            </div>
        </div>
    );
}
