/**
 * Grading Service
 * Wraps Gemini API and orchestrates repo grading
 */

import { GoogleGenAI } from "@google/genai";
import { HealthReport } from "../../types.ts";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const client = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Define schema for HealthReport
const healthReportSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.string().regex(/^[A-F]$/),
  security: z.object({
    score: z.number().min(0).max(100),
    findings: z.array(z.any()),
    summary: z.string()
  }),
  quality: z.object({
    score: z.number().min(0).max(100),
    testCoverage: z.number().min(0).max(100),
    maintainability: z.number().min(0).max(100),
    summary: z.string()
  }),
  market: z.object({
    score: z.number().min(0).max(100),
    stars: z.number().min(0),
    forks: z.number().min(0),
    activity: z.string().regex(/^(low|medium|high)$/),
    summary: z.string()
  }),
  valuation: z.object({
    replacementCost: z.number().min(0),
    reliefFromRoyalty: z.number().min(0),
    productivityDebt: z.number().min(0),
    totalEstimate: z.number().min(0)
  }),
  oss: z.object({
    licenses: z.array(z.any()),
    conflicts: z.array(z.any()),
    summary: z.string()
  }),
  architecture: z.object({
    score: z.number().min(0).max(100),
    complexity: z.string().regex(/^(low|medium|high)$/),
    patterns: z.array(z.any()),
    summary: z.string()
  }),
  iso5055: z.object({
    reliability: z.number().min(0).max(100),
    security: z.number().min(0).max(100),
    maintainability: z.number().min(0).max(100),
    performance: z.number().min(0).max(100)
  }),
  quickWins: z.array(z.object({
    title: z.string(),
    description: z.string(),
    effort: z.string().regex(/^(1h|1d|3d|1w)$/),
    impact: z.string().regex(/^(high|medium|low)$/)
  })),
  roadmap: z.array(z.object({
    phase: z.string(),
    tasks: z.array(z.any()),
    timelineWeeks: z.number().min(0)
  }))
});

export interface GradeInput {
  repoUrl: string;
  owner: string;
  repo: string;
}

export class GradingService {
  /**
   * Grade a GitHub repository using Gemini AI
   */
  static async gradeRepo(input: GradeInput): Promise<HealthReport> {
    try {
      const prompt = this.buildGradingPrompt(input);

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text ?? "";
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      // Parse JSON response from Gemini
      const report = JSON.parse(responseText) as HealthReport;
      return report;
    } catch (error) {
      console.error("Grading error:", error);
      throw error;
    }
  }

  /**
   * Build the prompt for Gemini to grade a repo
   */
  private static buildGradingPrompt(input: GradeInput): string {
    return `
You are an expert code auditor. Grade the GitHub repository "${input.owner}/${input.repo}" across multiple dimensions.

IMPORTANT: Return ONLY a valid JSON object matching this exact structure:
{
  "score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "security": {
    "score": <0-100>,
    "findings": [<vulnerability objects>],
    "summary": "<brief summary>"
  },
  "quality": {
    "score": <0-100>,
    "testCoverage": <0-100>,
    "maintainability": <0-100>,
    "summary": "<brief summary>"
  },
  "market": {
    "score": <0-100>,
    "stars": <estimated>,
    "forks": <estimated>,
    "activity": "<low|medium|high>",
    "summary": "<brief summary>"
  },
  "valuation": {
    "replacementCost": <$>,
    "reliefFromRoyalty": <$>,
    "productivityDebt": <$>,
    "totalEstimate": <$>
  },
  "oss": {
    "licenses": [],
    "conflicts": [],
    "summary": "<brief summary>"
  },
  "architecture": {
    "score": <0-100>,
    "complexity": "<low|medium|high>",
    "patterns": [],
    "summary": "<brief summary>"
  },
  "iso5055": {
    "reliability": <0-100>,
    "security": <0-100>,
    "maintainability": <0-100>,
    "performance": <0-100>
  },
  "quickWins": [],
  "roadmap": []
}

Grade this repo based on public information available on GitHub:
1. Security: Check for vulnerability disclosure, dependency auditing, SBOM
2. Quality: Assess README, test coverage indicators, code organization
3. Market: Estimate GitHub metrics (stars, forks, activity)
4. Valuation: Calculate replacement cost, relief-from-royalty, productivity debt
5. OSS: Identify licenses and potential conflicts
6. Architecture: Analyze code patterns, complexity, design
7. ISO 5055: Score reliability, security, maintainability, performance
8. Quick Wins: Identify low-effort improvements
9. Roadmap: Suggest prioritized 12-week roadmap

Return ONLY valid JSON, no markdown, no code blocks.
`;
  }
}