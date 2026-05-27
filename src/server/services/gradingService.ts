import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { HealthReport } from "../../types.ts";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({ apiKey });
}

const healthReportSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  overallScore: z.number().min(0).max(100),
  gradeCategory: z.string(),
  mainLanguage: z.string(),
  starsCount: z.number().min(0),
  forksCount: z.number().min(0),
  openIssuesCount: z.number().min(0),
  lastPushedAt: z.string(),
  summary: z.string(),
  security: z.object({
    secretLeakDetected: z.boolean(),
    secretsDetails: z.array(z.string()),
    vulnerabilityCount: z.number().min(0),
    highestSeverity: z.enum(["Low", "Medium", "High", "Critical", "None"]),
    vulnerabilities: z.array(z.object({
      package: z.string(),
      severity: z.enum(["Low", "Medium", "High", "Critical", "None"]),
      details: z.string(),
      recommendation: z.string(),
    })),
  }),
  quality: z.object({
    readmeScore: z.number().min(0).max(100),
    readmeFeedback: z.string(),
    readmeMissingSections: z.array(z.string()),
    testFrameDetected: z.string().nullable(),
    testsExplanation: z.string(),
    setupFrictionLevel: z.enum(["Low", "Medium", "High"]),
    setupFrictionReason: z.string(),
  }),
  market: z.object({
    trendAlignmentGrade: z.enum(["Rising Star", "Steady", "Declining Stack", "Experimental"]),
    trendExplanation: z.string(),
    benchmarks: z.object({
      starRatingPercentile: z.number(),
      releaseFrequency: z.enum(["High", "Medium", "Low"]),
      activeContributorScore: z.enum(["Healthy", "Solo Maker", "Stagnant"]),
    }),
    competitors: z.array(z.object({
      repoName: z.string(),
      stars: z.number(),
      advantages: z.array(z.string()),
      weaknesses: z.array(z.string())
    })),
  }),
  quickWins: z.array(z.object({
    id: z.string(),
    title: z.string(),
    severity: z.enum(["High", "Medium", "Low"]),
    category: z.string(),
    description: z.string(),
    actionableSteps: z.string()
  })),
  roadmap: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string(),
    phase: z.enum(["Now", "Next", "Later"]),
    effort: z.enum(["Small", "Medium", "Large"])
  })),
  valuation: z.object({
    estimatedDeveloperHours: z.number(),
    averageHourlyRate: z.number(),
    replacementCostFMV: z.number(),
    reliefFromRoyaltyValue: z.number(),
    productivityWasteHeuristic: z.number(),
    annualInterestDebtCost: z.number(),
  }),
  hotspots: z.array(z.object({
    filePath: z.string(),
    complexityScore: z.number(),
    changeFrequency: z.enum(["High", "Medium", "Low"]),
    churnPercent: z.number(),
    riskRating: z.enum(["Critical", "High", "Medium", "Low"]),
    recommendation: z.string(),
  })),
  ossRisk: z.object({
    copyleftDetected: z.boolean(),
    licenseConflictsCount: z.number(),
    licensesFound: z.array(z.object({
      name: z.string(),
      verified: z.boolean(),
      type: z.string(),
      riskLevel: z.string(),
      details: z.string(),
    })),
    legalAdviceSnippet: z.string(),
  }),
  architecture: z.object({
    dependencyCouplingScore: z.number(),
    circularImportsFound: z.number(),
    architecturalDriftIndex: z.number(),
    modularSpacingScore: z.number(),
    structuralComplexityFeedback: z.string(),
  }),
  compliance: z.object({
    iso5055Compliant: z.boolean(),
    reliabilityScore: z.number(),
    securityPracticesScore: z.number(),
    maintainabilityPracticesScore: z.number(),
    performanceScore: z.number(),
    severeViolationsCount: z.number(),
    certValidationId: z.string(),
  }),
  globalBenchmarkPercent: z.number(),
});

export interface GradeInput {
  repoUrl: string;
  owner: string;
  repo: string;
}

interface RepoData {
  repoMeta?: Record<string, unknown> | null;
  packageJsonStr?: string;
  readmeStr?: string;
  fileList?: string[];
  gitleaksJson?: string;
  semgrepJson?: string;
}

export class GradingService {
  static async gradeRepo(
    input: GradeInput,
    repoData?: RepoData | null
  ): Promise<HealthReport> {
    const client = getGeminiClient();
    const prompt = this.buildGradingPrompt(input, repoData);

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const text = response.text ?? "";
    if (!text) throw new Error("Empty response from Gemini");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);
    const report = healthReportSchema.parse(parsed);
    return report as HealthReport;
  }

  private static buildGradingPrompt(input: GradeInput, repoData?: RepoData | null): string {
    const truncatedData = repoData ? {
      ...repoData,
      readmeStr: repoData.readmeStr?.slice(0, 10000) || "",
      packageJsonStr: repoData.packageJsonStr?.slice(0, 5000) || "",
      fileList: repoData.fileList?.slice(0, 50) || [],
      gitleaksJson: repoData.gitleaksJson?.slice(0, 10000) || "",
      semgrepJson: repoData.semgrepJson?.slice(0, 20000) || "",
      repoMeta: repoData.repoMeta ? {
        name: repoData.repoMeta.name,
        full_name: repoData.repoMeta.full_name,
        description: repoData.repoMeta.description,
        language: repoData.repoMeta.language,
        stargazers_count: repoData.repoMeta.stargazers_count,
        forks_count: repoData.repoMeta.forks_count,
        open_issues_count: repoData.repoMeta.open_issues_count,
        topics: repoData.repoMeta.topics,
        default_branch: repoData.repoMeta.default_branch,
        license: repoData.repoMeta.license,
      } : null,
    } : null;

    const { gitleaksJson, semgrepJson, ...dataWithoutScans } = truncatedData ?? {};

    const dataSection = dataWithoutScans
      ? `## Repository Data\n${JSON.stringify(dataWithoutScans, null, 2)}`
      : "";

    const hasGitleaks = !!gitleaksJson;
    const hasSemgrep = !!semgrepJson;

    const securitySection = (hasGitleaks || hasSemgrep)
      ? `
## Real Security Scan Results — USE THESE, DO NOT GUESS

The following results come from automated security tools run against the actual cloned repository.
Use these findings to populate the "security" section of your JSON response.
Do NOT invent additional vulnerabilities beyond what is shown here.

${hasGitleaks ? `### Gitleaks — Secret Detection
Gitleaks v8 scanned the repository for leaked secrets, API keys, credentials, and tokens.
Each object in the array below is a confirmed finding with file path and description.
- If this array is non-empty → set secretLeakDetected: true
- Extract "Description" and "File" from each finding into secretsDetails[]
- If empty or null → secretLeakDetected: false, secretsDetails: []

\`\`\`json
${gitleaksJson}
\`\`\`` : "Gitleaks scan was not available for this repository."}

