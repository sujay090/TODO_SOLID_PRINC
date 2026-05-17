import { Pool, type PoolClient, type QueryResult } from "pg";
import dotenv from "dotenv";
dotenv.config();

class Database {
    private static instance: Database;
    public pool: Pool;

    private constructor() {
        this.pool = new Pool({
            connectionString: process.env.DB_URL,
            ssl: false,
            min: parseInt(process.env.DB_POOL_MIN!),
            max: parseInt(process.env.DB_POOL_MAX!),
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 2_000,
            statement_timeout: 10_000,
        });
        this.registerEvents();
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private registerEvents(): void {
        this.pool.on("connect", () => {
            console.log("🔗 New client connected to PostgreSQL");
        });

        this.pool.on("error", (err) => {
            console.error("❌ PostgreSQL pool error:", err.message);
            process.exit(1);
        });

        this.pool.on("remove", () => {
            console.log("🔌 Client removed from pool");
        });
    }

    public async query<T = any>(
        text: string,
        params?: any[]
    ): Promise<QueryResult<T>> {
        const start = Date.now();

        try {
            const result = await this.pool.query<T>(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV === "development" && duration > 100) {
                console.warn(`⚠️  Slow query (${duration}ms):\n${text}`);
            }

            return result;
        } catch (err: any) {
            console.error("❌ Query failed:", {
                query: text,
                params,
                error: err.message,
            });
            throw err;
        }
    }

    public async withTransaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");
            const result = await callback(client);
            await client.query("COMMIT");
            return result;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            const result = await this.query<{ current_time: string }>(
                "SELECT NOW() as current_time"
            );
            console.log("✅ PostgreSQL connected:", result.rows[0].current_time);
            return true;
        } catch (err: any) {
            console.error("❌ PostgreSQL connection failed:", err.message);
            return false;
        }
    }

    public async close(): Promise<void> {
        await this.pool.end();
        console.log("🔒 PostgreSQL pool closed.");
    }

    public getPoolStatus() {
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount,
        };
    }
}


export default Database;