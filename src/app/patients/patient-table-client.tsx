"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MoreVertical, Filter, ArrowUpRight, Activity, X, Info, Zap, TrendingDown, Target, Brain, CheckCircle, AlertCircle, Loader2, ShieldAlert, Heart, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { createPatient, updatePatient, deletePatient } from "@/app/actions/patient-actions";
import { getDrugIntelligence, getBehavioralNudge } from "@/app/actions/ai-actions";
import { submitFeedback } from "@/app/actions/feedback-actions";
import { cn } from "@/lib/utils";

const computeFusionScore = (ehrRisk: number, wearRisk: number) => {
    return Math.min(100, Math.max(0, Math.round((0.6 * ehrRisk) + (0.4 * wearRisk))));
};

// Mock SHAP data for display
const mockShapData = [
    { name: "Heart Rate Variability", value: 32.4, color: "bg-emerald-500" },
    { name: "Systolic Blood Pressure", value: 24.1, color: "bg-amber-500" },
    { name: "SpO2 Level", value: 18.5, color: "bg-blue-500" },
    { name: "PM2.5 Exposure", value: 15.2, color: "bg-rose-500" },
    { name: "Age Factor", value: 9.8, color: "bg-slate-500" },
];

export default function PatientTableClient({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isInsightsOpen, setInsightsOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [counterfactuals, setCounterfactuals] = useState({ hr: 0, sbp: 0, pm25: 0 });
    const [drugAnalysis, setDrugAnalysis] = useState<string | null>(null);
    const [behavioralNudge, setBehavioralNudge] = useState<any>(null);
    const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", age: 45, gender: "Male", medicalHistory: "None",
        heartRate: 70, hrv: 50, systolicBp: 120, diastolicBp: 80, spo2: 98,
        temperature: 36.5, activityLevel: 5.0, pm25: 15, aqi: 45, status: "Stable", riskScore: 30,
        respiratoryRate: 16, glucoseLevel: 100, cholesterol: 200, bmi: 22,
        dailyFiberIntake: 25, sleepHours: 7, stressLevel: 3, smokingStatus: "None",
        alcoholIntake: 0, exerciseMinutes: 30, adherenceRate: 0.85, medicineAdherence: true
    });

    const filteredPatients = initialData.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this patient record?")) {
            const result = await deletePatient(id);
            if (result.success) {
                router.refresh();
            } else {
                alert("Error deleting patient: " + result.error);
            }
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createPatient(formData);
        if (result.success) {
            setAddModalOpen(false);
            resetForm();
            router.refresh();
        } else {
            alert("Error creating patient: " + result.error);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPatient) {
            const result = await updatePatient(selectedPatient.id, formData);
            if (result.success) {
                setEditModalOpen(false);
                setSelectedPatient(null);
                resetForm();
                router.refresh();
            } else {
                alert("Error updating patient: " + result.error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "", lastName: "", age: 45, gender: "Male", medicalHistory: "None",
            heartRate: 70, hrv: 50, systolicBp: 120, diastolicBp: 80, spo2: 98,
            temperature: 36.5, activityLevel: 5.0, pm25: 15, aqi: 45, status: "Stable", riskScore: 30,
            respiratoryRate: 16, glucoseLevel: 100, cholesterol: 200, bmi: 22,
            dailyFiberIntake: 25, sleepHours: 7, stressLevel: 3, smokingStatus: "None",
            alcoholIntake: 0, exerciseMinutes: 30, adherenceRate: 0.85, medicineAdherence: true
        });
    };

    const openEdit = (patient: any) => {
        setSelectedPatient(patient);
        setFormData({ ...patient });
        setEditModalOpen(true);
    };

    const openInsights = async (patient: any) => {
        setSelectedPatient(patient);
        setInsightsOpen(true);
        setCounterfactuals({ hr: 0, sbp: 0, pm25: 0 });
        setDrugAnalysis(null);
        setBehavioralNudge(null);

        // Trigger Intelligence Agent
        setIsIntelligenceLoading(true);

        // Parallel fetch for intelligence and behavioral nudging
        const [drugResult, nudgeResult] = await Promise.all([
            getDrugIntelligence(patient),
            getBehavioralNudge(patient.id, patient.adherenceRate || 0.85)
        ]);

        setDrugAnalysis(drugResult.analysis);
        setBehavioralNudge(nudgeResult.nudge);
        setIsIntelligenceLoading(false);
    };

    const handleFeedback = async (type: string, id: string, quality: string) => {
        await submitFeedback({
            entityType: type,
            entityId: id,
            feedback: quality,
            clinicianId: "DEMO_USER"
        });
        alert(`Clinical Feedback Logged: ${quality}. Data point added to Active Learning buffer.`);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or ID..."
                        className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 transition-all focus:ring-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-slate-800 text-slate-300 hover:bg-slate-800">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Patient
                    </Button>
                </div>
            </div >

            <Card className="bg-slate-900/60 border-slate-800/60 overflow-hidden backdrop-blur-xl group/card shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-rose-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-800/20">
                            <TableRow className="border-slate-800/50 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-semibold py-4">Patient Info</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Demographics</TableHead>
                                <TableHead className="text-slate-400 font-semibold">XGBoost Risk Score</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Medicine</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Last Sync</TableHead>
                                <TableHead className="text-right text-slate-400 font-semibold pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredPatients.map((patient, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ delay: i * 0.03 }}
                                        key={patient.id}
                                        className="border-slate-800/40 hover:bg-slate-800/30 transition-all group/row relative"
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400 border border-slate-700 group-hover/row:border-emerald-500/50 transition-colors">
                                                    {patient.firstName[0]}{patient.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-200 group-hover/row:text-emerald-400 transition-colors">
                                                        {patient.firstName} {patient.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{patient.id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-slate-300 text-sm font-medium">{patient.age}y • {patient.gender}</p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">{patient.medicalHistory || "No declared history"}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">HR: {Math.round(patient.heartRate)}</span>
                                                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">BP: {Math.round(patient.systolicBp)}/80</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-300">{computeFusionScore(patient.riskScore, patient.heartRate > 100 ? 80 : 30)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/30">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${computeFusionScore(patient.riskScore, patient.heartRate > 100 ? 80 : 30)}%` }}
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            computeFusionScore(patient.riskScore, 20) > 70 ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" :
                                                                computeFusionScore(patient.riskScore, 20) > 40 ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" :
                                                                    "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-md px-2 py-0.5 text-[10px] transition-all border font-bold uppercase tracking-widest",
                                                patient.medicineAdherence ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            )}>
                                                {patient.medicineAdherence ? "ON TIME" : "DELAYED"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-md px-2 py-0.5 text-[10px] transition-all border",
                                                patient.status === "Critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    patient.status === "Observation" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {patient.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-mono">
                                            {new Date(patient.lastUpdated).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <Button
                                                    onClick={() => openInsights(patient)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                >
                                                    <Zap className="w-3 h-3 mr-1.5" />
                                                    Insights
                                                </Button>
                                                <Button
                                                    onClick={() => openEdit(patient)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                                <DropdownActions patient={patient} />
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Side Insights Panel (21st.dev Drawer style) */}
            <AnimatePresence>
                {isInsightsOpen && selectedPatient && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[50]"
                            onClick={() => setInsightsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-[ -20px_0_50px_rgba(0,0,0,0.5)] z-[60] overflow-y-auto"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-100">ML Insights</h3>
                                            <p className="text-sm text-slate-400">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-800" onClick={() => setInsightsOpen(false)}>
                                        <X className="w-5 h-5 text-slate-500" />
                                    </Button>
                                </div>

                                {/* Multimodal Risk Score (Phase 4) */}
                                <section className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Activity className="w-20 h-20 text-emerald-500" />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="flex items-center justify-between w-full mb-6">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[2.5px]">Multimodal Risk Score</h4>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/10"
                                                    onClick={() => handleFeedback("RiskScore", selectedPatient.id, "Accurate")}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> VERIFY
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 border border-rose-500/10"
                                                    onClick={() => handleFeedback("RiskScore", selectedPatient.id, "Inaccurate")}
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> FLAG
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tabular-nums">
                                            {computeFusionScore(selectedPatient.riskScore, selectedPatient.heartRate > 100 ? 80 : 30)}
                                        </div>
                                        <Badge className={cn(
                                            "mt-6 px-6 py-2 text-xs font-black uppercase tracking-widest",
                                            selectedPatient.riskScore > 70 ? "bg-rose-500 text-slate-950" :
                                                selectedPatient.riskScore > 40 ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950"
                                        )}>
                                            {selectedPatient.status} • {selectedPatient.riskScore > 70 ? "Protocol Required" : "Continuous Monitoring"}
                                        </Badge>
                                    </div>
                                </section>

                                {/* Behavioral Nudge (Phase 3) */}
                                <section className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Behavioral Nudge</h4>
                                    </div>
                                    <p className="text-sm text-slate-100 font-medium leading-relaxed">
                                        {selectedPatient.heartRate > 85
                                            ? "You are losing the cardiovascular protection you built up! Missing doses increases risk by 25%."
                                            : "80% of patients with your profile stayed active today! You're in the top tier."}
                                    </p>
                                    <Badge variant="outline" className="mt-3 border-emerald-500/30 text-emerald-400 text-[9px] uppercase font-bold px-2 py-0.5">
                                        {selectedPatient.heartRate > 85 ? "Loss Aversion Framing (2.5x Impact)" : "Social Proof Framing"}
                                    </Badge>
                                </section>

                                {/* Hybrid Anomaly Meter */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> Hybrid Anomaly Detection
                                        </h4>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">92.1% Sensitivity</Badge>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-20"><Info className="w-4 h-4" /></div>
                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-3xl font-black text-slate-100 font-mono tracking-tighter">0.14<span className="text-slate-500 text-sm">/1.0</span></p>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Normal Pattern detected</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500">IF: 0.08 | Z-Score: 0.23</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: "14%" }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                                        </div>
                                    </div>
                                </section>

                                {/* Drug Repositioning suggestions (Phase 3/6) */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3 h-3" /> GPT Clinical Intelligence
                                        </h4>
                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black">ACTIVE LEARNING ON</Badge>
                                    </div>
                                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
                                        {isIntelligenceLoading ? (
                                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">Analyzing Polypharmacy Profile...</p>
                                            </div>
                                        ) : drugAnalysis ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mt-0.5">
                                                        <Brain className="w-3 h-3 text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                                                            {drugAnalysis}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider mr-2">Feedback Loop:</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 text-[10px] font-bold border-slate-800 hover:bg-emerald-500/10 hover:text-emerald-400 gap-1.5"
                                                        onClick={() => handleFeedback("DrugAnalysis", selectedPatient.id, "Correct")}
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> Verify
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 text-[10px] font-bold border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 gap-1.5"
                                                        onClick={() => handleFeedback("DrugAnalysis", selectedPatient.id, "Incorrect")}
                                                    >
                                                        <AlertCircle className="w-3 h-3" /> Flag
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-slate-600 italic text-center py-4">Intelligence Mesh Standby. Open panel to initiate scan.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Behavioral Nudging (Phase 8 - Prospect Theory) */}
                                {behavioralNudge && (
                                    <section className={cn(
                                        "p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500",
                                        behavioralNudge.type === "Loss Aversion"
                                            ? "bg-rose-500/10 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]"
                                            : "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                    )}>
                                        <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10 blur-2xl rounded-full bg-current" />
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {behavioralNudge.type === "Loss Aversion" ? (
                                                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                                                    ) : (
                                                        <Sparkles className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                    <h4 className={cn(
                                                        "text-[10px] font-black uppercase tracking-[2px]",
                                                        behavioralNudge.type === "Loss Aversion" ? "text-rose-400" : "text-emerald-400"
                                                    )}>
                                                        {behavioralNudge.type} Nudge
                                                    </h4>
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black",
                                                    behavioralNudge.type === "Loss Aversion" ? "border-rose-500/30 text-rose-400" : "border-emerald-500/30 text-emerald-400"
                                                )}>
                                                    Psych Multiplier: {behavioralNudge.psychological_impact}x
                                                </Badge>
                                            </div>

                                            <p className="text-sm font-bold text-slate-100 leading-tight">
                                                "{behavioralNudge.message}"
                                            </p>

                                            <div className="pt-2 border-t border-slate-800/10">
                                                <p className="text-[10px] text-slate-400 font-medium italic mb-3">
                                                    Perspective: {behavioralNudge.type === "Loss Aversion"
                                                        ? "Leveraging loss framing for 2.5x impact."
                                                        : "Leveraging social proof and normative framing."}
                                                </p>
                                                <Button className={cn(
                                                    "w-full h-10 text-[11px] font-black uppercase tracking-widest",
                                                    behavioralNudge.type === "Loss Aversion"
                                                        ? "bg-rose-500 hover:bg-rose-600 text-slate-950"
                                                        : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                                                )}>
                                                    {behavioralNudge.cta}
                                                </Button>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Microbiome Score (Phase 3) */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> Microbiome Forecast
                                        </h4>
                                        <span className="text-[10px] font-mono text-slate-400">Dietary Fiber: 22g/day</span>
                                    </div>
                                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                                        <div className="h-10 w-10 rounded-full border-2 border-slate-800 flex items-center justify-center relative">
                                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin-slow" />
                                            <span className="text-[10px] font-bold text-emerald-400">0.22</span>
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <p className="text-xs font-bold text-slate-200">Dysbiosis Risk: Low</p>
                                            <p className="text-[10px] text-slate-500">Stable gut diversity forecasted for next 72h.</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SHAP Feature Attribution */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3 h-3" /> SHAP Feature Attribution
                                        </h4>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10"
                                                onClick={() => handleFeedback("SHAP", selectedPatient.id, "Correct")}
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10"
                                                onClick={() => handleFeedback("SHAP", selectedPatient.id, "Incorrect")}
                                            >
                                                <AlertCircle className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                        {mockShapData.map((feat, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-[10px] transition-all">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider">{feat.name}</span>
                                                    <span className="text-slate-300 font-bold font-mono">{feat.value}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${feat.value}%` }}
                                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                                        className={cn("h-full rounded-full", feat.color)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Medications Management (New for Expo) */}
                                <section className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Active Prescriptions
                                    </h4>
                                    <div className="space-y-3">
                                        {(selectedPatient.prescriptions || []).map((med: any) => (
                                            <div key={med.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between group/med">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-100">{med.name}</p>
                                                    <p className="text-[10px] text-slate-500">{med.dosage} • {med.frequency}</p>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">{med.status}</Badge>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 h-9 text-[10px] font-bold uppercase">
                                            + Add New Medication
                                        </Button>
                                    </div>
                                </section>

                                {/* EXPO SIMULATION CENTER (New) */}
                                <section className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-4 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[2px] flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Expo Simulation Center
                                        </h4>
                                        <Badge className="bg-rose-500 text-slate-950 font-black text-[9px] px-2">LIVE DEMO</Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-normal">Override live telemetry to trigger critical system responses for the tester.</p>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="secondary"
                                            className="h-9 text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                                            onClick={async () => {
                                                await updatePatient(selectedPatient.id, { heartRate: 145, status: "Critical" });
                                                setInsightsOpen(false);
                                            }}
                                        >
                                            Simulate Tachycardia
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="h-9 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                                            onClick={async () => {
                                                await updatePatient(selectedPatient.id, { pm25: 85, status: "Observation" });
                                                setInsightsOpen(false);
                                            }}
                                        >
                                            PM2.5 Spike
                                        </Button>
                                    </div>
                                </section>

                                {/* Counterfactual Simulator */}
                                <section className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingDown className="w-3 h-3" /> Potential Risk Reduction
                                        </h4>
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">What-if Engine</Badge>
                                    </div>
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center space-y-2">
                                        <p className="text-xs text-emerald-400/70 font-medium">New Simulated Risk Score</p>
                                        <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">
                                            {(30 - (counterfactuals.hr + counterfactuals.sbp + counterfactuals.pm25) / 5).toFixed(1)}%
                                        </p>
                                        <p className="text-[10px] text-slate-500 italic flex items-center justify-center gap-2">
                                            <Target className="w-3 h-3" /> Base Risk: 30.0%
                                        </p>
                                    </div>

                                    <div className="space-y-6 px-2">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-300">Heart Rate Modification</label>
                                                <span className="text-xs font-mono text-emerald-400">{counterfactuals.hr > 0 ? "+" : ""}{counterfactuals.hr} bpm</span>
                                            </div>
                                            <input
                                                type="range" min="-30" max="30" step="1"
                                                value={counterfactuals.hr}
                                                onChange={(e) => setCounterfactuals({ ...counterfactuals, hr: +e.target.value })}
                                                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-300">Blood Pressure Δ</label>
                                                <span className="text-xs font-mono text-amber-400">{counterfactuals.sbp > 0 ? "+" : ""}{counterfactuals.sbp} mmHg</span>
                                            </div>
                                            <input
                                                type="range" min="-40" max="40" step="1"
                                                value={counterfactuals.sbp}
                                                onChange={(e) => setCounterfactuals({ ...counterfactuals, sbp: +e.target.value })}
                                                className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setCounterfactuals({ hr: 0, sbp: 0, pm25: 0 })}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 h-10 text-xs font-bold"
                                    >
                                        Reset Scenario
                                    </Button>
                                </section>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modals for Add/Edit */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70]"
                            onClick={() => { setAddModalOpen(false); setEditModalOpen(false); setSelectedPatient(null); resetForm(); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl z-[80] overflow-hidden glossy-card"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-100 mb-1">{isEditModalOpen ? "Modify Record" : "Onboard Patient"}</h2>
                                        <p className="text-sm text-slate-400 tracking-tight">Syncing to Prisma SQLite node with active ML observers.</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-800" onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}>
                                        <X className="w-5 h-5 text-slate-500" />
                                    </Button>
                                </div>

                                <form onSubmit={isEditModalOpen ? handleEdit : handleAdd} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">First Name</label>
                                            <Input className="bg-slate-950/50 border-slate-800 h-11 focus:border-emerald-500/50 transition-all font-medium" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Last Name</label>
                                            <Input className="bg-slate-950/50 border-slate-800 h-11 focus:border-emerald-500/50 transition-all font-medium" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Age</label>
                                            <Input type="number" className="bg-slate-950/50 border-slate-800 h-11" value={formData.age} onChange={e => setFormData({ ...formData, age: +e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Gender</label>
                                            <Input className="bg-slate-950/50 border-slate-800 h-11" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Risk Status</label>
                                            <select
                                                className="w-full bg-slate-950/50 border border-slate-800 h-11 rounded-md px-3 text-sm focus:border-emerald-500/50 outline-none text-slate-200"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Stable">Stable</option>
                                                <option value="Observation">Observation</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Primary Medical History</label>
                                        <Input className="bg-slate-950/50 border-slate-800 h-11" value={formData.medicalHistory} onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })} />
                                    </div>

                                    <div className="border-t border-slate-800 pt-4 mt-6">
                                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[2px] mb-4">Clinical Vitals (Simulation Baseline)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate (bpm)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.heartRate} onChange={e => setFormData({ ...formData, heartRate: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">SpO2 (%)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.spo2} onChange={e => setFormData({ ...formData, spo2: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Systolic BP</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.systolicBp} onChange={e => setFormData({ ...formData, systolicBp: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Diastolic BP</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.diastolicBp} onChange={e => setFormData({ ...formData, diastolicBp: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Glucose (mg/dL)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.glucoseLevel} onChange={e => setFormData({ ...formData, glucoseLevel: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Resp. Rate</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.respiratoryRate} onChange={e => setFormData({ ...formData, respiratoryRate: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">HRV (ms)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.hrv} onChange={e => setFormData({ ...formData, hrv: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Temp (°C)</label>
                                                <Input type="number" step="0.1" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Cholesterol</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.cholesterol} onChange={e => setFormData({ ...formData, cholesterol: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">BMI</label>
                                                <Input type="number" step="0.1" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.bmi} onChange={e => setFormData({ ...formData, bmi: +e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-800 pt-4">
                                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[2px] mb-4">Behavioral & Fiber Data</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Daily Fiber (g)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.dailyFiberIntake} onChange={e => setFormData({ ...formData, dailyFiberIntake: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Sleep Hours</label>
                                                <Input type="number" step="0.5" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.sleepHours} onChange={e => setFormData({ ...formData, sleepHours: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Stress (1-10)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.stressLevel} onChange={e => setFormData({ ...formData, stressLevel: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Exercise (min)</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.exerciseMinutes} onChange={e => setFormData({ ...formData, exerciseMinutes: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Smoking</label>
                                                <select
                                                    className="w-full bg-slate-950/30 border border-slate-800 h-9 rounded-md px-2 text-[10px] outline-none text-slate-200"
                                                    value={formData.smokingStatus}
                                                    onChange={e => setFormData({ ...formData, smokingStatus: e.target.value })}
                                                >
                                                    <option value="None">None</option>
                                                    <option value="Former">Former</option>
                                                    <option value="Current">Current</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Alcohol/wk</label>
                                                <Input type="number" className="bg-slate-950/30 border-slate-800 h-9 text-xs" value={formData.alcoholIntake} onChange={e => setFormData({ ...formData, alcoholIntake: +e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Medicine on Time?</label>
                                                <select
                                                    className="w-full bg-slate-950/30 border border-slate-800 h-9 rounded-md px-2 text-[10px] outline-none text-slate-200"
                                                    value={formData.medicineAdherence ? "true" : "false"}
                                                    onChange={e => setFormData({ ...formData, medicineAdherence: e.target.value === "true" })}
                                                >
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-4">
                                        <Button type="button" variant="ghost" className="flex-1 border border-slate-800 h-12 font-bold text-slate-400 hover:bg-slate-800" onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}>Cancel</Button>
                                        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black h-12 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95">
                                            {isEditModalOpen ? "Commit Changes" : "Bootstrap Profile"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function DropdownActions({ patient }: { patient: any }) {
    return (
        <div className="relative group/dd inline-block">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-slate-200">
                <MoreVertical className="w-4 h-4" />
            </Button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 group-hover/dd:opacity-100 invisible group-hover/dd:visible transition-all z-10 p-1">
                <button
                    onClick={async () => {
                        if (confirm("Delete this life record?")) {
                            await deletePatient(patient.id);
                        }
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                    Delete Record
                </button>
            </div>
        </div>
    );
}
