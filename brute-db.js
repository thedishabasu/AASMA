const { PrismaClient } = require("./src/generated/client");
require("dotenv").config();

const PASS = "eZxynU2G9CI0tnhY";
const REF = "yhjqzwitfwswaqyaiqih";

const VARIANTS = [
    // Shared Pooler AP-SE-1 (Singapore)
    `postgresql://postgres.${REF}:${PASS}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
    `postgresql://postgres.${REF}:${PASS}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,

    // No Dot format
    `postgresql://postgres:${PASS}@${REF}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,

    // Region-less Pooler host
    `postgresql://postgres.${REF}:${PASS}@pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,

    // Custom port 5432 (Session mode) on shared poolers
    `postgresql://postgres.${REF}:${PASS}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
    `postgresql://postgres.${REF}:${PASS}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
];

async function testAll() {
    for (const url of VARIANTS) {
        console.log(`\nTesting: ${url.replace(/:[^:@]+@/, ":****@")}`);
        const prisma = new PrismaClient({ datasources: { db: { url } } });
        try {
            await prisma.$connect();
            console.log("✅ SUCCESS!");
            process.exit(0);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message.split("\n")[0]}`);
        } finally {
            await prisma.$disconnect();
        }
    }
}

testAll();
