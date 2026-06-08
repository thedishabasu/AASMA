import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || "NOT_SET";
    const directUrl = process.env.DIRECT_URL || "NOT_SET";

    const mask = (url: string) => {
        try {
            const parsed = new URL(url.includes("://") ? url : `protocol://${url}`);
            return {
                hostname: parsed.hostname,
                username: parsed.username,
                port: parsed.port,
                protocol: parsed.protocol,
                params: parsed.search,
                password_length: parsed.password.length,
            };
        } catch (e) {
            return "INVALID_URL_FORMAT";
        }
    };

    let prismaTest = "NOT_STARTED";
    try {
        await prisma.$connect();
        prismaTest = "SUCCESS";
        const patientCount = await prisma.patient.count();
        prismaTest = `SUCCESS (Count: ${patientCount})`;
    } catch (e: any) {
        prismaTest = `FAILED: ${e.message}`;
    } finally {
        await prisma.$disconnect();
    }

    const allEnvVars = Object.keys(process.env).filter(key =>
        key.includes("DATABASE") || key.includes("DIRECT") || key.includes("URL") || key.includes("POSTGRES") || key.includes("SUPABASE")
    );

    return NextResponse.json({
        PRISMA_TEST: prismaTest,
        DATABASE_URL: mask(dbUrl),
        DIRECT_URL: mask(directUrl),
        ENV_VARS_FOUND: allEnvVars,
        NODE_ENV: process.env.NODE_ENV,
    });
}
