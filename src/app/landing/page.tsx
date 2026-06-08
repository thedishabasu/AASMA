"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    ShieldCheck,
    Sparkles,
    Zap,
    Globe,
    Heart
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center -m-8 overflow-hidden bg-slate-950">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

            <div className="container relative z-10 px-6 py-24 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge variant="outline" className="mb-8 px-4 py-1.5 border-emerald-500/20 text-emerald-400 bg-emerald-500/5 backdrop-blur-sm font-semibold tracking-wide">
                        <Sparkles className="w-4 h-4 mr-2" />
                        V1.0.0 Stable Deployment
                    </Badge>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl"
                >
                    Adaptive Intelligence for <span className="text-emerald-500">Modern Healthcare</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 text-xl text-slate-400 max-w-2xl leading-relaxed"
                >
                    AASMA fuses EHR data, wearable metrics, and environmental alerts into
                    a unified, high-confidence risk prediction engine for proactive clinical care.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-6"
                >
                    <Link href="/">
                        <Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20">
                            Enter Platform
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-14 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-2xl">
                        Watch Technical Demo
                    </Button>
                </motion.div>

                {/* Robot Illustration Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-20 relative w-full max-w-lg aspect-square"
                >
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/40 backdrop-blur-xl group">
                        {/* Fallback while image generates or if it fails */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-8 text-center group-hover:scale-105 transition-transform duration-700">
                            <div className="w-48 h-48 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                <Zap className="w-24 h-24 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300">AASMA Companion Core</h3>
                            <p className="text-sm mt-2 opacity-60">Initializing multimodal fusion engine...</p>
                        </div>
                        {/* If we have an image path from generate_image, we use it here */}
                        <Image
                            src="/aasma_companion_robot.png"
                            alt="AASMA AI Robot"
                            fill
                            className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                            onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                </motion.div>

                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-800 pt-12 w-full max-w-5xl">
                    <Feature icon={ShieldCheck} label="HIPAA Certified" />
                    <Feature icon={Globe} label="Federated Learning" />
                    <Feature icon={Heart} label="Predictive Wellness" />
                    <Feature icon={Zap} label="Real-time Fusion" />
                </div>
            </div>
        </div>
    );
}

function Feature({ icon: Icon, label }: any) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">{label}</span>
        </div>
    );
}
