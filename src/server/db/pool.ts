import pg from "pg";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;

let pgPool: pg.Pool | null = null;
let sqliteDb: Database.Database | null = null;

// Initialize database
export const initDb = async () => {
  if (isProduction) {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const schemaPath = path.join(process.cwd(), "src/server/db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    await pgPool.query(schema);
    console.log("PostgreSQL Database initialized and schema applied.");
  } else {
    const dbPath = path.join(process.cwd(), "dist/local.db");
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    sqliteDb = new Database(dbPath);
    console.log(`SQLite database loaded at ${dbPath}`);
    
    // SQLite compatible schema initialization
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        github_id TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS orgs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        stripe_customer_id TEXT,
        plan_tier TEXT DEFAULT 'free',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS org_members (
        org_id TEXT,
        user_id TEXT,
        role TEXT DEFAULT 'member',
        joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (org_id, user_id)
      );
      
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        key_hash TEXT UNIQUE NOT NULL,
        prefix TEXT NOT NULL,
        user_id TEXT,
        org_id TEXT,
        name TEXT,
        last_used_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        user_id TEXT,
        repo_url TEXT NOT NULL,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        grade_category TEXT NOT NULL,
        report TEXT NOT NULL, -- JSON string
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS scan_queue (
        id TEXT PRIMARY KEY,
        status TEXT DEFAULT 'pending',
        org_id TEXT,
        repo_url TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        started_at TEXT,
        completed_at TEXT,
        error TEXT
      );
      
      CREATE TABLE IF NOT EXISTS usage_log (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        user_id TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS rate_limits (
        org_id TEXT PRIMARY KEY,
        period_start TEXT DEFAULT CURRENT_TIMESTAMP,
        scan_count INTEGER DEFAULT 0,
        api_call_count INTEGER DEFAULT 0
      );
    `);
    console.log("SQLite Schema and tables validated.");
  }
};

// Unified Query interface
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
  if (isProduction && pgPool) {
    const res = await pgPool.query(text, params);
    return { rows: res.rows };
  } else if (sqliteDb) {
    // Safely translate PG query placeholders ($1, $2...) to SQLite (?)
    // This avoids replacing placeholders inside string literals
    let sqliteText = text;
    const placeholderMatches = [...text.matchAll(/\$\d+/g)];
    
    // Process matches in reverse order to avoid index shifting
    for (let i = placeholderMatches.length - 1; i >= 0; i--) {
      const match = placeholderMatches[i];
      const placeholder = match[0]; // e.g., "$1"
      const index = match.index;
      
      // Check if this placeholder is inside a string literal
      // Simple heuristic: count quotes before the placeholder
      const textBefore = text.substring(0, index);
      const singleQuoteCount = (textBefore.match(/'/g) || []).length;
      const doubleQuoteCount = (textBefore.match(/"/g) || []).length;
      
      // If odd number of quotes, we're inside a string literal
      if (singleQuoteCount % 2 === 0 && doubleQuoteCount % 2 === 0) {
        // Outside string literals, safe to replace
        sqliteText = sqliteText.substring(0, index) + "?" + sqliteText.substring(index + placeholder.length);
      }
      // If inside string literals, leave the placeholder as-is (it's part of the string content)
    }
    
    // Auto translate postgres UUID gen to text IDs if doing inserts without explicitly specified IDs
    // For standard queries, Database prepare works seamlessly
    try {
      const stmt = sqliteDb.prepare(sqliteText);
      const rows = stmt.all(...params);
      return { rows };
    } catch (e: any) {
      // Handle Exec queries that don't return rows (INSERT/UPDATE/DELETE without RETURNING)
      try {
        const stmt = sqliteDb.prepare(sqliteText);
        stmt.run(...params);
        return { rows: [] };
      } catch (err: any) {
        console.error("SQL Error executed:", sqliteText, "Params:", params);
        throw err;
      }
    }
  }
  throw new Error("Database not initialized. Please call initDb() first.");
};
