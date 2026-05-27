import React from "react";
import { TrendingUp, Users, RefreshCw, Layers, Sparkles, AlertCircle } from "lucide-react";
import { MarketSnapshot } from "../types";

interface MarketSectionProps {
  market: MarketSnapshot;
}

export default function MarketSection({ market }: MarketSectionProps) {
  // Helper for trend badge
  const getTrendStyle = (trend: string) => {
    switch (trend) {
      case "Rising Star":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Steady":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Declining Stack":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div id="section-market" className="space-y-6">
      {/* 1. Trend and Benchmark Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trend Card */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-semibold text-slate-100 font-display">Stack Trend Alignment</h4>
            </div>
            <span className={`text-[11px] font-mono py-0.5 px-2 border rounded-full ${getTrendStyle(market.trendAlignmentGrade)}`}>
              ✦ {market.trendAlignmentGrade}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
            {market.trendExplanation}
          </p>
        </div>

        {/* Vital Benchmarks */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold text-slate-100 font-display">Vitals & Benchmarks</h4>
          
          <div className="space-y-3 font-mono text-[11px]">
            {/* Stars percentile */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Star Percentile:</span>
              <span className="text-emerald-400 font-bold">{market.benchmarks.starRatingPercentile}th %</span>
            </div>
            {/* Release activity */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Update Frequency:</span>
              <span className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{market.benchmarks.releaseFrequency}</span>
            </div>
            {/* Contributor Health */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contributor Health:</span>
              <span className="text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{market.benchmarks.activeContributorScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Market Competitor Benchmarking */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-display">Direct Competitor Landscape Analysis</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Comparative Matrix
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/20 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Repository (Market Benchmark)</th>
                <th className="py-3 px-5">Stars</th>
                <th className="py-3 px-5">Your Strategic Advantages</th>
                <th className="py-3 px-5">Threats / Weaknesses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {market.competitors && market.competitors.length > 0 ? (
                market.competitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-200 font-semibold">
                      {comp.repoName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono">
                      ★ {comp.stars.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        {comp.advantages.map((adv, aIdx) => (
                          <span key={aIdx} className="text-[11px] text-emerald-300 flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">•</span> {adv}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        {comp.weaknesses.map((weak, wIdx) => (
                          <span key={wIdx} className="text-[11px] text-amber-300 flex items-center gap-1">
                            <span className="text-amber-500 font-bold">•</span> {weak}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No competitor comparisons found for this repository stack.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
