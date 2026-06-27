import React from "react";
import { ShieldAlert, CheckCircle, Shield, AlertTriangle, AlertCircle, Info, RefreshCw, PenTool } from "lucide-react";
import { SecurityScan } from "../types";

interface SecuritySectionProps {
  scan: SecurityScan;
  onFixSecret?: () => void;
  onFixVulnerability?: (pkgName: string) => void;
}

export default function SecuritySection({ scan, onFixSecret, onFixVulnerability }: SecuritySectionProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "High":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Low":
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div id="section-security" className="space-y-6">
      {/* 1. Safety Highlights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Secret Status Card */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
          scan.secretLeakDetected 
            ? "bg-rose-950/20 border-rose-500/30" 
            : "bg-slate-900/40 border-slate-800"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${scan.secretLeakDetected ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {scan.secretLeakDetected ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-100 font-display">Credential Leak Check</h4>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {scan.secretLeakDetected 
                  ? "WARNING: Potential hardcoded API secrets or private environment tokens detected in workspace config files!" 
                  : "No exposed API keys, secret strings, or credential hashes detected in core repository code files."}
              </p>
              {scan.secretLeakDetected && scan.secretsDetails?.length > 0 && (
                <div className="mt-3 py-1.5 px-2 bg-rose-950/40 rounded border border-rose-500/20">
                  <span className="text-[11px] font-mono text-rose-300 block truncate">Potential leaks in: {scan.secretsDetails.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {scan.secretLeakDetected && onFixSecret && (
            <div className="mt-4 pt-3 border-t border-rose-500/10 flex justify-end">
              <button
                type="button"
                onClick={onFixSecret}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded border border-rose-400/20 shadow-md flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                Rotate & Remove Secrets File Leak
              </button>
            </div>
          )}
        </div>

        {/* Highest Severity CVE Card */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-start gap-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 font-display">CVE Vulnerabilities</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Aggregate Status:</span>
              <span className={`text-[11px] py-0.5 px-2 font-mono border rounded-full ${getSeverityBadge(scan.highestSeverity)}`}>
                {scan.highestSeverity} Risk
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-normal">
              {scan.vulnerabilityCount === 0 
                ? "Clean health! No high-risk obsolete libraries found in dependency configurations." 
                : `Detected ${scan.vulnerabilityCount} package dependencies with published vulnerabilities.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Detected Vulnerabilities Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-display">Package Dependency Warnings</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
            {scan.vulnerabilities.length} Findings
          </span>
        </div>

        {scan.vulnerabilities.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500/60" />
            <span>This workspace has zero dependency vulnerabilities. Outstanding job!</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {scan.vulnerabilities.map((vuln, idx) => (
              <div key={idx} className="p-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-900/20 transition-colors">
                {/* Badge Column */}
                <div className="md:w-32 shrink-0">
                  <span className={`inline-block text-[11px] font-mono font-bold py-0.5 px-2 border rounded-full uppercase tracking-tighter ${getSeverityBadge(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <div className="text-xs font-bold text-slate-100 mt-2 truncate font-mono">
                    {vuln.package}
                  </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed text-justify">
                    {vuln.details}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850 flex-1">
                      <span className="text-emerald-400 font-semibold font-mono uppercase text-[9px] tracking-wider shrink-0">Fix Action:</span>
                      <span className="text-slate-300 italic truncate">{vuln.recommendation}</span>
                    </div>

                    {onFixVulnerability && (
                      <button
                        type="button"
                        onClick={() => onFixVulnerability(vuln.package)}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-slate-205 font-mono font-bold uppercase text-[9.5px] rounded border border-white/5 shadow-md shrink-0 flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <PenTool className="w-3 h-3 text-indigo-300" />
                        Upgrade & Patch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Tip Box */}
      <div className="p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300 font-display">Automated Vibe Tip:</strong> Static vulnerability diagnostics rely on package definitions. Never commit raw passwords or AWS keys directly in source versions — always employ process-mounted standard <code className="text-emerald-400 font-mono">.env</code> environments and include them inside <code className="text-emerald-400 font-mono">.gitignore</code> profiles.
        </p>
      </div>
    </div>
  );
}
