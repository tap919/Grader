import React, { useState } from "react";
import { Users, Info, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";

interface TeaserCongruenceProps {
  isUpgraded?: boolean;
}

export default function TeaserCongruence({ isUpgraded = false }: TeaserCongruenceProps) {
  // Developer inputs values to compare perception versus absolute reality
  const [perceivedQuality, setPerceivedQuality] = useState(85);
  const [perceivedSecurity, setPerceivedSecurity] = useState(90);
  const [actualQuality, setActualQuality] = useState(55);
  const [actualSecurity, setActualSecurity] = useState(40);

  // Calculate team congruence score
  // Congruence = 100 - (Avg Absolute Difference)
  const difference = (Math.abs(perceivedQuality - actualQuality) + Math.abs(perceivedSecurity - actualSecurity)) / 2;
  const congruence = Math.round(100 - difference);

  const getStatus = (score: number) => {
    if (score >= 85) return { label: "Perfect Alignment", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", details: "Your team and reality are fully calibrated. Strong predictability, low onboarding failures!" };
    if (score >= 65) return { label: "Developing Blindspot", color: "text-amber-400 border-amber-500/20 bg-amber-500/10", details: "Minor misalignment. Developers expect more structure than currently documented." };
    return { label: "Walking Off A Cliff", color: "text-rose-400 border-rose-500/20 bg-rose-500/15", details: "CRITICAL MISMATCH! The group believes codebases are secure & tested, but static scans find empty suites and leaks." };
  };

  const status = getStatus(congruence);

  return (
    <div id="congruence-interactive-tool" className="p-6 bg-slate-900/45 border border-slate-800 rounded-xl space-y-6">
      {/* Explanation */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Users className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-100 font-display">Client-Interactive Alignment Simulator</h4>
          <p className="text-xs text-slate-400 mt-1">
            Analyze the overlap of team perception indices with absolute scanned indices. Calibrating alignment keeps distributed teams rowing in sync.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Sliders panel */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-bold block mb-1">
            perception vs. reality sliders
          </h5>

          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Team Codebase Confidence Index</span>
              <span className="text-indigo-400 font-mono font-bold">{perceivedQuality}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={perceivedQuality}
              onChange={(e) => setPerceivedQuality(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Absolute Scanned Code Integrity</span>
              <span className="text-emerald-400 font-mono font-bold">{actualQuality}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={actualQuality}
              onChange={(e) => setActualQuality(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Slider 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-sans">Team Security Confidence Index</span>
              <span className="text-indigo-400 font-mono font-bold">{perceivedSecurity}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={perceivedSecurity}
              onChange={(e) => setPerceivedSecurity(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Slider 4 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Absolute Scanned Security Cleanliness</span>
              <span className="text-emerald-400 font-mono font-bold">{actualSecurity}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={actualSecurity}
              onChange={(e) => setActualSecurity(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Calculation metrics display */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-950/40 rounded-xl border border-slate-800/80 text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-widest block">
              Alignment Score
            </span>
            <div className="text-4xl font-extrabold font-display text-slate-100 tracking-tight">
              {congruence}%
            </div>
          </div>

          {/* Congruence Status Badge */}
          <div className={`py-1.5 px-3 block rounded text-[11px] font-mono border uppercase tracking-wider font-semibold ${status.color}`}>
            {status.label}
          </div>

          <p className="text-xs text-slate-400 leading-normal max-w-xs font-sans">
            {status.details}
          </p>

          {isUpgraded ? (
            <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-2.5 rounded-full block font-bold animate-pulse">
              ✦ PRO VECTOR ALIGNMENT LIVE UNLOCKED
            </span>
          ) : (
            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 py-1 px-2 rounded-full block">
              ✦ Locked on Pro Version plan ($29/mo)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
