"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    BrainCircuit,
    BarChart3,
    MessageSquare,
    Settings,
    ShieldAlert,
    Activity,
    Stethoscope
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Medical Staff", href: "/admin/staff", icon: Stethoscope },
    { name: "AI Insights", href: "/insights", icon: BrainCircuit },
    { name: "Fairness", href: "/fairness", icon: ShieldAlert },
    { name: "Health GPT", href: "/chat", icon: MessageSquare },
    { name: "Monitoring", href: "/monitoring", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col h-full backdrop-blur-xl">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Activity className="text-slate-950 w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-emerald-400">AASMA</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="px-3 py-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-sm text-slate-300 font-medium">Core AI Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
