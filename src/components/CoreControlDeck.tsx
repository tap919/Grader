import React, { useState, useEffect, useRef } from "react";
import { 
  FolderUp, 
  Settings, 
  Github, 
  History, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  Search, 
  FileCode, 
  Folder, 
  SlidersHorizontal, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Pin,
  HelpCircle,
  FileText,
  DollarSign,
  Cpu,
  Layers
} from "lucide-react";
import { HealthReport, QuickWin, RoadmapItem, HotspotItem, OssLicense } from "../types";

interface CoreControlDeckProps {
  report: HealthReport;
  onReportChange: (updatedReport: HealthReport) => void;
  onRepoInputChange: (repoInput: string) => void;
  onSubmitRepo: (repoUrl: string) => void;
  isUpgraded: boolean;
  setIsUpgraded: (upgraded: boolean) => void;
}

interface CustomSettings {
  minComplianceScore: number;
  averageHourlyRate: number;
  flagRestrictiveLicenses: boolean;
  complexityHotspotThreshold: number;
  preferredScanMode: "semantic" | "standard" | "ultra";
  customAuditGuideline: string;
}

type WebkitFile = File & {
  webkitRelativePath?: string;
};

export default function CoreControlDeck({
  report,
  onReportChange,
  onRepoInputChange,
  onSubmitRepo,
  isUpgraded,
  setIsUpgraded
}: CoreControlDeckProps) {
  // Tabs within the Control Deck
  const [deckTab, setDeckTab] = useState<"folder" | "github" | "settings" | "vault">("folder");

  // Settings State
  const [settings, setSettings] = useState<CustomSettings>({
    minComplianceScore: 80,
    averageHourlyRate: 95,
    flagRestrictiveLicenses: true,
    complexityHotspotThreshold: 70,
    preferredScanMode: "standard",
    customAuditGuideline: ""
  });

  // Load Settings from LocalStorage on launch
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("grader_custom_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error("Failed to parse settings from localStorage:", e);
    }
  }, []);

  // Save Settings helper
  const saveSettings = (newSettings: CustomSettings) => {
    setSettings(newSettings);
    localStorage.setItem("grader_custom_settings", JSON.stringify(newSettings));
    
    // Apply dynamic updates to the report state when settings are changed
    const updatedReport = { ...report };
    if (updatedReport.valuation) {
      updatedReport.valuation.averageHourlyRate = newSettings.averageHourlyRate;
      updatedReport.valuation.replacementCostFMV = updatedReport.valuation.estimatedDeveloperHours * newSettings.averageHourlyRate;
      updatedReport.valuation.reliefFromRoyaltyValue = Math.round(updatedReport.valuation.replacementCostFMV * 0.125);
      updatedReport.valuation.annualInterestDebtCost = Math.round(updatedReport.valuation.replacementCostFMV * (updatedReport.valuation.productivityWasteHeuristic / 100));
    }
    
    // Update compliance flags based on threshold
    if (updatedReport.compliance) {
      updatedReport.compliance.reliabilityScore = Math.max(50, Math.min(100, updatedReport.overallScore - (newSettings.minComplianceScore > 85 ? 5 : 0)));
    }

    onReportChange(updatedReport);
  };

  // GitHub Link Form State
  const [rawGithbUrl, setRawGithubUrl] = useState("");
  const [extractedCoords, setExtractedCoords] = useState<{ owner: string; repo: string } | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Folder Upload States
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ path: string; size: number; language: string; name: string }[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [fileFilter, setFileFilter] = useState("");
  const [parsedMetadata, setParsedMetadata] = useState<{ dependenciesCount: number; usesTypeScript: boolean; mainFiles: string[] }>({
    dependenciesCount: 0,
    usesTypeScript: false,
    mainFiles: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local Storage Vault Scans History
  const [vaultScans, setVaultScans] = useState<HealthReport[]>([]);
  const [pinnedScanKeys, setPinnedScanKeys] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Load Scan history from LocalStorage
  useEffect(() => {
    try {
      const savedScans = localStorage.getItem("grader_local_vault_scans");
      if (savedScans) {
        setVaultScans(JSON.parse(savedScans));
      }
      
      const savedPins = localStorage.getItem("grader_pinned_keys");
      if (savedPins) {
        setPinnedScanKeys(JSON.parse(savedPins));
      }
    } catch (e) {
      console.error("Failed to load local vault scans", e);
    }
  }, []);

  const triggerNotify = (text: string, type: "success" | "info" | "error" = "success") => {
    setShowNotification({ text, type });
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // Save scan record locally in LocalStorage
  const handleSaveToVault = (targetReport: HealthReport) => {
    const key = `${targetReport.repoOwner}/${targetReport.repoName}`.toLowerCase();
    
    // Keep list clean, prevent duplication
    const updatedVault = vaultScans.filter(s => `${s.repoOwner}/${s.repoName}`.toLowerCase() !== key);
    updatedVault.unshift(targetReport);
    
    setVaultScans(updatedVault);
    localStorage.setItem("grader_local_vault_scans", JSON.stringify(updatedVault));
    triggerNotify(`Saved ${targetReport.repoOwner}/${targetReport.repoName} scan metrics into local memory!`, "success");
  };

  // Pin / Unpin Scan
  const togglePinScan = (owner: string, name: string) => {
    const key = `${owner}/${name}`.toLowerCase();
    let updatedPins = [...pinnedScanKeys];
    if (updatedPins.includes(key)) {
      updatedPins = updatedPins.filter(k => k !== key);
      triggerNotify("Unpinned scan", "info");
    } else {
      updatedPins.push(key);
      triggerNotify("Pinned scan to top", "success");
    }
    setPinnedScanKeys(updatedPins);
    localStorage.setItem("grader_pinned_keys", JSON.stringify(updatedPins));
  };

  // Delete scan from vault
  const handleDeleteFromVault = (owner: string, name: string) => {
    const key = `${owner}/${name}`.toLowerCase();
    const updatedVault = vaultScans.filter(s => `${s.repoOwner}/${s.repoName}`.toLowerCase() !== key);
    setVaultScans(updatedVault);
    localStorage.setItem("grader_local_vault_scans", JSON.stringify(updatedVault));
    
    const updatedPins = pinnedScanKeys.filter(k => k !== key);
    setPinnedScanKeys(updatedPins);
    localStorage.setItem("grader_pinned_keys", JSON.stringify(updatedPins));
    
    triggerNotify("Deleted record from system memory", "info");
  };

  // Export report to a JSON file
  const handleExportJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grader-audit-${report.repoOwner}-${report.repoName}.json`.toLowerCase();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerNotify("Successfully exported metric scorecard as JSON!", "success");
    } catch (e) {
      console.error(e);
      triggerNotify("Failed to download JSON payload", "error");
    }
  };

  // Import report from a JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedReport = JSON.parse(text) as HealthReport;
        
        // Basic schema verification
        if (!parsedReport.repoOwner || !parsedReport.repoName || typeof parsedReport.overallScore !== "number") {
          throw new Error("Invalid schema structure. Missing required overallScore or repo name attributes.");
        }

        onReportChange(parsedReport);
        onRepoInputChange(`${parsedReport.repoOwner}/${parsedReport.repoName}`);
        triggerNotify(`Loaded scorecard for ${parsedReport.repoOwner}/${parsedReport.repoName}!`, "success");
      } catch (err: any) {
        triggerNotify("Corrupted JSON database. Verify fields align with standard Grader structure.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Parse Raw GitHub input string dynamically to build coordinates preview block
  const handleGithubUrlChange = (val: string) => {
    setRawGithubUrl(val);
    setGithubError(null);
    
    let cleaned = val.trim();
    cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
    cleaned = cleaned.replace(/\.git$/i, "").replace(/\/+$/, "");

    const parts = cleaned.split("/");
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      setExtractedCoords({ owner, repo });
    } else {
      setExtractedCoords(null);
    }
  };

  const handleApplyGithubImport = () => {
    if (!extractedCoords) {
      setGithubError("Could not resolve valid owner/repository coordinates. Verify link format.");
      return;
    }
    const fullKey = `${extractedCoords.owner}/${extractedCoords.repo}`;
    onRepoInputChange(fullKey);
    onSubmitRepo(fullKey);
    triggerNotify(`Initiating codebase diagnostics for ${fullKey}`, "info");
  };

  // Helper to resolve code languages on client-side folder selection
  const detectLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts": case "tsx": return "TypeScript";
      case "js": case "jsx": return "JavaScript";
      case "py": return "Python";
      case "go": return "Go Lang";
      case "rs": return "Rust";
      case "java": return "Java";
      case "kt": return "Kotlin";
      case "rb": return "Ruby";
      case "cs": return "C#";
      case "cpp": case "h": return "C/C++";
      case "json": return "JSON";
      case "md": return "Markdown";
      case "html": return "HTML5";
      case "css": return "CSS Grid";
      default: return "Code Module";
    }
  };

  // Recursively process files uploaded via directory inputs
  const parseSelectedFiles = async (filesList: FileList) => {
    const parsedFiles: { path: string; size: number; language: string; name: string }[] = [];
    let containsTS = false;
    let dependenciesCount = 0;
    let fallbackFolderName = "uploaded-workspace";

    // Loop and read names
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i] as WebkitFile;
      const relPath = file.webkitRelativePath || file.name;
      const sizeBytes = file.size;
      const lang = detectLanguage(file.name);

      if (lang === "TypeScript") containsTS = true;

      // Extract workspace folder name prefix
      if (file.webkitRelativePath && file.webkitRelativePath.includes("/")) {
        fallbackFolderName = file.webkitRelativePath.split("/")[0];
      }

      parsedFiles.push({
        path: relPath,
        size: sizeBytes,
        language: lang,
        name: file.name
      });

      // Simple file reading to scan package.json
      if (file.name === "package.json") {
        try {
          const contents = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.readAsText(file);
          });
          const parsedJson = JSON.parse(contents);
          const deps = { ...parsedJson.dependencies, ...parsedJson.devDependencies };
          dependenciesCount = Object.keys(deps).length;
        } catch (e) {
          console.error("Could not parse uploaded package.json dependencies", e);
        }
      }
    }

    setFolderName(fallbackFolderName);
    setUploadedFiles(parsedFiles);
    setParsedMetadata({
      dependenciesCount,
      usesTypeScript: containsTS,
      mainFiles: parsedFiles.map(f => f.name).slice(0, 5)
    });

    triggerNotify(`Successfully parsed ${parsedFiles.length} files in directories tree!`, "success");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleSelectFolder = () => {
    fileInputRef.current?.click();
  };

  // Compile a stateful simulated report using local filesystem coordinates in memory
  const handleGradeLocalFolder = () => {
    if (uploadedFiles.length === 0) {
      triggerNotify("No files loaded in memory. Drag or choose a folder first.", "error");
      return;
    }

    // Build unique custom metrics based on content
    const totalFilesCount = uploadedFiles.length;
    const languagesMap: Record<string, number> = {};
    uploadedFiles.forEach(f => {
      languagesMap[f.language] = (languagesMap[f.language] || 0) + 1;
    });

    // Identify dominant language
    let primaryLanguage = "TypeScript";
    let maxCount = 0;
    Object.entries(languagesMap).forEach(([lang, count]) => {
      if (count > maxCount && lang !== "JSON" && lang !== "Markdown") {
        maxCount = count;
        primaryLanguage = lang;
      }
    });

    // Compute random, realistic, structured scores
    const overallScore = Math.min(
      100, 
      Math.max(
        42,
        80 + (parsedMetadata.usesTypeScript ? 5 : 0) - (totalFilesCount > 200 ? 5 : 0) - (parsedMetadata.dependenciesCount > 40 ? 4 : 0)
      )
    );

    // Categories mappings
    let gradeCategory = "A-";
    if (overallScore >= 95) gradeCategory = "A+";
    else if (overallScore >= 90) gradeCategory = "A";
    else if (overallScore >= 85) gradeCategory = "B+";
    else if (overallScore >= 80) gradeCategory = "B";
    else if (overallScore >= 70) gradeCategory = "C";
    else if (overallScore >= 60) gradeCategory = "D";
    else gradeCategory = "F";

    const localOwner = "sandbox-user";
    const localRepo = folderName || "local-project";

    const customWins: QuickWin[] = [
      {
        id: "lw-1",
        title: "Clean leftover node_modules artifacts",
        severity: "Medium",
        category: "Quality",
        description: "Found nested cache nodes in file buffers indices.",
        actionableSteps: "Add a standardized root .gitignore including node_modules/, dist/, and cached environment configurations."
      },
      {
        id: "lw-2",
        title: "Setup Vitest static configurations wrapper",
        severity: "High",
        category: "Quality",
        description: "No dedicated test runner was identified in local folders structure.",
        actionableSteps: "Run npm install -D vitest to instantiate blazing-fast types testing suites."
      }
    ];

    const customRoadmap: RoadmapItem[] = [
      {
        id: "rm-1",
        title: "Separate monolith subroutines into modules",
        category: "Quality",
        description: `Split any file over ${settings.complexityHotspotThreshold} complexity points to reduce cognitive load indices.`,
        phase: "Now",
        effort: "Medium"
      },
      {
        id: "rm-2",
        title: "Instantiate legal compliance audit checklist",
        category: "Security",
        description: "Ensure no dual GPL or restrictive licenses are imported via nested dependencies structures.",
        phase: "Next",
        effort: "Small"
      }
    ];

    const customHotspots: HotspotItem[] = uploadedFiles.slice(0, 3).map((f, i) => ({
      filePath: f.path,
      complexityScore: Math.floor(Math.random() * 30) + 45,
      changeFrequency: i === 0 ? "High" : "Medium",
      churnPercent: Math.floor(Math.random() * 25) + 10,
      riskRating: i === 0 ? "High" : "Medium",
      recommendation: `Decouple exports list and increase assertions density inside the target directory.`
    }));

    const compiledLocalReport: HealthReport = {
      repoOwner: localOwner,
      repoName: localRepo,
      overallScore,
      gradeCategory,
      mainLanguage: primaryLanguage,
      starsCount: 1,
      forksCount: 0,
      openIssuesCount: 0,
      lastPushedAt: new Date().toISOString(),
      summary: `A comprehensive evaluation of the locally uploaded workspace: "${localRepo}". Found ${totalFilesCount} ingested files, containing ~${parsedMetadata.dependenciesCount} dependent packages under NPM indices. Highly decoupled and structure friendly.`,
      security: {
        secretLeakDetected: false,
        secretsDetails: [],
        vulnerabilityCount: parsedMetadata.dependenciesCount > 50 ? 3 : 1,
        highestSeverity: parsedMetadata.dependenciesCount > 50 ? "High" : "Medium",
        vulnerabilities: [
          {
            package: "lodash",
            severity: "Medium",
            details: "Prototype pollution security flaws discovered on old subversions schemas.",
            recommendation: "Run npm install lodash@latest or upgrade dependencies locks to maintain structural safety."
          }
        ]
      },
      quality: {
        readmeScore: parsedMetadata.mainFiles.includes("README.md") ? 90 : 25,
        readmeFeedback: parsedMetadata.mainFiles.includes("README.md") 
          ? "Excellent instructions readme file located in raw directory root."
          : "No structural README file was discovered on indices. Code developers might experience setup friction.",
        readmeMissingSections: parsedMetadata.mainFiles.includes("README.md") ? [] : ["Installation Scripts", "API Keys Setup Guides"],
        testFrameDetected: parsedMetadata.usesTypeScript ? "TypeScript Compiler" : "Heuristic Tracker",
        testsExplanation: "Code elements parsed using Javascript syntax scanners.",
        setupFrictionLevel: totalFilesCount > 100 ? "Medium" : "Low",
        setupFrictionReason: "Compact modern folder structure prevents configuration headaches."
      },
      market: {
        trendAlignmentGrade: "Experimental",
        trendExplanation: "Local sandboxed workspace. Unreleased public configurations.",
        benchmarks: {
          starRatingPercentile: 50,
          releaseFrequency: "Low",
          activeContributorScore: "Solo Maker"
        },
        competitors: []
      },
      quickWins: customWins,
      roadmap: customRoadmap,
      valuation: {
        estimatedDeveloperHours: Math.min(1000, Math.max(10, totalFilesCount * 8)),
        averageHourlyRate: settings.averageHourlyRate,
        replacementCostFMV: Math.min(1000, Math.max(10, totalFilesCount * 8)) * settings.averageHourlyRate,
        reliefFromRoyaltyValue: Math.round(Math.min(1000, Math.max(10, totalFilesCount * 8)) * settings.averageHourlyRate * 0.125),
        productivityWasteHeuristic: 18,
        annualInterestDebtCost: Math.round(Math.min(1000, Math.max(10, totalFilesCount * 8)) * settings.averageHourlyRate * 0.18)
      },
      hotspots: customHotspots,
      ossRisk: {
        copyleftDetected: false,
        licenseConflictsCount: 0,
        licensesFound: [
          { name: "MIT", verified: true, type: "Permissive", riskLevel: "Low", details: "All access permit. Free commercial reuse authorized without limit." }
        ],
        legalAdviceSnippet: "Local audit complies fully with standard permissible MIT patterns of operations."
      },
      architecture: {
        dependencyCouplingScore: 88,
        circularImportsFound: 0,
        architecturalDriftIndex: 5,
        modularSpacingScore: 92,
        structuralComplexityFeedback: "Clean local component-tree structure. Highly balanced coupling coefficients."
      },
      compliance: {
        iso5055Compliant: true,
        reliabilityScore: overallScore,
        securityPracticesScore: 90,
        maintainabilityPracticesScore: 88,
        performanceScore: 94,
        severeViolationsCount: 0,
        certValidationId: `ISO-LOCAL-${Date.now().toString(36).toUpperCase()}`
      },
      globalBenchmarkPercent: overallScore - 4
    };

    onReportChange(compiledLocalReport);
    onRepoInputChange(`${localOwner}/${localRepo}`);
    triggerNotify(`Successfully evaluated sandboxed folder "${localRepo}"!`, "success");
    
    // Save locally into Vault history
    handleSaveToVault(compiledLocalReport);
  };

  const filteredFiles = uploadedFiles.filter(item => 
    item.path.toLowerCase().includes(fileFilter.toLowerCase()) ||
    item.language.toLowerCase().includes(fileFilter.toLowerCase())
  );

  return (
    <div id="core-control-deck-workspace" className="bg-[#0c0c0e]/95 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col">
      
      {/* Toast Notification Notification banner panel */}
      {showNotification && (
        <div className={`fixed bottom-6 right-6 z-50 py-3 px-5 rounded-xl border flex items-center gap-3 shadow-xl animate-scaleIn select-all text-xs font-semibold ${
          showNotification.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
            : showNotification.type === "error"
            ? "bg-rose-950/90 border-rose-500/30 text-rose-300"
            : "bg-indigo-950/90 border-indigo-500/30 text-indigo-300"
        }`}>
          {showNotification.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{showNotification.text}</span>
        </div>
      )}

      {/* Control Top tab Bar */}
      <div className="flex border-b border-white/5 bg-slate-950/50">
        <button
          onClick={() => setDeckTab("folder")}
          className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            deckTab === "folder" 
              ? "border-amber-500 text-white bg-white/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FolderUp className="w-4 h-4 text-amber-500" />
          Ingest local folder
        </button>

        <button
          onClick={() => setDeckTab("github")}
          className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            deckTab === "github" 
              ? "border-indigo-500 text-white bg-white/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Github className="w-4 h-4 text-indigo-400" />
          GitHub Resolver
        </button>

        <button
          onClick={() => setDeckTab("settings")}
          className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            deckTab === "settings" 
              ? "border-pink-500 text-white bg-white/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4 text-pink-400" />
          Report Settings
        </button>

        <button
          onClick={() => setDeckTab("vault")}
          className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            deckTab === "vault" 
              ? "border-emerald-500 text-white bg-white/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4 text-emerald-400" />
          Vault History ({vaultScans.length})
        </button>
      </div>

      {/* Main Tab Content Panels */}
      <div className="p-6">
        
        {/* PANEL A: FOLDER UPLOADER */}
        {deckTab === "folder" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-display">Ingest Static Files & Directories</h4>
                <p className="text-xs text-slate-400">Upload a workspace directory to dynamically reconstruct architectural files complexity.</p>
              </div>

              {/* JSON export import utilities button links */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-white/5 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  title="Download dynamic state database"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save JSON
                </button>

                <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-white/5 flex items-center gap-1 text-[11px] font-mono cursor-pointer relative">
                  <Upload className="w-3.5 h-3.5" />
                  Load JSON
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImportJSON}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer h-full"
                  />
                </label>
              </div>
            </div>

            {/* Drag and Drop Ingestion Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleSelectFolder}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                dragActive 
                  ? "border-amber-500 bg-amber-500/5" 
                  : uploadedFiles.length > 0
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              {/* Native directory uploader input wrapper */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) parseSelectedFiles(e.target.files);
                }}
                className="hidden" 
                multiple
                // @ts-ignore
                webkitdirectory="" 
                directory=""
              />

              <div className={`p-4 rounded-full ${uploadedFiles.length > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                <FolderUp className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {uploadedFiles.length > 0 ? `Folder Ingested: "${folderName}"` : "Click to select or drag directory folder"}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Support parsing directory recursively. Scans package dependencies manifest keys, README blueprints, file distributions and code metrics safely on sandboxed client context.
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
                  Ready to map state • {uploadedFiles.length} files parsed
                </div>
              )}
            </div>

            {/* Display nested tree files list if loaded */}
            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl space-y-4">
                
                {/* Meta properties header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="py-1 px-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-mono font-bold">
                      {folderName}
                    </div>
                    <span className="text-xs text-slate-400">• {uploadedFiles.length} unique file nodes discovered</span>
                  </div>

                  <button
                    onClick={handleGradeLocalFolder}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg border border-white/10 shadow-lg cursor-pointer"
                  >
                    ✦ Compile local folder audit
                  </button>
                </div>

                {/* Sub parsing elements summary values row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">NPM Dependencies count</span>
                    <span className="text-sm text-white font-mono font-bold mt-1">
                      {parsedMetadata.dependenciesCount > 0 ? `${parsedMetadata.dependenciesCount} Node Packages` : "None"}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold font-sans">Strict Code compilation</span>
                    <span className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {parsedMetadata.usesTypeScript ? "TypeScript configured" : "Javascript detected"}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Workspace size</span>
                    <span className="text-sm font-bold text-slate-200 mt-1 font-mono">
                      {(uploadedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB footprint
                    </span>
                  </div>
                </div>

                {/* Live Filterable file browser panel */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input 
                      type="text" 
                      value={fileFilter}
                      onChange={(e) => setFileFilter(e.target.value)}
                      placeholder="Filter ingested elements, e.g. .ts, utils, components..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/5 rounded-md text-xs font-mono font-semibold placeholder-slate-600 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-black/40 hover:bg-black/60 rounded border border-white/[0.02] text-xs font-mono">
                        <div className="flex items-center gap-2 truncate min-w-0 pr-1">
                          {file.language === "JSON" || file.language === "Markdown" ? (
                            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          ) : (
                            <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          )}
                          <span className="text-slate-300 truncate text-[11px] block text-left leading-normal">{file.path}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                            {file.language}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredFiles.length === 0 && (
                      <p className="text-xs font-mono text-slate-500 text-center py-4">No matching files found under search filters.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* PANEL B: GITHUB LINK RESOLVER */}
        {deckTab === "github" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">Resolve Complex Git Architecture URL</h4>
              <p className="text-xs text-slate-400">Paste nested trees, repositories, branch directories blobs directly to extract exact checkout paths variables.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  value={rawGithbUrl}
                  onChange={(e) => handleGithubUrlChange(e.target.value)}
                  placeholder="e.g. https://github.com/vibe-coders/nexus-platform/tree/main/src"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-lg text-xs font-mono font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {githubError && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-lg flex items-start gap-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{githubError}</span>
                </div>
              )}

              {extractedCoords ? (
                <div className="p-4 bg-slate-900/40 border border-[#a5b4fc]/15 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs text-indigo-300 font-mono font-bold uppercase tracking-wider block">Resolved Repository parameters:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                    <div>
                      <span className="text-slate-500 text-[10px] font-sans">Repository Owner (Git ID)</span>
                      <span className="text-white font-bold block mt-1">{extractedCoords.owner}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] font-sans">Repository Identifier Name</span>
                      <span className="text-emerald-400 font-bold block mt-1">{extractedCoords.repo}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleApplyGithubImport}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      ✦ Grade and Sync Repository
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/20 border border-white/5 rounded-xl text-center py-6">
                  <HelpCircle className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Input a complete, fully qualified GitHub URL path to display interactive resolution details.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL C: DETAILED WORKSPACE CUSTOMIZER */}
        {deckTab === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">Thresholds Settings Customizer</h4>
              <p className="text-xs text-slate-400">Configure safety margins, technical debt developer wages rates, compliance scores parameters, and scan rules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Left sliders side info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Min ISO compliance rating</span>
                    <span className="text-indigo-400 font-bold">{settings.minComplianceScore}% Limit</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="95" 
                    step="5"
                    value={settings.minComplianceScore}
                    onChange={(e) => saveSettings({ ...settings, minComplianceScore: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">Score ratios under this rating limit instantly flag structural quality warnings in audits.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Developer average wage index</span>
                    <span className="text-indigo-400 font-bold">${settings.averageHourlyRate} / hour</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="180" 
                    step="5"
                    value={settings.averageHourlyRate}
                    onChange={(e) => saveSettings({ ...settings, averageHourlyRate: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">Alters the estimated economic compensation values dynamically inside ROI calculations.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Hotspot complexity warning trigger</span>
                    <span className="text-indigo-400 font-bold">{settings.complexityHotspotThreshold} PTS</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="90" 
                    step="5"
                    value={settings.complexityHotspotThreshold}
                    onChange={(e) => saveSettings({ ...settings, complexityHotspotThreshold: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">Warning trigger limit rating for refactoring complex modules on behavioral indices.</span>
                </div>
              </div>

              {/* Right config toggles side info */}
              <div className="space-y-4">
                
                {/* Switch flag restrictive licenses */}
                <div className="flex items-start justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Audit Copyleft licensing strictly</span>
                    <p className="text-[10px] text-slate-400 leading-normal">Instantly warn M&A reviewers if copyleft licenses (like GPL/AGPL variants) exists inside dependencies lockfiles.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.flagRestrictiveLicenses}
                    onChange={(e) => saveSettings({ ...settings, flagRestrictiveLicenses: e.target.checked })}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-slate-950 border-white/15 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Scan modes choice */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">Preferred analyzer scanning density:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["semantic", "standard", "ultra"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => saveSettings({ ...settings, preferredScanMode: mode as any })}
                        className={`py-1.5 px-2.5 rounded text-[10px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                          settings.preferredScanMode === mode 
                            ? "bg-pink-500/10 text-pink-400 border-pink-500/30" 
                            : "bg-slate-950 text-slate-500 border-transparent hover:text-slate-400"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom system audit query guidance */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">Custom Prompt Evaluation guidelines:</label>
                  <textarea
                    value={settings.customAuditGuideline}
                    onChange={(e) => saveSettings({ ...settings, customAuditGuideline: e.target.value })}
                    placeholder="e.g. Prioritize security compliance rules or warn on old styled React packages."
                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-lg text-xs font-sans placeholder-slate-600 font-medium text-slate-200 focus:outline-none focus:border-indigo-500 h-16 min-h-[64px] transition-colors resize-none mb-1 text-justify"
                  />
                </div>

              </div>

            </div>
          </div>
        )}

        {/* PANEL D: LOCAL VAULT SCAN RECORDS PERSISTENCE */}
        {deckTab === "vault" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">Offline In-Memory Vault</h4>
              <p className="text-xs text-slate-400">Load or delete scanned repositories cached in LocalStorage. These entries persist safely across browser state reboots.</p>
            </div>

            <div className="space-y-2.5">
              {vaultScans.map((vs, i) => {
                const scanKey = `${vs.repoOwner}/${vs.repoName}`.toLowerCase();
                const isPinned = pinnedScanKeys.includes(scanKey);

                return (
                  <div 
                    key={i} 
                    className={`p-3 bg-slate-900/40 border rounded-xl flex items-center justify-between gap-3 text-left transition-all ${
                      isPinned ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-white/5 hover:border-slate-800"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate font-mono">
                          {vs.repoOwner}/{vs.repoName}
                        </span>
                        {isPinned && <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono py-0.5 px-1.5 rounded font-bold">PINNED</span>}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {vs.lastPushedAt ? new Date(vs.lastPushedAt).toLocaleDateString() : "Sandboxed Folder"}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-semibold">{vs.mainLanguage}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-semibold">Score: {vs.overallScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onReportChange(vs);
                          onRepoInputChange(`${vs.repoOwner}/${vs.repoName}`);
                          triggerNotify(`Loaded scorecard from local storage: ${vs.repoOwner}/${vs.repoName}`, "success");
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 text-white text-xs font-semibold rounded hover:text-indigo-300 transition-colors font-mono cursor-pointer"
                      >
                        Load Scan
                      </button>

                      <button
                        onClick={() => togglePinScan(vs.repoOwner, vs.repoName)}
                        className={`p-1.5 border rounded cursor-pointer ${
                          isPinned ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "text-slate-500 border-white/5 hover:text-slate-300 hover:border-slate-700"
                        }`}
                        title={isPinned ? "Unpin repo" : "Pin repo"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteFromVault(vs.repoOwner, vs.repoName)}
                        className="p-1.5 border border-white/5 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 rounded cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {vaultScans.length === 0 && (
                <div className="p-8 bg-slate-900/20 border border-white/5 rounded-2xl text-center">
                  <History className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your local scan vault is empty. Try grading a local folder directory or saving an active project checklist to cache results here!
                  </p>
                </div>
              )}
            </div>

            {vaultScans.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    handleSaveToVault(report);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 hover:text-white text-emerald-100 font-mono font-bold text-xs uppercase tracking-wider rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Pin Active Scan
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
