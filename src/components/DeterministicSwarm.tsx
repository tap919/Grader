import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Settings2, 
  Terminal, 
  Play, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  Lightbulb, 
  ChevronRight, 
  FileText, 
  Sliders, 
  Flame, 
  ShieldAlert, 
  Workflow, 
  Search, 
  AlertCircle,
  Code2,
  RefreshCw,
  Database,
  Globe,
  Award,
  TrendingUp,
  Copy,
  Plus,
  Check,
  Lock,
  Shield,
  Users,
  Activity,
  ArrowRight,
  ExternalLink,
  HelpCircle
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  category: "Code Health" | "Readiness" | "Market & Eco" | "Synthesis";
  description: string;
  toolsUsed: string;
  executionTime: string;
  ruleFile: string;
  deterministicLogic: string;
  thresholds: {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
  }[];
}

export default function DeterministicSwarm() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("lint-complexity");
  const [sandboxCode, setSandboxCode] = useState<string>(
    `// Paste sample code or text here to test the deterministic probe triggers\n` +
    `function calculatePayment(amount) {\n` +
    `  const GOOGLE_API_KEY = "AIzaSyD-mock-key-some-long-hash-here-12345";\n` +
    `  let fee = amount * 0.05;\n` +
    `  return amount + fee;\n` +
    `}`
  );
  const [probeResult, setProbeResult] = useState<{
    status: "idle" | "running" | "matched" | "clean";
    logs: string[];
    outputJson: string;
  }>({
    status: "idle",
    logs: [],
    outputJson: ""
  });
  const [simulatedLoad, setSimulatedLoad] = useState(false);

  // New High-Level Workspace Architecture for our category moats
  const [swarmMode, setSwarmMode] = useState<"agents" | "moats">("agents");
  const [activeMoatSubTab, setActiveMoatSubTab] = useState<"graph" | "benchmarking" | "friction" | "congruence" | "genome" | "integrations" | "pipeline" | "testing">("graph");

  // brand new E2E test states
  const [e2eStatus, setE2eStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [e2eProgress, setE2eProgress] = useState<number>(0);
  const [e2eConfigWorkers, setE2eConfigWorkers] = useState<number>(8);
  const [e2eFailFast, setE2eFailFast] = useState<boolean>(false);
  const [e2eSpotInstances, setE2eSpotInstances] = useState<boolean>(true);
  const [e2eNetworkFailureRate, setE2eNetworkFailureRate] = useState<number>(5);
  const [e2eActiveCaseId, setE2eActiveCaseId] = useState<string | null>("tc-1");
  const [e2eLogLines, setE2eLogLines] = useState<Array<{ id: string; time: string; msg: string; status: "success" | "warning" | "error" | "info" }>>([]);

  // Pipeline-specific Grading and Refinement States
  const [selectedPipelineId, setSelectedPipelineId] = useState<"lst" | "secrets" | "deps" | "license">("lst");
  const [pipelineState, setPipelineState] = useState({
    lst: { depth: 7, preserveComments: true, pruneUnused: 40, grade: "A-", precision: 95.8, recall: 92.4, latencyMs: 140, isRefining: false },
    secrets: { entropy: 4.5, awsScope: true, verifyRsa: true, grade: "B+", precision: 91.2, recall: 94.6, latencyMs: 52, isRefining: false },
    deps: { transitive: true, minSeverity: "Medium" as "Low" | "Medium" | "High" | "Critical", grade: "B", precision: 92.5, recall: 89.2, latencyMs: 220, isRefining: false },
    license: { forbidViral: true, matchDual: false, corporateCheck: true, grade: "A-", precision: 93.6, recall: 91.0, latencyMs: 80, isRefining: false }
  });

  // 1. Archetype Graph States
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<"nextjs" | "python" | "react" | "terraform">("nextjs");
  const [proposedRule, setProposedRule] = useState("");
  const [archetypeVotes, setArchetypeVotes] = useState<Record<string, number>>({
    nextjs: 132,
    python: 64,
    react: 85,
    terraform: 41
  });
  const [consensusProposalList, setConsensusProposalList] = useState<Array<{id: string; rule: string; votes: number; agreed: boolean}>>([
    { id: "prop-1", rule: "Forbid inline stylesheet injections inside server component files", votes: 42, agreed: true },
    { id: "prop-2", rule: "Assert Dockerfile standard utilizes multi-stage rootless Alpine images", votes: 29, agreed: true },
  ]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // 2. Cross-Project Benchmarking States
  const [scannedPeersCount, setScannedPeersCount] = useState<number>(4820);
  const [selectedPeerCategory, setSelectedPeerCategory] = useState<"nextjs" | "python" | "react">("react");

  // 3. Setup Friction MicroVM States
  const [frictionPlatform, setFrictionPlatform] = useState<"firecracker" | "alpine-docker">("firecracker");
  const [frictionLogStatus, setFrictionLogStatus] = useState<"idle" | "booting" | "scraped" | "building" | "testing" | "successful" | "failed">("idle");
  const [frictionTerminalLines, setFrictionTerminalLines] = useState<string[]>([]);
  const [frictionOverallResult, setFrictionOverallResult] = useState<any | null>(null);

  // 4. Team Congruence Engine States
  const [surveyAnswers, setSurveyAnswers] = useState({
    coverage: "80-90%",
    secrets: "maybe-sandbox",
    complexity: "moderate",
    licensing: "100-compliant"
  });
  const [congruenceReport, setCongruenceReport] = useState<any | null>(null);
  const [historicalCongruenceList, setHistoricalCongruenceList] = useState<Array<{ date: string; score: number; delta: string; status: string }>>([
    { date: "May 10, 2026", score: 62, delta: "Divergent (-28%)", status: "Caution" },
    { date: "May 18, 2026", score: 79, delta: "Converging (-11%)", status: "Moderate" },
  ]);

  // 5. Genome Registry States
  const [genomeQuery, setGenomeQuery] = useState("");
  const [selectedGenomeRepo, setSelectedGenomeRepo] = useState<string | null>("vibe-coders/nexus-platform");
  const [selectedBadgeStyle, setSelectedBadgeStyle] = useState<"flat" | "flat-square" | "plastic" | "for-the-badge">("flat");
  const [copiedBadgeText, setCopiedBadgeText] = useState(false);

  // 6. Integrations States
  const [gateMinScore, setGateMinScore] = useState<number>(85);
  const [gateNoSecrets, setGateNoSecrets] = useState<boolean>(true);
  const [gateCopyleftForbid, setGateCopyleftForbid] = useState<boolean>(true);
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);

  // 7. Hybrid Pipeline & Golden Dataset States
  const [pipelineConfidence, setPipelineConfidence] = useState<number>(80);
  const [pipelineLimitComments, setPipelineLimitComments] = useState<number>(5);
  const [preCommitEnabled, setPreCommitEnabled] = useState<boolean>(true);
  const [batchFindingsEnabled, setBatchFindingsEnabled] = useState<boolean>(true);
  const [activeServerlessPlatform, setActiveServerlessPlatform] = useState<"cloudflare" | "fly" | "aws">("cloudflare");
  const [regressionStatus, setRegressionStatus] = useState<"idle" | "running" | "done">("idle");
  const [regressionProgress, setRegressionProgress] = useState<number>(0);
  const [dismissedFindings, setDismissedFindings] = useState<string[]>([]);
  const [feedbackSuppressedCount, setFeedbackSuppressedCount] = useState<number>(12);
  const [activeTraceId, setActiveTraceId] = useState<string | null>("tr-83fa9b");
  const [selectedMoatIndex, setSelectedMoatIndex] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; event: string; status: "success" | "warning" }>>([
    { id: "tr-83fa9b", timestamp: "14:21:05", event: "CI Merge Gate: Filtered 3 duplicate issues. Passed ESLint checks.", status: "success" },
    { id: "tr-74a81e", timestamp: "12:15:32", event: "Golden Dataset regression: 100% ground-truth matched.", status: "success" },
    { id: "tr-91bdcf", timestamp: "09:40:11", event: "LST parsed /src/auth.ts (size 42.1KB). AI analysis successful.", status: "success" },
  ]);

  // Refs for tracking active timeouts/intervals to prevent memory leaks and state updates on unmounted components
  const probeTimeoutRef = useRef<any>(null);
  const frictionTimeoutsRef = useRef<any[]>([]);
  const regressionIntervalRef = useRef<any>(null);
  const e2eIntervalRef = useRef<any>(null);
  const e2eTimeoutsRef = useRef<any[]>([]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (probeTimeoutRef.current) {
        clearTimeout(probeTimeoutRef.current);
      }
      if (regressionIntervalRef.current) {
        clearInterval(regressionIntervalRef.current);
      }
      if (e2eIntervalRef.current) {
        clearInterval(e2eIntervalRef.current);
      }
      frictionTimeoutsRef.current.forEach(t => clearTimeout(t));
      frictionTimeoutsRef.current = [];
      e2eTimeoutsRef.current.forEach(t => clearTimeout(t));
      e2eTimeoutsRef.current = [];
    };
  }, []);

  // End of state declarations


  // Define our 100% Deterministic Agent fleet
  const agents: Agent[] = [
    {
      id: "lint-complexity",
      name: "Lint & Complexity Agent",
      category: "Code Health",
      description: "Extracts cyclomatic complexity index metrics, cognitive depth markers, and static code lints.",
      toolsUsed: "ESLint, Radon (Python), RuboCop (Ruby), Go Vet",
      executionTime: "1.2s",
      ruleFile: "configs/rules/eslint-complexity.json",
      deterministicLogic: `Parses source files into solid Abstract Syntax Trees (AST). Traverses branches to count decision points (if/else, switch, catch, logical loops). Computes cyclomatic score strictly: M = E - N + 2P. Any function > 10 triggers warnings.`,
      thresholds: [
        { label: "Max Allowed Cyclomatic Complexity", value: 10, min: 4, max: 25, unit: "points" },
        { label: "Cognitive Depth Tolerance Limit", value: 4, min: 2, max: 8, unit: "branches" }
      ]
    },
    {
      id: "duplication-deadcode",
      name: "Duplication & Dead Code Agent",
      category: "Code Health",
      description: "Finds duplicate blocks of code, unused modular files, and orphaned or dead exports.",
      toolsUsed: "jscpd, unimported, ts-prune, vulture",
      executionTime: "0.8s",
      ruleFile: "configs/rules/jscpd-clones.yml",
      deterministicLogic: `Hashes sliding strings of code chars using Rabin-Karp subsegment algorithms. Matches identical hashing signatures across different file directories to catch plagiarized/copy-pasted modules. Performs relative dependency tree traversal to highlight unreachable exports.`,
      thresholds: [
        { label: "Min Token Count for Clone Detection", value: 40, min: 20, max: 150, unit: "tokens" },
        { label: "Permitted Copy-Paste Block Ratio", value: 5, min: 1, max: 20, unit: "%" }
      ]
    },
    {
      id: "secret-scanner",
      name: "Secret Scanner Agent",
      category: "Code Health",
      description: "Performs brute entropy evaluations to isolate leaked credentials, tokens, AWS/Google API keys, and passwords.",
      toolsUsed: "Gitleaks, TruffleHog, detect-secrets",
      executionTime: "0.4s",
      ruleFile: "configs/rules/gitleaks-signatures.json",
      deterministicLogic: `Uses 42 optimized regular expression patterns paired with Shannon Entropy algorithms: H(X) = -Σ P(xi) log2 P(xi) to isolate random string blocks without LLM latency or hallucinations.`,
      thresholds: [
        { label: "Shannon Entropy Minimum Trigger", value: 4.5, min: 3.0, max: 8.0, unit: "bits" },
        { label: "Permitted Key Length Bounds", value: 16, min: 8, max: 64, unit: "chars" }
      ]
    },
    {
      id: "cve-auditor",
      name: "CVE Dependency Auditor",
      category: "Code Health",
      description: "Audits direct and transitive dependencies for known CVE indices utilizing static database hashes.",
      toolsUsed: "npm audit parser, pip-audit, Trivy, OWASP dependency-check",
      executionTime: "1.5s",
      ruleFile: "configs/rules/advisories-snapshot.db",
      deterministicLogic: `Parses lockfile structures (package-lock.json, poetry.lock, Cargo.lock). Compares direct and transitive library version tags directly against a locally cached, daily-synchronized snapshot of GitHub Advisory and National Vulnerability Databases.`,
      thresholds: [
        { label: "CVSS Severity Alert Threshold", value: 7, min: 1, max: 10, unit: "rating" },
        { label: "Max Transitive Depth Range Check", value: 5, min: 1, max: 15, unit: "layers" }
      ]
    },
    {
      id: "license-auditor",
      name: "Ecosystem License Auditor",
      category: "Code Health",
      description: "Detects Copyleft licenses, GPL triggers, missing copyrights, and proprietary package restrictions.",
      toolsUsed: "license-checker, FOSSA CLI, ScanCode",
      executionTime: "0.6s",
      ruleFile: "configs/rules/license-compliance.json",
      deterministicLogic: `Inspects 'license' configurations inside parsed package.json files. Searches top-level comments of codebase modules for legal keywords (such as GPL, AGPL, MIT, Apache, Proprietary, Copyright). Flashes alert indicators on licensing overlaps.`,
      thresholds: [
        { label: "Restrictive License Action Priority", value: 9, min: 5, max: 10, unit: "score" }
      ]
    },
    {
      id: "docs-completeness",
      name: "README / Docs Completeness Agent",
      category: "Readiness",
      description: "Evaluates onboarding readiness based on setup sections, instructions, and standard project links.",
      toolsUsed: "Strict AST-Markdown Parser, Regular Expressions",
      executionTime: "0.5s",
      ruleFile: "configs/rules/documentation-standards.yml",
      deterministicLogic: `Heuristically structures README.md files into section headings (H1, H2, H3). Searches for key instructions (e.g., install commands, configuration checklists, security procedures, quick starts) and counts actual shell snippets.`,
      thresholds: [
        { label: "Expected Setup Code Snippet Minimum", value: 3, min: 1, max: 10, unit: "blocks" },
        { label: "Doc completeness word limit", value: 250, min: 100, max: 1000, unit: "words" }
      ]
    },
    {
      id: "test-coverage",
      name: "Test Coverage Agent",
      category: "Readiness",
      description: "Detects test frameworks, evaluates unit/integration directories, and performs deterministic coverage estimates.",
      toolsUsed: "pytest --cov, jest --coverage, vitest, nyc",
      executionTime: "0.9s",
      ruleFile: "configs/rules/coverage-caps.yml",
      deterministicLogic: `Scans for directories matching 'test', 'spec', or files matching '*.test.ts'. When running, executes test suites dynamically. If silent sandbox mode, estimates coverage ratio via testfile-to-source-file density ratios.`,
      thresholds: [
        { label: "Minimum Acceptable Statement Coverage", value: 80, min: 50, max: 100, unit: "%" },
        { label: "Min Test Coverage Assertions per File", value: 5, min: 1, max: 20, unit: "asserts" }
      ]
    },
    {
      id: "friction-tester",
      name: "Setup Friction Tester Agent",
      category: "Readiness",
      description: "Measures developer setup difficulty by dry-running installation instructions in virtual sandboxes.",
      toolsUsed: "Custom Firecracker Sandbox microVM, CLI Sandbox Interpreter",
      executionTime: "2.8s",
      ruleFile: "configs/rules/sandbox-installers.json",
      deterministicLogic: `Scrapes install snippets (npm build, pip install) from README. Executes these commands inside a sandboxed Linux microVM. Evaluates return codes, installation timeline, and missing env diagnostics with high consistency.`,
      thresholds: [
        { label: "Max Docker Build Sandbox Timeout", value: 120, min: 30, max: 300, unit: "seconds" },
        { label: "Maximum Error Verbosity Limit", value: 5, min: 1, max: 20, unit: "lines" }
      ]
    },
    {
      id: "community-health",
      name: "Community Health Agent",
      category: "Market & Eco",
      description: "Measures repository retention stats, issues/PR velocity, stars decay, contributor count, and bus factor.",
      toolsUsed: "GitHub Rest Core API, GitLab API",
      executionTime: "0.4s",
      ruleFile: "configs/rules/community-vitality.json",
      deterministicLogic: `Parses open-vs-closed issue quotients. Computes the Bus Factor: the minimum number of core developers who make over 50% of total commits. Flags alerts if 85%+ commits arise from a single user.`,
      thresholds: [
        { label: "Acceptable Bus Factor Floor", value: 3, min: 1, max: 10, unit: "contributors" },
        { label: "Max Days Pending Open PRs Limit", value: 30, min: 7, max: 180, unit: "days" }
      ]
    },
    {
      id: "ecosystem-position",
      name: "Ecosystem Positioning Agent",
      category: "Market & Eco",
      description: "Unbiased positioning of the project against top-n active repositories using high-precision dependency clustering.",
      toolsUsed: "Keyword extraction, Multi-dimensional clustering, Cosine similarity vectors",
      executionTime: "0.7s",
      ruleFile: "configs/market/competitor-clusters.json",
      deterministicLogic: `Extracts parsed parameters (such as frameworks, dependencies listed in manifest) to outline a keyword footprint. Performs standard Cosine similarity clustering matching top open-source projects.`,
      thresholds: [
        { label: "Similarity Vector Match Cap", value: 75, min: 30, max: 100, unit: "%" }
      ]
    },
    {
      id: "trend-alignment",
      name: "Trend Alignment Agent",
      category: "Market & Eco",
      description: "Evaluates framework popularity trends to flag dependencies that are sliding or growing obsolete.",
      toolsUsed: "Stack Overflow Trends API, npm/PyPI registry metrics, Git Star Historian",
      executionTime: "0.5s",
      ruleFile: "configs/market/trends-index.yml",
      deterministicLogic: `Compares declared dependencies into a static registry table containing historical growth weights. Flags depreciating libraries (such as older frameworks or unmaintained tools) immediately.`,
      thresholds: [
        { label: "Max Permitted Library Deprecation Term", value: 24, min: 6, max: 60, unit: "months" }
      ]
    },
    {
      id: "missing-features",
      name: "Missing Features Detector",
      category: "Market & Eco",
      description: "Compares dependencies against curated ecosystem blueprints representing common setups.",
      toolsUsed: "Ecosystem Graph Diffs (TF-IDF / Set-difference)",
      executionTime: "0.5s",
      ruleFile: "archetypes/nextjs-app.yaml",
      deterministicLogic: `Loads community-maintained YAML rules mapping files to their 'archetype' (e.g., Next.js, Python FastAPI, Rust Actix). Calculates a set-difference evaluation to isolate missing essential monitoring/testing packages.`,
      thresholds: [
        { label: "Ecosystem Blueprints Common Match Threshold", value: 80, min: 50, max: 95, unit: "%" }
      ]
    },
    {
      id: "monetization-viability",
      name: "License & Monetization Viability Agent",
      category: "Market & Eco",
      description: "Applies rule trees targeting open-source license choices to evaluate fitness for commercial monetization & sponsorship models.",
      toolsUsed: "Monetization Decision Tree Matrix",
      executionTime: "0.4s",
      ruleFile: "configs/rules/monetization-models.json",
      deterministicLogic: `Inspects license models (Copyleft vs permissive MIT/Apache) alongside sponsorship/sponsors files. Applies standard logical models (e.g., Open Core, SaaS wrapper proxy, Dual Licensing suitability) to compute monetization ease scores.`,
      thresholds: [
        { label: "Sponsorship Presence Weight Factor", value: 8, min: 1, max: 10, unit: "weight" }
      ]
    },
    {
      id: "roadmap-generator",
      name: "Roadmap Priority Generator",
      category: "Synthesis",
      description: "Creates prioritized task indices by weighting threat vectors, duplication metrics, and outdated libraries.",
      toolsUsed: "CVSS Priority Sorter, Dependency Urgency Sorter",
      executionTime: "0.3s",
      ruleFile: "configs/synthesis/priority-sort.json",
      deterministicLogic: `Collects outputs from CVE, Secrets, Lint, Complexity, and License agents. Orders remediation targets: CVSS Critical Severity ➔ High-Entropy secrets leak ➔ REST API structural violations ➔ Unmaintained dependencies.`,
      thresholds: [
        { label: "Max Roadmap Tasks Limit", value: 10, min: 3, max: 20, unit: "issues" }
      ]
    },
    {
      id: "score-calculator",
      name: "Synthesis & Score Calculator",
      category: "Synthesis",
      description: "Aggregates deterministic metrics into our 0-100 master scorecard using fixed category weights.",
      toolsUsed: "Central Weighted Aggregator Engine",
      executionTime: "0.2s",
      ruleFile: "configs/weights/score-matrix.json",
      deterministicLogic: `Applies a fully transparent linear calculation: Score = 0.3(Security) + 0.35(Quality) + 0.2(Ecosystem) + 0.15(Readiness). Results are verifiable down to individual rules with no black-box adjustments.`,
      thresholds: [
        { label: "Weight: Security Check Value", value: 30, min: 10, max: 50, unit: "%" },
        { label: "Weight: Code Quality Value", value: 35, min: 10, max: 50, unit: "%" },
        { label: "Weight: Operations Readiness Value", value: 15, min: 5, max: 30, unit: "%" }
      ]
    }
  ];

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Rule template trigger examples for the live sandbox
  const replaceSandboxExample = (type: string) => {
    if (type === "secret") {
      setSandboxCode(
        `// Leaked Token Trigger Test\n` +
        `const config = {\n` +
        `  dbConnection: "mongodb+srv://admin:SafePassword2026!@cluster0.db.net/prod",\n` +
        `  awsAccessKey: "AKIAIOSFODNN7EXAMPLE",\n` +
        `  githubAuthToken: "ghp_31CharactersOfPureSecretRandomToken1234"\n` +
        `};`
      );
    } else if (type === "license") {
      setSandboxCode(
        `/*\n` +
        ` * Project dependent components\n` +
        ` * This module is subject strictly to the terms of the GNU GPL v3 license.\n` +
        ` * You must distribute a full disclosure of your source repositories to run this wrapper.\n` +
        ` */\n` +
        `export function gnuLicenseHelper() {\n` +
        `  return "GPL Compliance Wrapper Core Engine";\n` +
        `}`
      );
    } else if (type === "complexity") {
      setSandboxCode(
        `// High Cyclomatic Nesting Trigger\n` +
        `function procesDataRecursively(items, level) {\n` +
        `  if (level > 10) {\n` +
        `    for (let i = 0; i < items.length; i++) {\n` +
        `      if (items[i] !== null && items[i].active) {\n` +
        `        if (items[i].value > 50) {\n` +
        `          switch (items[i].type) {\n` +
        `            case "user":\n` +
        `              if (items[i].verified) { return "allowed"; }\n` +
        `              else if (items[i].banned) { return "banned"; }\n` +
        `              break;\n` +
        `            case "system":\n` +
        `              return "system-level";\n` +
        `          }\n` +
        `        }\n` +
        `      }\n` +
        `    }\n` +
        `  }\n` +
        `  return "incomplete";\n` +
        `}`
      );
    } else if (type === "coverage") {
      setSandboxCode(
        `import { describe, test, expect } from "vitest";\n` +
        `// High-coverage framework syntax simulation\n` +
        `describe("Valuation engine test-suite", () => {\n` +
        `  test("properly bounds compound asset depreciation ratios", () => {\n` +
        `    const finalVal = computeDepreciationRate(100000, 0.1, 5);\n` +
        `    expect(finalVal).toBeGreaterThan(50000);\n` +
        `  });\n` +
        `});`
      );
    } else if (type === "trends") {
      setSandboxCode(
        `{\n` +
        `  "name": "legacy-infrastructure-boilerplate",\n` +
        `  "dependencies": {\n` +
        `    "jquery": "^1.11.1",\n` +
        `    "angularjs": "1.3.15",\n` +
        `    "bower": "^1.8.8"\n` +
        `  }\n` +
        `}`
      );
    } else if (type === "community") {
      setSandboxCode(
        `{\n` +
        `  "repo": "vibe-coders/solo-experiment",\n` +
        `  "meta": {\n` +
        `    "stars": 490,\n` +
        `    "open_issues": 1420,\n` +
        `    "contributors_count": 1,\n` +
        `    "total_commits": 148,\n` +
        `    "pending_prs": 82\n` +
        `  }\n` +
        `}`
      );
    } else if (type === "monetization") {
      setSandboxCode(
        `{\n` +
        `  "license": "MIT",\n` +
        `  "commercialization": {\n` +
        `    "has_backers": false,\n` +
        `    "has_enterprise_pricing": false,\n` +
        `    "open_core_package": null\n` +
        `  }\n` +
        `}`
      );
    }
  };

  const handleRunProbe = () => {
    if (probeTimeoutRef.current) {
      clearTimeout(probeTimeoutRef.current);
    }

    setSimulatedLoad(true);
    setProbeResult({
      status: "running",
      logs: ["Initializing Ephemeral File Ingress Pipeline...", "Mapping Rule Configuration Trees..."],
      outputJson: ""
    });

    probeTimeoutRef.current = setTimeout(() => {
      let status: "matched" | "clean" = "clean";
      const logs = [
        "[INFO] Initiating stateless sandboxed Probe execution...",
        `[INFO] Target: Ephemeral InMemory Workspace Buffer (size: ${sandboxCode.length} bytes)`,
        "[DEBUG] Injecting configurations from " + selectedAgent.ruleFile,
      ];
      let outputObj = {};

      if (selectedAgent.id === "secret-scanner") {
        const containsSecret = 
          sandboxCode.includes("ghp_") || 
          sandboxCode.includes("AKIA") || 
          sandboxCode.includes("AIzaSy") || 
          sandboxCode.includes("mongodb+srv");
        
        logs.push("[PROCESS] Executing Shannon Entropy evaluations...");
        logs.push("[PROCESS] Validating RegEx patterns for AWS, GitHub and Google OAuth tags...");

        if (containsSecret) {
          status = "matched";
          logs.push("[CRITICAL SECRET DETECTED] Match on pattern 'ghp_...' / 'AKIA...' or high-entropy credentials URL.");
          logs.push(`[RULE DETECT] Rule-ID: GR-SEC-042. Action required: Revoke and Rotate key immediately.`);
          outputObj = {
            scanner: "Gitleaks-Deterministic",
            vulnerabilitiesFound: 1,
            entropyAudit: {
              detectedLeak: true,
              matchedPatterns: ["GH_TOKEN_GENERIC", "AWS_ACCESS_KEY"],
              averageEntropyScore: "5.82 bits (Above threshold 4.5)"
            },
            remediation: "Replace hardcoded secret strings with dynamic references (process.env)."
          };
        } else {
          logs.push("[SUCCESS] No high-entropy keys or standard API signatures matched the RegEx index.");
          outputObj = {
            scanner: "Gitleaks-Deterministic",
            vulnerabilitiesFound: 0,
            status: "Secure"
          };
        }
      } else if (selectedAgent.id === "license-auditor") {
        const containsGpl = sandboxCode.toLowerCase().includes("gpl") || sandboxCode.toLowerCase().includes("gnu");
        logs.push("[PROCESS] Searching file buffers for restrictive intellectual copyright headings...");
        
        if (containsGpl) {
          status = "matched";
          logs.push("[ALERT] Restrictive Copyleft License Tag matched: GNU GPL v3 detected.");
          logs.push("[WARNING] Codebase liability: Proprietary codebases using this module may be forced into public disclosure.");
          outputObj = {
            scanner: "FOSSA-Deterministic-Engine",
            licenseType: "GPL-3.0",
            verified: true,
            riskLevel: "Critical",
            conflictsCount: 1,
            remediation: "Swap this dependency file with an MIT/BSD or Apache licensed package before entering legal transaction reviews."
          };
        } else {
          logs.push("[SUCCESS] Standard headers clean. No copyleft licensing structures trigger conflicts.");
          outputObj = {
            scanner: "FOSSA-Deterministic",
            conflictCount: 0,
            unbiasedRating: "A"
          };
        }
      } else if (selectedAgent.id === "lint-complexity") {
        // Count branches, switches, ifs to estimate logic depth
        const occurrences = (sandboxCode.match(/if|for|while|switch|case|catch/g) || []).length;
        logs.push(`[PROCESS] Walking AST syntax structure, parsed ${occurrences} decision paths...`);
        
        if (occurrences > 10) {
          status = "matched";
          logs.push(`[METRIC WARNING] Cyclomatic complexity calculated at ${occurrences} points (Limit is 10).`);
          logs.push("[RULE DETECT] Rule-ID: GR-LNT-095 (High cognitive bifurcation). Recommend splitting subcomponents.");
          outputObj = {
            scanner: "ESLint-Cyclomatic",
            cyclomaticScore: occurrences,
            compliant: false,
            recommendation: "Refactor deeply nested conditional cascades into flat map lookups."
          };
        } else {
          status = "clean";
          logs.push(`[SUCCESS] Cyclomatic complexity is healthy at ${occurrences} points (Limit is 10).`);
          outputObj = {
            scanner: "ESLint-Cyclomatic",
            cyclomaticScore: occurrences,
            compliant: true
          };
        }
      } else if (selectedAgent.id === "test-coverage") {
        const hasTestFramework = sandboxCode.toLowerCase().includes("describe") || sandboxCode.toLowerCase().includes("test") || sandboxCode.toLowerCase().includes("expect");
        logs.push("[PROCESS] Scoping imports for testing frameworks (Vitest, Jest, PyTest, mocha)...");
        
        if (hasTestFramework) {
          status = "clean";
          logs.push("[SUCCESS] Comprehensive testing framework detected & parsed in the context buffer.");
          logs.push("[INFO] Verified assert-to-bifurcation safety density quotient satisfies structural requirements.");
          outputObj = {
            scanner: "Deterministic-Coverage-Validator",
            frameworksFound: ["Vitest/Jest standard format"],
            estimatedStatementCoverage: "94.2%",
            status: "Compliant"
          };
        } else {
          status = "matched";
          logs.push("[WARNING] Low or missing test framework assertions. Test file density is below 80% quotient guidelines.");
          outputObj = {
            scanner: "Deterministic-Coverage-Validator",
            frameworksFound: [],
            estimatedStatementCoverage: "0.0% (Zero test assertions detected)",
            status: "Deficient",
            remediation: "Create dedicated speculative testing scripts (e.g. *.test.ts) to guard core functions."
          };
        }
      } else if (selectedAgent.id === "community-health") {
        const hasSoloContributor = sandboxCode.includes('"contributors_count": 1') || sandboxCode.toLowerCase().includes("single-developer");
        logs.push("[PROCESS] Sifting repository collaborator metadata parameters...");
        logs.push("[PROCESS] Modeling developer contribution ratios for Bus Factor analysis...");

        if (hasSoloContributor) {
          status = "matched";
          logs.push("[CRITICAL COM-ALERT] Bus Factor is equal to 1. 100% of contributions are concentrated in one peer.");
          logs.push("[WARNING] High operational redundancy risk. If this contributor leaves, system maintainability drops to zero.");
          outputObj = {
            scanner: "Deterministic-Ecosystem-Auditor",
            computedBusFactor: 1,
            issueResolveSlope: "Optimal Decline",
            riskLevel: "Significant Redundancy Hazard",
            remediation: "Onboard additional core maintainers to decentralize system domain knowledge."
          };
        } else {
          status = "clean";
          logs.push("[SUCCESS] Multi-maintainer model verified. Work distribution is healthy.");
          outputObj = {
            scanner: "Deterministic-Ecosystem-Auditor",
            computedBusFactor: 4,
            contributorModel: "Distributed Swarm"
          };
        }
      } else if (selectedAgent.id === "trend-alignment") {
        const containsLegacy = sandboxCode.includes("angularjs") || sandboxCode.includes("jquery") || sandboxCode.includes("bower");
        logs.push("[PROCESS] Cross-referencing manifest dependency trees with StackOverflow popularity weights...");

        if (containsLegacy) {
          status = "matched";
          logs.push("[ALERT OBSOLETE LIBRARY] Deprecated/Obsolescent dependency tags detected in codebase.");
          logs.push("[WARNING] Matched: jQuery (< 2.0.0), AngularJS (1.x EOL). High vulnerability & technical debt rating.");
          outputObj = {
            scanner: "Trend-Alignment-Deterministic-Probe",
            outdatedPackages: ["jquery@1.11.1", "angularjs@1.3.15", "bower@1.8.8"],
            status: "Grave Tech-Debt Risk",
            remediation: "Upgrade AngularJS structures to modern React/Vue structures, and swap legacy elements with native vanilla DOM query lines."
          };
        } else {
          status = "clean";
          logs.push("[SUCCESS] Modern web standards validated. Zero deprecated framework weights matched.");
          outputObj = {
            scanner: "Trend-Alignment-Deterministic-Probe",
            outdatedPackagesCount: 0,
            status: "Highly Optimized Stack"
          };
        }
      } else if (selectedAgent.id === "monetization-viability") {
        const containsMit = sandboxCode.includes('"MIT"') || sandboxCode.includes("MIT");
        logs.push("[PROCESS] Analysing commercial licensing constraints and sponsorship configurations...");

        if (containsMit) {
          status = "clean";
          logs.push("[SUCCESS] Permissive MIT copyright tags detected. Optimal eligibility for flexible private monetization wrapping.");
          outputObj = {
            scanner: "Monetization-Viability-Decision-Matrix",
            commercialEaseScore: "9.5 / 10",
            licensingVigor: "Extremely Permissive",
            suggestedCommercialModel: "SaaS Wrapper / Managed Cloud Services Hosting"
          };
        } else {
          logs.push("[INFO] License model is non-standard or missing. Commercial wrapping indices standard.");
          outputObj = {
            scanner: "Monetization-Viability-Decision-Matrix",
            commercialEaseScore: "6.0 / 10",
            suggestedCommercialModel: "Dual-license Open Core"
          };
        }
      } else if (selectedAgent.id === "roadmap-generator") {
        logs.push("[PROCESS] Synthesizing rule outcomes from parallel scanners (CVE, Entropy, Linter)...");
        logs.push("[SUCCESS] Successfully compiled deterministic remediation roadmap priorities.");
        status = "clean";
        outputObj = {
          aggregator: "Deterministic-Priority-Sorter",
          findingsCount: 4,
          priorityRemediationRoadmap: [
            { priority: 1, target: "Revoke hardcoded credentials on Gitleaks trigger", expectedFTE: "0.2 hours" },
            { priority: 2, target: "Migrate deprecated copyleft packages (GNU GPL licenses)", expectedFTE: "4.0 hours" },
            { priority: 3, target: "Refactor deeply nested conditional cascades (Radon complexity limit exceeded)", expectedFTE: "2.5 hours" },
            { priority: 4, target: "Synthesize missing standard configs for setup friction testing", expectedFTE: "1.0 hours" }
          ]
        };
      } else {
        // Generic agent response
        logs.push(`[PROCESS] Executing stateless evaluator rules in ${selectedAgent.toolsUsed}...`);
        logs.push(`[SUCCESS] No outstanding rule match failures found in this sample.`);
        outputObj = {
          agent: selectedAgent.name,
          toolsUsed: selectedAgent.toolsUsed,
          status: "SUCCESS",
          executionFrictionScore: "Optimal"
        };
      }

      logs.push("[INFO] Clean isolation tear down complete. Execution took " + selectedAgent.executionTime);
      
      setProbeResult({
        status,
        logs,
        outputJson: JSON.stringify(outputObj, null, 2)
      });
      setSimulatedLoad(false);
      probeTimeoutRef.current = null;
    }, 1200);
  };

  // Run initial probe on load/switch
  useEffect(() => {
    handleRunProbe();
  }, [selectedAgentId]);

  // Simulated run for Setup Friction microVM sandbox dry-run
  const triggerFrictionSandboxSim = () => {
    // Clear any active state transition timeouts from prior clicks
    frictionTimeoutsRef.current.forEach(t => clearTimeout(t));
    frictionTimeoutsRef.current = [];

    setFrictionLogStatus("booting");
    setFrictionTerminalLines([]);
    setFrictionOverallResult(null);

    const steps = [
      { msg: "[SYSTEM] Initializing Firecracker MicroVM container (Kernel-v5.10)...", wait: 400 },
      { msg: "[SYSTEM] Booting isolated network tap device [tap0]...", wait: 700 },
      { msg: "[SYSTEM] Mounting ephemeral overlay filesystem with strictly rootless safety permissions...", wait: 1100 },
      { msg: "[SCRAPE] Parsing target project manifest: README.md / package.json detected.", wait: 1500 },
      { msg: "[SCRAPE] Extracted 2 build commands: 'npm install' and 'npm run build'", wait: 1800 },
      { msg: "[EXEC] Initiating command chain dry-run: 'npm install' inside virtual process group...", wait: 2300 },
      { msg: "[EXEC] npm notice - Creating lockfile configurations...", wait: 2800 },
      { msg: "[EXEC] npm warn - optional dependency @swc/core skipped on OS alpine-linux-x64", wait: 3100 },
      { msg: "[EXEC] Added 412 packages in 1.42s. Command resolved with status code: 0 ✅", wait: 3600 },
      { msg: "[EXEC] Initiating: 'npm run build'...", wait: 4000 },
      { msg: "[EXEC] vite v5.1.0 building for production...", wait: 4400 },
      { msg: "[EXEC] ✓ 382 modules transformed. Output directory: dist/", wait: 4800 },
      { msg: "[EXEC] Build verified. Compiling performance profile...", wait: 5100 },
      { msg: "[VERIFY] Port binding scan initialized on port 3000... Bind success within 200ms.", wait: 5400 },
      { msg: "[SUCCESS] Safe sandbox installation resolved seamlessly in 5.4s overall pipeline time. Teardown active.", wait: 5800 }
    ];

    steps.forEach((step, idx) => {
      const timeoutId = setTimeout(() => {
        setFrictionTerminalLines(prev => [...prev, step.msg]);
        if (idx === 4) {
          setFrictionLogStatus("scraped");
        } else if (idx === 8) {
          setFrictionLogStatus("building");
        } else if (idx === 12) {
          setFrictionLogStatus("testing");
        } else if (idx === steps.length - 1) {
          setFrictionLogStatus("successful");
          setFrictionOverallResult({
            durationS: "5.4s",
            performanceLevel: "Golden Optimized standard",
            score: 96,
            diagnostics: "README instructions perfectly match lockfile dependencies. Fast boot speed.",
            reproducibility: "Absolute (Clean VM exit, status standard 0)"
          });
        }
      }, step.wait);
      frictionTimeoutsRef.current.push(timeoutId);
    });
  };

  // Team Congruence reality checker algorithm
  const calculateTeamCongruence = () => {
    // Diff subjective answers with parsed objective reality we know from our default report findings
    // Findings: Test Coverage is 94.2% (under sandbox), Secrets == 1 (if Leaks present), Complexity/Rules.
    let deltaQuotient = 100;
    const details: string[] = [];

    // Question 1: Test coverage check
    if (surveyAnswers.coverage === "90%+") {
      details.push("Test coverage estimate match! Objective Vitest analyzer detects 94.2% statement coverage.");
    } else {
      deltaQuotient -= 15;
      details.push(`Minor understatement: Team estimated '${surveyAnswers.coverage}' coverage but actual is a pristine 94.2%.`);
    }

    // Question 2: Secrets belief check
    if (surveyAnswers.secrets === "maybe-sandbox") {
      details.push("Secrets assessment is mostly aligned. Older API key strings found in sandbox tests.");
    } else if (surveyAnswers.secrets === "absolutely-no") {
      deltaQuotient -= 25;
      details.push("Critical delusion gap! Team believes zero secrets exist, but Gitleaks pattern detected active credentials in memory.");
    } else {
      details.push("Accurate hazard recognition. Hardcoded credentials isolated cleanly.");
    }

    // Question 3: Nesting complexity check
    if (surveyAnswers.complexity === "elegant") {
      deltaQuotient -= 20;
      details.push("Slight optimization blindness! Team rated codebase as 'Very Elegant', but cyclomatic loops exceed maximum threshold rules.");
    } else {
      details.push("Solid realistic appraisal on structural logical cyclomatic density.");
    }

    // Question 4: License check
    if (surveyAnswers.licensing === "100-compliant") {
      deltaQuotient -= 15;
      details.push("Compliance blind spot! Active Copyleft GPL constraints found on direct dependency trees.");
    } else {
      details.push("Correct license awareness. Verified warning triggers standard.");
    }

    setCongruenceReport({
      score: Math.max(deltaQuotient, 35),
      divergenceGap: `${100 - Math.max(deltaQuotient, 35)}% Delta`,
      findings: details,
      verdict: deltaQuotient > 85 ? "High Congruence Alignment 🏆" : deltaQuotient > 60 ? "Moderate Alignment ⚠️" : "Grave Human Delusion Risk 🛑"
    });
  };

  const handleProposeRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedRule.trim()) return;

    const newProp = {
      id: "prop-" + Date.now(),
      rule: proposedRule.trim(),
      votes: 1,
      agreed: false
    };

    setConsensusProposalList([newProp, ...consensusProposalList]);
    setProposedRule("");
  };

  const castProposalVote = (propId: string) => {
    if (votedIds.has(propId)) return; // prevent double vote

    setConsensusProposalList(prev => 
      prev.map(p => p.id === propId ? { ...p, votes: p.votes + 1 } : p)
    );
    setVotedIds(prev => {
      const next = new Set(prev);
      next.add(propId);
      return next;
    });
  };

  // Pre-configured public genome registry for search
  const genomeRegistryData = [
    { repo: "vibe-coders/nexus-platform", desc: "Enterprise message streaming platform", qualityScore: 87, securityScore: 92, frictionScore: "Very Low", license: "MIT", stars: "4.8k" },
    { repo: "facebook/react", desc: "Declarative component-oriented framework", qualityScore: 94, securityScore: 88, frictionScore: "Low", license: "MIT", stars: "220k" },
    { repo: "vercel/next.js", desc: "The React server framework", qualityScore: 91, securityScore: 85, frictionScore: "Medium", license: "MIT", stars: "119k" },
    { repo: "django/django", desc: "The high-level Python Web framework", qualityScore: 85, securityScore: 95, frictionScore: "Low", license: "BSD-3-Clause", stars: "76k" }
  ];

  const filteredGenomeData = genomeRegistryData.filter(g => 
    g.repo.toLowerCase().includes(genomeQuery.toLowerCase()) || 
    g.desc.toLowerCase().includes(genomeQuery.toLowerCase())
  );

  const getBadgeMarkdown = (repo: string, score: number) => {
    let styleParam = "";
    if (selectedBadgeStyle !== "flat") {
      styleParam = `?style=${selectedBadgeStyle}`;
    }
    return `[![Grader Score](https://img.shields.io/badge/Grader%20Score-${score}-indigo${styleParam})](https://grader.dev/repo/${repo})`;
  };

  const copyToClipboard = (text: string, isToken = false) => {
    navigator.clipboard.writeText(text);
    if (isToken) {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedBadgeText(true);
      setTimeout(() => setCopiedBadgeText(false), 2000);
    }
  };

  const generateApiKey = () => {
    setGeneratedToken(`gr_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`);
  };

  const startRegressionSuite = () => {
    if (regressionIntervalRef.current) {
      clearInterval(regressionIntervalRef.current);
    }

    setRegressionStatus("running");
    setRegressionProgress(10);
    regressionIntervalRef.current = setInterval(() => {
      setRegressionProgress(prev => {
        if (prev >= 100) {
          if (regressionIntervalRef.current) {
            clearInterval(regressionIntervalRef.current);
            regressionIntervalRef.current = null;
          }
          setRegressionStatus("done");
          setAuditLogs(logs => [
            { id: "tr-reg-" + Math.floor(Math.random() * 1000), timestamp: new Date().toLocaleTimeString().split(" ")[0], event: "Golden regression pass: 100% of ground-truth matched. Precision 98.4%, Recall 97.2%.", status: "success" },
            ...logs
          ]);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const triggerE2eTestSuiteSim = () => {
    // Clear all existing E2E timeouts
    e2eTimeoutsRef.current.forEach(t => clearTimeout(t));
    e2eTimeoutsRef.current = [];
    if (e2eIntervalRef.current) {
      clearInterval(e2eIntervalRef.current);
      e2eIntervalRef.current = null;
    }

    setE2eStatus("running");
    setE2eProgress(5);
    setE2eLogLines([
      { id: "e2e-0", time: new Date().toLocaleTimeString().split(" ")[0], msg: `[INFO] Launching Grader End-to-End Orchestrator. Mode: ${e2eSpotInstances ? "Spot-Failover Preemptive" : "Standard Private Cloud"}. Parallel Workers: ${e2eConfigWorkers}.`, status: "info" }
    ]);

    const logsAndTriggers = [
      { progress: 15, msg: "[BOOT] Firecracker MicroVM hypervisor initialized in sandboxed memory. Base Image: alpine-3.20.", status: "info", wait: 200 },
      { progress: 25, msg: "[PASS] tc-1: Cold-start latency check. Measured: 38.6ms. Target: <100ms.", status: "success", wait: 450 },
      { progress: 35, msg: "[PASS] tc-2: Temp directory isolation partition verified. Volatile disk memory sandbox mounted to RAMFS.", status: "success", wait: 650 },
      { progress: 42, msg: "[PASS] tc-3: Zero-retention secure scrub verified. Confirmed RAMFS scrubbed to zero bytes on sandbox teardown.", status: "success", wait: 850 },
      { progress: 50, msg: `[INFO] Initializing Swarm concurrency test with ${e2eConfigWorkers} active workers under simulated ${e2eNetworkFailureRate}% network drop.`, status: "info", wait: 1100 },
      { progress: 60, msg: `[PASS] tc-4: Lock-free scheduler queue barrier verification. Under loaded operations, zero queue deadlocks found.`, status: "success", wait: 1350 },
      { progress: 70, msg: "[PASS] tc-5: Spot Instance preemption swap check. Dropped worker VM replaced dynamically in 18ms with 0.00% state leakage.", status: "success", wait: 1600 },
      { progress: 80, msg: "[PASS] tc-6: MicroVM teardown SLA constraint tests. Average runtime: 198ms. SLA standard fully satisfied.", status: "success", wait: 1900 },
      { progress: 88, msg: "[PASS] tc-7: Unified evaluation engine weighted harmonic formula matches Golden mathematical criteria precisely.", status: "success", wait: 2200 },
      { progress: 95, msg: `[PASS] tc-8: Git Merge-Gate status enforcement verifies. Dynamic webhook checks locked automatically under score threshold: ${gateMinScore}.`, status: "success", wait: 2450 },
      { progress: 100, msg: "[PASS] tc-9: SVG Shields Badge CDN request telemetry verified edge-cached properly in Singapore, London & US nodes.", status: "success", wait: 2700 }
    ];

    logsAndTriggers.forEach((step, idx) => {
      const timeoutId = setTimeout(() => {
        setE2eProgress(step.progress);
        setE2eLogLines(prev => [
          ...prev,
          {
            id: `e2e-${idx + 1}`,
            time: new Date().toLocaleTimeString().split(" ")[0],
            msg: step.msg,
            status: step.status as any
          }
        ]);
        if (step.progress === 100) {
          setE2eStatus("passed");
          setAuditLogs(logs => [
            { id: "tr-e2e-" + Math.floor(Math.random() * 1000), timestamp: new Date().toLocaleTimeString().split(" ")[0], event: `Swarm full E2E validation passed: 11 primary test scenarios (24 assertions) met successfully.`, status: "success" },
            ...logs
          ]);
        }
      }, step.wait);
      e2eTimeoutsRef.current.push(timeoutId);
    });
  };

  const handleDismissFinding = (findingId: string) => {
    if (!dismissedFindings.includes(findingId)) {
      setDismissedFindings(prev => [...prev, findingId]);
      setFeedbackSuppressedCount(prev => prev + 1);
      setAuditLogs(logs => [
        { id: "tr-fp-" + Math.floor(Math.random() * 1000), timestamp: new Date().toLocaleTimeString().split(" ")[0], event: `Dismissed finding [${findingId}]. Semantic weights adjusted to suppress similar false positives.`, status: "warning" },
        ...logs
      ]);
    }
  };

  const refinePipeline = (pipelineId: "lst" | "secrets" | "deps" | "license") => {
    setPipelineState(prev => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        isRefining: true
      }
    }));

    const timeNow = new Date().toLocaleTimeString().split(" ")[0];
    setE2eLogLines(prev => [
      { id: `refine-start-${Date.now()}`, time: timeNow, msg: `[TUNE & GRADE] Initiating interactive pipeline compilation: [${pipelineId.toUpperCase()}]. Synthesizing dynamic heuristics...`, status: "info" },
      ...prev
    ]);

    setTimeout(() => {
      let finalGrade = "A";
      setPipelineState(prev => {
        const current = prev[pipelineId];
        let nextGrade = current.grade;
        let nextPrecision = current.precision;
        let nextRecall = current.recall;
        let nextLatency = current.latencyMs;

        if (pipelineId === "lst") {
          if (current.depth >= 8) {
            nextPrecision = 99.2;
            nextRecall = 95.4;
            nextGrade = "A";
          } else {
            nextPrecision = 94.5;
            nextRecall = 90.1;
            nextGrade = "B+";
          }
          nextLatency = Math.max(90, 200 - (current.depth * 10));
        } else if (pipelineId === "secrets") {
          const isOptimalEntropy = current.entropy >= 4.0 && current.entropy <= 5.5;
          if (isOptimalEntropy && current.awsScope && current.verifyRsa) {
            nextGrade = "A+";
            nextPrecision = 99.6;
            nextRecall = 98.1;
          } else {
            nextGrade = "A-";
            nextPrecision = 96.0;
            nextRecall = 92.5;
          }
          nextLatency = current.verifyRsa ? 48 : 28;
        } else if (pipelineId === "deps") {
          if (current.transitive) {
            nextGrade = "A-";
            nextPrecision = 95.8;
            nextRecall = 96.4;
          } else {
            nextGrade = "B";
            nextPrecision = 90.1;
            nextRecall = 84.0;
          }
          nextLatency = current.transitive ? 210 : 100;
        } else if (pipelineId === "license") {
          if (current.forbidViral && current.corporateCheck) {
            nextGrade = "A";
            nextPrecision = 98.2;
            nextRecall = 94.8;
          } else {
            nextGrade = "B";
            nextPrecision = 92.0;
            nextRecall = 88.0;
          }
          nextLatency = current.corporateCheck ? 85 : 45;
        }

        finalGrade = nextGrade;
        return {
          ...prev,
          [pipelineId]: {
            ...current,
            grade: nextGrade,
            precision: nextPrecision,
            recall: nextRecall,
            latencyMs: nextLatency,
            isRefining: false
          }
        };
      });

      setE2eLogLines(prev => [
        { id: `refine-success-${Date.now()}`, time: new Date().toLocaleTimeString().split(" ")[0], msg: `[SUCCESS] Pipeline [${pipelineId.toUpperCase()}] successfully calibrated. Metrics recalculated successfully. New validation grade bounds assigned: [${finalGrade}]. Ready for immediate production release!`, status: "success" },
        ...prev
      ]);

      setAuditLogs(logs => [
        { id: "tr-pipeline-" + Math.floor(Math.random() * 1000), timestamp: new Date().toLocaleTimeString().split(" ")[0], event: `Refined & compiled [${pipelineId.toUpperCase()}] analysis pipeline rules under custom tuner parameters.`, status: "success" },
        ...logs
      ]);

    }, 600);
  };

  return (
    <div id="deterministic-swarm-orchestrator" className="space-y-6">
      
      {/* Prime Header & Navigation System */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            Deterministic Swarm Workspace
          </h2>
          <p className="text-xs text-slate-400">
            A zero-bias, rule-based codebase grader. Defensible data moats generated natively from anonymous aggregate scanning logs.
          </p>
        </div>

        {/* Swarm vs Moat Level Navigation */}
        <div className="flex bg-slate-950 p-1 border border-white/5 rounded-xl self-start md:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setSwarmMode("agents")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              swarmMode === "agents"
                ? "bg-indigo-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Stateless Agent Fleet
          </button>
          
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              swarmMode === "moats"
                ? "bg-indigo-600 text-white shadow-md font-bold"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setSwarmMode("moats")}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Platform Defensibility Moat Suite
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">PRO</span>
          </button>
        </div>
      </div>

      {/* SWARM AGENT MODE */}
      {swarmMode === "agents" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Visual Workflow Orchestrator */}
          <div className="p-4 bg-[#0a0a0c]/80 border border-white/5 rounded-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-indigo-400" />
              Coordinated Swarm Pipe-flow (Stateless Sandbox Execution)
            </span>

            {/* Node connections visual */}
            <div className="hidden md:flex items-center justify-between gap-4 py-2 font-mono text-[10px] uppercase text-center relative">
              
              <div className="p-3 bg-slate-900 border border-white/10 rounded-lg flex-1">
                <div className="text-indigo-400 font-bold">1. Ingress Clone</div>
                <div className="text-slate-500 text-[9px] mt-1.5">Ephemere Clone File systems</div>
              </div>

              <div className="text-slate-600 font-extrabold">➔</div>

              <div className="p-3 bg-slate-900 border border-indigo-500/30 rounded-lg flex-1 relative font-mono">
                <div className="absolute top-1 right-1.5 text-[8px] bg-indigo-500/15 py-0.2 px-1 text-indigo-300 font-bold rounded">Parallel</div>
                <div className="text-white font-bold">2. Swarm Dispatch</div>
                <div className="text-slate-400 text-[9px] mt-1.5">12 Coordinated Workers</div>
              </div>

              <div className="text-slate-600 font-extrabold">➔</div>

              <div className="p-3 bg-slate-900 border border-white/10 rounded-lg flex-1">
                <div className="text-emerald-400 font-bold">3. Rule Filters</div>
                <div className="text-slate-500 text-[9px] mt-1.5">No Hallucinations / High Precision</div>
              </div>

              <div className="text-slate-600 font-extrabold">➔</div>

              <div className="p-3 bg-slate-900 border border-indigo-550/35 rounded-lg flex-1">
                <div className="text-indigo-300 font-bold">4. Score Synthesis</div>
                <div className="text-slate-400 text-[9px] mt-1.5">Linear Weighted Index Matrix</div>
              </div>
            </div>

            {/* Small screen pipeline banner */}
            <div className="md:hidden p-3 bg-slate-900/50 border border-white/5 rounded text-xs text-slate-400 font-mono">
              Pipeline: Ephemeral Clone ➔ Parallel Dispatch (12 stateless workers) ➔ Strict Static Verification Rules ➔ Linear Weighted Aggregator Score.
            </div>
          </div>

          {/* Main split grid: Fleet inventory vs focused inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left pane: Agent inventory cards (col-span-5) */}
            <div id="swarm-catalogue-pane" className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Stateless Agent Catalogue ({agents.length})
              </h3>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {agents.map((item) => {
                  const isActive = selectedAgentId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAgentId(item.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center gap-3 ${
                        isActive 
                          ? "bg-indigo-950/20 border-indigo-500/40 shadow-inner" 
                          : "bg-[#0b0c0d]/60 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 truncate block">
                            {item.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-mono font-bold font-semibold ${
                            item.category === "Code Health"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                              : item.category === "Readiness"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-indigo-500/10 text-indigo-400"
                          }`}>
                            {item.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-[10px] text-slate-500 block">Runs</span>
                        <span className="text-[11px] text-slate-300 font-semibold">{item.executionTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right pane: Operational rules & threshold modifiers */}
            <div id="agent-rules-panel" className="lg:col-span-7 space-y-6">
              
              <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-5">
                <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Rule Inspector & Thresholds
                    </span>
                    <h4 className="text-base font-bold text-white font-display mt-0.5">{selectedAgent.name}</h4>
                  </div>
                  <div className="text-right py-1 px-2.5 bg-black/40 border border-white/5 text-[10px] font-mono text-indigo-300 rounded font-bold">
                    {selectedAgent.ruleFile}
                  </div>
                </div>

                {/* Deterministic Rules Explanation */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Rule Traversal Logic:</span>
                  <div className="p-3.5 bg-black/50 border border-white/5 rounded-xl font-mono text-xs text-slate-300 leading-relaxed">
                    {selectedAgent.deterministicLogic}
                  </div>
                  <div className="text-[11px] text-indigo-300 flex items-center gap-1.5 pt-1">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    Underlying Binaries/CLIs: <code className="text-white font-mono bg-indigo-500/15 py-0.2 px-1.5 rounded">{selectedAgent.toolsUsed}</code>
                  </div>
                </div>

                {/* Threshold sliders */}
                {selectedAgent.thresholds.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Configurable Alert Slices (Central Yaml Configs):</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedAgent.thresholds.map((t, idx) => (
                        <div key={idx} className="p-3 bg-[#0a0a0c]/60 rounded-xl border border-white/5 space-y-1.5 text-xs">
                          <div className="flex justify-between text-[11px] font-mono text-slate-300">
                            <span>{t.label}</span>
                            <span className="text-indigo-400 font-bold font-mono">{t.value} {t.unit}</span>
                          </div>
                          
                          {/* Sim slider */}
                          <input 
                            type="range"
                            min={t.min}
                            max={t.max}
                            value={t.value}
                            disabled
                            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-not-allowed accent-indigo-500"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Min: {t.min}</span>
                            <span>Max: {t.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive deterministic code analyzer test-suite sandbox */}
              <div className="p-5 bg-indigo-950/10 border border-indigo-500/20 rounded-2xl space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/10 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-display">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Stateless Sandbox Probe Simulation
                    </h4>
                    <p className="text-[11px] text-slate-400">Tweak standard code templates below and hit Run Simulation to observe deterministic logic.</p>
                  </div>

                  {/* Quick Preset Buttons for sandbox testing */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => replaceSandboxExample("secret")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load a leaked GitHub credentials tag"
                    >
                      Load Leak
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("license")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load high-risk Copyleft GPL comments"
                    >
                      Load GPL
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("complexity")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load deeply nested complexity loops"
                    >
                      Load Complex Loop
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("coverage")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load high-coverage Unit/Spec testing imports"
                    >
                      Load Test Code
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("trends")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load legacy package dependencies"
                    >
                      Load Tech Stack
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("community")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load solo experiment repository statistics"
                    >
                      Load Repo Metrics
                    </button>
                    <button
                      onClick={() => replaceSandboxExample("monetization")}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded cursor-pointer"
                      title="Load permissive monetization configuration files"
                    >
                      Load Monetization
                    </button>
                  </div>
                </div>

                {/* Sandbox Input Code Area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Input Buffer Draft</span>
                    <span>Select active agent at catalog to focus scanners</span>
                  </div>
                  <textarea
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="w-full h-32 p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                    placeholder="Write, tweak or paste custom code block characters..."
                  />
                </div>

                {/* Action Trigger Button */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleRunProbe}
                    disabled={simulatedLoad}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 text-white font-semibold text-xs rounded-lg select-none flex items-center justify-center gap-1.5 transition-all cursor-pointer grow sm:grow-0"
                  >
                    {simulatedLoad ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    Run Swarm Probe Simulation
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Analyzed via active agent: <strong className="text-indigo-400 font-semibold">{selectedAgent.name}</strong>
                  </span>
                </div>

                {/* Output stdout diagnostics and schema payloads */}
                {probeResult.logs.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    
                    {/* 1. Scrolling shell log */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Stdout Console Logs</span>
                      <div className="h-[140px] bg-black border border-white/5 p-3 rounded-xl font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1 scrollbar-thin">
                        {probeResult.logs.map((log, idx) => (
                          <div key={idx} className={
                            log.includes("CRITICAL") || log.includes("ALERT") || log.includes("WARNING")
                              ? "text-rose-400 font-bold"
                              : log.includes("SUCCESS") || log.includes("Secure")
                              ? "text-emerald-400 font-medium"
                              : "text-slate-400"
                          }>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Structured JSON Output payloads */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Deterministic JSON Response</span>
                      <div className="h-[140px] bg-black border border-white/5 p-3 rounded-xl font-mono text-[10px] text-emerald-300 overflow-y-auto scrollbar-thin">
                        {probeResult.outputJson ? (
                          <pre className="whitespace-pre-wrap leading-normal">{probeResult.outputJson}</pre>
                        ) : (
                          <span className="text-slate-600 italic">Processing pipeline data stream...</span>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Final disclaimer on deterministic mechanics */}
                <div className="p-3 bg-slate-900/30 border border-white/5 rounded-lg text-[11px] text-slate-400 leading-snug">
                  ℹ️ <strong>Developer Sandbox Notice:</strong> Swarm probe diagnostics run strictly in-memory inside custom worker scopes. All output contracts are repeatable, auditable in production systems, and can easily run on pipelines like GitHub Actions, Travis-CI, or Docker local stacks.
                </div>

              </div>

            </div>

          </div>
        </div>
      )}


      {/* PLATFORM DEFENSIBILITY MOATS SUITE */}
      {swarmMode === "moats" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Defensibility Concept Description Banner */}
          <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-indigo-900/10 to-transparent border border-indigo-500/20 rounded-2xl relative overflow-hidden">
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10 pointer-events-none">
              <Shield className="w-40 h-40 text-indigo-400" />
            </div>
            <div className="max-w-3xl space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 py-1 px-2.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest inline-block">
                Defensibility & Compound Networks Moat
              </span>
              <h3 className="text-lg font-bold text-white font-display">Unfair Platform Moats Over Single Scanners</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                While standard competitors run simple linters or parse static credentials APIs, Grader compiles 
                <strong> aggregate community inputs, cross-project anonymized percentiles, verified microVM outcomes,
                and team congruence surveys</strong> to build a compound network standard that grows stronger with every user.
              </p>
            </div>
          </div>

          {/* Moat Sub-navigation Rail */}
          <div className="flex flex-wrap border-b border-white/5 gap-1.5 pb-0.5 whitespace-nowrap scrollbar-none overflow-x-auto">
            <button
              onClick={() => setActiveMoatSubTab("graph")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "graph"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              1. Archetype Knowledge Graph
            </button>

            <button
              onClick={() => setActiveMoatSubTab("benchmarking")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "benchmarking"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              2. Cross-Project Benchmarks
            </button>

            <button
              onClick={() => setActiveMoatSubTab("friction")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "friction"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              3. Setup Friction Sandboxing
            </button>

            <button
              onClick={() => setActiveMoatSubTab("congruence")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "congruence"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              4. Team Congruence Engine
            </button>

            <button
              onClick={() => setActiveMoatSubTab("genome")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "genome"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              5. Public Genome Registry
            </button>

            <button
              onClick={() => setActiveMoatSubTab("integrations")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "integrations"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              6. CI/CD API Integration
            </button>

            <button
              onClick={() => setActiveMoatSubTab("pipeline")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "pipeline"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              7. Hybrid Pipeline & Golden Dataset
            </button>

            <button
              onClick={() => setActiveMoatSubTab("testing")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMoatSubTab === "testing"
                  ? "border-indigo-500 text-indigo-300 font-bold bg-indigo-550/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              8. Swarm E2E Test Suite
            </button>
          </div>

          {/* TAB 1: THE ARCHETYPE KNOWLEDGE GRAPH */}
          {activeMoatSubTab === "graph" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn pb-6">
              
              {/* Left archetype index selectors */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Select Archetype Blueprint:</span>
                
                <div className="space-y-2">
                  {[
                    { id: "nextjs", name: "Next.js SaaS Blueprint", agree: archetypeVotes.nextjs, tags: ["App Router", "Next-Auth", "Prisma", "ESLint"] },
                    { id: "python", name: "Python FastAPI Blueprint", agree: archetypeVotes.python, tags: ["Poetry", "PyTest", "SQLAlchemy", "Black"] },
                    { id: "react", name: "React Modern Component", agree: archetypeVotes.react, tags: ["Vite", "Turborepo", "Vitest", "MIT License"] },
                    { id: "terraform", name: "Terraform Cloud Module", agree: archetypeVotes.terraform, tags: ["AWS Provider", "TFLint", "Hardened-State"] }
                  ].map((arch) => (
                    <div
                      key={arch.id}
                      onClick={() => setSelectedArchetypeId(arch.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedArchetypeId === arch.id
                          ? "bg-indigo-950/20 border-indigo-500/40"
                          : "bg-slate-900/30 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white font-display">{arch.name}</span>
                        <span className="text-[10px] text-indigo-300 font-mono">Consensus Voted: {arch.agree}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {arch.tags.map(t => (
                          <span key={t} className="text-[8px] px-1 bg-slate-800 text-slate-300 rounded font-mono">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consensus Voting button (Simulated community network effects) */}
                <div className="p-4 bg-slate-950/80 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-mono font-bold text-slate-100 uppercase">Vote for validation standards</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This specification is community-hardened. Upvoting establishes strict priority weights inside Grader's global validator cluster.
                  </p>
                  <button
                    onClick={() => {
                      setArchetypeVotes(prev => ({ ...prev, [selectedArchetypeId]: prev[selectedArchetypeId] + 1 }));
                    }}
                    className="w-full py-1.5 bg-indigo-600/35 hover:bg-indigo-600/50 text-[11px] text-indigo-200 border border-indigo-500/30 rounded-lg font-bold tracking-wide transition-all cursor-pointer"
                  >
                    👍 Endorse & Vote Gold-Standard Consensus
                  </button>
                </div>
              </div>

              {/* Right Archetype Blueprint parameters */}
              <div className="lg:col-span-8 space-y-4">
                
                <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">
                        Blueprint: {selectedArchetypeId === "nextjs" ? "Next.js SaaS Stack" : selectedArchetypeId === "python" ? "FastAPI Backend" : selectedArchetypeId === "react" ? "React Pure Library" : "Terraform Infrastructure"}
                      </h4>
                      <p className="text-[11px] text-slate-400">Specifies structural rules, forbidden packages, expected test formats, and required security gates.</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Version 2.4.1 (Stable JSON Schema)</span>
                  </div>

                  {/* Archetype specification lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-3 bg-black/40 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-emerald-300 font-bold block">Expected Inclusions (Files & Deps)</span>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                        {selectedArchetypeId === "nextjs" && (
                          <>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <code>next.config.js</code> (or .ts root config)</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <code>/src/app/layout.tsx</code> routing pattern</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Jest or Vitest assertion suites</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Strict ESLint plugin rule config</li>
                          </>
                        )}
                        {selectedArchetypeId === "python" && (
                          <>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <code>pyproject.toml</code> or <code>requirements.txt</code></li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> FastAPI runtime with uvicorn hooks</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> PyTest integration directories</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> black/flake8 type checkers</li>
                          </>
                        )}
                        {selectedArchetypeId === "react" && (
                          <>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <code>vite.config.ts</code> with library bundle parameters</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Strict TypeScript types file standard</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Vitest layout checks</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Clean PeerDependencies declarations</li>
                          </>
                        )}
                        {selectedArchetypeId === "terraform" && (
                          <>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> <code>variables.tf</code> and <code>outputs.tf</code> files</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> provider lock-in constraint parameters</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> .github code-owner security definitions</li>
                            <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> tflint and checkov security rules</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-rose-300 font-bold block">Forbidden / Anti-Patterns Checked</span>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                        {selectedArchetypeId === "nextjs" && (
                          <>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ GPL Restricted direct packages</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Inline style inline configurations</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Dynamic un-typed routing hooks</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Hardcoded dev URL credentials</li>
                          </>
                        )}
                        {selectedArchetypeId === "python" && (
                          <>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Unlocked dev libraries inside prod requirements</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Globals-level database credential exports</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Sync-only blocking requests in async routing</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Missing API response payload schemas</li>
                          </>
                        )}
                        {selectedArchetypeId === "react" && (
                          <>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Inline base SVG declarations (Lucide pre-loaded)</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Global namespace polluting styles</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Unspecified dynamic any-type attributes</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ LocalStorage caches lack fallback mocks</li>
                          </>
                        )}
                        {selectedArchetypeId === "terraform" && (
                          <>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Hardcoded IP ranges (e.g. 0.0.0.0/0) in security groups</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Unencrypted AWS S3 backend state buckets</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Outdated provider semantic definitions</li>
                            <li className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-rose-400" /> ❌ Standard user/pass secret configurations</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Submission form to contribute to data moat graph */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-indigo-300 font-bold block uppercase tracking-wider">🔬 Propose validation rules (Data Network Effect)</span>
                    <form onSubmit={handleProposeRule} className="flex gap-2">
                      <input
                        type="text"
                        value={proposedRule}
                        onChange={(e) => setProposedRule(e.target.value)}
                        placeholder="e.g. Reject Next.js libraries with dependency tree depth > 8"
                        className="flex-1 bg-black/60 border border-white/10 rounded-lg text-xs p-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Propose
                      </button>
                    </form>
                    
                    {/* Live Consensus Proposals List */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Active Community Feedback Submissions ({consensusProposalList.length}):</span>
                      {consensusProposalList.map((p) => (
                        <div key={p.id} className="p-2.5 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between gap-4 text-xs font-mono">
                          <span className="text-slate-300 line-clamp-1">{p.rule}</span>
                          <div className="flex items-center gap-2shrink-0">
                            <span className="text-[10px] text-indigo-400 font-semibold">{p.votes} votes</span>
                            <button
                              type="button"
                              disabled={votedIds.has(p.id)}
                              onClick={() => castProposalVote(p.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                votedIds.has(p.id)
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                  : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/35 cursor-pointer"
                              }`}
                            >
                              {votedIds.has(p.id) ? "Voted ✔" : "Upvote"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 2: GLOBAL PEER BENCHMARKING */}
          {activeMoatSubTab === "benchmarking" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Cross-Project Anonymous Benchmarking</h4>
                  <p className="text-[11px] text-slate-400">Determines your standing credit-score amongst scanned peers in real-time. Power compounds with total dataset size.</p>
                </div>
                
                {/* Aggregate count simulation control */}
                <div className="flex items-center gap-3 bg-black/40 py-1.5 px-3 border border-white/5 rounded-xl text-xs">
                  <span className="text-slate-300 font-mono">Simulate scanned repos index:</span>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="100"
                    value={scannedPeersCount}
                    onChange={(e) => setScannedPeersCount(parseInt(e.target.value))}
                    className="w-24 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-indigo-400 font-bold font-mono">{scannedPeersCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Percentile Stats Curves Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Master scorecard Standing badge */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl relative overflow-hidden flex flex-col justify-between h-42">
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 pointer-events-none">
                      <Award className="w-32 h-32 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 block uppercase font-bold tracking-wider">Your Global Standing Credit</span>
                      <h4 className="text-3xl font-extrabold text-white font-display mt-1">Grader Score: 87</h4>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Top 12% in Next.js + React Bracket</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Calculated securely against {scannedPeersCount.toLocaleString()} anonymous verified repos.
                      </p>
                    </div>
                  </div>

                  {/* Security Shield Integrity badge */}
                  <div className="p-4 bg-emerald-950/15 border border-emerald-500/20 rounded-xl space-y-2">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">Privacy-Preserving Security</span>
                    <p className="text-xs text-slate-300 leading-snug">
                      Your scanner findings are zero-knowledge aggregated. No raw files are ever published. Percentile statistics are computed via secure hash limits.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Key Performance Comparator Index:</span>
                  
                  <div className="space-y-3">
                    {[
                      { label: "Test statement coverage density", userVal: "94.2%", sampleAvg: "81.5%", state: "Top 5%", isBetter: true },
                      { label: "Cyclomatic branch complexity ratio", userVal: "4.2 branches", sampleAvg: "6.1 branches", state: "Top 12%", isBetter: true },
                      { label: "Hardcoded key leaks count", userVal: "1 active leak", sampleAvg: "0.04 leaks", state: "Bottom 30%", isBetter: false },
                      { label: "Setup installation timeline duration", userVal: "5.4s Sandbox", sampleAvg: "15.8s Sample", state: "Top 4%", isBetter: true },
                      { label: "Codebase team consensus congruence", userVal: "96.4%", sampleAvg: "72.1%", state: "Top 8%", isBetter: true }
                    ].map((comp, idx) => (
                      <div key={idx} className="p-3 bg-black/45 border border-white/5 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-200">{comp.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${comp.isBetter ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                            {comp.state}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 text-[11px] font-mono text-slate-400">
                          <div>Your codebase finding: <strong className="text-white font-semibold">{comp.userVal}</strong></div>
                          <div className="text-right">Scanned peers average: <span className="text-slate-300 font-semibold">{comp.sampleAvg}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 3: SETUP FRICTION VM SANDBOX */}
          {activeMoatSubTab === "friction" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Deterministic Setup Friction Emulator</h4>
                  <p className="text-[11px] text-slate-400">Launches isolated Firecracker microVMs to procedurally verify markdown commands and compile pass/fail statistics.</p>
                </div>

                {/* VM select options */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Environment Sandbox:</span>
                  <select
                    value={frictionPlatform}
                    onChange={(e) => setFrictionPlatform(e.target.value as any)}
                    className="p-1 bg-black border border-white/10 rounded font-mono text-[11px] text-indigo-300 focus:outline-none"
                  >
                    <option value="firecracker">Linux Firecracker VM v4.1</option>
                    <option value="alpine-docker">Isolated Alpine-Docker v3.19</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* VM execution control console (col-span-8) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Isolated MicroVM Terminal Output
                    </span>
                    <span className={`uppercase text-[10px] ${
                      frictionLogStatus === "idle" ? "text-slate-500" :
                      frictionLogStatus === "successful" ? "text-emerald-400 animate-pulse" : "text-yellow-400 animate-pulse"
                    }`}>
                      Status: {frictionLogStatus}
                    </span>
                  </div>

                  {/* Virtual Shell emulation box */}
                  <div className="h-[260px] bg-black border border-white/10 rounded-xl p-4 font-mono text-[10px] text-emerald-300 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {frictionTerminalLines.length === 0 ? (
                      <div className="text-slate-500 italic h-full flex flex-col items-center justify-center gap-1 text-center font-sans text-xs">
                        <Terminal className="w-8 h-8 text-slate-600 mb-2" />
                        <span>Mock terminal is idle in safe state.</span>
                        <span>Click 'Provision & Boot Sandboxed VM' below to dry-run the installation guidelines.</span>
                      </div>
                    ) : (
                      frictionTerminalLines.map((line, idx) => (
                        <div key={idx} className={
                          line.includes("[SUCCESS]") ? "text-emerald-400 font-bold" :
                          line.includes("[EXEC]") ? "text-indigo-400" :
                          line.includes("[SCRAPE]") ? "text-yellow-400" :
                          "text-slate-300"
                        }>
                          {line}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Trigger buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={triggerFrictionSandboxSim}
                      disabled={frictionLogStatus !== "idle" && frictionLogStatus !== "successful" && frictionLogStatus !== "failed"}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${frictionLogStatus !== "idle" && frictionLogStatus !== "successful" ? "animate-spin" : ""}`} />
                      Provision & Boot Sandboxed Sandbox VM
                    </button>
                    {(frictionLogStatus === "successful" || frictionLogStatus === "failed") && (
                      <button
                        onClick={() => { setFrictionTerminalLines([]); setFrictionLogStatus("idle"); setFrictionOverallResult(null); }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Reset Console
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Setup diagnostics report statistics */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sandbox Execution Metrics:</span>
                  
                  {frictionOverallResult ? (
                    <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-3 animate-fadeIn">
                      <div className="text-center pb-2 border-b border-indigo-500/10">
                        <span className="text-[10px] font-mono text-indigo-400 block uppercase">Sandbox Reproducibility Rate</span>
                        <h5 className="text-3xl font-extrabold text-white mt-1">{frictionOverallResult.score}%</h5>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Excellent / Minimum Friction</p>
                      </div>

                      <div className="space-y-2 text-xs font-sans">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Scraped Commands Match:</span>
                          <p className="text-slate-200 mt-0.5">{frictionOverallResult.reproducibility}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Installation Duration:</span>
                          <p className="text-slate-200 mt-0.5">{frictionOverallResult.durationS} overall</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">Resolution Diagnostics:</span>
                          <p className="text-slate-300 leading-normal text-[11px] mt-0.5">{frictionOverallResult.diagnostics}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl h-[330px] flex flex-col items-center justify-center text-center p-3 text-slate-500 text-xs">
                      <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                      <span>Diagnostics pending.</span>
                      <span>Run the virtual dry-run to compile reproduction health metrics.</span>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}


          {/* TAB 4: TEAM CONGRUENCE ENGINE */}
          {activeMoatSubTab === "congruence" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white font-display">Team Congruence Alignment Engine</h4>
                <p className="text-[11px] text-slate-400">Differentiates internal team subjective assumptions against 100% objective, parsed results to detect developmental blindness.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left pane: Team Surveys */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">1. Subjective Team Questionnaire</span>
                  
                  <div className="space-y-3 text-xs bg-black/40 p-4 border border-white/5 rounded-xl">
                    
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Q1: Estimated codebase test coverage ratio?</label>
                      <select
                        value={surveyAnswers.coverage}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, coverage: e.target.value }))}
                        className="w-full p-2 bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none"
                      >
                        <option value="90%+">Pragmatic 90%+ statement coverage</option>
                        <option value="80-90%">Steady 80-90% coverage</option>
                        <option value="50-80%">Partial 50-80% coverage</option>
                        <option value="no-tests">Scant/No tests written</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Q2: Presence of credentials/secret keys?</label>
                      <select
                        value={surveyAnswers.secrets}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, secrets: e.target.value }))}
                        className="w-full p-2 bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none"
                      >
                        <option value="absolutely-no">We maintain pristine secret management (0 keys)</option>
                        <option value="maybe-sandbox">Maybe some old developer sandbox mockup key hashes</option>
                        <option value="definite-leaks">We have active/known secrets inside direct strings</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Q3: Source cyclomatic nesting level?</label>
                      <select
                        value={surveyAnswers.complexity}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, complexity: e.target.value }))}
                        className="w-full p-2 bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none"
                      >
                        <option value="elegant">Extremely flat and beautifully clean loops</option>
                        <option value="moderate">Average nested conditionals (Complexity &lt;= 10)</option>
                        <option value="complex-spaghetti">Deeply nested spaghetti loops of if-else statements</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Q4: Monetization and License Compliance?</label>
                      <select
                        value={surveyAnswers.licensing}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, licensing: e.target.value }))}
                        className="w-full p-2 bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none"
                      >
                        <option value="100-compliant">100% Permissive commercial licensing</option>
                        <option value="not-sure">Unsure of packaging copyright overlapping hazards</option>
                        <option value="uncompliant">We copy-paste files directly regardless of license type</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={calculateTeamCongruence}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer mt-1"
                    >
                      Compare Sub-Objective Congruence Engine
                    </button>
                  </div>
                </div>

                {/* Right pane: Reality outcomes and progress trajectory */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">2. Congruence Delta Comparison Findings</span>
                  
                  {congruenceReport ? (
                    <div className="space-y-4 animate-fadeIn">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Radial dial score */}
                        <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">Congruence Alignment Index</span>
                          <h4 className="text-4xl font-extrabold text-white mt-2 mb-1">{congruenceReport.score}%</h4>
                          <span className={`text-[10px] font-bold uppercase rounded py-0.5 px-2 ${
                            congruenceReport.score > 85 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                          }`}>
                            {congruenceReport.verdict}
                          </span>
                        </div>

                        {/* Gap analysis */}
                        <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-mono">Delusional Quotient</span>
                            <h4 className="text-2xl font-bold text-rose-400 mt-1">{congruenceReport.divergenceGap}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal font-sans">
                            A delta larger than 25% signifies serious structural communication gaps between developer assumptions and physical master codebases.
                          </p>
                        </div>
                      </div>

                      {/* Explicit detail bullets */}
                      <div className="p-4 bg-[#0a0a0c]/80 border border-white/5 rounded-xl space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">Diff Resolution Trait:</span>
                        {congruenceReport.findings.map((finding: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-slate-300 font-sans">
                            <span className="text-indigo-400 mt-0.5">▪</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  ) : (
                    <div className="p-5 bg-slate-950/40 border border-white/5 rounded-2xl h-[240px] flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-1">
                      <Users className="w-8 h-8 text-slate-600 mb-1" />
                      <span>Questionnaire pending comparison.</span>
                      <span>Specify subjective estimates on the left and submit to view the alignment gap.</span>
                    </div>
                  )}

                  {/* Operational historical progress */}
                  <div className="p-4 bg-slate-950/30 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Historical Team Congruence Scans:</span>
                    <div className="space-y-1.5 text-xs font-mono">
                      {historicalCongruenceList.map((hist, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300 p-2 bg-black/40 border border-white/5 rounded-lg">
                          <span>{hist.date} scan log</span>
                          <div className="flex gap-4">
                            <span>Score: <strong className="text-white font-semibold">{hist.score}%</strong></span>
                            <span className="text-slate-400 font-bold font-semibold uppercase text-[10px]">{hist.delta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 5: PUBLIC GENOME REGISTRY & SHIELDS BADGES */}
          {activeMoatSubTab === "genome" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white font-display">Public Project Genome Registry</h4>
                <p className="text-[11px] text-slate-400">The transparent, SEO-prominent registry proving package trust. Generate dynamic, live-updating Shields.io badges.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Search public repos */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 bg-black/40 p-2 border border-white/10 rounded-xl">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={genomeQuery}
                      onChange={(e) => setGenomeQuery(e.target.value)}
                      placeholder="Search scanned public codebase genomes (e.g. facebook, vercel, vibe-coders)..."
                      className="bg-transparent border-none text-xs w-full text-slate-200 outline-none placeholder-slate-500"
                    />
                  </div>

                  {/* Scanned Repo listings table */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredGenomeData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedGenomeRepo(item.repo)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center gap-3 ${
                          selectedGenomeRepo === item.repo 
                            ? "bg-indigo-950/20 border-indigo-500/40" 
                            : "bg-black/30 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-display">{item.repo}</span>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-mono py-0.2 px-1 rounded uppercase font-semibold">{item.license}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</p>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[11px]">
                          <span className="text-white font-bold">Grader Score: {item.qualityScore}</span>
                          <span className="text-[10px] text-slate-500 block">Stars: {item.stars}</span>
                        </div>
                      </div>
                    ))}
                    {filteredGenomeData.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-500 italic">No matching public repositories found.</div>
                    )}
                  </div>
                </div>

                {/* Badge copy tool on the right */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">Live Trust Badge Generator</span>
                  
                  {selectedGenomeRepo ? (
                    <div className="p-4 bg-[#0a0a0c]/60 border border-white/5 rounded-2xl space-y-4 animate-fadeIn text-xs">
                      
                      {/* Interactive preview */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center space-y-2">
                        <span className="text-[9px] text-slate-500 font-mono block uppercase">Real-Time Shields Badge Preview</span>
                        
                        <div className="flex justify-center items-center py-2 select-none">
                          <span className={`px-2.5 py-1 text-[11px] font-bold font-mono text-white tracking-wide rounded-l bg-slate-800 border border-r-0 border-white/10 flex items-center gap-1`}>
                            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            Grader Quality
                          </span>
                          <span className="px-2.5 py-1 text-[11px] font-bold font-mono text-white rounded-r bg-indigo-600 border border-l-0 border-indigo-500/30">
                            {genomeRegistryData.find(g => g.repo === selectedGenomeRepo)?.qualityScore || 87}
                          </span>
                        </div>
                      </div>

                      {/* Badge Style picker */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Shield Style Format:</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
                          {["flat", "flat-square", "plastic", "for-the-badge"].map(style => (
                            <button
                              key={style}
                              onClick={() => setSelectedBadgeStyle(style as any)}
                              className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                                selectedBadgeStyle === style 
                                  ? "bg-indigo-600 border-indigo-500 text-white" 
                                  : "bg-slate-900/50 border-white/5 text-slate-300 hover:border-white/10"
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Markdown code copy block */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>Copy Markdown Hook</span>
                          <button
                            onClick={() => copyToClipboard(getBadgeMarkdown(selectedGenomeRepo, genomeRegistryData.find(g => g.repo === selectedGenomeRepo)?.qualityScore || 87))}
                            className="text-indigo-400 hover:text-indigo-200 transition-all font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedBadgeText ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={getBadgeMarkdown(selectedGenomeRepo, genomeRegistryData.find(g => g.repo === selectedGenomeRepo)?.qualityScore || 87)}
                          className="w-full h-20 p-2.5 bg-black border border-white/5 rounded-lg font-mono text-[10px] text-emerald-400 leading-relaxed resize-none focus:outline-none"
                        />
                      </div>

                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl h-[230px] flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                      <span>Select a scanned repository from the registry list to format custom live quality badges.</span>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}


          {/* TAB 6: API INTEGRATION & CI/CD ENFORCEMENT */}
          {activeMoatSubTab === "integrations" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white font-display">Integrations, CI/CD Gates & Venture Capital API</h4>
                <p className="text-[11px] text-slate-400">Enforce score boundaries directly inside GitHub Actions before pull request merges, or extract JSON payloads for VC investment memos.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Configurator parameters */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">1. Configure CI/CD Guardrail Rules</span>
                  
                  <div className="space-y-4 bg-black/40 p-4 border border-white/5 rounded-xl text-xs">
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Fail build if score falls below:</span>
                        <span className="font-bold font-mono text-indigo-400">{gateMinScore} points</span>
                      </div>
                      <input 
                        type="range"
                        min="50"
                        max="95"
                        value={gateMinScore}
                        onChange={(e) => setGateMinScore(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={gateNoSecrets}
                        onChange={(e) => setGateNoSecrets(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Strict: Reject merge if raw secrets leaked</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={gateCopyleftForbid}
                        onChange={(e) => setGateCopyleftForbid(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Strict: Halt compilation if Copyleft (GPL) matched</span>
                    </label>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Due-Diligence Venture API Auth Token</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          placeholder="Tokens trigger secure program reviews..."
                          value={generatedToken}
                          className="w-full p-2 bg-slate-900 border border-white/10 rounded font-mono text-[10px] text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={generateApiKey}
                          className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold font-mono transition-now pointer cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      
                      {generatedToken && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedToken, true)}
                          className="text-[10px] text-indigo-300 hover:text-indigo-200 block transition-all font-mono font-bold"
                        >
                          {copiedToken ? "✔ Token string copied to clipboard!" : "📋 Copy API Credentials"}
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Generated pipeline code block on the right */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Compiled GitHub Actions workflow file: <code>.github/workflows/grader-sentinel.yml</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `# Grader compliance gate\n` +
                          `name: Grader Compliance Sentinel\n` +
                          `on:\n` +
                          `  pull_request:\n` +
                          `    branches: [ main, master ]\n\n` +
                          `jobs:\n` +
                          `  grader-gate:\n` +
                          `    runs-on: ubuntu-latest\n` +
                          `    steps:\n` +
                          `      - name: Checkout Code\n` +
                          `        uses: actions/checkout@v4\n\n` +
                          `      - name: Execute Deterministic Grader Swarm\n` +
                          `        uses: grader-dev/swarm-action@v2\n` +
                          `        with:\n` +
                          `          min-score: ${gateMinScore}\n` +
                          `          assert-no-secrets: ${gateNoSecrets}\n` +
                          `          assert-no-copyleft: ${gateCopyleftForbid}\n` +
                          `          api-token: \${{ secrets.GRADER_API_TOKEN }}`;
                        navigator.clipboard.writeText(code);
                        setCopiedYaml(true);
                        setTimeout(() => setCopiedYaml(false), 2000);
                      }}
                      className="text-indigo-400 hover:text-indigo-200 text-xs font-bold flex items-center gap-1 transition-all pointer cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedYaml ? "Copied!" : "Copy Code"}
                    </button>
                  </div>

                  <textarea
                    readOnly
                    className="w-full h-[280px] p-4 bg-black border border-white/10 rounded-xl font-mono text-[10px] text-indigo-300 leading-relaxed resize-none focus:outline-none"
                    value={
                      `# Grader compliance gate\n` +
                      `name: Grader Compliance Sentinel\n` +
                      `on:\n` +
                      `  pull_request:\n` +
                      `    branches: [ main, master ]\n\n` +
                      `jobs:\n` +
                      `  grader-gate:\n` +
                      `    runs-on: ubuntu-latest\n` +
                      `    steps:\n` +
                      `      - name: Checkout Code\n` +
                      `        uses: actions/checkout@v4\n\n` +
                      `      - name: Execute Deterministic Grader Swarm\n` +
                      `        uses: grader-dev/swarm-action@v2\n` +
                      `        with:\n` +
                      `          min-score: ${gateMinScore}\n` +
                      `          assert-no-secrets: ${gateNoSecrets}\n` +
                      `          assert-no-copyleft: ${gateCopyleftForbid}\n` +
                      `          api-token: \${{ secrets.GRADER_API_TOKEN }}`
                    }
                  />

                </div>

              </div>

            </div>
          )}

          {/* TAB 7: HYBRID COMPLIANCE PIPELINE & GOLDEN DATASET COCKPIT */}
          {activeMoatSubTab === "pipeline" && (
            <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-6 animate-fadeIn pb-8">
              
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-400" />
                  Hybrid AI-Deterministic Compliance Pipeline
                </h4>
                <p className="text-[11px] text-slate-400">
                  Combining high-resolution Lossless Semantic Trees (LST) with probabilistic AI and physical verification engines to optimize precision, recall, and token efficiency.
                </p>
              </div>

              {/* TWO COLUMN WORKSPACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-display">
                
                {/* COLUMN 1: Visual State Machine & Configuration Controls (col-span-8) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Pipeline Step Flow Diagram Card */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 relative overflow-hidden">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">1. Pipeline Flow Architecture & Context Matching</span>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono text-[9px] uppercase">
                      
                      <div className="p-2.5 bg-slate-950 rounded border border-white/5 relative">
                        <span className="absolute top-1 right-1.5 text-[7px] text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded">Cached</span>
                        <div className="text-white font-semibold mb-0.5">Semantic Ingress</div>
                        <div className="text-[8px] text-slate-500 leading-normal lowercase">embedding of repo indexed once on push, not regenerated</div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded border border-white/5">
                        <div className="text-indigo-400 font-bold mb-0.5">LST Parsing</div>
                        <div className="text-[8px] text-slate-500 leading-normal lowercase">converts code to lossless semantic tree instead of string</div>
                      </div>

                      <div className="p-2.5 bg-indigo-950/20 rounded border border-indigo-500/25 relative">
                        <span className="absolute top-1 right-1 text-[7px] text-indigo-300 font-bold bg-indigo-505/15 px-1 rounded">Batch</span>
                        <div className="text-white font-semibold mb-0.5">Probabilistic AI</div>
                        <div className="text-[8px] text-indigo-300 leading-normal lowercase">interprets structural tree data into schema JSON</div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded border border-white/5">
                        <div className="text-emerald-400 font-bold mb-0.5">Static Correct</div>
                        <div className="text-[8px] text-slate-500 leading-normal lowercase">rules (semgrep, openrewrite) validate model outputs</div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center font-mono text-[9px] uppercase pt-1">
                      
                      <div className="p-2 bg-slate-950 rounded border border-white/5">
                        <div className="text-purple-400 font-semibold mb-0.5">DEDUPLICATION</div>
                        <div className="text-[8px] text-slate-500 leading-normal lowercase">filters repeated alerts across incremental commits</div>
                      </div>

                      <div className="p-2 bg-slate-950 rounded border border-white/5">
                        <div className="text-yellow-400 font-semibold mb-0.5">RATE LIMITING</div>
                        <div className="text-[8px] text-slate-505 leading-normal lowercase">caps max review comments per PR to avoid burnout</div>
                      </div>

                      <div className="p-2 bg-emerald-950/15 rounded border border-emerald-500/20">
                        <div className="text-emerald-450 font-bold mb-0.5">CI MERGE GATE</div>
                        <div className="text-[8px] text-slate-300 leading-normal lowercase font-semibold">automatically blocks merging when findings are critical</div>
                      </div>

                    </div>
                  </div>

                  {/* Operational Settings Parameter Switches block */}
                  <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">2. Compliance Tuners & Token Cost Controllers</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Threshold parameter slider */}
                      <div className="space-y-1.5 p-3 bg-slate-950/50 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="font-semibold">Confidence Threshold:</span>
                          <span className="font-mono text-indigo-400 font-bold">{pipelineConfidence}%</span>
                        </div>
                        <input 
                          type="range"
                          min="50"
                          max="95"
                          value={pipelineConfidence}
                          onChange={(e) => setPipelineConfidence(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-[9px] text-slate-500 block font-mono">Suppress low-confidence noise. Settings over 80% dynamically filter trace signals.</span>
                      </div>

                      {/* Comments per PR rate list slider */}
                      <div className="space-y-1.5 p-3 bg-slate-950/50 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="font-semibold">Max Comments per PR:</span>
                          <span className="font-mono text-indigo-400 font-bold">Cap at {pipelineLimitComments} comments</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="15"
                          value={pipelineLimitComments}
                          onChange={(e) => setPipelineLimitComments(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-[9px] text-slate-500 block font-mono">Caps total comments per Pull Request to prevent developer overload.</span>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Pre commit Hook checkbox */}
                      <label className="flex items-start gap-2.5 p-3 bg-slate-950/50 rounded-lg border border-white/5 cursor-pointer text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={preCommitEnabled}
                          onChange={(e) => setPreCommitEnabled(e.target.checked)}
                          className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="font-semibold block">Pre-Commit Hooks Enabled</span>
                          <span className="text-[10px] text-slate-500 leading-normal block font-mono">Eliminate trivial structural noise locally, cutting remote LLM token usage down.</span>
                        </div>
                      </label>

                      {/* AI Batch Findings checkbox */}
                      <label className="flex items-start gap-2.5 p-3 bg-slate-950/50 rounded-lg border border-white/5 cursor-pointer text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={batchFindingsEnabled}
                          onChange={(e) => setBatchFindingsEnabled(e.target.checked)}
                          className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="font-semibold block">Batch Finding Mode</span>
                          <span className="text-[10px] text-slate-500 leading-normal block font-mono">Pack all detected issues into a single model execution instead of separate individual calls.</span>
                        </div>
                      </label>

                    </div>

                    {/* Serverless Worker options */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Serverless Worker Deployment Target (Zero Idle Cost):</span>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono font-bold">
                        {[
                          { id: "cloudflare", name: "Cloudflare Workers", latency: "0ms cold boot", cost: "$0.15 / 10k" },
                          { id: "fly", name: "Fly.io Machines", latency: "110ms cold boot", cost: "$0.29 / 10k" },
                          { id: "aws", name: "AWS Lambda Edge", latency: "240ms cold boot", cost: "$0.40 / 10k" }
                        ].map(platform => (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => setActiveServerlessPlatform(platform.id as any)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                              activeServerlessPlatform === platform.id 
                                ? "bg-indigo-950/20 border-indigo-500 text-white" 
                                : "bg-black/20 border-white/5 text-slate-400 hover:border-white/10"
                            }`}
                          >
                            <span className="block text-white font-bold">{platform.name}</span>
                            <span className="block text-[8px] text-slate-400 my-0.5">{platform.latency}</span>
                            <span className="block text-[8px] text-indigo-400 font-medium">{platform.cost}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* INTERACTIVE FALSE POSITIVE RECURSIVE FEEDBACK sandbox */}
                  <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">3. False Positive Feedback Loop (Dismissal Training Sandbox)</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 py-0.5 px-2 rounded font-mono">Suppressed via Weights: {feedbackSuppressedCount} cases</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: "fp-auth", code: "services/api.ts", msg: "Potential unencrypted access credentials leak in string literal.", conf: 58 },
                        { id: "fp-loop", code: "utils/math-helper.ts", msg: "Average nested cyclomatic conditional branch exceeds recommended depth limit (9).", conf: 82 }
                      ].map((item) => {
                        const isDismissed = dismissedFindings.includes(item.id);
                        const isFilteredByConfidence = item.conf < pipelineConfidence;

                        if (isFilteredByConfidence && !isDismissed) {
                          return (
                            <div key={item.id} className="p-3.5 bg-indigo-950/5 border border-dashed border-indigo-500/10 rounded-lg flex items-center justify-between text-slate-500 text-[11px] font-mono">
                              <span>Filtered out automatically (Finding confidence {item.conf}% is below threshold {pipelineConfidence}%)</span>
                              <span className="bg-indigo-500/15 text-indigo-300 rounded font-bold px-1.5 text-[9px]">Suppressed</span>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={item.id} 
                            className={`p-3.5 bg-slate-950/50 border border-white/5 rounded-lg flex items-center justify-between gap-4 transition-all ${
                              isDismissed ? "opacity-30 line-through saturate-50 border-dashed bg-black/40" : ""
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] bg-[#1a1b1e] text-slate-300 font-bold px-1.5 py-0.2 rounded">{item.code}</span>
                                <span className={`text-[10px] uppercase font-bold px-1 rounded ${item.conf >= 80 ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-400"}`}>
                                  Conf: {item.conf}%
                                </span>
                              </div>
                              <p className="text-slate-200 mt-0.5">{item.msg}</p>
                            </div>

                            <button
                              type="button"
                              disabled={isDismissed}
                              onClick={() => handleDismissFinding(item.id)}
                              className={`px-3 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                                isDismissed 
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                  : "bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 cursor-pointer"
                              }`}
                            >
                              {isDismissed ? "✔ Marked FP" : "Dismiss Finding"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: Golden Dataset, Prompt Regression, Audit Trails & KPIs (col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Golden Dataset registry & Benchmarker Card */}
                  <div className="p-4 bg-indigo-950/15 border border-indigo-500/20 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">4. Golden PR ground-truth Dataset</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Maintains a ground-truth suite of PRs with known findings to audit precision and recall scoring ratios. Prevents prompt regressions on update.
                    </p>

                    <div className="space-y-1.5 text-[9px] font-mono">
                      {[
                        { title: "PR #124: Router Mount Leak", issue: "lifecycle-leak", category: "React-Core" },
                        { title: "PR #89: SQL Injection Vector", issue: "leak-sql_injection", category: "Security" },
                        { title: "PR #215: Circ. Redux Loop", issue: "cycle-loop", category: "Architecture" }
                      ].map((item, id) => (
                        <div key={id} className="p-2 bg-black/40 border border-white/5 rounded leading-normal">
                          <div className="flex justify-between font-bold text-white">
                            <span>{item.title}</span>
                            <span className="text-indigo-400 font-semibold">{item.category}</span>
                          </div>
                          <span className="text-slate-500 block">Detect: <code className="text-slate-400 font-mono">{item.issue}</code></span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Simulator */}
                    {regressionStatus === "running" && (
                      <div className="space-y-1.5 py-1">
                        <div className="flex justify-between text-[10px] font-mono text-yellow-400">
                          <span>Scanning regression prompts...</span>
                          <span>{regressionProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1">
                          <div className="bg-yellow-400 h-1 rounded-full transition-all duration-150" style={{ width: `${regressionProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={regressionStatus === "running"}
                      onClick={startRegressionSuite}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm select-none"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regressionStatus === "running" ? "animate-spin" : ""}`} />
                      {regressionStatus === "running" ? "Running Regression Tests..." : "Run regression testing"}
                    </button>

                  </div>

                  {/* Golden KPI metrics card */}
                  <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">5. Score & Prompt KPI Analytics</span>
                    
                    <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300">
                      
                      <div className="p-3 bg-[#0a0a0c]/80 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Time-To-Review</span>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-base font-bold text-white">4.2 Seconds</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">92% score</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0a0a0c]/80 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Acceptance rate</span>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-base font-bold text-white">94.6% Accepted</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">Low noise</span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0a0a0c]/80 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">False Positive rate</span>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-base font-bold text-white">5.4% FP Ratio</span>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold">Tuned fine</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Trace & Audit logs list */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">6. Audit traces & typed outputs</span>
                    
                    <div className="space-y-1.5 text-[9px] font-mono">
                      {auditLogs.map((log) => (
                        <div 
                          key={log.id} 
                          onClick={() => setActiveTraceId(log.id)}
                          className={`p-2 rounded cursor-pointer leading-normal border transition-all ${
                            activeTraceId === log.id 
                              ? "bg-indigo-950/10 border-indigo-500/20 text-slate-200" 
                              : "bg-black/30 border-white/5 text-slate-400 hover:border-white/10"
                          }`}
                        >
                          <div className="flex justify-between font-bold">
                            <span className="text-white">Trace: {log.id}</span>
                            <span>{log.timestamp}</span>
                          </div>
                          <span className="block mt-0.5 whitespace-normal">{log.event}</span>
                        </div>
                      ))}
                    </div>

                    {activeTraceId && (
                      <div className="p-2.5 bg-black rounded border border-indigo-500/25 space-y-1 animate-fadeIn">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-indigo-300 font-bold">🔍 Live Trace Schema Replay ({activeTraceId})</span>
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded uppercase font-bold">LST-Typed</span>
                        </div>
                        <pre className="text-[8px] text-emerald-500 font-mono leading-relaxed overflow-x-auto select-all max-h-28 pt-1">
                          {activeTraceId.includes("reg") ? (
                            `{\n  "regression_suite": true,\n  "ground_truths_replayed": 3,\n  "precision_score": 0.984,\n  "recall_score": 0.972,\n  "verdict": "PASSED"\n}`
                          ) : activeTraceId.includes("fp") ? (
                            `{\n  "feedback_loop": "FP dismiss",\n  "embedding_offset": -0.15,\n  "ast_pattern": "unsecure_vars_comment",\n  "suppressed_instance_count": ${feedbackSuppressedCount}\n}`
                          ) : (
                            `{\n  "event": "LST_PARSED",\n  "files": ["/src/auth.ts"],\n  "typed_findings": [\n    {\n      "severity": "high",\n      "category": "security",\n      "location": "line 62, col 4",\n      "evidence": "process.env.API_KEY_LEAK"\n    }\n  ],\n  "deduplicated": true,\n  "status": "BLOCKED_CI_GATE"\n}`
                          )}
                        </pre>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* BRAND NEW: STRATEGIC COMPLIANCE MOATS PANEL (Filling the Blanks in a Nutshell) */}
              <div className="border-t border-white/5 pt-6 space-y-4 font-display">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Defensive Architecture Moats
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Deep-dive evaluation of Grader's 12 Core Strategic Capabilities, Engineering Solutions, & Competitive Moats.
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono py-1 px-2.5 rounded border border-indigo-500/10 self-start sm:self-auto uppercase">
                    Filling the Blanks in a Nutshell
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                  {/* Left checklist of areas */}
                  <div className="xl:col-span-5 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                    {[
                      { area: "Swarm orchestration", solution: "Queue‑based stateless microVMs with strict timeouts", moat: "Proven zero‑retention design earns enterprise trust" },
                      { area: "Project fingerprinting", solution: "File‑based detection tree", moat: "Archetype graph feeds instant framework‑specific value" },
                      { area: "Scoring model", solution: "Weighted harmonic mean with versioned rules", moat: "Transparent, auditable scores become industry benchmark" },
                      { area: "Report UX", solution: "Template‑driven static dashboard with Quick Wins", moat: "Actionability turns “scanner” into “strategic assistant”" },
                      { area: "Edge cases", solution: "Monorepo segmentation, deterministic sampling", moat: "Works where competitors fall over, broadens TAM" },
                      { area: "Knowledge graph community", solution: "GitHub PRs with CI validation", moat: "Network effect of contributors = data moat" },
                      { area: "Feedback loop", solution: "Aggregated flags trigger manual rule reviews", moat: "System self‑improves without AI drift" },
                      { area: "Privacy architecture", solution: "Ephemeral Firecracker VMs, no source storage", moat: "Gold standard for security, opens enterprise sales" },
                      { area: "API & badges", solution: "RESTful, webhooks, cached badge SVGs", moat: "Embedding into workflows creates switching costs" },
                      { area: "Self‑hosted packaging", solution: "Single Docker Compose, air‑gapped updates", moat: "Caters to a market AI competitors can’t touch" },
                      { area: "Cost optimization", solution: "Lockfile caching, sampling, spot instances", moat: "Free tier sustainability, healthy margins" },
                      { area: "Internal analytics", solution: "Dogfooding Grader on Grader", moat: "Informs roadmap with the same tool you sell" }
                    ].map((moat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedMoatIndex(idx)}
                        className={`w-full p-2.5 text-left rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          selectedMoatIndex === idx
                            ? "bg-indigo-950/25 border-indigo-500 text-white animate-pulse"
                            : "bg-black/20 border-white/5 text-slate-400 hover:bg-black/40 hover:border-white/10"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                          selectedMoatIndex === idx ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5 leading-normal">
                          <span className="font-bold text-slate-200 block">{moat.area}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{moat.moat}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right Detail Deep-dive screen */}
                  <div className="xl:col-span-7 bg-black/45 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    {(() => {
                      const detailsMap = [
                        {
                          area: "Swarm orchestration",
                          solution: "Queue‑based stateless microVMs with strict timeouts",
                          moat: "Proven zero‑retention design earns enterprise trust",
                          details: "Executes rule-checks inside isolated Firecracker microVMs. Clean state is initialized per probe, run to completion, and completely destroyed within 500ms, leaving no source fragments or residual assets on disk.",
                          metrics: "Avg. spin-up: 42ms | Isolation level: Sandboxed virtual CPU",
                          status: "Production Ready",
                          icon: <Cpu className="w-6 h-6 text-indigo-400" />
                        },
                        {
                          area: "Project fingerprinting",
                          solution: "File‑based detection tree",
                          moat: "Archetype graph feeds instant framework‑specific value",
                          details: "Bypasses slow, generic AST traversals by walking specific config manifests (package.json, pyproject.toml, Cargo.toml) to map the repo's technology archetype instantly and mount custom evaluation rules.",
                          metrics: "Match precision: 99.8% | Zero-overhead manifest probe",
                          status: "Production Ready",
                          icon: <Search className="w-6 h-6 text-indigo-400" />
                        },
                        {
                          area: "Scoring model",
                          solution: "Weighted harmonic mean with versioned rules",
                          moat: "Transparent, auditable scores become industry benchmark",
                          details: "Unlike unstable LLM scores, our index relies on weighted harmonic means that mathematically penalize single extreme violations, giving reviewers deterministic formulas they can write compliance policies against.",
                          metrics: "Reproducibility: 100.0% | Variance interval: 0.000",
                          status: "System Core",
                          icon: <Award className="w-6 h-6 text-emerald-400" />
                        },
                        {
                          area: "Report UX",
                          solution: "Template‑driven static dashboard with Quick Wins",
                          moat: "Actionability turns “scanner” into “strategic assistant”",
                          details: "Generates ultra-fast, lightweight HTML reports containing targeted, copy-paste ready code patches grouped under an urgent 'Quick Wins' rail, making triage effortless for engineering leads.",
                          metrics: "Triage rate: +65% speedup | Weight: <150KB fully self-contained",
                          status: "Optimized",
                          icon: <Sliders className="w-6 h-6 text-indigo-400" />
                        },
                        {
                          area: "Edge cases",
                          solution: "Monorepo segmentation, deterministic sampling",
                          moat: "Works where competitors fall over, broadens TAM",
                          details: "Gracefully isolates nested folder root boundaries during parsing. Uses code-size heuristic sampling to target scanning on active files, avoiding processing crashes on complex multi-gigabyte repositories.",
                          metrics: "File ceiling: No limit | Support for: Yarn/NPM Workspaces, Lerna",
                          status: "Scale Verified",
                          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />
                        },
                        {
                          area: "Knowledge graph community",
                          solution: "GitHub PRs with CI validation",
                          moat: "Network effect of contributors = data moat",
                          details: "Allows open-source community developers to suggest security & style rules via structured YAML pulls, which automatically run through high-coverage regression gates before general distribution.",
                          metrics: "Community contributors: 1.4k+ | Active rules: 12,410 rules",
                          status: "Decentralized",
                          icon: <Users className="w-6 h-6 text-sky-400" />
                        },
                        {
                          area: "Feedback loop",
                          solution: "Aggregated flags trigger manual rule reviews",
                          moat: "System self‑improves without AI drift",
                          details: "Tracks developers' action to dismiss findings. High-dismissal patterns trigger automated warnings to the core rule compilers, initiating fine-tuning without polluting rules with unstable stochastic drift.",
                          metrics: "Telemetry capture: On-the-fly | Rule revision cycle: Daily",
                          status: "Active Loop",
                          icon: <RefreshCw className="w-6 h-6 text-orange-400" />
                        },
                        {
                          area: "Privacy architecture",
                          solution: "Ephemeral Firecracker VMs, no source storage",
                          moat: "Gold standard for security, opens enterprise sales",
                          details: "Zero caching of customer codebases. The abstract tree is parsed, converted to secure JSON, and stored ephemerally solely during evaluation. Satisfies SOC2 Type II, ISO-27001, and HIPAA constraints out of the box.",
                          metrics: "Data permanence: Pure RAM | Audited: Active SOC2 compliance",
                          status: "SOC2 Audited",
                          icon: <Lock className="w-6 h-6 text-emerald-400" />
                        },
                        {
                          area: "API & badges",
                          solution: "RESTful, webhooks, cached badge SVGs",
                          moat: "Embedding into workflows creates switching costs",
                          details: "Engenders stickiness via live-updating SVG badges showing realtime compliance scores embedded within README files on GitHub, GitLab, and developer portals.",
                          metrics: "SVG build latency: 8ms | Edge Cached via Cloudflare CDN",
                          status: "Live Edge",
                          icon: <ExternalLink className="w-6 h-6 text-indigo-400" />
                        },
                        {
                          area: "Self‑hosted packaging",
                          solution: "Single Docker Compose, air‑gapped updates",
                          moat: "Caters to a market AI competitors can’t touch",
                          details: "Can compile to a standalone, completely air-gapped Docker stack that runs locally behind consumer firewalls. Works offline with zero public internet dependencies or secret leak vectors.",
                          metrics: "Deployment time: <60 seconds | Internet requirement: 0%",
                          status: "Enterprise OS",
                          icon: <Globe className="w-6 h-6 text-indigo-400" />
                        },
                        {
                          area: "Cost optimization",
                          solution: "Lockfile caching, sampling, spot instances",
                          moat: "Free tier sustainability, healthy margins",
                          details: "Caches dependency environments via rock-solid lockfile mounts, targets scanning on modified code lines, and automatically schedules workloads across low-cost spot cloud computation nodes.",
                          metrics: "Scans per Dollar: 4,000+ | Idle waste: 0.00%",
                          status: "Tuned",
                          icon: <Activity className="w-6 h-6 text-teal-400" />
                        },
                        {
                          area: "Internal analytics",
                          solution: "Dogfooding Grader on Grader",
                          moat: "Informs roadmap with the same tool you sell",
                          details: "We continuously scan our own code generators, rule repositories, and web platform using the core Grader engine, building an internal feedback loop representing the most rigorous quality standard in the industry.",
                          metrics: "Coverage on self: 100.0% | Core health score: 98.4%",
                          status: "Dogfooding",
                          icon: <Lightbulb className="w-6 h-6 text-yellow-400" />
                        }
                      ];

                      const selectedMoat = detailsMap[selectedMoatIndex] || detailsMap[0];

                      return (
                        <>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                              <div className="flex items-center gap-3">
                                {selectedMoat.icon}
                                <div>
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold block">
                                    Strategic Dimension #{selectedMoatIndex + 1}
                                  </span>
                                  <h5 className="text-sm font-bold text-white font-display">
                                    {selectedMoat.area}
                                  </h5>
                                </div>
                              </div>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 font-mono font-bold py-0.5 px-2 rounded uppercase border border-emerald-500/15">
                                {selectedMoat.status}
                              </span>
                            </div>

                            <div className="space-y-3 font-mono text-xs">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Deterministic Solution</span>
                                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-slate-200 leading-relaxed">
                                  {selectedMoat.solution}
                                </div>
                              </div>

                              <div>
                                <span className="text-[9px] text-amber-500 uppercase font-bold block mb-0.5">Hard‑to‑Copy Defensive Angle</span>
                                <div className="p-3 bg-amber-950/5 border border-amber-500/10 text-amber-200/95 rounded-xl leading-relaxed">
                                  {selectedMoat.moat}
                                </div>
                              </div>

                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Functional Mechanism & Architecture</span>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                  {selectedMoat.details}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 bg-[#0e1014] border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-baseline gap-2 font-mono text-[9px] mt-4">
                            <div className="space-y-0.5">
                              <span className="text-slate-500 uppercase block">Engine telemetry parameters:</span>
                              <span className="text-slate-300 font-bold block">{selectedMoat.metrics}</span>
                            </div>
                            <span className="text-slate-500 block">Verified CI-Swarm standard</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SWARM E2E TEST SUITE ORCHESTRATOR */}
          {activeMoatSubTab === "testing" && (
            <div className="p-6 bg-slate-900/45 border border-white/5 rounded-2xl space-y-8 animate-fadeIn pb-12">
              
              <div className="border-b border-white/5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-400" />
                      Swarm End‑to‑End Test Suite & Analyzer Sandbox
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Simulate, execute, and verify high-resolution evaluation cycles governing Grader's private MicroVM architecture, semantic parsing trees, and mathematical scoring pipelines.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono py-1.5 px-3 rounded-lg border border-emerald-500/20 uppercase font-bold self-start sm:self-auto tracking-wider">
                    Continuous Validation Active (v2.4)
                  </span>
                </div>
              </div>

              {/* SECTION I: DYNAMIC TUNING, GRADING & PIPELINE REFINEMENT DECK */}
              <div className="p-5 bg-slate-950/60 border border-white/5 rounded-xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-505/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Interactive Pipeline Tuning & Refining Deck
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Select any underlying analysis pipeline, configure its dynamic heuristic rules, and click <strong>Refine</strong> to grade and compile the calibrated ruleset.
                    </p>
                  </div>
                  
                  {/* Pipeline selector sub-navigation */}
                  <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 gap-1 self-start md:self-auto shrink-0">
                    {[
                      { id: "lst", label: "LST Parser" },
                      { id: "secrets", label: "Entropy Secrets" },
                      { id: "deps", label: "Dependency Audit" },
                      { id: "license", label: "License Guard" }
                    ].map(pipeObj => (
                      <button
                        key={pipeObj.id}
                        type="button"
                        onClick={() => setSelectedPipelineId(pipeObj.id as any)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded transition-all cursor-pointer ${
                          selectedPipelineId === pipeObj.id
                            ? "bg-indigo-600 text-white font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pipeObj.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TUNING CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT PANE: DYNAMIC DIALS (col-span-7) */}
                  <div className="lg:col-span-7 space-y-4">
                    {selectedPipelineId === "lst" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-4.5 bg-black/30 border border-white/5 rounded-xl space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest block">LST (Lossless Semantic Tree) Configurations</span>
                          
                          <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="text-[11px] text-slate-300 flex justify-between font-mono">
                                <span>Max Tree Traversal Depth:</span>
                                <span className="text-indigo-400 font-bold">{pipelineState.lst.depth} Nodes Nested</span>
                              </label>
                              <input 
                                type="range" 
                                min="4" 
                                max="12" 
                                value={pipelineState.lst.depth} 
                                onChange={(e) => setPipelineState(prev => ({
                                  ...prev,
                                  lst: { ...prev.lst, depth: parseInt(e.target.value) }
                                }))}
                                className="w-full accent-indigo-500 bg-slate-900 cursor-pointer h-1 rounded"
                              />
                              <p className="text-[9px] text-slate-500 leading-normal font-mono">Higher depth increases AST scope capture to resolve sub-module links but shifts virtual CPU overhead.</p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] text-slate-300 flex justify-between font-mono">
                                <span>Unused Module Pruning Threshold:</span>
                                <span className="text-indigo-400 font-bold">{pipelineState.lst.pruneUnused}% aggressive</span>
                              </label>
                              <input 
                                type="range" 
                                min="10" 
                                max="90" 
                                value={pipelineState.lst.pruneUnused} 
                                onChange={(e) => setPipelineState(prev => ({
                                  ...prev,
                                  lst: { ...prev.lst, pruneUnused: parseInt(e.target.value) }
                                }))}
                                className="w-full accent-indigo-500 bg-slate-900 cursor-pointer h-1 rounded"
                              />
                            </div>

                            <div className="pt-2 border-t border-white/5">
                              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.lst.preserveComments}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    lst: { ...prev.lst, preserveComments: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Preserve Inline Annotation Comments</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Feeds native documentation context to the downstream rating rules.</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPipelineId === "secrets" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-4.5 bg-black/30 border border-white/5 rounded-xl space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest block">Entropy Secret Scanner Settings</span>
                          
                          <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="text-[11px] text-slate-300 flex justify-between font-mono">
                                <span>Minimum Character Shannon Entropy:</span>
                                <span className="text-indigo-400 font-bold">{pipelineState.secrets.entropy.toFixed(1)} bits</span>
                              </label>
                              <input 
                                type="range" 
                                min="2.0" 
                                max="7.0" 
                                step="0.5"
                                value={pipelineState.secrets.entropy} 
                                onChange={(e) => setPipelineState(prev => ({
                                  ...prev,
                                  secrets: { ...prev.secrets, entropy: parseFloat(e.target.value) }
                                }))}
                                className="w-full accent-indigo-500 bg-slate-900 cursor-pointer h-1 rounded"
                              />
                              <p className="text-[9px] text-slate-500 leading-normal font-mono">Sets the randomness threshold. Lower values detect shorter leaks (e.g. AWS access keys), but heighten false alarm ratios.</p>
                            </div>

                            <div className="pt-2 border-t border-white/5 space-y-3">
                              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.secrets.awsScope}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    secrets: { ...prev.secrets, awsScope: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Scan All Known AWS ARN Signatures</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Enforces strict dictionary match filters over standard AWS service identifiers.</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.secrets.verifyRsa}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    secrets: { ...prev.secrets, verifyRsa: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Deep Cryptographic Private Key Scan</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Analyzes raw text structures for private SSH, PGP, and SSL/TLS headers.</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPipelineId === "deps" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-4.5 bg-black/30 border border-white/5 rounded-xl space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest block">Third-Party Dependency Vulnerability Engine</span>
                          
                          <div className="space-y-4 text-xs">
                            <div className="space-y-3">
                              <label className="text-[11px] text-slate-300 block font-mono">
                                Minimum Severity Alarm Level:
                              </label>
                              <div className="grid grid-cols-4 gap-2 text-[10px] font-mono font-bold">
                                {["Low", "Medium", "High", "Critical"].map(sev => (
                                  <button
                                    key={sev}
                                    type="button"
                                    onClick={() => setPipelineState(prev => ({
                                      ...prev,
                                      deps: { ...prev.deps, minSeverity: sev as any }
                                    }))}
                                    className={`p-2 rounded text-center cursor-pointer border ${
                                      pipelineState.deps.minSeverity === sev
                                        ? "bg-indigo-600 text-white border-indigo-505"
                                        : "bg-slate-950 text-slate-400 border-white/5 hover:border-white/10"
                                    }`}
                                  >
                                    {sev}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[9px] text-slate-500 leading-normal font-mono">Determines the threshold to generate blocking errors. Standard grade policy recommends "Medium" floor.</p>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.deps.transitive}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    deps: { ...prev.deps, transitive: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Deep Resolve Transitive Lockfile Trees</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Scans multi-tiered dependency child chains instead of direct package-lock references only.</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPipelineId === "license" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-4.5 bg-black/30 border border-white/5 rounded-xl space-y-4">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest block">MIT / Permissive License Integrity Guard</span>
                          
                          <div className="space-y-3 text-xs">
                            <label className="text-[11px] text-slate-300 font-bold block">License Risk Assertions Parameters:</label>
                            
                            <div className="space-y-3 p-3 bg-black/30 rounded-lg border border-white/5">
                              <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 select-none">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.license.forbidViral}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    license: { ...prev.license, forbidViral: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-0.5"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Strictly Block Copyleft & Viral Licenses (e.g. GPL‑v3)</span>
                                  <span className="text-[9px] text-slate-500 font-mono block leading-normal">Flags components that require open-sourcing upstream intellectual property.</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 select-none pt-2 border-t border-white/5">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.license.matchDual}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    license: { ...prev.license, matchDual: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-0.5"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Validate Dual-License Compatibility Scenarios</span>
                                  <span className="text-[9px] text-slate-500 font-mono block leading-normal">Confirms dual-licensing suitability against standard corporate legal lists.</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 select-none pt-2 border-t border-white/5">
                                <input
                                  type="checkbox"
                                  checked={pipelineState.license.corporateCheck}
                                  onChange={(e) => setPipelineState(prev => ({
                                    ...prev,
                                    license: { ...prev.license, corporateCheck: e.target.checked }
                                  }))}
                                  className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-0.5"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-[11px] font-semibold block">Verify Corporate Sponsorship/Donors Headers</span>
                                  <span className="text-[9px] text-slate-500 font-mono block leading-normal">Examines funding and sponsors fields to alert risk of prospective library abandonment.</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT PANE: COMPLIANCE CARD & GRADE RADIALS (col-span-5) */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    {(() => {
                      const currentPipe = pipelineState[selectedPipelineId];
                      return (
                        <div className="p-4.5 bg-black/40 border border-white/5 rounded-xl h-full flex flex-col justify-between space-y-4">
                          
                          <div className="text-center py-2 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest font-bold">Recalculated Grade Index</span>
                            
                            {/* Grade glowing token */}
                            <div className="relative flex items-center justify-center py-3">
                              <div className="absolute inset-0 w-16 h-16 mx-auto bg-indigo-500/15 rounded-full blur-xl animate-pulse" />
                              <span className="text-4xl font-black font-display text-indigo-300 relative tracking-tighter">
                                {currentPipe.grade}
                              </span>
                            </div>

                            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 py-0.5 px-2 rounded-full font-mono font-black uppercase text-center inline-block">
                              {selectedPipelineId === "lst" && "AST Code Structure"}
                              {selectedPipelineId === "secrets" && "Secrets & Entropy"}
                              {selectedPipelineId === "deps" && "Dependencies CVE"}
                              {selectedPipelineId === "license" && "Permissive Audit"}
                            </span>
                          </div>

                          {/* Secondary metrics list */}
                          <div className="p-3 bg-slate-950/70 border border-white/5 rounded-lg space-y-2 font-mono text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Pipeline Precision:</span>
                              <span className="text-emerald-400 font-bold">{currentPipe.precision.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Pipeline Recall:</span>
                              <span className="text-indigo-400 font-bold">{currentPipe.recall.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Execution Overhead:</span>
                              <span className="text-slate-300 font-bold">{currentPipe.latencyMs} ms</span>
                            </div>
                          </div>

                          {/* Command executor refine action */}
                          <button
                            type="button"
                            onClick={() => refinePipeline(selectedPipelineId)}
                            disabled={currentPipe.isRefining}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              currentPipe.isRefining
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_2px_15px_rgba(99,102,241,0.25)]"
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${currentPipe.isRefining ? "animate-spin" : ""}`} />
                            {currentPipe.isRefining ? "Refining Optimizer..." : `Refine & Compile ${selectedPipelineId.toUpperCase()}`}
                          </button>

                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>

              {/* SECTION II: SYSTEM INTEGRATED EXECUTIONS & HARDWARE TESTER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-display">
                
                {/* COLUMN 1: VIRTUAL VM CONTROLS & CLI CONSOLE (col-span-7) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Test Parameters Controls Card */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block">2. Sandbox Virtualization Parameters</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sliders */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-slate-300 flex justify-between font-mono mb-1">
                            <span>Parallel VM Simulators:</span>
                            <span className="text-indigo-300 font-bold">{e2eConfigWorkers} Workers</span>
                          </label>
                          <input 
                            type="range" 
                            min="2" 
                            max="16" 
                            value={e2eConfigWorkers}
                            onChange={(e) => setE2eConfigWorkers(parseInt(e.target.value))}
                            disabled={e2eStatus === "running"}
                            className="w-full accent-indigo-500 bg-slate-950/80 cursor-pointer h-1 rounded flex"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-300 flex justify-between font-mono mb-1">
                            <span>Simulated Target Droppage:</span>
                            <span className="text-indigo-300 font-bold">{e2eNetworkFailureRate}%</span>
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="25" 
                            value={e2eNetworkFailureRate}
                            onChange={(e) => setE2eNetworkFailureRate(parseInt(e.target.value))}
                            disabled={e2eStatus === "running"}
                            className="w-full accent-indigo-500 bg-slate-950/80 cursor-pointer h-1 rounded flex"
                          />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-4 border-l border-white/5 pl-0 md:pl-4 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-300 block font-bold leading-none">Spot Preemption Retries</span>
                            <p className="text-[9px] text-slate-500">Auto-heal node preemption dumps</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => e2eStatus !== "running" && setE2eSpotInstances(!e2eSpotInstances)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${e2eSpotInstances ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${e2eSpotInstances ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-300 block font-bold leading-none">Fail‑Fast Assertion Block</span>
                            <p className="text-[9px] text-slate-500">Stop at first mismatch instantly</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => e2eStatus !== "running" && setE2eFailFast(!e2eFailFast)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${e2eFailFast ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${e2eFailFast ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Last Verified locally: today, perfect outcome</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={triggerE2eTestSuiteSim}
                        disabled={e2eStatus === "running"}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          e2eStatus === "running"
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {e2eStatus === "running" ? "Running Core E2E..." : "Trigger Swarm E2E Run"}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Execution Window */}
                  <div className="p-4 bg-[#090b0e] border border-white/5 rounded-xl space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        CONCURRENT TELEMETRY STACK
                      </span>
                      <span className="text-slate-400 text-[9px] uppercase">
                        Active Sandbox Workers: {e2eConfigWorkers}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    {e2eStatus === "running" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-indigo-400 animate-pulse font-sans font-semibold text-[11px]">Compiling Isolated MicroVM Environments...</span>
                          <span className="text-slate-200 font-bold">{e2eProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1 pb-0 overflow-hidden border border-white/5">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${e2eProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terminal text feed */}
                    <div className="h-[250px] overflow-y-auto space-y-1.5 text-[10px] scrollbar-thin scrollbar-thumb-slate-800 pr-1 select-all scroll-smooth">
                      {e2eLogLines.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 space-y-1 p-4">
                          <Terminal className="w-8 h-8 text-slate-600 mb-1" />
                          <p className="font-sans font-bold text-white">E2E Console Idle</p>
                          <p className="font-sans text-[11px] max-w-sm">No active E2E scan trigger received. Adjust configuration parameters above and click "Trigger Swarm E2E Run" or refine/compile a target pipeline above to populate results.</p>
                        </div>
                      ) : (
                        e2eLogLines.map((log) => (
                          <div key={log.id} className="flex gap-2 items-start leading-relaxed animate-fadeIn">
                            <span className="text-slate-600 shrink-0 text-[9px] select-none">[{log.time}]</span>
                            <span className={`text-[10px] break-all ${
                              log.status === "success" 
                                ? "text-emerald-400 font-bold" 
                                : log.status === "warning" 
                                ? "text-amber-400" 
                                : log.status === "error" 
                                ? "text-rose-400 font-bold animate-pulse"
                                : log.status === "info"
                                ? "text-[#818cf8] font-bold"
                                : "text-slate-400"
                            }`}>
                              {log.msg}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-slate-500">
                      <span>Total assertions cached: 32 specs | zero leakage found</span>
                      <span>UTF‑8 CLI compliant</span>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: E2E SPEC DEEP RESEARCH DECK / DETAILED CODE BROWSER (col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold block mb-1">3. Executable Automation Spec Registry</span>
                      <p className="text-[11px] text-slate-400 font-sans mb-3 text-justify leading-relaxed">
                        Click on any technical test-case specification scenario to render their respective Playwright-typed assertions and operational assertions.
                      </p>

                      <div className="space-y-1.5">
                        {[
                          { id: "tc-1", title: "MicroVM Hypervisor Boot Latency", tag: "Isolation" },
                          { id: "tc-2", title: "Zero‑Retention Write & Scrub", tag: "Privacy Sec" },
                          { id: "tc-3", title: "Lock‑Free Scheduler Deadlocks", tag: "Concurrency" },
                          { id: "tc-4", title: "Spot Preemption State Resume", tag: "Fault Tolerance" },
                          { id: "tc-5", title: "Weighted Harmonic Score Math", tag: "Evaluation Math" },
                          { id: "tc-6", title: "Git Merge‑Gate Webhook Status", tag: "PR Status Check" },
                          { id: "tc-7", title: "Monorepo LST Cross‑Package Link", tag: "AST Parsing" }
                        ].map((scenario) => (
                          <button
                            key={scenario.id}
                            type="button"
                            onClick={() => setE2eActiveCaseId(scenario.id)}
                            className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              e2eActiveCaseId === scenario.id
                                ? "bg-indigo-505/10 border-indigo-500/30 text-indigo-200 font-bold shadow-[inset_0_0_10px_rgba(99,102,241,0.05)]"
                                : "bg-black/20 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                e2eActiveCaseId === scenario.id ? "bg-indigo-400 animate-pulse" : "bg-slate-600"
                              }`} />
                              {scenario.id}: {scenario.title}
                            </span>
                            <span className="text-[8px] bg-slate-950 border border-white/5 px-1 rounded uppercase shrink-0 text-slate-500">
                              {scenario.tag}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spec Execution JSON Panel */}
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      {(() => {
                        const specMap: Record<string, { desc: string; code: string; assert: string }> = {
                          "tc-1": {
                            desc: "Verifies the physical virtualization baseline: newly spawned Firecracker MicroVM containers must boot and reach active status under 100 milliseconds.",
                            code: `// Firecracker Core Latency Standard\nconst vm = await Firecracker.boot({\n  image: "alpine-3.20",\n  vcpus: 1,\n  ram: "256MB"\n});\nexpect(vm.isHealthy()).toBe(true);\nexpect(vm.bootTimeMs).toBeLessThan(100);`,
                            assert: "bootTime < 100ms"
                          },
                          "tc-2": {
                            desc: "Affirms that once code files are evaluated, all microVM RAMFS contents are immediately zero-scrubbed rather than simply unlinked, ensuring absolute data air-gap properties.",
                            code: `// Memory Partition Zeroization Check\nawait vm.write("/tmp/src", repoPayload);\nawait vm.evaluateSuite();\nawait vm.shutdown();\nconst leftoverDump = await vm.inspectSectorRAM();\nexpect(leftoverDump.totalSecureBytes).toBe(0);`,
                            assert: "RAMFS.activeRemnants === 0"
                          },
                          "tc-3": {
                            desc: "Performs peak concurrency queue tests using 5,000 artificial triggers on the scheduler to guarantee zero system lockouts or race conditions.",
                            code: `// Lock-free Scheduler Race Audit\nconst queue = new SwarmScheduler({ concurrent: ${e2eConfigWorkers} });\nconst tasks = Array.from({ length: 1500 }).map(() => queue.enqueue(mockScan));\nconst results = await Promise.all(tasks);\nexpect(queue.deadlocksDetected).toBe(0);`,
                            assert: "scheduler.deadlocks === 0"
                          },
                          "tc-4": {
                            desc: "Triggers unexpected node terminations midway during a parsed scan and validates automated failover routing boundaries without user feedback cycles.",
                            code: `// Spot Termination Resiliency Failover\nconst node = scheduler.getPrimaryNode();\nawait node.simulateEmergencyShutdown();\nawait delay(18);\nexpect(scheduler.getTransactionState()).toBe("HEALED");\nexpect(scheduler.rescanPendingCount).toBe(0);`,
                            assert: "jobState.recoveredWithin === 18ms"
                          },
                          "tc-5": {
                            desc: "Mathematically evaluates accuracy of our harmonic scoring algorithms: certifies single critical failures penalize the final ratio transparently.",
                            code: `// Weighted Harmonic Correctness Criteria\nconst sampleGaps = [105, 105, 10]; // 2 Clean, 1 Block\nconst outcome = scoring.computeHarmonicMean(sampleGaps);\nexpect(outcome).toBeCloseTo(25.0, 1);\nexpect(outcome).not.toBeCloseTo(70.0);`,
                            assert: "scoringMath.harmonicValue === 25.0"
                          },
                          "tc-6": {
                            desc: "Injects low scores into the GitHub webhook event parser and asserts status checks output a locked or blocked state dynamically.",
                            code: `// Git Status Gate Enforce Spec\nconst checkResponse = await GithubAPI.dispatchGate({\n  score: ${gateMinScore - 10},\n  threshold: ${gateMinScore},\n  sha: "c6a1e8a"\n});\nexpect(checkResponse.state).toBe("failure");`,
                            assert: "prStatus === BLOCKED"
                          },
                          "tc-7": {
                            desc: "Verifies the monorepo Lossless Semantic Tree (LST) resolution capabilities. Ensures cross-link references resolve and evaluate as expected.",
                            code: `// LST Parser Monorepo Verification\nconst monorepo = await LSTParser.parse("./packages/*");\nexpect(monorepo.getPackageCount()).toBe(4);\nexpect(monorepo.hasLooseResolutionFailures()).toBe(false);`,
                            assert: "lst.resolutionFailures === 0"
                          }
                        };

                        const selectedSpec = specMap[e2eActiveCaseId || "tc-1"] || specMap["tc-1"];

                        return (
                          <div className="space-y-2 font-mono">
                            <span className="text-[9px] text-[#818cf8] font-bold block uppercase pb-1 border-b border-white/5">
                              Executable Code Assertion ({e2eActiveCaseId})
                            </span>
                            <div className="p-2.5 bg-[#07090c] border border-white/5 rounded-lg">
                              <p className="text-[10px] text-slate-300 font-sans leading-relaxed mb-2 pb-2 border-b border-white/5 text-justify">
                                {selectedSpec.desc}
                              </p>
                              <pre className="text-[9px] text-emerald-400 leading-relaxed max-h-32 overflow-y-auto overflow-x-auto pr-1 whitespace-pre select-all scrollbar-thin scrollbar-thumb-slate-800">
                                {selectedSpec.code}
                              </pre>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-slate-500 font-bold bg-[#0e1014] p-1.5 rounded border border-white/5">
                              <span>ASSERTION PROBE LIMIT:</span>
                              <span className="text-indigo-400 font-mono text-[9px]">{selectedSpec.assert}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
