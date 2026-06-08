const { Client } = require('pg');

const config = {
    user: 'postgres.yhjqzwitfwswaqyaiqih',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    database: 'postgres',
    password: 'eZxynU2G9CI0tnhY',
    port: 6543,
    ssl: {
        rejectUnauthorized: false
    }
};

async function testRaw() {
    console.log("--- Raw PG Connection Test ---");
    console.log(`Target: ${config.host}:${config.port}`);
    console.log(`User: ${config.user}`);

    const client = new Client(config);

    try {
        await client.connect();
        console.log("✅ RAW CONNECTION SUCCESS!");
        const res = await client.query('SELECT NOW()');
        console.log("🕒 DB Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("❌ RAW CONNECTION FAILED:");
        console.error(err.message);
        if (err.detail) console.error("Detail:", err.detail);
        if (err.hint) console.error("Hint:", err.hint);
    }
}

testRaw();
