import { HealthReport } from "../types";

export const defaultPresetReport: HealthReport = {
  repoOwner: "vibe-coders",
  repoName: "nexus-platform",
  overallScore: 68,
  gradeCategory: "C+",
  mainLanguage: "TypeScript (Next.js)",
  starsCount: 142,
  forksCount: 22,
  openIssuesCount: 14,
  lastPushedAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hrs ago
  summary: "Security vulnerabilities in dependency tree are dragging down your score. Code quality is above market average, with strong TypeScript configurations, but setup friction on local environment and documentation can be improved.",
  security: {
    secretLeakDetected: true,
    secretsDetails: ["/lib/storage.ts"],
    vulnerabilityCount: 3,
    highestSeverity: "High",
    vulnerabilities: [
      {
        package: "express",
        severity: "High",
        details: "Prototype pollution in query parser allows remote attackers to crash the process or inject parameters.",
        recommendation: "Upgrade express to 4.21.2 or higher."
      },
      {
        package: "lodash",
        severity: "Medium",
        details: "Command injection vulnerability in template compilation via unescaped interpolation.",
        recommendation: "Upgrade lodash to 4.17.21 or higher."
      },
      {
        package: "axios",
        severity: "High",
        details: "Server-side request forgery (SSRF) bypass due to incomplete URL character sanitization.",
        recommendation: "Upgrade axios to 1.6.8 or higher."
      }
    ]
  },
  quality: {
    readmeScore: 72,
    readmeFeedback: "README contains basic setup commands and outline, but is missing license info, api documentation, and has sparse troubleshooting details for distributed teams.",
    readmeMissingSections: ["LICENSE", "API Reference", "Troubleshooting Guide"],
    testFrameDetected: "Jest",
    testsExplanation: "Detected Jest configuration with 12 existing test suites. Average estimated coverage is calculated at 45% of core controllers.",
    setupFrictionLevel: "Medium",
    setupFrictionReason: "Requires local Docker database setup and 4 specific environment variables with no automated script."
  },
  market: {
    trendAlignmentGrade: "Rising Star",
    trendExplanation: "This project uses Next.js and TypeScript, which aligns perfectly with modern frontend trends, gaining 18.4% Year-over-Year popularity in Github and developer survey index trends.",
    benchmarks: {
      starRatingPercentile: 78,
      releaseFrequency: "Medium",
      activeContributorScore: "Healthy"
    },
    competitors: [
      {
        repoName: "solomaker/t3-template",
        stars: 1240,
        advantages: ["Lower boilerplate payload", "Better test coverage heuristics"],
        weaknesses: ["Lacks automated secret auditing", "No security proxy layers"]
      },
      {
        repoName: "monolith/next-boilerplate",
        stars: 8520,
        advantages: ["Direct support for Docker out-of-the-box", "Simpler onboarding script"],
        weaknesses: ["Outdated Tailwind v3 modules", "Leaked keys in build logs"]
      }
    ]
  },
  quickWins: [
    {
      id: "win-1",
      title: "Rotate AWS Access Keys",
      severity: "High",
      category: "Security",
      description: "Hardcoded secret detected in /lib/storage.ts. High compromise risk.",
      actionableSteps: "Remove the raw string, add process.env.AWS_SECRET_ACCESS_KEY, and update .env.example."
    },
    {
      id: "win-2",
      title: "Implement a LICENSE file",
      severity: "Medium",
      category: "Documentation",
      description: "Missing open source license blocks external contributor adoption and company usage.",
      actionableSteps: "Create a LICENSE file in the root folder using standard MIT or Apache-2.0 template."
    },
    {
      id: "win-3",
      title: "Deduplicate API Hooks",
      severity: "Medium",
      category: "Quality",
      description: "42% code overlap in data fetching layer. High maintenance debt.",
      actionableSteps: "Refactor shared fetchers into custom swr or react-query reuse custom hooks."
    }
  ],
  roadmap: [
    {
      id: "road-1",
      title: "Setup automated Dotenv validation",
      category: "Security",
      description: "Create a baseline validation script to block builds if secrets are unpopulated.",
      phase: "Now",
      effort: "Small"
    },
    {
      id: "road-2",
      title: "Upgrade express & update package-lock",
      category: "Security",
      description: "Resolve CVE-2024-xxx vulnerability by updating base express server references.",
      phase: "Now",
      effort: "Small"
    },
    {
      id: "road-3",
      title: "Add Vitest and integrate with CI",
      category: "Quality",
      description: "Replace heavy Jest runner with lightning-fast Vitest container test pipeline.",
      phase: "Next",
      effort: "Medium"
    },
    {
      id: "road-4",
      title: "Author API reference sheet",
      category: "Documentation",
      description: "Draft automated documentation using JSDoc outputs to describe endpoint payload schemas.",
      phase: "Next",
      effort: "Medium"
    },
    {
      id: "road-5",
      title: "Optimize bundles with ESBuild bundle scans",
      category: "Quality",
      description: "Reduce final tree-shaken JS payload sizes below 150kb per route.",
      phase: "Later",
      effort: "Large"
    }
  ],
  valuation: {
    estimatedDeveloperHours: 6400,
    averageHourlyRate: 85,
    replacementCostFMV: 544000,
    reliefFromRoyaltyValue: 68000,
    productivityWasteHeuristic: 22,
    annualInterestDebtCost: 119680
  },
  hotspots: [
    {
      filePath: "src/controllers/authRouter.ts",
      complexityScore: 88,
      changeFrequency: "High",
      churnPercent: 78,
      riskRating: "Critical",
      recommendation: "Refactor complex password validation cascades. Split passport endpoints into secondary decorators."
    },
    {
      filePath: "src/utils/cryptoWrapper.ts",
      complexityScore: 72,
      changeFrequency: "Medium",
      churnPercent: 44,
      riskRating: "High",
      recommendation: "Switch key derivation algorithms to node standard argon2, reduce file-level nesting."
    },
    {
      filePath: "src/components/PaymentModal.tsx",
      complexityScore: 65,
      changeFrequency: "High",
      churnPercent: 62,
      riskRating: "High",
      recommendation: "Move server state loading cascades to a React Context reducer to prevent global state re-renders."
    },
    {
      filePath: "src/store/slices/config.ts",
      complexityScore: 48,
      changeFrequency: "Low",
      churnPercent: 12,
      riskRating: "Low",
      recommendation: "Deduplicate key configuration lookups into environment constants schema."
    }
  ],
  ossRisk: {
    copyleftDetected: true,
    licenseConflictsCount: 1,
    licensesFound: [
      {
        name: "gGPL-2.0 (via mock-gpg-wrapper)",
        verified: true,
        type: "Copyleft / Restrictive",
        riskLevel: "Critical",
        details: "Requires derivative proprietary applications to also disclose source files to public repositories."
      },
      {
        name: "@types/react",
        verified: true,
        type: "MIT",
        riskLevel: "Low",
        details: "Highly permissive. Safe for custom closed-source software and corporate equity exchanges."
      },
      {
        name: "express",
        verified: true,
        type: "MIT",
        riskLevel: "Low",
        details: "Permissive. General commercial reuse is authorized safely with copyright notices retained."
      },
      {
        name: "postgres-driver",
        verified: true,
        type: "Apache-2.0",
        riskLevel: "Low",
        details: "Permissive with trademark restrictions. Standard commercial deployment friendly."
      }
    ],
    legalAdviceSnippet: "M&A Due Diligence Alert: A restrictive 'copyleft' dependency reference was detected in package configurations. While secondary tool chains can run dynamically, we recommend swapping this package out before entering equity series financing rounds."
  },
  architecture: {
    dependencyCouplingScore: 64,
    circularImportsFound: 1,
    architecturalDriftIndex: 12,
    modularSpacingScore: 78,
    structuralComplexityFeedback: "Detected weak cohesion between route controllers and local storage libraries. Standard decoupled separation would keep route handlers isolated."
  },
  compliance: {
    iso5055Compliant: true,
    reliabilityScore: 88,
    securityPracticesScore: 92,
    maintainabilityPracticesScore: 84,
    performanceScore: 89,
    severeViolationsCount: 1,
    certValidationId: "ISO-5055-6FF82B-2026"
  },
  globalBenchmarkPercent: 82
};