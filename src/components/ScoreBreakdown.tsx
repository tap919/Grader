import React from "react";
import { 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Code, 
  Cpu, 
  Scale, 
  Sparkles,
  Zap,
  Bookmark,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { HealthReport } from "../types";

interface ScoreBreakdownProps {
  report: HealthReport;
  onFixSecret: () => void;
  onFixVulnerability: (pkgName: string) => void;
  onBoostQuality: () => void;
}

export default function ScoreBreakdown({ 
  report, 
  onFixSecret, 
  onFixVulnerability, 
  onBoostQuality 
}: ScoreBreakdownProps) {
  
  // Calculate dynamic component scores to present an honest mathematical audit
  const hasSecrets = report.security.secretLeakDetected;
  const vulnerabilityCount = report.security.vulnerabilities.length;
  
  // 1. Security Stance Score (30%)
  let securityScore = 100;
  if (hasSecrets) securityScore -= 40;
  securityScore -= Math.min(60, vulnerabilityCount * 15);
  securityScore = Math.max(0, securityScore);
  
  // 2. Code Quality (25%)
  const qualityScore = Math.round((report.quality.readmeScore + report.compliance.maintainabilityPracticesScore) / 2);
  
  // 3. Architecture Structure coupling (20%)
  const archScore = report.architecture ? report.architecture.dependencyCouplingScore : 85;
  
  // 4. Compliance & License Audit (15%)
  let licenseScore = 100;
  if (report.ossRisk && report.ossRisk.licenseConflictsCount > 0) {
    licenseScore -= report.ossRisk.licenseConflictsCount * 20;
  }
  licenseScore = Math.max(0, licenseScore);

  // 5. Market Pulse & Social Vitality (10%)
  const marketScore = report.market && report.market.benchmarks ? report.market.benchmarks.starRatingPercentile : 75;

  // Weighted totals checks
  const weightedTotal = Math.round(
    (securityScore * 0.30) + 
    (qualityScore * 0.25) + 
    (archScore * 0.20) + 
    (licenseScore * 0.15) + 
    (marketScore * 0.10)
  );

  // Build target focus priority list
  interface PriorityItem {
    id: string;
    level: "Critical" | "High" | "Medium" | "Low";
    title: string;
    description: string;
    impact: string;
    actionLabel: string;
    onAction: () => void;
    icon: React.ReactNode;
  }

  const focusPriorities: PriorityItem[] = [];

  if (hasSecrets) {
    focusPriorities.push({
      id: "secrets-leak",
      level: "Critical",
      title: "Hardcoded Secrets Detected",
      description: `Potential private developer secrets located in: ${report.security.secretsDetails?.join(", ") || "raw storage.ts"}.`,
      impact: "+15 Overall Score Points",
      actionLabel: "Rotate & Safe-Delete Leak",
      onAction: onFixSecret,
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />
    });
  }

  report.security.vulnerabilities.forEach((vuln) => {
    focusPriorities.push({
      id: `cve-${vuln.package}`,
      level: "High",
      title: `Vulnerable Package: ${vuln.package}`,
      description: vuln.details,
      impact: "+5 Overall Score Points",
      actionLabel: `Patch ${vuln.package}`,
      onAction: () => onFixVulnerability(vuln.package),
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />
    });
  });

  if (report.quality.readmeScore < 80) {
    focusPriorities.push({
      id: "readme-boost",
      level: "Medium",
      title: "Sparse Onboarding Blueprint",
      description: `Missing sections: ${report.quality.readmeMissingSections?.join(", ") || "License briefs"}. High setup friction.`,
      impact: "+8 Overall Score Points",
      actionLabel: "Boost README Coverage",
      onAction: onBoostQuality,
      icon: <Code className="w-4 h-4 text-amber-400" />
    });
  }

  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-6">
      
      {/* Visual Header */}
      <div>
        <div className="flex items-center gap-1.5 justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Diagnostic Audit Breakdown
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/5 opacity-80 px-2 py-0.5 rounded uppercase">
            Weights Calibrated
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
          Calculated based on objective technical debt metrics and structural verification vectors.
        </p>
      </div>

      {/* Visual Bars Breakdown Row */}
      <div className="space-y-3.5 pt-1">
        
        {/* Security bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${securityScore > 80 ? "bg-emerald-400" : securityScore > 50 ? "bg-amber-400" : "bg-rose-400"}`} />
              Security Posture (30% weight)
            </span>
            <span className="font-mono text-slate-400 font-bold">{securityScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              style={{ width: `${securityScore}%` }}
              className={`h-full rounded-full transition-all duration-505 ${
                securityScore > 80 ? "bg-emerald-500" : securityScore > 50 ? "bg-amber-500" : "bg-rose-500"
              }`} 
            />
          </div>
        </div>

        {/* Code Quality bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${qualityScore > 80 ? "bg-emerald-400" : "bg-amber-400"}`} />
              Code Quality (25% weight)
            </span>
            <span className="font-mono text-slate-400 font-bold">{qualityScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              style={{ width: `${qualityScore}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-505" 
            />
          </div>
        </div>

        {/* Modular Architecture coupling bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Architecture Isolation (20% weight)
            </span>
            <span className="font-mono text-slate-400 font-bold">{archScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              style={{ width: `${archScore}%` }}
              className="h-full rounded-full bg-emerald-500 transition-all duration-505" 
            />
          </div>
        </div>

        {/* Compliance License bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              OSS Risk & Legal (15% weight)
            </span>
            <span className="font-mono text-slate-400 font-bold">{licenseScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              style={{ width: `${licenseScore}%` }}
              className="h-full rounded-full bg-indigo-500 transition-all duration-505" 
            />
          </div>
        </div>

        {/* Vitality benchmark pulse bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              Market Vitality (10% weight)
            </span>
            <span className="font-mono text-slate-400 font-bold">{marketScore}/100</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              style={{ width: `${marketScore}%` }}
              className="h-full rounded-full bg-pink-500 transition-all duration-505" 
            />
          </div>
        </div>

      </div>

      {/* RATING FOCUS PRIORITIES LIST */}
      <div className="space-y-3 pt-3 border-t border-white/5">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Ranked Focus Priorities
        </h4>

        {focusPriorities.length > 0 ? (
          <div className="space-y-2.5">
            {focusPriorities.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left transition-all ${
                  item.level === "Critical" 
                    ? "bg-rose-950/20 border-rose-500/20" 
                    : item.level === "High"
                    ? "bg-orange-950/20 border-orange-500/20"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex gap-2 min-w-0">
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 leading-normal">
                        <span className="text-xs font-bold text-slate-100 truncate">{item.title}</span>
                        <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          item.level === "Critical" 
                            ? "bg-rose-500/20 text-rose-300"
                            : item.level === "High"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {item.level}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-normal text-justify pr-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remediation callback actions */}
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/[0.04] text-[10px]">
                  <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/10">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    {item.impact}
                  </span>
                  
                  <button
                    onClick={item.onAction}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase text-[9.5px] rounded border border-white/5 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
                  >
                    {item.actionLabel}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-[#10b981] font-bold text-[11px] font-sans">100% Remediation Compliant</p>
            <p className="text-[10px] text-slate-400 mt-0.5">All critical quality vulnerabilities have been successfully remediated. Excellent engineering architecture!</p>
          </div>
        )}
      </div>

    </div>
  );
}
