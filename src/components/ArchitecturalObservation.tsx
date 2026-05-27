import React from "react";
import { GitBranch, RefreshCw, AlertTriangle, Cpu, HelpCircle, Layout } from "lucide-react";
import { ArchitecturalMetrics } from "../types";

interface ArchitecturalObservationProps {
  metrics: ArchitecturalMetrics;
}

export default function ArchitecturalObservation({ metrics }: ArchitecturalObservationProps) {
  
  // High-fidelity fallback defaults
  const activeMetrics = metrics || {
    dependencyCouplingScore: 64,
    circularImportsFound: 1,
    architecturalDriftIndex: 12,
    modularSpacingScore: 78,
    structuralComplexityFeedback: "Detected weak cohesion between route controllers and local storage libraries. Standard decoupled separation would keep route handlers isolated from low-level cache dependencies."
  };

  return (
    <div id="architectural-observability-drift" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-2">
        <div>
          <h3 className="text-base font-bold text-white font-display">Architectural Observability & Coupling</h3>
          <p className="text-xs text-slate-400">Identify structural deviation of directories, static separation boundaries, and circular dependency cycles.</p>
        </div>
        <div className="py-1 px-2.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono rounded font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
          <GitBranch className="w-3.5 h-3.5" /> Static Coupling
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Metric Cards Grid (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Coupling Score Card */}
          <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Dependency Coupling index</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {activeMetrics.dependencyCouplingScore}
              </span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              A higher score indicates tight file-coupling. Ideal balance should align below 45.
            </p>
          </div>

          {/* Drift Index Card */}
          <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Architectural Drift Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-orange-400 font-mono">
                {activeMetrics.architecturalDriftIndex}%
              </span>
              <span className="text-slate-500 text-xs font-mono">Deviation dev</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Measure of drift where real-world file imports bypass designated component layers code.
            </p>
          </div>

          {/* Circular Imports Card */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            activeMetrics.circularImportsFound > 0 
              ? "bg-rose-950/10 border-rose-500/20 text-rose-400" 
              : "bg-emerald-950/10 border-emerald-500/20 text-emerald-400"
          }`}>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Circular Imports Detected</span>
            <div className="text-2xl font-bold font-mono">
              {activeMetrics.circularImportsFound} File Cycles
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Circular chains can crash server builds or create memory leakage loops in live processes.
            </p>
          </div>

        </div>

        {/* Visual Layer Flow Diagram (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 bg-black/40 border border-white/5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Structural Cohesion Visual Layout
            </h4>

            {/* Simulated Architecture Layers Stack */}
            <div className="space-y-3 font-mono text-xs">
              
              {/* Layer 1: Entrance */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 mr-2">[L1] Entry Point & Pages</span>
                  <span className="text-white font-bold">src/App.tsx</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">Clean boundary</span>
              </div>

              {/* Coupling Connector Down */}
              <div className="h-4 flex justify-between px-10 text-[10px] text-slate-600 font-bold">
                <span>│</span>
                <span className="text-rose-400 font-mono text-[9px] animate-pulse">!! Direct Bypass coupling (drift)</span>
                <span>│</span>
              </div>

              {/* Layer 2: Logical components */}
              <div className="p-3 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 mr-2">[L2] Interactive Submodules</span>
                  <span className="text-white font-medium">components/*</span>
                </div>
                <span className="text-[10px] text-indigo-400">Coupled loops: 2</span>
              </div>

              {/* Coupling Connector Down */}
              <div className="h-4 flex justify-between px-10 text-[10px] text-slate-600 font-bold">
                <span>│</span>
                <span></span>
                <span>│</span>
              </div>

              {/* Layer 3: Helpers & Storage API */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 mr-2">[L3] Shared Storage Utility</span>
                  <span className="text-amber-200">util/api_router.ts</span>
                </div>
                <span className="text-[10px] text-rose-400 font-bold">Coupling Bottleneck</span>
              </div>

            </div>

            {/* Audit Diagnostic Block */}
            <div className="p-3 bg-slate-900/30 border border-white/5 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Layered separation alert:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeMetrics.structuralComplexityFeedback}
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
