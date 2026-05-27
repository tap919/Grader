export interface SecurityVulnerability {
  package: string;
  severity: "Low" | "Medium" | "High" | "Critical" | "None";
  details: string;
  recommendation: string;
}

export interface SecurityScan {
  secretLeakDetected: boolean;
  secretsDetails: string[];
  vulnerabilityCount: number;
  highestSeverity: "Low" | "Medium" | "High" | "Critical" | "None";
  vulnerabilities: SecurityVulnerability[];
}

export interface QualityScorecard {
  readmeScore: number; // 0-100
  readmeFeedback: string;
  readmeMissingSections: string[];
  testFrameDetected: string | null;
  testsExplanation: string;
  setupFrictionLevel: "Low" | "Medium" | "High";
  setupFrictionReason: string;
}

export interface MarketBenchmark {
  starRatingPercentile: number; // 0-100
  releaseFrequency: "High" | "Medium" | "Low";
  activeContributorScore: "Healthy" | "Solo Maker" | "Stagnant";
}

export interface CompetitorComparison {
  repoName: string;
  stars: number;
  advantages: string[];
  weaknesses: string[];
}

export interface MarketSnapshot {
  trendAlignmentGrade: "Rising Star" | "Steady" | "Declining Stack" | "Experimental";
  trendExplanation: string;
  benchmarks: MarketBenchmark;
  competitors: CompetitorComparison[];
}

export interface QuickWin {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  category: "Security" | "Quality" | "Market Fit" | "Documentation";
  description: string;
  actionableSteps: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  category: "Security" | "Quality" | "Market Fit" | "Team Alignment" | "Documentation";
  description: string;
  phase: "Now" | "Next" | "Later";
  effort: "Small" | "Medium" | "Large";
}

export interface ValuationMetrics {
  estimatedDeveloperHours: number;
  averageHourlyRate: number;
  replacementCostFMV: number;
  reliefFromRoyaltyValue: number;
  productivityWasteHeuristic: number; // percent value 0-100
  annualInterestDebtCost: number;
}

export interface HotspotItem {
  filePath: string;
  complexityScore: number; // 1-100
  changeFrequency: "High" | "Medium" | "Low";
  churnPercent: number;
  riskRating: "Critical" | "High" | "Medium" | "Low";
  recommendation: string;
}

export interface OssLicense {
  name: string;
  verified: boolean;
  type: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  details: string;
}

export interface OssRiskAudit {
  copyleftDetected: boolean;
  licenseConflictsCount: number;
  licensesFound: OssLicense[];
  legalAdviceSnippet: string;
}

export interface ArchitecturalMetrics {
  dependencyCouplingScore: number;
  circularImportsFound: number;
  architecturalDriftIndex: number;
  modularSpacingScore: number;
  structuralComplexityFeedback: string;
}

export interface IsoCompliance {
  iso5055Compliant: boolean;
  reliabilityScore: number;
  securityPracticesScore: number;
  maintainabilityPracticesScore: number;
  performanceScore: number;
  severeViolationsCount: number;
  certValidationId: string;
}

export interface HealthReport {
  repoOwner: string;
  repoName: string;
  overallScore: number; // 0-100
  gradeCategory: string; // e.g. "B+", "A", etc.
  mainLanguage: string;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  lastPushedAt: string;
  summary: string;
  security: SecurityScan;
  quality: QualityScorecard;
  market: MarketSnapshot;
  quickWins: QuickWin[];
  roadmap: RoadmapItem[];
  // Extended leading investor metrics
  valuation: ValuationMetrics;
  hotspots: HotspotItem[];
  ossRisk: OssRiskAudit;
  architecture: ArchitecturalMetrics;
  compliance: IsoCompliance;
  globalBenchmarkPercent: number; // SIG scale percentile match e.g. 84
}

export interface HistoricalScan {
  repoKey: string; // owner/name
  scannedAt: string;
  overallScore: number;
  gradeCategory: string;
  owner: string;
  name: string;
}
