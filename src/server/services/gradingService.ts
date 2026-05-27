/**
 * Grading Service
 * Wraps Gemini API and orchestrates repo grading
 */

import { GoogleGenAI } from "@google/genai";
import { HealthReport } from "../../types.ts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const client = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
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
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const responseText = response.response.text?.();
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      // Parse JSON response from Gemini
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from Gemini response");
      }

      const report = JSON.parse(jsonMatch[0]) as HealthReport;
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
    "licenses": [<license>],
    "conflicts": [],
    "summary": "<brief summary>"
  },
  "architecture": {
    "score": <0-100>,
    "complexity": "<low|medium|high>",
    "patterns": [<pattern>],
    "summary": "<brief summary>"
  },
  "iso5055": {
    "reliability": <0-100>,
    "security": <0-100>,
    "maintainability": <0-100>,
    "performance": <0-100>
  },
  "quickWins": [
    {
      "title": "<title>",
      "description": "<description>",
      "effort": "<1h|1d|3d|1w>",
      "impact": "<high|medium|low>"
    }
  ],
  "roadmap": [
    {
      "phase": "<Phase X>",
      "tasks": [<task>],
      "timelineWeeks": <weeks>
    }
  ]
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
