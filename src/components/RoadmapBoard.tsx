import React, { useState } from "react";
import { GitPullRequest, ArrowUpRight, CheckCircle, ChevronRight, Share2, HelpCircle } from "lucide-react";
import { RoadmapItem } from "../types";

interface RoadmapBoardProps {
  roadmap: RoadmapItem[];
}

export default function RoadmapBoard({ roadmap }: RoadmapBoardProps) {
  const [exporting, setExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const columns: { phase: "Now" | "Next" | "Later"; title: string; subtitle: string; bg: string }[] = [
    { phase: "Now", title: "Now (Critical)", subtitle: "Immediate focus this sprint", bg: "border-t-rose-500/80" },
    { phase: "Next", title: "Next (Iterative)", subtitle: "Under evaluation/backlog", bg: "border-t-indigo-500/80" },
    { phase: "Later", title: "Later (Strategic)", subtitle: "Long term roadmap targets", bg: "border-t-slate-500/80" },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }, 1500);
  };

  const getEffortBadge = (effort: "Small" | "Medium" | "Large") => {
    switch (effort) {
      case "Small":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "Medium":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
      default:
        return "bg-orange-500/10 text-orange-300 border-orange-500/40";
    }
  };

  return (
    <div id="roadmap-kanban-board" className="space-y-6 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-slate-900 border border-emerald-500/30 rounded-lg shadow-xl max-w-sm flex items-start gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-slate-100 font-display">Roadmap Exported!</h5>
            <p className="text-[11px] text-slate-400 mt-1">
              [Pro Mode Simulated] Grader generated and exported <span className="text-emerald-400 font-semibold">{roadmap.length} structured markdown templates</span> ready to paste into GitHub Issues!
            </p>
          </div>
        </div>
      )}

      {/* Exporter Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-100 font-display uppercase tracking-widest">Git Integration Node</h4>
          <p className="text-xs text-slate-400 mt-1">Ready to align your project board? Synced with issue templates.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full sm:w-auto px-4 py-2 font-mono text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg shadow-md hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {exporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Preparing Cards...
            </>
          ) : (
            <>
              <GitPullRequest className="w-3.5 h-3.5 stroke-[3px]" />
              Export to GitHub Issues
            </>
          )}
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {columns.map((col) => {
          const items = roadmap.filter((item) => item.phase === col.phase);
          return (
            <div key={col.phase} className={`flex flex-col bg-slate-950/40 border border-slate-900 border-t-2 ${col.bg} rounded-xl p-4 min-h-[300px]`}>
              <div className="mb-4">
                <h4 className="text-sm font-semibold font-display text-slate-200">{col.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{col.subtitle}</p>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-slate-850 rounded-lg text-slate-600 text-xs text-center font-mono">
                  No issues allocated to this stage
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-750 hover:bg-slate-900/60 transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono uppercase bg-slate-950 text-slate-400 py-0.5 px-1.5 rounded">
                          {item.category}
                        </span>
                        <span className={`text-[9px] font-mono py-0.5 px-1.5 border rounded-full ${getEffortBadge(item.effort)}`}>
                          {item.effort} Effort
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-200 font-display leading-snug group-hover:text-slate-100 transition-colors">
                        {item.title}
                      </h5>

                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
