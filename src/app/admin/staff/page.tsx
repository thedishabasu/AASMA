"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDoctors, addDoctor, deleteDoctor, updateDoctorBurnout } from "@/app/actions/management-actions";
import {
    UserPlus,
    Stethoscope,
    Hospital,
    Mail,
    Trash2,
    Search,
    Clock,
    Users,
    Moon,
    Flame,
    Loader2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    async function loadDoctors() {
        const data = await getDoctors();
        setDoctors(data);
        setLoading(false);
    }

    async function handleAddDoctor(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await addDoctor(formData);

            if (result.success) {
                e.currentTarget.reset();
                await loadDoctors();
            } else {
                setError(result.error || "Failed to add clinician.");
            }
        } catch (err: any) {
            setError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleUpdateBurnout(id: string, shift: number, load: number, sleep: number) {
        setUpdatingId(id);
        const result = await updateDoctorBurnout(id, shift, load, sleep);
        if (result.success) {
            await loadDoctors();
        }
        setUpdatingId(null);
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to remove this clinician?")) {
            const result = await deleteDoctor(id);
            if (result.success) {
                loadDoctors();
            }
        }
    }

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Staff Health & Performance</h1>
                    <p className="text-slate-400">Monitor clinician burnout risk and manage agents in the AASMA mesh.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search staff..."
                        className="bg-slate-900/50 border-slate-800 pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to Add Doctor */}
                <Card className="bg-slate-900/40 border-slate-800 h-fit sticky top-8">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-emerald-400" />
                            Identity Provisioning
                        </CardTitle>
                        <CardDescription>Onboard a new clinician to the multimodal observation mesh.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDoctor} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[2px]">Full Name</label>
                                <Input name="name" placeholder="Dr. Elena Rodriguez" required className="bg-slate-950/50 border-slate-800 h-11 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[2px]">Specialty</label>
                                <Input name="specialty" placeholder="Cardiology" required className="bg-slate-950/50 border-slate-800 h-11 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[2px]">Hospital/Unit</label>
                                <Input name="hospital" placeholder="Central Metro Health" required className="bg-slate-950/50 border-slate-800 h-11 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[2px]">Email Address</label>
                                <Input name="email" type="email" placeholder="elena.r@aasma.ai" required className="bg-slate-950/50 border-slate-800 h-11 text-white" />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black h-12 shadow-[0_10px_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Activate Staff Identity"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Staff List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <Card className="bg-slate-900/40 border-slate-800 border-dashed p-12 text-center rounded-3xl">
                            <p className="text-slate-500 font-medium">No medical staff identities found in this shard.</p>
                        </Card>
                    ) : (
                        filteredDoctors.map((doc) => (
                            <Card key={doc.id} className="bg-slate-900 shadow-2xl border-slate-800 hover:border-slate-700 transition-all rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-all">
                                                <Stethoscope className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-slate-100">{doc.name}</h3>
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black">{doc.specialty}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <Hospital className="w-3.5 h-3.5" />
                                                        {doc.hospital}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {doc._count?.patients || 0} Patients
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Burnout Detection Panel */}
                                    <div className="p-8 bg-slate-950/30 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] flex items-center gap-2">
                                                    <Flame className="w-3.5 h-3.5 text-rose-500" /> Burnout Metrics
                                                </h4>
                                                {updatingId === doc.id && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                                            </div>

                                            <div className="space-y-5">
                                                <MetricSlider
                                                    label="Shift Duration"
                                                    value={doc.shiftHours}
                                                    max={16}
                                                    unit="hrs"
                                                    icon={Clock}
                                                    onChange={(val: number) => handleUpdateBurnout(doc.id, val, doc.patientLoad, doc.sleepHours)}
                                                />
                                                <MetricSlider
                                                    label="Patient Load"
                                                    value={doc.patientLoad}
                                                    max={40}
                                                    unit="pts"
                                                    icon={Users}
                                                    onChange={(val: number) => handleUpdateBurnout(doc.id, doc.shiftHours, val, doc.sleepHours)}
                                                />
                                                <MetricSlider
                                                    label="Sleep Quality"
                                                    value={doc.sleepHours}
                                                    max={12}
                                                    unit="hrs"
                                                    icon={Moon}
                                                    onChange={(val: number) => handleUpdateBurnout(doc.id, doc.shiftHours, doc.patientLoad, val)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-slate-800/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <Flame className="w-12 h-12" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">Burnout Risk Prediction</p>
                                            <div className="text-5xl font-black font-mono tracking-tighter mb-2">
                                                <span className={cn(
                                                    doc.burnoutRisk > 0.7 ? "text-rose-500" :
                                                        doc.burnoutRisk > 0.4 ? "text-amber-500" : "text-emerald-500"
                                                )}>
                                                    {Math.round(doc.burnoutRisk * 100)}%
                                                </span>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "font-black text-[9px] uppercase px-3",
                                                doc.burnoutRisk > 0.7 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    doc.burnoutRisk > 0.4 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {doc.burnoutRisk > 0.7 ? "Mandatory Handover Recommended" :
                                                    doc.burnoutRisk > 0.4 ? "Observation Needed" : "Optimal Performance"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricSlider({ label, value, max, unit, icon: Icon, onChange }: any) {
    return (
        <div className="space-y-3 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-colors">
            <div className="flex justify-between items-center text-[11px] font-bold">
                <div className="flex items-center gap-2 text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                </div>
                <span className="text-slate-200 font-mono">{value}{unit}</span>
            </div>
            <input
                type="range"
                min="0"
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}
