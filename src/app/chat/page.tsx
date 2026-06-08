"use client"

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Bot,
    User,
    Sparkles,
    ShieldCheck,
    RefreshCcw,
    AlertCircle
} from "lucide-react";
import { getHealthGptResponse } from "@/app/actions/ai-actions";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello, I am AASMA Health GPT. I have analyzed Patient Sarah Jenkins' (P-102) latest data. She shows a 15% increase in respiratory risk over the last 4 hours concurrent with a drop in oxygen levels. How can I assist you in interpreting these results?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Thinking state
        const thinkingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: "...",
            timestamp: new Date()
        }]);

        const res = await getHealthGptResponse(input);

        setMessages(prev => prev.map(m =>
            m.id === thinkingId ? { ...m, content: res.response } : m
        ));
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Bot className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Health GPT</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs text-slate-400 font-medium italic">Context: Active Patient (Sarah J.)</p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-800 text-slate-400 hover:text-slate-200"
                    onClick={() => setMessages([{
                        id: "initial",
                        role: "assistant",
                        content: "Session cleared. How can I assist you with Patient Sarah Jenkins' (P-102) data today?",
                        timestamp: new Date()
                    }])}
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Clear Session
                </Button>
            </div>

            <Card className="flex-1 bg-slate-900/40 border-slate-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-4 max-w-[85%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                msg.role === "assistant"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            )}>
                                {msg.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed",
                                msg.role === "assistant"
                                    ? "bg-slate-800/50 text-slate-200 border border-slate-700/50"
                                    : "bg-emerald-600 text-slate-950 font-medium"
                            )}>
                                {msg.content}
                                {msg.role === "assistant" && msg.content.includes("[Medical Disclaimer]") && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-start gap-2 text-[10px] text-slate-500 uppercase tracking-tighter italic">
                                        <AlertCircle className="w-3 h-3 text-amber-500/50 shrink-0" />
                                        Regulatory AI Disclaimer: Not a substitute for clinical diagnosis.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <CardFooter className="p-4 bg-slate-900/60 border-t border-slate-800">
                    <div className="relative w-full">
                        <Input
                            placeholder="Ask about patient risk factors, anomalies, or environmental data..."
                            className="w-full bg-slate-950/50 border-slate-700 text-slate-200 pl-4 pr-24 py-6 rounded-xl focus-visible:ring-emerald-500/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <p className="text-center text-[10px] text-slate-600 mt-4 flex items-center justify-center gap-1.5 uppercase font-bold tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" />
                Encrypted HIPAA-Compliant Session
            </p>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
