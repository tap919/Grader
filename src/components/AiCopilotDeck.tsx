import React, { useState } from "react";
import { Sparkles, Copy, Check, Terminal, FileText, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { HealthReport } from "../types";

interface AiCopilotDeckProps {
  report: HealthReport;
}

export default function AiCopilotDeck({ report }: AiCopilotDeckProps) {
  const [copied, setCopied] = useState(false);

  // Compile the master prompt that the LLM will parse from the clipboard or printed PDF text
  const compilePromptLines = () => {
    const vulnsText = report.security.vulnerabilities
      .map((v, i) => `  ${i + 1}. [${v.severity} Severity] Package: "${v.package}"\n     - Issue: ${v.details}\n     - Fix Action: ${v.recommendation}`)
      .join("\n\n");

    const winsText = report.quickWins
      .map((w, i) => `  ${i + 1}. [${w.severity} Impact] Title: "${w.title}" (${w.category})\n     - Description: ${w.description}\n     - Actionable steps: ${w.actionableSteps}`)
      .join("\n\n");

    const hotspotsText = report.hotspots
      .map((h, i) => `  ${i + 1}. [${h.riskRating} Risk] Path: "${h.filePath}"\n     - Complexity Score: ${h.complexityScore}/100 | Churn Ratio: ${h.churnPercent}%\n     - Core Recommendation: ${h.recommendation}`)
      .join("\n\n");

    const roadmapText = report.roadmap
      .map((r, i) => `  ${i + 1}. [Phase: ${r.phase}] Title: "${r.title}" (${r.category})\n     - Description: ${r.description}\n     - Estimated Effort: ${r.effort}`)
      .join("\n\n");

    return `================================================================================
🚀 GRADER PRO INDUSTRIAL CO-PILOT REMEDIATION BLUEPRINT & AI INGESTION CONTEXT
================================================================================

PROJECT FOOTPRINT:
- Repository Target: github.com/${report.repoOwner}/${report.repoName}
- Core Programming Language/Framework stack: ${report.mainLanguage}
- Overall Quality Rating Score: ${report.overallScore}/100 (Grade: ${report.gradeCategory})
- Total Vulnerability count: ${report.security.vulnerabilityCount} (highest alert: ${report.security.highestSeverity})
- OSS Copyleft conflict: ${report.ossRisk?.copyleftDetected ? "YES (Restrictive Licenses Found)" : "NO (All Permissive)"}

SYSTEM EXECUTIVE ANALYSIS STATE:
"${report.summary}"

--------------------------------------------------------------------------------
🚨 HIGH-PRIORITY ASSESSMENT I: SECURITY & VULNERABILITIES REMEDIATION
--------------------------------------------------------------------------------
Below is a structured list of verified package-level CVEs and secrets disclosures in the codebase.
Vulnerabilities found:
${vulnsText || "  No critical CVEs currently active."}

${report.security.secretLeakDetected ? `⚠️ WARNING: Potential key leak detected in the following paths:\n${report.security.secretsDetails.map(p => `  - ${p}`).join("\n")}\n  *Action Required: Rotate active access tokens immediately and clean history with git-filter-repo.` : ""}

--------------------------------------------------------------------------------
⚡ HIGH-PRIORITY ASSESSMENT II: IMMEDIATE QUICK WINS
--------------------------------------------------------------------------------
Apply these tactical, low-risk codebase alterations to maximize quality score gains instantly:
${winsText || "  No unaddressed quick wins in sandbox memory."}

--------------------------------------------------------------------------------
🔥 HIGH-PRIORITY ASSESSMENT III: COMPLEX SECURITY & COMPLEXITY HOTSPOTS
--------------------------------------------------------------------------------
The following files exhibit severe code complexity bottlenecks or extreme commit frequency churn rates. Let's refactor them to separate concerns:
${hotspotsText || "  No critical file hotspots detected."}

--------------------------------------------------------------------------------
🗺️ DESTRUCTIVE TECHNICAL DEBT DEPRECIATION ROADMAP
--------------------------------------------------------------------------------
Prioritized engineering sprint tasks categorized by chronological phases:
${roadmapText || "  No ongoing roadmap elements."}

--------------------------------------------------------------------------------
🔍 LEGAL & INTELLECTUAL PROPERTY COMPLIANCE STATE
--------------------------------------------------------------------------------
- OSS Licenses Audit: ${report.ossRisk?.licensesFound.map(l => `${l.name} (${l.type})`).join(", ") || "N/A"}
- Conflict Details: ${report.ossRisk?.legalAdviceSnippet || "No core conflicts found."}

================================================================================
🛠️ CORE REMEDIATION INSTRUCTIONS FOR TARGET LLM (CLAUDE / GEMINI / CHATGPT)
================================================================================
You are the primary Code Remediation and Refactoring Agent in charge of fixing the target repository.
Analyze the report details provided above carefully, and generate highly professional, ready-to-merge patches:

1. COMPILER & SECURITY RECONCILIATION:
   - Formulate exact command line directives to safely upgrade obsolete NPM or bundle packages.
   - For credentials leaks, provide the correct structure using standard dotenv config imports.

2. COMPLEX FILE REFACTORING:
   - For files list under "Complex hotspots", supply dry-run, modular structures, splitting monolith functions into test-driven sub-routines.
   - Retain complete types safety matching React, Next.js, or typescript schemas.

3. DELIVERABLES CONFIGURATION:
   - Present code snippets inside markdown blocks with clear filepath indicators as headers (e.g., "// Path: src/utils/example.ts").
   - Output step-by-step shell commands for installing, logging, and continuous deployment validation.

Acknowledge reading this directive report by stating: "Remediation blueprint loaded. Initiating tactical fixes for github.com/${report.repoOwner}/${report.repoName}." and proceed instantly.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compilePromptLines());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-remediation-copilot-container" className="space-y-6 animate-fadeIn">
      {/* Dynamic Instruction Card */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex gap-4 items-start">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">How to use this Remediation Deck:</h4>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              Grader's print-layout has been specifically calibrated with semantic layout structures matching leading LLM parsers. 
              Simply click <strong>Export PDF</strong> in the top header and save the report. When you upload that PDF or copy-paste this compiled prompt into your AI chat (Claude 3.5 Sonnet, Gemini 1.5 Pro, or GPT-4o), the model will immediately ingest the complete codebase coordinates, risk parameters, and complex files to start printing ready-to-merge patches.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] items-center gap-1 inline-flex bg-slate-950 px-2 py-1 rounded font-mono text-slate-400 border border-white/5">
                <Terminal className="w-3 h-3 text-indigo-400" />
                Prompt Length: ~3.5K chars
              </span>
              <span className="text-[10px] items-center gap-1 inline-flex bg-slate-950 px-2 py-1 rounded font-mono text-slate-400 border border-white/5">
                <FileText className="w-3 h-3 text-emerald-400" />
                PDF Context: Fully Indexed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Action Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Playground Box (col-span-8) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Compiled AI Prompt Preview
            </span>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-650/15 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300 animate-scaleIn" />
                  Copied Blueprint!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Master Prompt
                </>
              )}
            </button>
          </div>

          <div className="p-4.5 bg-[#08080a] border border-white/5 rounded-xl flex-1 relative">
            <pre className="text-[10px] font-mono leading-relaxed text-indigo-300 select-all whitespace-pre-wrap max-h-[480px] overflow-y-auto pr-1 text-justify scrollbar-thin scrollbar-thumb-slate-800 pr-1 select-all scroll-smooth">
              {compilePromptLines()}
            </pre>
            <div className="absolute bottom-2 right-2 bg-slate-900 border border-white/10 rounded-md py-1 px-2 text-[8px] text-slate-500 uppercase tracking-widest font-bold font-mono pointer-events-none">
              Raw plain-text payload
            </div>
          </div>
        </div>

        {/* Right Structured Statistics Deck (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4.5 bg-slate-900/30 border border-white/5 rounded-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
                remit optimization targets
              </span>

              <div className="space-y-3">
                <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="p-1.5 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono font-bold leading-none mb-1">CVE VULNERABILITIES</span>
                    <span className="text-xs text-white font-bold">{report.security.vulnerabilityCount} Remediation Tasks</span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono font-bold leading-none mb-1">IMMEDIATE QUICK WINS</span>
                    <span className="text-xs text-white font-bold">{report.quickWins.length} Actionable Changes</span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono font-bold leading-none mb-1">HOTSPOTS TO REFACTOR</span>
                    <span className="text-xs text-white font-bold">{report.hotspots.length} Complex Codebases</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-[11px] text-slate-400 leading-normal text-justify">
                <strong>Ingestion tip:</strong> Uploading the printed PDF triggers the model's optical-char search parameters. This forces the LLM to process the entire dashboard audit details systematically.
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-sans font-bold text-xs uppercase tracking-wider rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Export E2E Report PDF
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
