const { PrismaClient } = require("./src/generated/client");
require("dotenv").config();

async function testConnection() {
    console.log("Testing connection to Supabase...");
    console.log("URL:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    try {
        await prisma.$connect();
        console.log("✅ Successfully connected to DATABASE_URL!");
        const count = await prisma.patient.count();
        console.log("📊 Patient count:", count);
    } catch (e) {
        console.error("❌ Failed to connect to DATABASE_URL:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }

    console.log("\nTesting DIRECT_URL...");
    const prismaDirect = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DIRECT_URL,
            },
        },
    });

    try {
        await prismaDirect.$connect();
        console.log("✅ Successfully connected to DIRECT_URL!");
    } catch (e) {
        console.error("❌ Failed to connect to DIRECT_URL:");
        console.error(e.message);
    } finally {
        await prismaDirect.$disconnect();
    }
}

testConnection();
