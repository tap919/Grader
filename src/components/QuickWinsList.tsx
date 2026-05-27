import React from "react";
import { Zap, Check, AlertTriangle, Flame, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { QuickWin } from "../types";

interface QuickWinsListProps {
  quickWins: QuickWin[];
  completedWins: string[];
  onToggleWin: (id: string) => void;
}

export default function QuickWinsList({ quickWins, completedWins, onToggleWin }: QuickWinsListProps) {

   const toggleWin = (id: string) => {
     onToggleWin(id);
   };

  const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "Quality":
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case "Market Fit":
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="quick-wins-module" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          The top 5 high-impact alterations built as a curated launch list.
        </p>
        <span className="text-[10px] font-mono text-emerald-400">
          Completed: {completedWins.length} / {quickWins.length}
        </span>
      </div>

      <div className="space-y-3">
        {quickWins.map((win) => {
          const isDone = completedWins.includes(win.id);
          return (
            <div
              key={win.id}
              className={`p-4 border rounded-xl transition-all ${
                isDone
                  ? "bg-emerald-950/5 border-emerald-500/20 opacity-60"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Select Circle & Labels */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleWin(win.id)}
                    className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : "border-slate-700 bg-slate-950 hover:border-emerald-500"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono py-0.5 px-2 border rounded-full ${getPriorityBadge(win.severity)}`}>
                        {win.severity} Priority
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        {getCategoryIcon(win.category)} {win.category}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold font-display leading-snug ${
                      isDone ? "text-slate-500 line-through" : "text-slate-100"
                    }`}>
                      {win.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {win.description}
                    </p>

                    {!isDone && (
                      <div className="mt-2.5 p-2 bg-slate-950/40 border border-slate-800/80 rounded">
                        <span className="text-[10px] text-emerald-300 font-mono block uppercase font-bold">Action Steps:</span>
                        <p className="text-xs text-slate-300 italic mt-0.5">{win.actionableSteps}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
