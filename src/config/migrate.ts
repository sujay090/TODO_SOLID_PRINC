import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import Database from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationDir = path.join(__dirname, "migrations");

async function runMigrations() {
    // Step 1: Create migrations table
    try {
        await Database.getInstance().query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL,
                name VARCHAR(255) UNIQUE NOT NULL,
                ran_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("✅ Migrations table ready");
    } catch (error) {
        console.error("Failed to create migrations table:", error);
        process.exit(1);
    }

    // Step 2: Get files and sort them
    const files = readdirSync(migrationDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    // Step 3: Run each migration SEQUENTIALLY (not in parallel)
    for (const file of files) {
        // Check if already ran
        const check = await Database.getInstance().query(
            "SELECT name FROM migrations WHERE name = $1",
            [file]
        ) as { rows: { name: string }[] };

        const alreadyExists = check.rows.length > 0;

        if (alreadyExists) {
            console.log(`⏭️  Skipping ${file} (already ran)`);
            continue;
        }

        // Run the migration
        try {
            const sql = readFileSync(path.join(migrationDir, file), "utf-8");
            await Database.getInstance().query(sql);
            await Database.getInstance().query(
                "INSERT INTO migrations (name) VALUES ($1)",
                [file]
            );
            console.log(`✅ Migration: ${file} completed successfully`);
        } catch (err: any) {
            console.error(`❌ Migration ${file} failed:`, err.message);
            process.exit(1);
        }
    }

    console.log("🎉 All migrations complete");

    // Close pool AFTER all migrations finish
    Database.getInstance().close();
}

runMigrations();