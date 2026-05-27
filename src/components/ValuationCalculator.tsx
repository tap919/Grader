import React, { useState } from "react";
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  HelpCircle, 
  ShieldAlert, 
  Award, 
  Calculator, 
  Sliders, 
  Activity, 
  Cpu, 
  Globe, 
  Users, 
  Zap, 
  Layers, 
  Settings2,
  Lock,
  RefreshCw
} from "lucide-react";
import { ValuationMetrics } from "../types";

interface ValuationCalculatorProps {
  metrics: ValuationMetrics;
}

export default function ValuationCalculator({ metrics }: ValuationCalculatorProps) {
  // Configurable sliders for dynamic ROI estimation
  const [hourlyRate, setHourlyRate] = useState(metrics?.averageHourlyRate || 85);
  const [estimatedHours, setEstimatedHours] = useState(metrics?.estimatedDeveloperHours || 650);
  const [wastePercent, setWastePercent] = useState(metrics?.productivityWasteHeuristic || 22);

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"roi" | "economics">("roi");

  // Dynamic calculations based on team inputs
  const replacementCostFMV = estimatedHours * hourlyRate;
  const reliefFromRoyaltyValue = Math.round(replacementCostFMV * 0.125); // Standard 12.5% proxy royalty index
  const annualInterestDebtCost = Math.round(replacementCostFMV * (wastePercent / 100));
  const potentialSavingsPro = Math.round(annualInterestDebtCost * 0.65); // 65% recoupable through proactive fixes

  // --- UNIT ECONOMICS COCKPIT STATES ---
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro_annual");
  const [cacheHitRatio, setCacheHitRatio] = useState<number>(85); // 0% to 100% slider
  
  // Add-on switches
  const [monitoredReposCount, setMonitoredReposCount] = useState<number>(3); // $2 / repo / month
  const [deepMarketScansCount, setDeepMarketScansCount] = useState<number>(1); // $3 / scan
  const [apiPowerPack, setApiPowerPack] = useState<boolean>(true); // $5 / month
  const [badgeAnalytics, setBadgeAnalytics] = useState<boolean>(false); // $2 / month
  const [whiteLabelReports, setWhiteLabelReports] = useState<boolean>(false); // $10 / month
  const [priorityQueue, setPriorityQueue] = useState<boolean>(true); // $3 / month

  // Plans Config
  const plans = [
    { id: "free", name: "Free", price: 0, interval: "month", desc: "2 public scans/mo, watermarked snapshot", scansIncluded: 2 },
    { id: "pay_per_scan", name: "Pay‑Per‑Scan", price: 1, interval: "scan", desc: "$1 / full project X‑ray, no expiry", scansIncluded: 1 },
    { id: "pro_monthly", name: "Pro Monthly", price: 8, interval: "month", desc: "Unlimited public + 5 private scans/mo", scansIncluded: 15 },
    { id: "pro_annual", name: "Pro Annual", price: 5, interval: "month_billed_60", desc: "Save 37%. Spotify-pricing impulse buy", scansIncluded: 18 },
    { id: "team", name: "Team", price: 29, interval: "month", desc: "15 monitored repos, team dashboard", scansIncluded: 35 },
    { id: "enterprise", name: "Enterprise", price: 100, interval: "month", desc: "Self‑hosted Docker swarm, air-gapped", scansIncluded: 100 }
  ];

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[3];

  // Base Revenue Calculation
  let baseAnnualRevenue = 0;
  if (selectedPlan.id === "free") {
    baseAnnualRevenue = 0;
  } else if (selectedPlan.id === "pay_per_scan") {
    baseAnnualRevenue = 12 * 1; // Assuming 12 scans/year for pay-per-scan user
  } else if (selectedPlan.id === "pro_annual") {
    baseAnnualRevenue = 60;
  } else {
    baseAnnualRevenue = selectedPlan.price * 12;
  }

  // Add-ons Annual Value
  const addOnAnnualMonitoring = monitoredReposCount * 2 * 12;
  const addOnAnnualDeepMarket = deepMarketScansCount * 3 * 12;
  const addOnAnnualApi = apiPowerPack ? 5 * 12 : 0;
  const addOnAnnualBadge = badgeAnalytics ? 2 * 12 : 0;
  const addOnAnnualWhiteLabel = whiteLabelReports ? 10 * 12 : 0;
  const addOnAnnualPriority = priorityQueue ? 3 * 12 : 0;

  const totalAddOnsAnnual = addOnAnnualMonitoring + addOnAnnualDeepMarket + addOnAnnualApi + addOnAnnualBadge + addOnAnnualWhiteLabel + addOnAnnualPriority;
  const grossAnnualRevenue = baseAnnualRevenue + totalAddOnsAnnual;

  // Compute Cost math based on agent reality checklist
  // Cached scan base: $0.12 (highly optimised lockfile + ast tree caching)
  // Cold scan base: $0.26 (Firecracker VM microVM initialization, full dependency lint queries)
  const cachedScanCost = 0.12;
  const coldScanCost = 0.26;
  const blendedScanCost = (cachedScanCost * (cacheHitRatio / 100)) + (coldScanCost * (1 - (cacheHitRatio / 100)));

  // Estimated scans per user per year based on plan + monitor configuration
  const baseEstimatedScans = selectedPlan.id === "free" ? 24 : selectedPlan.id === "pay_per_scan" ? 12 : selectedPlan.scansIncluded * 12;
  const monitoringTriggerScans = monitoredReposCount * 4 * 12; // Assuming 4 commits per monitored repo push per month
  const totalScansInvoiced = baseEstimatedScans + (selectedPlan.id === "free" ? 0 : monitoringTriggerScans);
  
  const annualComputeCost = Math.round(totalScansInvoiced * blendedScanCost * 100) / 100;
  const netAnnualProfit = grossAnnualRevenue - annualComputeCost;
  const grossProfitMargin = grossAnnualRevenue > 0 ? (netAnnualProfit / grossAnnualRevenue) * 100 : 100;
  const revenueMultiplier = baseAnnualRevenue > 0 ? (grossAnnualRevenue / baseAnnualRevenue) : 1;

  // Agent-level sub-costs for display purposes based on ratio
  const getBlendedAgentCost = (cold: number, cached: number) => {
    return Math.round(((cached * (cacheHitRatio / 100)) + (cold * (1 - (cacheHitRatio / 100)))) * 1000) / 1000;
  };

  return (
    <div id="roi-valuation-calculator" className="space-y-6">
      
      {/* COCKPIT TAB SELECTION BAR */}
      <div className="flex border-b border-white/5 pb-0">
        <button
          type="button"
          onClick={() => setActiveSubTab("roi")}
          className={`px-5 py-3 text-xs font-bold font-display cursor-pointer transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "roi"
              ? "border-indigo-500 text-white bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calculator className="w-4 h-4" />
          M&A Asset Valuation & Technical Debt
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("economics")}
          className={`px-5 py-3 text-xs font-bold font-display cursor-pointer transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "economics"
              ? "border-indigo-500 text-white bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Grader Business Unit Economics & Compute Stress-Test
        </button>
      </div>

      {activeSubTab === "roi" ? (
        // TAB A: CORE VALUATION HEURISTICS (MODIFIED EXISTING WORKSPACE)
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Asset Value & Recoupable Loss Projections</h3>
              <p className="text-[11px] text-slate-400">Evaluate software intellectual equity and ROI savings of proactive remediation.</p>
            </div>
            <div className="py-1 px-2.5 bg-indigo-500/15 text-indigo-400 text-[10px] font-mono rounded uppercase tracking-wider font-semibold border border-indigo-500/20">
              Code Valuation: GR-VAL-2026
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sliders Control Column (col-span-5) */}
            <div className="lg:col-span-5 space-y-5 bg-black/40 p-5 rounded-2xl border border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5 mb-2">
                <Sliders className="w-3.5 h-3.5" />
                Valuation Factor Tuners
              </h4>

              {/* Slider 1: Hourly Rate */}
              <div className="space-y-1.5 p-3.5 bg-slate-950/50 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Developer Hourly Rate:</span>
                  <span className="text-indigo-400 font-bold">${hourlyRate}/hr</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[9px] text-slate-500 block font-mono">Typical junior-to-principal blended developer payroll index.</span>
              </div>

              {/* Slider 2: Dev hours */}
              <div className="space-y-1.5 p-3.5 bg-slate-950/50 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Rebuild Effort Estimation:</span>
                  <span className="text-indigo-400 font-bold">{estimatedHours} Hours</span>
                </div>
                <input 
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[9px] text-slate-500 block font-mono">Calculated hours necessary to program and rewrite this codebase from raw scratch.</span>
              </div>

              {/* Slider 3: Friction Waste */}
              <div className="space-y-1.5 p-3.5 bg-slate-950/50 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Technical Debt Friction:</span>
                  <span className="text-rose-400 font-bold">{wastePercent}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="70"
                  value={wastePercent}
                  onChange={(e) => setWastePercent(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-[9px] text-slate-500 block font-mono">Percent of active dev cycles lost fixing regression bugs or manually patching architecture details.</span>
              </div>

              <div className="pt-1">
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/25 rounded-xl text-[11px] text-indigo-300 leading-normal font-mono">
                  <strong>Auditor Formula:</strong> Current workspace represents <span className="text-white font-semibold">{(estimatedHours / 160).toFixed(1)}</span> developer-months of fair replacement asset equity.
                </div>
              </div>
            </div>

            {/* Financial Metrics Displays (col-span-7) */}
            <div className="lg:col-span-7 space-y-4 font-display">
              
              {/* Main FMV Score block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* FMV Card */}
                <div className="p-5 bg-indigo-950/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                  <div className="absolute top-2.5 right-3 text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">FMV Asset Method</div>
                  <div>
                    <span className="block text-xs text-slate-450 font-sans">Fair Value Replacement Cost</span>
                    <span className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight block">
                      ${Math.round(replacementCostFMV).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed mt-2">
                    Approximate replacement budget required to reproduce this codebase under normal corporate developer payroll standards.
                  </p>
                </div>

                {/* Relief from Royalty Card */}
                <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[120px]">
                  <div className="text-xs text-slate-400 font-sans">Relief from Royalty Valuation</div>
                  <div>
                    <span className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono tracking-tight block">
                      ${reliefFromRoyaltyValue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                    Value benchmark mapped against proprietary royalty licensing offsets of custom intellectual property.
                  </p>
                </div>

              </div>

              {/* Productivity Waste Risk Card */}
              <div className="p-5 bg-rose-950/5 border border-rose-500/10 rounded-2xl flex items-start gap-3.5">
                <ShieldAlert className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">Annual Friction Surcharge Debt</h4>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15">
                      -${annualInterestDebtCost.toLocaleString()} / year
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    With a <strong className="text-slate-300">{wastePercent}% operational drag heuristic</strong>, developer cycles are leaking into remedial task workloads, resulting in ongoing waste overhead.
                  </p>

                  <div className="h-[1px] bg-white/5 my-2" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1.5">
                    <span className="text-emerald-400 font-semibold">Recoupable via Grader Core Fixes:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      +${potentialSavingsPro.toLocaleString()} Recovered / Yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive ROI chart summary */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold font-mono">ROI Investment Yield analysis</span>
                  <span className="text-xs text-emerald-400 font-bold">Payback Cycle: ~1.2 Months</span>
                </div>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Implementing core compliance corrections:</span>
                    <span className="text-slate-200">Est. 28 Engineering Hours ($2,380 effort)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Targeted developer speedup multiplier:</span>
                    <span className="text-emerald-400 font-bold">+15.4% efficiency yield</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Return on investment index:</span>
                    <span className="text-indigo-400 font-extrabold text-xs">1,020% Annualised Yield</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        // TAB B: BRAND NEW GRADER UNIT ECONOMICS & COMPUTE REALITY COCKPIT
        <div className="space-y-6 animate-fadeIn pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3 font-display">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Grader Business Scaling & Compute Reality Cockpit
              </h3>
              <p className="text-[11px] text-slate-400">
                Stress-test the high-volume model of Grader's $5 base subscription and optional deterministic add-on packages.
              </p>
            </div>
            <div className="py-1 px-2.5 bg-yellow-500/10 text-yellow-300 text-[10px] font-mono rounded uppercase tracking-wider font-semibold border border-yellow-500/20">
              Compute Multiplier Target
            </div>
          </div>

          {/* MAIN GRID - THREE COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-display">
            
            {/* COLUMN 1: SELECT PLAN & INTERACTIVE TUNERS (col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PLAN SELECTION CONTAINER */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">1. Select Target Customer Archetype</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedPlanId === p.id 
                          ? "bg-indigo-950/25 border-indigo-500 text-white shadow-sm font-bold" 
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-white truncate">{p.name}</span>
                        <span className="text-indigo-400 font-extrabold">
                          ${p.price}{p.interval === "month" || p.id === "pro_annual" ? "/mo" : ""}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-tight block truncate lowercase font-sans">
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* OPTIONS BUILDER FOR ADD-ON ITEMS */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-1 border-b border-white/5">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">2. Layered Add-On Suite</span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 rounded-full py-0.2">+Profit center</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Monitored Repos slider */}
                  <div className="space-y-1 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                      <span className="font-semibold">Continuous Repo Monitoring:</span>
                      <span className="text-amber-400 font-bold">{monitoredReposCount} Repos (+${monitoredReposCount * 2}/mo)</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="10"
                      value={monitoredReposCount}
                      onChange={(e) => setMonitoredReposCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Auto-scans every push. Includes team alerts on score drop.</span>
                  </div>

                  {/* Deep Market Intelligence scans slider */}
                  <div className="space-y-1 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                      <span className="font-semibold">Deep Market Analysis Add-on:</span>
                      <span className="text-amber-400 font-bold">{deepMarketScansCount} / month (+${deepMarketScansCount * 3}/mo)</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="5"
                      value={deepMarketScansCount}
                      onChange={(e) => setDeepMarketScansCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[9px] text-slate-500 font-mono block">Adds feature-gap map metrics and monetization forecasting.</span>
                  </div>

                  {/* API Power Pack checkbox */}
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-950/30 rounded-xl border border-white/5 cursor-pointer text-slate-300 select-none hover:bg-slate-950/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={apiPowerPack}
                      onChange={(e) => setApiPowerPack(e.target.checked)}
                      className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <div className="space-y-0.2">
                      <div className="flex justify-between w-full items-baseline">
                        <span className="font-semibold block text-[11px]">API Power Pack Add-On</span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold shrink-0 ml-2">+$5/mo</span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-normal block font-mono">Adds 1,000 extra CI/CD requests with customizable webhook outputs.</span>
                    </div>
                  </label>

                  {/* White label exports */}
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-950/30 rounded-xl border border-white/5 cursor-pointer text-slate-300 select-none hover:bg-slate-950/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={whiteLabelReports}
                      onChange={(e) => setWhiteLabelReports(e.target.checked)}
                      className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <div className="space-y-0.2">
                      <div className="flex justify-between w-full items-baseline">
                        <span className="font-semibold block text-[11px]">White-Label Reports</span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold shrink-0 ml-2">+$10/mo</span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-normal block font-mono">Removes Grader branding from PDFs & embeds for agencies.</span>
                    </div>
                  </label>

                  {/* Priority Queue */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-slate-950/30 rounded-xl border border-white/5 cursor-pointer text-slate-300 select-none hover:bg-slate-950/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={priorityQueue}
                        onChange={(e) => setPriorityQueue(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="leading-tight">
                        <span className="font-semibold block text-[10px]">Priority Scan Queue</span>
                        <span className="text-[9px] text-indigo-400 font-mono">+$3/mo</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-950/30 rounded-xl border border-white/5 cursor-pointer text-slate-300 select-none hover:bg-slate-950/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={badgeAnalytics}
                        onChange={(e) => setBadgeAnalytics(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="leading-tight">
                        <span className="font-semibold block text-[10px]">Badge Traffic Stats</span>
                        <span className="text-[9px] text-indigo-400 font-mono">+$2/mo</span>
                      </div>
                    </label>
                  </div>

                </div>
              </div>

            </div>

            {/* COLUMN 2: CACHE STRESS TEST & COMPUTE COST PROFILE (col-span-4) */}
            <div className="lg:col-span-4 space-y-6 pb-2">
              
              {/* CHIP ECONOMICS COMPUTE PROFILE CARD */}
              <div className="p-4 bg-indigo-950/10 border border-indigo-500/20 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">3. Compute Cost Reality Tunnel</span>
                    <h5 className="text-[11px] font-bold text-white font-sans">Lockfile & AST Cache Efficiency</h5>
                  </div>
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>

                {/* Cache hit slider */}
                <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-slate-400">Lockfile / AST Cache Hit Ratio:</span>
                    <span className="text-indigo-300 font-bold">{cacheHitRatio}%</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={cacheHitRatio}
                    onChange={(e) => setCacheHitRatio(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-550"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>90% target in volume</span>
                    <span>No-AI Deterministic</span>
                  </div>
                </div>

                {/* Agent cost breakdowns dynamically modified by Slider */}
                <div className="space-y-1 text-[9px] font-mono">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Compute Cost/Scan Breakdown:</span>
                  
                  {[
                    { agent: "Lint & Complexity", cold: 0.04, cached: 0.02, desc: "Saves AST trees via file hash" },
                    { agent: "Secrets & Credentials", cold: 0.02, cached: 0.01, desc: "Lightweight regex grep engine" },
                    { agent: "Dependency Advisor (CVE)", cold: 0.03, cached: 0.005, desc: "90% lockfile hash database matches" },
                    { agent: "Deduplication & Dead Code", cold: 0.04, cached: 0.02, desc: "Incremental code segment comparisons" },
                    { agent: "OSS License Risks", cold: 0.01, cached: 0.005, desc: "Manifest matching" },
                    { agent: "Setup Friction MicroVMs", cold: 0.07, cached: 0.03, desc: "Firecracker sandbox layers" },
                    { agent: "JSON Assembler & Badge", cold: 0.002, cached: 0.001, desc: "Sub-millisecond outputs" }
                  ].map((layer, id) => {
                    const blendedCost = getBlendedAgentCost(layer.cold, layer.cached);
                    return (
                      <div key={id} className="p-1.5 bg-black/45 rounded border border-white/5 flex justify-between items-center leading-normal">
                        <div>
                          <div className="text-slate-200 font-bold">{layer.agent}</div>
                          <div className="text-[8px] text-slate-500 block leading-none font-sans font-normal mt-0.5">{layer.desc}</div>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0">${blendedCost.toFixed(3)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-[#0a0c10] border border-indigo-500/10 rounded-xl flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Avg. Scan Cost Profile:</span>
                  <div className="text-right">
                    <span className="text-white font-extrabold block text-xs">${blendedScanCost.toFixed(3)}</span>
                    <span className="text-[8px] text-slate-500">
                      (Cold: $0.26 | Cache: $0.12)
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* COLUMN 3: UNIT ECONOMICS RUNSHEET & FINANCIAL RESULT CARD (col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* COMPREHENSIVE LTV & UNIT PROFITABILITY SUMMARY */}
              <div className="bg-[#12141c] border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between min-h-[440px]">
                
                <div className="space-y-1.5 pb-2 border-b border-white/10">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">4. Year 1 Economics Results</span>
                  <h4 className="text-sm font-bold text-white leading-tight font-sans">Single Customer Profit Yield</h4>
                </div>

                {/* Key KPIs Stack */}
                <div className="space-y-4 font-mono">
                  
                  {/* Revenue metrics row */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold">Annual Invoiced Value (AIV)</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-emerald-400">${grossAnnualRevenue.toLocaleString()} / yr</span>
                      <span className="text-[10px] text-slate-350">
                        (${Math.round(grossAnnualRevenue / 12 * 10) / 10}/mo)
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-450 flex justify-between font-sans leading-none pt-0.5">
                      <span>Base Plan: ${baseAnnualRevenue}/yr</span>
                      <span>Add-ons: ${totalAddOnsAnnual}/yr</span>
                    </div>
                  </div>

                  {/* Scans made vs compute costs */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Scans/commits run:</span>
                      <span className="text-slate-200 font-bold">{totalScansInvoiced} scans</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Annual compute burned:</span>
                      <span className="text-rose-400 font-bold">${annualComputeCost.toFixed(2)}</span>
                    </div>
                    <p className="text-[9px] text-slate-550 leading-tight font-sans">
                      Includes scheduled hooks and push scans mapped to monitored repos.
                    </p>
                  </div>

                  {/* Net Profit Margin bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] items-baseline">
                      <span className="text-slate-400 uppercase text-[9px] block">Gross Margin Heuristic</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {grossProfitMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${grossProfitMargin}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 leading-none">
                      <span>Compute: ${annualComputeCost.toFixed(2)}</span>
                      <span>Net: ${netAnnualProfit.toFixed(2)} / yr</span>
                    </div>
                  </div>

                  {/* Revenue Multiplier Factor */}
                  <div className="p-3 bg-yellow-950/10 border border-yellow-500/10 rounded-xl leading-normal text-[10px]">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-yellow-400 font-semibold uppercase text-[9px]">Expansion Coefficient</span>
                      <span className="font-extrabold text-white">{revenueMultiplier.toFixed(1)}x upsell</span>
                    </div>
                    <p className="text-slate-400 leading-tight font-sans text-[9px]">
                      Optional high-value deterministic add-ons expanded client lifetime value {revenueMultiplier.toFixed(1)}x over the standard base tier.
                    </p>
                  </div>

                </div>

                {/* Final verdict paragraph */}
                <div className="pt-2">
                  <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[10px] font-sans text-indigo-200/90 leading-relaxed font-semibold">
                    💡 <strong>Vibe coder scale target:</strong> At 10,000 customers on Spotify-like pricing, this model generates <strong>${(grossAnnualRevenue * 10000).toLocaleString()} Annual Recurring Revenue (ARR)</strong> with a minimal cloud compute margin surcharge under $20k.
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
