import React from "react";
import { motion } from "motion/react";

interface ScoreGaugeProps {
  score: number;
  category: string;
}

export default function ScoreGauge({ score, category }: ScoreGaugeProps) {
  // SVG gauge constants
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Decide colors based on score
  const getColors = (s: number) => {
    if (s >= 80) return { stroke: "stroke-emerald-400", text: "text-emerald-400", bgGlow: "rgba(16, 185, 129, 0.25)", label: "Solid/Healthy" };
    if (s >= 60) return { stroke: "stroke-amber-400", text: "text-amber-400", bgGlow: "rgba(245, 158, 11, 0.25)", label: "Needs Polish" };
    return { stroke: "stroke-rose-500", text: "text-rose-400", bgGlow: "rgba(239, 68, 68, 0.25)", label: "At Risk" };
  };

  const colors = getColors(score);

  return (
    <div id="vibe-score-gauge" className="relative flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/40 border-breathe glow-indigo-subtle">
      {/* Background glow shadow following the level */}
      <div 
        className="absolute w-40 h-40 blur-3xl rounded-full transition-all duration-1000 -z-10 animate-pulse"
        style={{ backgroundColor: colors.bgGlow, top: "20%" }}
      />

      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle Track */}
        <svg className="w-full h-full -rotate-90">
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Gauge Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />
        </svg>

        {/* Floating Percentage Indicator */}
        <div id="gauge-score-value" className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-extrabold font-display ${colors.text} tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]`}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-widest bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">
            Grade {category}
          </span>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${score >= 80 ? "bg-emerald-400 pulse-emerald" : score >= 60 ? "bg-amber-400" : "bg-rose-500 pulse-rose"}`} />
          {colors.label}
        </p>
        <p className="text-xs text-slate-400 mt-1">Codebase Health Index</p>
      </div>
    </div>
  );
}
