const { app, initDb } = require("../dist/server.cjs");

let dbInitialized = false;

module.exports = async function handler(req, res) {
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
};
