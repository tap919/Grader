/**
 * Scans Routes
 * Submit, list, retrieve, and delete repository scans
 */

import express from "express";
import { authMiddleware } from "../middleware/auth.ts";
import { scanLimitMiddleware, apiRateLimitMiddleware } from "../middleware/tenant.ts";
import { query } from "../db/pool.ts";
import { GradingService } from "../services/gradingService.ts";
const { Router } = express;
type Request = express.Request;
type Response = express.Response;

const router = Router();

/**
 * POST /api/v1/scans
 * Submit a repository for grading
 */
router.post(
  "/",
  authMiddleware,
  scanLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.orgId || !req.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { repoUrl } = req.body;
      if (!repoUrl) {
        return res.status(400).json({ error: "repoUrl required" });
      }

      // Parse repo URL
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
      if (!repoMatch) {
        return res.status(400).json({ error: "Invalid GitHub URL" });
      }

      const [, owner, repo] = repoMatch;

      // Create scan record
      const { rows: scanRows } = await query(
        `INSERT INTO scans (org_id, user_id, repo_url, owner, name, score, grade_category, report, created_at)
          VALUES ($1, $2, $3, $4, $5, 0, 'pending', '{"status": "processing"}', NOW())
          RETURNING id, repo_url, owner, name, created_at`,
        [req.orgId, req.userId, repoUrl, owner, repo]
      );

      if (!scanRows || scanRows.length === 0) {
        return res.status(500).json({ error: "Failed to create scan" });
      }

      const scan = scanRows[0];

      // Grade the repo (async, but return immediately)
      await gradeRepoAsync(scan.id, owner, repo, repoUrl, req.orgId);

      res.status(201).json({
        id: scan.id,
        repoUrl: scan.repo_url,
        owner: scan.owner,
        repo: scan.name,
        status: "processing",
        createdAt: scan.created_at,
      });
    } catch (error) {
      console.error("Submit scan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/scans
 * List all scans for the authenticated org
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.orgId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const { rows: scans } = await query(
      `SELECT id, repo_url, owner, name, score, grade_category, created_at, updated_at
        FROM scans
        WHERE org_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [req.orgId, limit, offset]
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*) as total FROM scans WHERE org_id = $1`,
      [req.orgId]
    );

    const total = parseInt(countRows[0].total, 10) || 0;

    res.json({
      scans: scans || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List scans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/scans/:id
 * Get scan detail including full report
 */
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.orgId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;

    const { rows } = await query(
      `SELECT id, org_id, user_id, repo_url, owner, name, score, grade_category, report, created_at, updated_at
        FROM scans
        WHERE id = $1 AND org_id = $2`,
      [id, req.orgId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Scan not found" });
    }

    const scan = rows[0];

    res.json({
      id: scan.id,
      repoUrl: scan.repo_url,
      owner: scan.owner,
      repo: scan.name,
      score: scan.score,
      grade: scan.grade_category,
      report: typeof scan.report === "string" ? JSON.parse(scan.report) : scan.report,
      createdAt: scan.created_at,
      updatedAt: scan.updated_at,
    });
  } catch (error) {
    console.error("Get scan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/v1/scans/:id
 * Delete a scan
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.orgId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;

    const { rows } = await query(
      `DELETE FROM scans WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, req.orgId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json({ message: "Scan deleted" });
  } catch (error) {
    console.error("Delete scan error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Background task: Grade repo and update scan
 */
async function gradeRepoAsync(
  scanId: string,
  owner: string,
  repo: string,
  repoUrl: string,
  orgId: string
) {
  try {
    // Call Grading Service
    const report = await GradingService.gradeRepo({
      repoUrl,
      owner,
      repo,
    });

    // Update scan with results
    await query(
      `UPDATE scans 
        SET score = $1, grade_category = $2, report = $3, updated_at = NOW()
        WHERE id = $4`,
      [report.score, report.grade, JSON.stringify(report), scanId]
    );

    // Log usage
    await query(
      `INSERT INTO usage_log (org_id, action, resource, created_at)
        VALUES ($1, 'scan_completed', $2, NOW())`,
      [orgId, `${owner}/${repo}`]
    );

    console.log(`Scan ${scanId} completed successfully`);
  } catch (error) {
    console.error(`Error grading repo for scan ${scanId}:`, error);

    // Update scan with error status
    try {
      await query(
        `UPDATE scans 
          SET grade_category = $1, report = $2, updated_at = NOW()
          WHERE id = $3`,
      [
        "error",
        JSON.stringify({
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        scanId,
      ]
    );
    } catch (updateError) {
      console.error(`Failed to update error status for scan ${scanId}:`, updateError);
    }
  }
}

export default router;