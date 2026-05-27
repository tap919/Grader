import React, { useState, useEffect } from "react"
import { Brain, Cpu, DollarSign, TrendingUp, TrendingDown, Activity, BarChart2, Zap, AlertTriangle, CheckCircle2, Users, ShoppingCart, CreditCard, Target, PieChart, LineChart, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "motion/react"

interface RevenueDashboardProps {
  dashboardData?: any
  onSyncData?: () => void
  onOptimize?: () => void
}

export function RevenueDashboard({ 
  dashboardData: initialData,
  onSyncData,
  onOptimize,
}: RevenueDashboardProps) {
  const [data, setData] = useState<any>(initialData || getDefaultData())
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "pipeline" | "agents">("overview")
  
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev: any) => ({
        ...prev,
        currentPerformance: {
          ...prev.currentPerformance,
          mrr: prev.currentPerformance.mrr + (Math.random() > 0.6 ? Math.random() * 50 : -Math.random() * 30),
          newMrr30: prev.currentPerformance.newMrr30 + (Math.random() > 0.7 ? Math.random() * 20 : -Math.random() * 10),
          pipelineValue: prev.currentPerformance.pipelineValue + (Math.random() > 0.5 ? Math.random() * 100 : -Math.random() * 50),
        },
      }))
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  const getPerformanceStatus = (metric: string, value: number, target: number): { status: string, color: string } => {
    const ratio = value / target
    if (ratio >= 1.1) return { status: "exceeding", color: "text-emerald-500" }
    if (ratio >= 0.9) return { status: "on_track", color: "text-blue-500" }
    if (ratio >= 0.7) return { status: "warning", color: "text-amber-500" }
    return { status: "critical", color: "text-red-500" }
  }
  
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />
    if (current < previous) return <ArrowDownRight className="w-4 h-4 text-red-500" />
    return <Zap className="w-4 h-4 text-blue-500" />
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/50 backdrop-blur-md">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">REVENUE BRAINSTEM</CardTitle>
                  <CardDescription className="text-xs font-mono uppercase tracking-widest">
                    CRO IN CODE - CLOSED REVENUE LOOP
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-500">
                ACTIVE
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RevenueMetricCard 
                icon={Target} 
                label="MRR Target" 
                value={`$${data.targets.mrrTarget.toLocaleString()}`}
                current={data.currentPerformance.mrr}
                target={data.targets.mrrTarget}
              />
              <RevenueMetricCard 
                icon={DollarSign} 
                label="Current MRR" 
                value={`$${Math.floor(data.currentPerformance.mrr).toLocaleString()}`}
                current={data.currentPerformance.mrr}
                previous={data.currentPerformance.mrr - data.currentPerformance.newMrr30}
              />
              <RevenueMetricCard 
                icon={TrendingUp} 
                label="Net New MRR" 
                value={`$${Math.floor(data.currentPerformance.netNewMrr).toLocaleString()}`}
                current={data.currentPerformance.netNewMrr}
                target={data.targets.mrrTarget * 0.1}
              />
              <RevenueMetricCard 
                icon={PieChart} 
                label="Pipeline" 
                value={`$${Math.floor(data.currentPerformance.pipelineValue).toLocaleString()}`}
                current={data.currentPerformance.pipelineValue}
                target={data.targets.mrrTarget * 3}
              />
            </div>
            
            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PerformanceIndicator 
                label="CAC" 
                value={`$${Math.floor(data.currentPerformance.cac).toLocaleString()}`}
                target={data.targets.maxCac}
                current={data.currentPerformance.cac}
              />
              <PerformanceIndicator 
                label="Close Rate" 
                value={`${data.currentPerformance.closeRate.toFixed(1)}%`}
                target={data.targets.targetCloseRate}
                current={data.currentPerformance.closeRate}
              />
              <PerformanceIndicator 
                label="Churn Rate" 
                value={`${data.currentPerformance.churnRate.toFixed(1)}%`}
                target={data.targets.targetChurnRate}
                current={data.currentPerformance.churnRate}
                inverse={true}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={onSyncData}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest"
              >
                <Zap className="w-4 h-4 mr-2" />
                Sync Data
              </Button>
              <Button 
                onClick={onOptimize}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-[10px] tracking-widest"
              >
                <Target className="w-4 h-4 mr-2" />
                Optimize Plan
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Views */}
        {activeTab === "overview" && (
          <OverviewView data={data} />
        )}
        {activeTab === "performance" && (
          <PerformanceView data={data} />
        )}
        {activeTab === "pipeline" && (
          <PipelineView data={data} />
        )}
        {activeTab === "agents" && (
          <AgentsView data={data} />
        )}
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <TabButton 
                active={activeTab === "overview"} 
                onClick={() => setActiveTab("overview")}
                icon={BarChart2}
                label="Overview"
              />
              <TabButton 
                active={activeTab === "performance"} 
                onClick={() => setActiveTab("performance")}
                icon={Activity}
                label="Performance"
              />
              <TabButton 
                active={activeTab === "pipeline"} 
                onClick={() => setActiveTab("pipeline")}
                icon={LineChart}
                label="Pipeline"
              />
              <TabButton 
                active={activeTab === "agents"} 
                onClick={() => setActiveTab("agents")}
                icon={Users}
                label="Agents"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Health */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Revenue Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthItem 
              label="MRR Growth" 
              value={`${((data.currentPerformance.netNewMrr / Math.max(1, data.currentPerformance.mrr - data.currentPerformance.netNewMrr)) * 100).toFixed(1)}%`}
              status={data.currentPerformance.netNewMrr > 0 ? "healthy" : "warning"}
            />
            <HealthItem 
              label="CAC Payback" 
              value={`${(data.currentPerformance.cac / ((data.currentPerformance.mrr || 1) / (data.currentPerformance.customerCount || 1))).toFixed(1)} months`}
              status={data.currentPerformance.cac / ((data.currentPerformance.mrr || 1) / (data.currentPerformance.customerCount || 1)) < data.targets.maxPaybackMonths ? "healthy" : "warning"}
            />
            <HealthItem 
              label="LTV/CAC" 
              value={`${(data.currentPerformance.ltv / Math.max(1, data.currentPerformance.cac)).toFixed(1)}x`}
              status={data.currentPerformance.ltv / Math.max(1, data.currentPerformance.cac) > 3 ? "healthy" : "warning"}
            />
            <HealthItem 
              label="Pipeline Coverage" 
              value={`${(data.currentPerformance.pipelineValue / data.targets.mrrTarget).toFixed(1)}x`}
              status={data.currentPerformance.pipelineValue / data.targets.mrrTarget > 2.5 ? "healthy" : "warning"}
            />
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction 
              icon={Zap} 
              label="Run All Agents" 
              onClick={() => console.log("Run all agents")}
            />
            <QuickAction 
              icon={Target} 
              label="Set New Target" 
              onClick={() => console.log("Set new target")}
            />
            <QuickAction 
              icon={ShoppingCart} 
              label="Launch Campaign" 
              onClick={() => console.log("Launch campaign")}
            />
            <QuickAction 
              icon={CreditCard} 
              label="Process Payments" 
              onClick={() => console.log("Process payments")}
            />
          </CardContent>
        </Card>
        
        {/* Data Sources */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.connectedSources.map((source: any) => (
              <DataSourceItem 
                key={source.id}
                name={source.name}
                type={source.type}
                status={source.status}
                lastSync={source.lastSync}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RevenueMetricCard({ icon: Icon, label, value, current, target, previous }: {
  icon: React.ComponentType<any>
  label: string
  value: string
  current?: number
  target?: number
  previous?: number
}) {
  const hasTarget = target !== undefined && current !== undefined
  const hasTrend = previous !== undefined && current !== undefined
  
  const getStatus = () => {
    if (!hasTarget) return null
    const ratio = current! / target!
    if (ratio >= 1.1) return { text: "Exceeding", color: "text-emerald-500", bg: "bg-emerald-500/10" }
    if (ratio >= 0.9) return { text: "On Track", color: "text-blue-500", bg: "bg-blue-500/10" }
    if (ratio >= 0.7) return { text: "Warning", color: "text-amber-500", bg: "bg-amber-500/10" }
    return { text: "Critical", color: "text-red-500", bg: "bg-red-500/10" }
  }
  
  const status = getStatus()
  const trend = hasTrend ? (current! > previous! ? "up" : current! < previous! ? "down" : "stable") : null
  
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase font-mono">{label}</p>
          <p className="text-xl font-black text-foreground">{value}</p>
          {hasTrend && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              {trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
              {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
              {trend === "stable" && <Zap className="w-3 h-3 text-blue-500" />}
              {trend === "up" && "+"} {((Math.abs(current! - previous!) / previous!) * 100).toFixed(1)}%
            </p>
          )}
        </div>
        {status && (
          <Badge variant="outline" className={`ml-auto font-mono text-[8px] uppercase tracking-widest ${status.color} ${status.bg}`}>
            {status.text}
          </Badge>
        )}
      </div>
      {hasTarget && (
        <div className="mt-3">
          <Progress value={(current! / target!) * 100} className="h-1" />
          <p className="text-[10px] text-muted-foreground font-mono mt-1 text-right">
            {((current! / target!) * 100).toFixed(0)}% of target
          </p>
        </div>
      )}
    </div>
  )
}

function PerformanceIndicator({ label, value, current, target, inverse = false }: {
  label: string
  value: string
  current: number
  target: number
  inverse?: boolean
}) {
  const ratio = current / target
  const performance = inverse ? 1 - ratio : ratio
  
  let status, color, bg
  if (performance >= 1.1) { status = "exceeding"; color = "text-emerald-500"; bg = "bg-emerald-500/10" }
  else if (performance >= 0.9) { status = "on_track"; color = "text-blue-500"; bg = "bg-blue-500/10" }
  else if (performance >= 0.7) { status = "warning"; color = "text-amber-500"; bg = "bg-amber-500/10" }
  else { status = "critical"; color = "text-red-500"; bg = "bg-red-500/10" }
  
  return (
    <div className="p-3 rounded-xl border border-border/30 bg-card/50">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-black text-sm">{value}</p>
        <Badge variant="outline" className={`ml-auto font-mono text-[8px] uppercase tracking-widest ${color} ${bg}`}>
          {status.replace("_", " ")}
        </Badge>
      </div>
      <Progress value={Math.min(100, performance * 100)} className="h-1 mt-2" />
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<any>
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        active 
          ? "bg-primary/10 text-primary font-black"
          : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function OverviewView({ data }: { data: any }) {
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
          <div className="p-3 rounded-lg bg-primary/10">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Current Run Rate</p>
            <p className="text-2xl font-black">${Math.floor(data.currentPerformance.mrr * 12).toLocaleString()}</p>
            <p className="text-sm font-medium text-emerald-500">
              ${Math.floor(data.currentPerformance.netNewMrr).toLocaleString()} net new MRR
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <OverviewStat 
            label="Customers" 
            value={data.currentPerformance.customerCount.toString()}
            icon={Users}
          />
          <OverviewStat 
            label="Avg. Revenue/Customer" 
            value={`$${(data.currentPerformance.mrr / data.currentPerformance.customerCount).toFixed(2)}`}
            icon={CreditCard}
          />
          <OverviewStat 
            label="LTV" 
            value={`$${Math.floor(data.currentPerformance.ltv).toLocaleString()}`}
            icon={TrendingUp}
          />
          <OverviewStat 
            label="LTV/CAC" 
            value={`${(data.currentPerformance.ltv / Math.max(1, data.currentPerformance.cac)).toFixed(1)}x`}
            icon={Zap}
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Weekly Progress</p>
          <div className="space-y-1">
            {data.performanceHistory.slice(-7).reverse().map((day: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/20">
                <span className="text-xs font-mono text-muted-foreground w-20">
                  {new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <Progress value={(day.mrr / Math.max(1, data.targets.mrrTarget)) * 100} className="flex-1 h-2" />
                <span className="text-xs font-black w-16">${Math.floor(day.mrr).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceView({ data }: { data: any }) {
  const performanceReport = {
    mrr: {
      current: data.currentPerformance.mrr,
      target: data.targets.mrrTarget,
      variance: data.currentPerformance.mrr - data.targets.mrrTarget,
      onTrack: data.currentPerformance.mrr >= data.targets.mrrTarget * 0.9,
    },
    cac: {
      current: data.currentPerformance.cac,
      target: data.targets.maxCac,
      variance: data.currentPerformance.cac - data.targets.maxCac,
      onTrack: data.currentPerformance.cac <= data.targets.maxCac,
    },
    paybackPeriod: {
      current: data.currentPerformance.cac / ((data.currentPerformance.mrr || 1) / (data.currentPerformance.customerCount || 1)),
      target: data.targets.maxPaybackMonths,
      onTrack: (data.currentPerformance.cac / ((data.currentPerformance.mrr || 1) / (data.currentPerformance.customerCount || 1))) <= data.targets.maxPaybackMonths,
    },
    closeRate: {
      current: data.currentPerformance.closeRate,
      target: data.targets.targetCloseRate,
      variance: data.currentPerformance.closeRate - data.targets.targetCloseRate,
      onTrack: data.currentPerformance.closeRate >= data.targets.targetCloseRate * 0.9,
    },
  }
  
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Performance Against Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PerformanceDetail 
          label="MRR" 
          current={performanceReport.mrr.current}
          target={performanceReport.mrr.target}
          variance={performanceReport.mrr.variance}
          onTrack={performanceReport.mrr.onTrack}
          format="currency"
        />
        <PerformanceDetail 
          label="CAC" 
          current={performanceReport.cac.current}
          target={performanceReport.cac.target}
          variance={performanceReport.cac.variance}
          onTrack={performanceReport.cac.onTrack}
          format="currency"
          inverse={true}
        />
        <PerformanceDetail 
          label="Payback Period" 
          current={performanceReport.paybackPeriod.current}
          target={performanceReport.paybackPeriod.target}
          variance={performanceReport.paybackPeriod.current - performanceReport.paybackPeriod.target}
          onTrack={performanceReport.paybackPeriod.onTrack}
          format="decimal"
          suffix=" months"
          inverse={true}
        />
        <PerformanceDetail 
          label="Close Rate" 
          current={performanceReport.closeRate.current}
          target={performanceReport.closeRate.target}
          variance={performanceReport.closeRate.variance}
          onTrack={performanceReport.closeRate.onTrack}
          format="percentage"
        />
        
        <div className="p-4 rounded-xl bg-card/50 border border-border/30">
          <p className="text-sm font-semibold mb-3">Overall Performance Score</p>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <motion.circle 
                className="text-primary"
                cx="50%"
                cy="50%"
                r="40%"
                strokeWidth="8"
                fill="transparent"
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: "188.4 251.2" }}
                transition={{ duration: 1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black">84</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">On track for monthly target</p>
              <p className="text-xs text-muted-foreground">3 key metrics exceeding expectations</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PipelineView({ data }: { data: any }) {
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Revenue Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
          <div className="p-3 rounded-lg bg-primary/10">
            <LineChart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Pipeline Value</p>
            <p className="text-2xl font-black">${Math.floor(data.currentPerformance.pipelineValue).toLocaleString()}</p>
            <p className="text-sm font-medium">
              {((data.currentPerformance.pipelineValue / data.targets.mrrTarget) * 100).toFixed(1)}% of target
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Pipeline Breakdown</p>
          <PipelineStage label="Prospecting" value={30} color="bg-blue-500" />
          <PipelineStage label="Qualified" value={25} color="bg-purple-500" />
          <PipelineStage label="Proposal" value={20} color="bg-indigo-500" />
          <PipelineStage label="Negotiation" value={15} color="bg-violet-500" />
          <PipelineStage label="Closed Won" value={10} color="bg-emerald-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <PipelineStat label="Avg Deal Size" value={`$${(data.currentPerformance.pipelineValue / 20).toFixed(0)}`} />
          <PipelineStat label="Win Rate" value="35%" />
          <PipelineStat label="Sales Cycle" value="14 days" />
          <PipelineStat label="Deals in Pipeline" value="20" />
        </div>
      </CardContent>
    </Card>
  )
}

function AgentsView({ data }: { data: any }) {
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Revenue Agents Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.agentStatus.map((agent: any) => (
          <AgentStatusCard 
            key={agent.type}
            type={agent.type}
            status={agent.status}
            lastActivity={agent.lastActivity}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function OverviewStat({ label, value, icon: Icon }: {
  label: string
  value: string
  icon: React.ComponentType<any>
}) {
  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/30">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-black">{value}</span>
      </div>
    </div>
  )
}

function PerformanceDetail({ label, current, target, variance, onTrack, format = "currency", suffix = "", inverse = false }: {
  label: string
  current: number
  target: number
  variance: number
  onTrack: boolean
  format?: "currency" | "percentage" | "decimal"
  suffix?: string
  inverse?: boolean
}) {
  const formatValue = (value: number) => {
    switch (format) {
      case "currency": return `$${Math.floor(value).toLocaleString()}`
      case "percentage": return `${value.toFixed(1)}%`
      case "decimal": return `${value.toFixed(2)}${suffix}`
      default: return value.toString()
    }
  }
  
  const status = onTrack ? "on_track" : "off_track"
  const color = onTrack ? "text-emerald-500" : "text-red-500"
  const bg = onTrack ? "bg-emerald-500/10" : "bg-red-500/10"
  
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-2xl font-black">{formatValue(current)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Target: {formatValue(target)} • {inverse ? "Lower" : "Higher"} is better
          </p>
        </div>
        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${color} ${bg} mt-1`}>
          {status.replace("_", " ")}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Progress 
          value={Math.min(100, Math.max(0, (inverse ? (1 - (current / target)) : (current / target)) * 100))}
          className="flex-1 h-2"
        />
        <span className={`text-xs font-black ${variance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          {variance >= 0 ? "+" : ""}{formatValue(Math.abs(variance))}
        </span>
      </div>
    </div>
  )
}

function PipelineStage({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-muted-foreground w-20">{label}</span>
      <Progress value={value} className={`flex-1 h-3 ${color}`} />
      <span className="text-xs font-black w-8">{value}%</span>
    </div>
  )
}

function PipelineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/30">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  )
}

function AgentStatusCard({ type, status, lastActivity }: { type: string; status: string; lastActivity: Date }) {
  const getAgentName = (type: string) => {
    switch (type) {
      case "market_intelligence": return "Market Intelligence"
      case "outbound_sales": return "Outbound Sales"
      case "inbound_conversion": return "Inbound Conversion"
      case "content_funnel": return "Content & Funnel"
      case "pricing_offer": return "Pricing & Offers"
      case "retention_expansion": return "Retention & Expansion"
      default: return type
    }
  }
  
  const getStatusProps = () => {
    switch (status) {
      case "operational": return { color: "text-emerald-500", bg: "bg-emerald-500/10", text: "Operational" }
      case "degraded": return { color: "text-amber-500", bg: "bg-amber-500/10", text: "Degraded" }
      case "offline": return { color: "text-gray-500", bg: "bg-gray-500/10", text: "Offline" }
      default: return { color: "text-blue-500", bg: "bg-blue-500/10", text: status }
    }
  }
  
  const props = getStatusProps()
  
  return (
    <div className="p-3 rounded-lg bg-card/30 border border-border/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{getAgentName(type)}</p>
          <p className="text-[10px] text-muted-foreground">
            Last active: {lastActivity.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${props.color} ${props.bg}`}>
        {props.text}
      </Badge>
    </div>
  )
}

function HealthItem({ label, value, status }: { label: string; value: string; status: string }) {
  const getStatusProps = () => {
    switch (status) {
      case "healthy": return { color: "text-emerald-500", text: "Optimal" }
      case "warning": return { color: "text-amber-500", text: "Monitor" }
      default: return { color: "text-gray-500", text: "Stable" }
    }
  }
  
  const props = getStatusProps()
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-card/30 border border-border/20">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black">{value}</span>
        <span className={`text-[10px] font-mono uppercase ${props.color}`}>{props.text}</span>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }: {
  icon: React.ComponentType<any>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-all text-sm font-medium"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span>{label}</span>
    </button>
  )
}

function DataSourceItem({ name, type, status, lastSync }: {
  name: string
  type: string
  status: string
  lastSync: Date
}) {
  const getStatusProps = () => {
    switch (status) {
      case "connected": return { color: "text-emerald-500", text: "Connected" }
      case "syncing": return { color: "text-blue-500", text: "Syncing" }
      case "error": return { color: "text-red-500", text: "Error" }
      default: return { color: "text-gray-500", text: status }
    }
  }
  
  const props = getStatusProps()
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-card/30 border border-border/20">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-[10px] text-muted-foreground font-mono">({type})</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono uppercase ${props.color}`}>{props.text}</span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {lastSync.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function getDefaultData() {
  const now = new Date()
  
  return {
    targets: {
      mrrTarget: 100000,
      maxCac: 2500,
      maxPaybackMonths: 12,
      targetCloseRate: 25,
      targetChurnRate: 3,
    },
    currentPerformance: {
      mrr: 85000,
      newMrr30: 8500,
      churnMrr30: 3500,
      netNewMrr: 5000,
      cac: 1800,
      ltv: 24000,
      closeRate: 22.5,
      churnRate: 4.2,
      pipelineValue: 250000,
      customerCount: 425,
    },
    performanceHistory: Array(7).fill(0).map((_, i) => ({
      timestamp: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
      mrr: 85000 + (Math.random() > 0.5 ? Math.random() * 2000 : -Math.random() * 1000),
    })),
    agentStatus: [
      { type: "market_intelligence", status: "operational", lastActivity: new Date() },
      { type: "outbound_sales", status: "operational", lastActivity: new Date() },
      { type: "inbound_conversion", status: "operational", lastActivity: new Date() },
      { type: "content_funnel", status: "operational", lastActivity: new Date() },
      { type: "pricing_offer", status: "operational", lastActivity: new Date() },
      { type: "retention_expansion", status: "operational", lastActivity: new Date() },
    ],
    connectedSources: [
      { id: "1", name: "Stripe", type: "stripe", status: "connected", lastSync: new Date() },
      { id: "2", name: "HubSpot", type: "hubspot", status: "connected", lastSync: new Date() },
      { id: "3", name: "Google Analytics", type: "google_analytics", status: "connected", lastSync: new Date() },
    ],
  }
}
