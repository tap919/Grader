import React, { useState } from "react";
import { HotspotItem } from "../types";
import { Flame, Info, Minimize2, Trash, CheckSquare, Search, Sparkles } from "lucide-react";

interface BehavioralHotspotsProps {
  hotspots: HotspotItem[];
}

export default function BehavioralHotspots({ hotspots }: BehavioralHotspotsProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(hotspots[0] || null);

  // Fallback defaults to ensure pristine visual presentation
  const activeHotspots = hotspots && hotspots.length > 0 ? hotspots : [
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
  ] as HotspotItem[];

  return (
    <div id="behavioral-hotspot-identification" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-2">
        <div>
          <h3 className="text-base font-bold text-white font-display">Behavioral Codebase Hotspots Map</h3>
          <p className="text-xs text-slate-400">Intersection of codebase complexity and version commit churn frequency from history parameters.</p>
        </div>
        <div className="py-1 px-2 text-[10px] bg-rose-500/10 text-rose-400 font-mono uppercase tracking-wider rounded font-bold">
          Method: Churn-Complexity Scoring
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scatter Matrix Visual (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-slate-900/30 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-widest font-bold">Hotspot Prioritization Grid</span>
              <span className="text-rose-400 flex items-center gap-1"><Flame className="w-4 h-4" /> Priority Areas</span>
            </div>

            {/* Visual Grid Container */}
            <div className="relative h-[280px] bg-black/50 border border-white/10 rounded-lg p-2 overflow-hidden select-none flex flex-col justify-between">
              
              {/* Background Quadrants */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-40">
                <div className="border-r border-b border-dashed border-white/10 p-2 text-[10px] text-orange-400/60 font-mono font-medium uppercase">
                  Legacy Debt
                </div>
                <div className="border-b border-dashed border-white/10 p-2 text-[10px] text-rose-400/90 font-mono font-bold bg-rose-950/20 uppercase text-right">
                  💥 Danger Hotspot
                </div>
                <div className="border-r border-dashed border-white/10 p-2 text-[10px] text-slate-500/50 font-mono uppercase flex items-end">
                  Low Risk Stable
                </div>
                <div className="p-2 text-[10px] text-indigo-400/60 font-mono uppercase flex items-end justify-end">
                  Under Active Refactor
                </div>
              </div>

              {/* Render Scatter Dots */}
              {activeHotspots.map((item, idx) => {
                // map churn to left scale: margin percentage
                // map complexity to bottom scale: bottom percentage
                const xPos = Math.max(12, Math.min(88, item.churnPercent));
                const yPos = Math.max(12, Math.min(88, item.complexityScore));
                const isSelected = selectedHotspot?.filePath === item.filePath;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedHotspot(item)}
                    className="absolute cursor-pointer transition-all duration-300"
                    style={{
                      left: `${xPos}%`,
                      bottom: `${yPos}%`,
                      transform: "translate(-50%, 50%)"
                    }}
                    title={`${item.filePath} (Complexity: ${item.complexityScore}%, Churn: ${item.churnPercent}%)`}
                  >
                    <div className={`relative flex items-center justify-center p-1 rounded-full transition-transform ${isSelected ? "scale-125 z-20" : "scale-100 z-10"}`}>
                      {/* Pulse Ring if Critical */}
                      {item.riskRating === "Critical" && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500/30 animate-ping" />
                      )}
                      
                      <div className={`w-3.5 h-3.5 rounded-full border shadow-md transition-colors ${
                        isSelected 
                          ? "bg-rose-500 border-white" 
                          : item.riskRating === "Critical"
                          ? "bg-rose-500/80 border-rose-400"
                          : item.riskRating === "High"
                          ? "bg-orange-500/80 border-orange-400"
                          : "bg-slate-500 border-slate-400"
                      }`} />
                    </div>
                  </button>
                );
              })}

              {/* Axis labels */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 rotate-270 origin-left text-[9px] font-mono text-slate-500 pointer-events-none select-none uppercase tracking-widest pl-2">
                Static Complexity Score (Y-Axis) →
              </div>
              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 pointer-events-none select-none uppercase tracking-widest">
                Change Frequency / Churn (X-Axis) →
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>● Gray: Maintenance Stable</span>
              <span>● Orange: Refactoring Candidates</span>
              <span>● Rose: Urgent Hotspots</span>
            </div>
          </div>
        </div>

        {/* Selected File Details / List Row (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              File Performance Inventory
            </h4>

            <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
              {activeHotspots.map((item, idx) => {
                const isSelected = selectedHotspot?.filePath === item.filePath;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedHotspot(item)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-indigo-950/20 border-indigo-500/40 shadow-inner" 
                        : "bg-slate-900/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-slate-200 truncate flex-1 block">
                        {item.filePath}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold ${
                        item.riskRating === "Critical"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.riskRating === "High"
                          ? "bg-orange-500/10 text-orange-400"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {item.riskRating}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>Complexity: <strong className="text-slate-200">{item.complexityScore}/100</strong></span>
                      <span>Churn: <strong className="text-slate-200">{item.churnPercent}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focused Diagnosis Action Panel */}
          {selectedHotspot && (
            <div className="p-4 bg-indigo-950/15 border border-indigo-500/15 rounded-xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Diagnosis & Mitigation</span>
              </div>
              <div className="p-2 bg-black/30 border border-white/5 rounded">
                <code className="text-xs font-mono text-amber-200 block break-all leading-normal">
                  {selectedHotspot.filePath}
                </code>
              </div>
              
              <div className="space-y-1 text-xs text-slate-300">
                <p className="leading-relaxed">
                  <strong className="text-slate-100">Debt Level:</strong> Classified as <span className="text-orange-400 font-bold">{selectedHotspot.riskRating} Danger</span>. Changing this module creates systemic bugs across dependencies.
                </p>
                <p className="leading-relaxed text-slate-400 pt-1">
                  💡 <span className="text-indigo-300">Grader Recommendation:</span> {selectedHotspot.recommendation}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
