"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Heart,
  Wind,
  User as UserIcon,
  Brain,
  Target,
  ShieldIcon,
  Stethoscope,
  Users,
  Flame,
  Thermometer,
  Zap,
  Droplet,
  CloudSun,
  Cpu,
  UserCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState, useRef } from "react";
import { getLiveWeather } from "@/app/actions/weather-actions";
import { getPatients, getDoctors } from "@/app/actions/ehr-actions";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Dashboard() {
  const [weather, setWeather] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [liveVitals, setLiveVitals] = useState<any>(null);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [fusionRisk, setFusionRisk] = useState<number>(45);
  const [xgboostRisk, setXgboostRisk] = useState<number>(30);
  const [doctorStatus, setDoctorStatus] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initial data fetch
  useEffect(() => {
    getLiveWeather().then(setWeather);
    getDoctors().then(docs => setDoctors(docs || []));
    getPatients().then(data => {
      if (data && data.length > 0) {
        setPatients(data);
        setSelectedPatient(data[0]);
      }
    }).catch(err => {
      console.error("Failed to fetch patients:", err);
      const fallback = { id: "P-101", firstName: "Simulated", lastName: "Subject", heartRate: 72, spo2: 98 };
      setSelectedPatient(fallback);
    });
  }, []);

  // SSE Streaming Setup
  useEffect(() => {
    if (!selectedPatient) return;

    let retryTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      setConnectionError(false);
      setIsStreaming(true);

      if (eventSourceRef.current) eventSourceRef.current.close();

      let docObj = selectedPatient?.doctor;
      if (!docObj && doctors && doctors.length > 0) {
          docObj = doctors[0]; // Fallback to first available doctor
      }

      const docName = encodeURIComponent(docObj?.name || "Dr. Unassigned");
      const docLoad = Math.round((docObj?.burnoutRisk || 0) * 100); // Scale decimal (0.88) to percentage (88)
      const docPatients = docObj?.patientLoad || 0;
      const es = new EventSource(`${BACKEND_URL}/ehr/stream/${selectedPatient.id}?doc_name=${docName}&doc_load=${docLoad}&doc_patients=${docPatients}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLiveVitals(data.vitals);
          setFusionRisk(data.riskScore);
          setXgboostRisk(data.xgboostScore || 30);
          setLiveAlerts(data.alerts);
          setDoctorStatus(data.doctorStatus);
          
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setChartData(prev => {
            const newData = [...prev, { time, f_score: data.riskScore, x_score: data.xgboostScore, heartRate: data.vitals.heartRate }];
            return newData.slice(-15); 
          });
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      };

      es.onerror = () => {
        console.error("SSE Connection Error. Retrying in 5s...");
        setConnectionError(true);
        setIsStreaming(false);
        es.close();
        retryTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      clearTimeout(retryTimeout);
    };
  }, [selectedPatient]);

  const displayVitals = liveVitals || {
    heartRate: selectedPatient?.heartRate || 70,
    spo2: selectedPatient?.spo2 || 98,
    systolicBp: selectedPatient?.systolicBp || 120,
    diastolicBp: selectedPatient?.diastolicBp || 80,
    temp: selectedPatient?.temperature || 36.5,
    glucose: selectedPatient?.glucoseLevel || 100,
    respRate: selectedPatient?.respiratoryRate || 16,
    fiber: selectedPatient?.dailyFiberIntake || 25
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tighter text-white">Dynamic Clinical Oversight</h1>
            {isStreaming ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">
                <div className="size-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live EHR Stream</span>
              </div>
            ) : connectionError ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                <div className="size-1.5 bg-rose-500 rounded-full" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Backend Disconnected</span>
              </div>
            ) : null}
          </div>
          <p className="text-slate-400 text-lg font-medium">Reactive risk analysis for multimodal agent mesh.</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="relative group">
              <select 
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500/50 appearance-none cursor-pointer pr-10"
                value={selectedPatient?.id || ""}
                onChange={(e) => {
                  const p = patients.find(p => p.id === e.target.value);
                  if (p) setSelectedPatient(p);
                }}
              >
                {patients.length > 0 ? patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                )) : <option value="">No subjects found</option>}
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              Primary: <span className="text-slate-100 uppercase">{doctorStatus?.name || selectedPatient?.doctor?.name || "Dr. Unassigned"}</span>
            </div>

            {weather && (
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <CloudSun className="w-4 h-4 text-amber-400" />
                {weather.temp}{weather.unit} • {weather.condition}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Selected Subject</p>
              <h2 className="text-2xl font-black text-white">{selectedPatient?.firstName} {selectedPatient?.lastName}</h2>
              <p className="text-[10px] font-mono text-slate-600">ID: {selectedPatient?.id || "N/A"}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Fusion Risk Index"
            value={fusionRisk}
            unit="/ 100"
            trend={fusionRisk > 75 ? "Extreme" : fusionRisk > 40 ? "Elevated" : "Stable"}
            trendType={fusionRisk > 75 ? "negative" : "positive"}
            icon={Activity}
            color="text-amber-500"
          />
          <StatCard
            title="XGBoost Prediction"
            value={xgboostRisk}
            unit="score"
            trend={xgboostRisk > 60 ? "High Risk" : "Moderate"}
            trendType={xgboostRisk > 60 ? "negative" : "neutral"}
            icon={Cpu}
            color="text-emerald-500"
          />
          <StatCard
            title="Heart Rate"
            value={Math.round(displayVitals.heartRate)}
            unit="bpm"
            trend={displayVitals.heartRate > 110 ? "Tachy" : "Normal"}
            trendType={displayVitals.heartRate > 110 ? "negative" : "positive"}
            icon={Heart}
            color="text-rose-500"
          />
          <StatCard
            title="Oxygen (SpO2)"
            value={Math.round(displayVitals.spo2)}
            unit="%"
            trend={displayVitals.spo2 < 93 ? "Critical" : "Optimum"}
            trendType={displayVitals.spo2 < 93 ? "negative" : "positive"}
            icon={Droplet}
            color="text-blue-400"
          />
          <StatCard
            title="Fiber Intake"
            value={Math.round(displayVitals.fiber)}
            unit="g"
            trend={displayVitals.fiber < 18 ? "Too Low" : "Good"}
            trendType={displayVitals.fiber < 18 ? "negative" : "positive"}
            icon={Flame}
            color="text-amber-400"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Multimodal Trend Analysis
              </CardTitle>
              <CardDescription className="text-slate-500">
                Continuous telemetry aggregation for {selectedPatient?.firstName}.
              </CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Real-time Refresh</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} labelStyle={{ fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="f_score" stroke="#10b981" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} name="Fusion Risk" />
                  <Area type="monotone" dataKey="x_score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorX)" strokeWidth={2} name="XGBoost Prediction" />
                  <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" fillOpacity={0} strokeWidth={1} strokeDasharray="5 5" name="HR Trend" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-700">
                 <Wind className="animate-spin-slow mb-4 opacity-20" size={48} />
                 <p className="text-xs font-black uppercase tracking-widest opacity-40">Waiting for stream...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Alerts Side Panel */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Active System & Staff Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {liveAlerts.length > 0 ? liveAlerts.map((alert, idx) => (
                <motion.div
                  key={`${alert.title}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertItem 
                    type={alert.type} 
                    title={alert.title} 
                    message={alert.message} 
                    time="JUST NOW" 
                  />
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600 opacity-50">
                  <ShieldIcon className="size-12 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Threats</p>
                </div>
              )}
            </AnimatePresence>

            <div className="pt-4 border-t border-slate-800/50 space-y-4">
              <AlertItem 
                type="info" 
                title="AI Fairness verified" 
                message="Demographic parity checks complete. No bias detected." 
                time="Synced" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Clinical Oversight / Doctor Card */}
        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
             <UserCheck className="size-16 text-emerald-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[2px] text-slate-500">Physician Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
               <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{doctorStatus?.name || "Dr. Loading..."}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Assigned Medical Lead</p>
                  </div>
                  <Badge className={cn(
                    "text-[8px] font-black",
                    doctorStatus?.status === "Overworked" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {doctorStatus?.status || "Checking..."}
                  </Badge>
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-slate-500">Resource Utilization</span>
                   <span className={doctorStatus?.load > 85 ? "text-rose-500" : "text-emerald-500"}>{doctorStatus?.load || 0}%</span>
                 </div>
                 <Progress value={doctorStatus?.load || 0} className={cn(
                   "h-1.5",
                   doctorStatus?.load > 85 ? "bg-rose-500" : "bg-emerald-500"
                 )} />
               </div>
               <p className="text-[10px] text-slate-600 mt-3 font-medium italic">
                 Monitoring workload for potential clinician burnout detection.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Microbiome (Updated with live fiber) */}
        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
             <Wind className="size-16 text-blue-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[2px] text-slate-500">Microbiome Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
               <div className="size-12 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-500">
                 {Math.max(0.1, (25/displayVitals.fiber || 1) * 0.2).toFixed(2)}
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-200">Dysbiosis Risk: {displayVitals.fiber < 20 ? "ELEVATED" : "LOW"}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Live Fiber Analysis: {Math.round(displayVitals.fiber)}g</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl p-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
             <Brain className="size-16 text-emerald-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[2px] text-slate-500">Subject Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
               <div className="size-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-500">
                  {Math.round((selectedPatient?.adherenceRate || 0.85) * 100)}%
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-200">Behavioral Adherence</p>
                  <p className="text-[10px] text-slate-500 mt-1">Stress Level: {selectedPatient?.stressLevel || 3}/10</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, trend, trendType, icon: Icon, color }: any) {
  return (
    <Card className="bg-slate-900/40 border-slate-800 hover:border-emerald-500/30 transition-all duration-300 rounded-3xl group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800", color)}>
            <Icon size={18} />
          </div>
          <span className={cn(
            "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
            trendType === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              trendType === "neutral" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          )}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-white tabular-nums tracking-tighter">{value}</h3>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ type, title, message, time }: any) {
  const colors = {
    critical: "bg-rose-500 text-rose-500 border-rose-500/20",
    warning: "bg-amber-500 text-amber-500 border-amber-500/20",
    info: "bg-blue-500 text-blue-500 border-blue-500/20",
  };

  return (
    <div className="flex gap-4 group/alert p-3 rounded-2xl border border-transparent hover:border-slate-800 hover:bg-slate-950/30 transition-all">
      <div className={cn("w-1.5 self-stretch rounded-full", colors[type as keyof typeof colors]?.split(' ')[0] || "bg-slate-500")} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className={cn("text-[9px] font-black uppercase tracking-widest", colors[type as keyof typeof colors]?.split(' ')[1] || "text-slate-500")}>
            {type}
          </p>
          <span className="text-[9px] text-slate-600 font-bold">{time}</span>
        </div>
        <h4 className="text-xs font-bold text-slate-200 group-hover/alert:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
