import pg from "pg";
import fs from "fs";
import path from "path";

let pgPool: pg.Pool | null = null;
export const getPool = () => pgPool;

// Initialize database
export const initDb = async () => {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_MAX ?? "10", 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? "30000", 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? "5000", 10),
  });
  
  if (!process.env.SKIP_SCHEMA_ON_BOOT) {
    try {
      const schemaPath = path.join(process.cwd(), "src/server/db/schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf-8");
      await pgPool.query(schema);
      console.log("[initDb] PostgreSQL Database initialized and schema applied.");
    } catch (err) {
      console.error("[initDb] Schema application skipped:", err instanceof Error ? err.message : String(err));
    }
  } else {
    console.log("[initDb] PostgreSQL Database initialized (schema boot skipped).");
  }
};

// Unified Query interface
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
  if (!pgPool) {
    throw new Error("Database not initialized. Please call initDb() first.");
  }
  const res = await pgPool.query(text, params);
  return { rows: res.rows };
};