${hasSemgrep ? `### Semgrep — Static Analysis (SAST)
Semgrep scanned the repository with --config=auto rules covering security anti-patterns.
Each finding in results[] has: check_id (rule name), path, start.line, message, severity (ERROR/WARNING/INFO).
- Map each finding to a vulnerability entry: use check_id as "package", message as "details"
- Severity mapping: ERROR → "Critical", WARNING → "Medium", INFO → "Low"
- vulnerabilityCount = total number of findings in results[]
- highestSeverity = highest mapped severity across all findings, or "None" if empty

\`\`\`json
${semgrepJson}
\`\`\`` : "Semgrep scan was not available for this repository."}
`
      : `
## Security Analysis Note
No local security scan data was provided for this repository.
Base your security assessment on:
- Dependencies visible in package.json (known vulnerable versions)
- File structure indicators (e.g. .env files committed, hardcoded secrets patterns)
- Repository metadata
Clearly state in your summary that security results are heuristic estimates only,
not confirmed findings from a real scan.
`;

    return `
You are an expert codebase auditor. Grade the GitHub repository "${input.owner}/${input.repo}".

${dataSection}

${securitySection}

Return ONLY valid JSON matching this exact schema:
{
  "repoOwner": string,
  "repoName": string,
  "overallScore": number,
  "gradeCategory": string,
  "mainLanguage": string,
  "starsCount": number,
  "forksCount": number,
  "openIssuesCount": number,
  "lastPushedAt": string,
  "summary": string,
  "security": {
    "secretLeakDetected": boolean,
    "secretsDetails": string[],
    "vulnerabilityCount": number,
    "highestSeverity": "Low"|"Medium"|"High"|"Critical"|"None",
    "vulnerabilities": [{ "package": string, "severity": string, "details": string, "recommendation": string }]
  },
  "quality": {
    "readmeScore": number,
    "readmeFeedback": string,
    "readmeMissingSections": string[],
    "testFrameDetected": string | null,
    "testsExplanation": string,
    "setupFrictionLevel": "Low"|"Medium"|"High",
    "setupFrictionReason": string
  },
  "market": {
    "trendAlignmentGrade": "Rising Star"|"Steady"|"Declining Stack"|"Experimental",
    "trendExplanation": string,
    "benchmarks": { "starRatingPercentile": number, "releaseFrequency": "High"|"Medium"|"Low", "activeContributorScore": "Healthy"|"Solo Maker"|"Stagnant" },
    "competitors": [{ "repoName": string, "stars": number, "advantages": string[], "weaknesses": string[] }]
  },
  "quickWins": [{ "id": string, "title": string, "severity": "High"|"Medium"|"Low", "category": string, "description": string, "actionableSteps": string }],
  "roadmap": [{ "id": string, "title": string, "category": string, "description": string, "phase": "Now"|"Next"|"Later", "effort": "Small"|"Medium"|"Large" }],
  "valuation": { "estimatedDeveloperHours": number, "averageHourlyRate": number, "replacementCostFMV": number, "reliefFromRoyaltyValue": number, "productivityWasteHeuristic": number, "annualInterestDebtCost": number },
  "hotspots": [{ "filePath": string, "complexityScore": number, "changeFrequency": "High"|"Medium"|"Low", "churnPercent": number, "riskRating": "Critical"|"High"|"Medium"|"Low", "recommendation": string }],
  "ossRisk": { "copyleftDetected": boolean, "licenseConflictsCount": number, "licensesFound": [{ "name": string, "verified": boolean, "type": string, "riskLevel": string, "details": string }], "legalAdviceSnippet": string },
  "architecture": { "dependencyCouplingScore": number, "circularImportsFound": number, "architecturalDriftIndex": number, "modularSpacingScore": number, "structuralComplexityFeedback": string },
  "compliance": { "iso5055Compliant": boolean, "reliabilityScore": number, "securityPracticesScore": number, "maintainabilityPracticesScore": number, "performanceScore": number, "severeViolationsCount": number, "certValidationId": string },
  "globalBenchmarkPercent": number
}

Rules:
- This analysis is AI-generated. It is not a substitute for a professional security audit.
- Return ONLY raw JSON. No markdown, no code fences, no commentary.
- If you cannot determine a value, use null for nullable fields, 0 for numbers, "" for strings, [] for arrays.
- Do not invent data. If package.json was not fetched, say "Not retrieved" in explanations.
- For security: if real scan results were provided above, they are authoritative. Do not contradict them.
`;
  }
}
