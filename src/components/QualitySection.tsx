import React from "react";
import { Check, AlertTriangle, HelpCircle, FileText, Beaker, Play } from "lucide-react";
import { QualityScorecard } from "../types";

interface QualitySectionProps {
  quality: QualityScorecard;
}

export default function QualitySection({ quality }: QualitySectionProps) {
  // Setup Friction Badge helper
  const getFrictionColors = (level: "Low" | "Medium" | "High") => {
    switch (level) {
      case "Low":
        return { text: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", label: "Smooth/One-click" };
      case "Medium":
        return { text: "text-amber-400 border-amber-500/20 bg-amber-500/10", label: "Multi-step configuration" };
      default:
        return { text: "text-rose-400 border-rose-500/20 bg-rose-500/10", label: "High manual friction" };
    }
  };

  const friction = getFrictionColors(quality.setupFrictionLevel);

  return (
    <div id="section-quality" className="space-y-6">
      {/* Quality overview bento row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* README scorecard */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100 font-display">Onboarding Documentation</h4>
              <p className="text-xs text-slate-400 mt-0.5">README.md Score: {quality.readmeScore}/100</p>
            </div>
          </div>

          {/* Custom score bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${quality.readmeScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">{quality.readmeScore}% complete</p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3 rounded border border-slate-800/50">
            {quality.readmeFeedback}
          </p>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-2 font-bold">
              Missing Essential Elements:
            </span>
            {quality.readmeMissingSections && quality.readmeMissingSections.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {quality.readmeMissingSections.map((sect, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">
                    ⚠ {sect}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> All standard README sections (Setup, API rules, FAQ) are present!
              </p>
            )}
          </div>
        </div>

        {/* Tests & Friction card */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Beaker className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100 font-display">Testing Suite Integrity</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Framework: <span className="font-mono text-emerald-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">{quality.testFrameDetected || "None Detected"}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/50">
              {quality.testsExplanation}
            </p>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
              <span className="text-[11px] text-slate-400 font-mono">
                Autodetectlable test folders: {quality.testFrameDetected ? "Detected (/tests or /specs)" : "No files detected"}
              </span>
            </div>
          </div>

          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Developer Setup Friction</span>
              <p className="text-xs text-slate-300 leading-tight mt-1">{quality.setupFrictionReason}</p>
            </div>
            <div className={`py-1.5 px-3 border rounded text-xs font-mono text-center shrink-0 ${friction.text}`}>
              <span className="block font-bold">{quality.setupFrictionLevel}</span>
              <span className="text-[9px] text-slate-400 mt-0.5 block">{friction.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
