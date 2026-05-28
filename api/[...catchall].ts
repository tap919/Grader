import { app } from "../server";
import { initDb } from "../src/server/db/pool";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let dbInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!dbInitialized) {
    dbInitialized = true;
    try {
      await initDb();
      console.log("[Vercel] Database initialized");
    } catch (err) {
      console.error("[Vercel] Database init failed:", err);
    }
  }
  app(req, res);
}
