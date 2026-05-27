import React, { useState, useEffect } from "react"
import { Brain, Cpu, DollarSign, TrendingUp, Activity, BarChart2, Zap, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "motion/react"

interface AutonomousBrainDashboardProps {
  brainStatus?: any
  onGenerateRevenue?: () => void
  onOptimize?: () => void
}

export function AutonomousBrainDashboard({ 
  brainStatus: initialStatus,
  onGenerateRevenue,
  onOptimize,
}: AutonomousBrainDashboardProps) {
  const [status, setStatus] = useState<any>(initialStatus || getDefaultStatus())
  const [activeTab, setActiveTab] = useState<"performance" | "revenue" | "learning">("performance")
  
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus)
    }
  }, [initialStatus])
  
  // Simulate autonomous updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev: any) => ({
        ...prev,
        uptimeHours: prev.uptimeHours + 0.1,
        coreStats: {
          ...prev.coreStats,
          totalCalls: prev.coreStats.totalCalls + Math.floor(Math.random() * 3),
        },
        revenueStats: {
          ...prev.revenueStats,
          totalRevenue: prev.revenueStats.totalRevenue + (Math.random() > 0.7 ? Math.random() * 50 : 0),
        },
        learningStats: {
          ...prev.learningStats,
          totalExperiences: prev.learningStats.totalExperiences + Math.floor(Math.random() * 2),
        },
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  const getStatusColor = () => {
    switch (status.systemStatus) {
      case "operational": return "text-emerald-500"
      case "degraded": return "text-amber-500"
      case "shutting_down": return "text-blue-500"
      case "offline": return "text-gray-500"
      default: return "text-primary"
    }
  }
  
  const getRevenueTrend = () => {
    const hourlyRate = status.revenueStats.totalRevenue / Math.max(1, status.uptimeHours)
    if (hourlyRate > 100) return { trend: "up", color: "text-emerald-500", label: "High growth" }
    if (hourlyRate > 50) return { trend: "up", color: "text-green-500", label: "Steady growth" }
    if (hourlyRate > 10) return { trend: "stable", color: "text-blue-500", label: "Stable" }
    return { trend: "down", color: "text-amber-500", label: "Needs attention" }
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
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">AUTONOMOUS BRAIN CORE</CardTitle>
                  <CardDescription className="text-xs font-mono uppercase tracking-widest">
                    SELF-OPTIMIZING AI SYSTEM v3.0
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest border-emerald-500/30 ${getStatusColor()}`}>
                {status.systemStatus.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {/* System Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={Cpu} 
                label="Uptime" 
                value={`${status.uptimeHours.toFixed(1)}h`}
                subtitle="System operational time"
              />
              <StatCard 
                icon={Zap} 
                label="AI Calls" 
                value={status.coreStats.totalCalls.toString()}
                subtitle="Total generations"
              />
              <StatCard 
                icon={DollarSign} 
                label="Revenue" 
                value={`$${status.revenueStats.totalRevenue.toFixed(0)}`}
                subtitle="Generated revenue"
              />
              <StatCard 
                icon={TrendingUp} 
                label="Learning" 
                value={status.learningStats.totalExperiences.toString()}
                subtitle="Experiences learned"
              />
            </div>
            
            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusIndicator 
                icon={CheckCircle2} 
                label="Core Performance" 
                value={`${(100 - status.coreStats.errorRate * 100).toFixed(1)}%`}
                status={status.coreStats.errorRate < 0.05 ? "healthy" : status.coreStats.errorRate < 0.1 ? "stable" : "warning"}
              />
              <StatusIndicator 
                icon={DollarSign} 
                label="Revenue Generation" 
                value={getRevenueTrend().label}
                status={getRevenueTrend().trend}
              />
              <StatusIndicator 
                icon={Activity} 
                label="Learning System" 
                value={`${status.learningStats.successRate.toFixed(1)}%`}
                status={status.learningStats.successRate > 80 ? "healthy" : "stable"}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={onGenerateRevenue}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-[10px] tracking-widest"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Revenue
              </Button>
              <Button 
                onClick={onOptimize}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest"
              >
                <Zap className="w-4 h-4 mr-2" />
                Self-Optimize
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Views */}
        {activeTab === "performance" && (
          <PerformanceView status={status} />
        )}
        {activeTab === "revenue" && (
          <RevenueView status={status} />
        )}
        {activeTab === "learning" && (
          <LearningView status={status} />
        )}
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <TabButton 
                active={activeTab === "performance"} 
                onClick={() => setActiveTab("performance")}
                icon={BarChart2}
                label="Performance"
              />
              <TabButton 
                active={activeTab === "revenue"} 
                onClick={() => setActiveTab("revenue")}
                icon={DollarSign}
                label="Revenue"
              />
              <TabButton 
                active={activeTab === "learning"} 
                onClick={() => setActiveTab("learning")}
                icon={Activity}
                label="Learning"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* System Health */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthItem label="Core Stability" value="94%" status="healthy" />
            <HealthItem label="Memory Usage" value="62%" status="stable" />
            <HealthItem label="API Connectivity" value="100%" status="healthy" />
            <HealthItem label="Self-Improvement" value="Active" status="healthy" />
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <Card className="bg-card/40 border-border/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickStat label="Error Rate" value={`${(status.coreStats.errorRate * 100).toFixed(2)}%`} />
            <QuickStat label="Success Rate" value={`${(100 - status.coreStats.errorRate * 100).toFixed(1)}%`} />
            <QuickStat label="Avg Latency" value={`${status.coreStats.avgLatencyMs}ms`} />
            <QuickStat label="Opportunities" value={status.revenueStats.activeOpportunities.toString()} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtitle }: {
  icon: React.ComponentType<any>
  label: string
  value: string
  subtitle: string
}) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-mono">{label}</p>
          <p className="text-xl font-black text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function StatusIndicator({ icon: Icon, label, value, status }: {
  icon: React.ComponentType<any>
  label: string
  value: string
  status: "healthy" | "stable" | "warning" | "up" | "down"
}) {
  const getStatusProps = () => {
    switch (status) {
      case "healthy": return { color: "text-emerald-500", bg: "bg-emerald-500/10", text: "Healthy" }
      case "stable": return { color: "text-blue-500", bg: "bg-blue-500/10", text: "Stable" }
      case "warning": return { color: "text-amber-500", bg: "bg-amber-500/10", text: "Warning" }
      case "up": return { color: "text-emerald-500", bg: "bg-emerald-500/10", text: "Growing" }
      case "down": return { color: "text-red-500", bg: "bg-red-500/10", text: "Declining" }
      default: return { color: "text-gray-500", bg: "bg-gray-500/10", text: "Unknown" }
    }
  }
  
  const props = getStatusProps()
  
  return (
    <div className="p-3 rounded-xl border border-border/30 bg-card/50">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${props.color}`} />
        <p className="font-black text-sm">{value}</p>
        <Badge variant="outline" className={`ml-auto font-mono text-[8px] uppercase tracking-widest ${props.color} ${props.bg}`}>
          {props.text}
        </Badge>
      </div>
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

function PerformanceView({ status }: { status: any }) {
  const providerData = Object.entries(status.coreStats.callsByProvider || {})
  
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Core Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <PerformanceItem label="Total API Calls" value={status.coreStats.totalCalls.toString()} />
          <PerformanceItem label="Error Rate" value={`${(status.coreStats.errorRate * 100).toFixed(2)}%`} />
          <PerformanceItem label="Average Latency" value={`${status.coreStats.avgLatencyMs}ms`} />
          <PerformanceItem label="Total Cost" value={`$${status.coreStats.totalCostUsd.toFixed(2)}`} />
        </div>
        
        {providerData.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Provider Distribution</p>
            {providerData.map(([provider, count]) => (
              <div key={provider} className="flex items-center gap-2">
                <span className="text-xs font-mono w-16">{provider}:</span>
                <Progress value={(count / status.coreStats.totalCalls) * 100} className="flex-1 h-2" />
                <span className="text-xs font-mono w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RevenueView({ status }: { status: any }) {
  const trend = getRevenueTrend(status)
  
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Revenue Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
          <div className="p-3 rounded-lg ${trend.color}/10">
            <DollarSign className={`w-6 h-6 ${trend.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Revenue</p>
            <p className="text-2xl font-black">${status.revenueStats.totalRevenue.toFixed(0)}</p>
            <p className={`text-sm font-medium ${trend.color}`}>{trend.label}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <RevenueStat 
            label="Success Rate" 
            value={`${status.revenueStats.successRate.toFixed(1)}%`}
          />
          <RevenueStat 
            label="Opportunities" 
            value={status.revenueStats.totalOpportunities.toString()}
          />
          <RevenueStat 
            label="Active" 
            value={status.revenueStats.activeOpportunities.toString()}
          />
          <RevenueStat 
            label="Pipeline" 
            value={status.revenueStats.pipelineSize.toString()}
          />
        </div>
        
        {status.revenueStats.recentTransactions && status.revenueStats.recentTransactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Recent Transactions</p>
            {status.revenueStats.recentTransactions.slice(0, 5).map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/30 border border-border/20">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono uppercase ${tx.success ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.success ? '✓' : '✗'}
                  </span>
                  <span className="text-xs font-mono">{tx.opportunityId.substring(0, 20)}...</span>
                </div>
                <span className={`text-xs font-black ${tx.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${tx.amount.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LearningView({ status }: { status: any }) {
  return (
    <Card className="border-border/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Continuous Learning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Experiences</p>
            <p className="text-2xl font-black">{status.learningStats.totalExperiences}</p>
            <p className="text-sm font-medium text-emerald-500">
              {status.learningStats.successRate.toFixed(1)}% Success
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <LearningStat 
            label="Knowledge Base" 
            value={status.learningStats.knowledgeBaseSize.toString()}
          />
          <LearningStat 
            label="Performance History" 
            value={`${status.learningStats.performanceHistoryDays} days`}
          />
        </div>
        
        {status.learningStats.recentImprovements && status.learningStats.recentImprovements.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Recent Improvements</p>
            {status.learningStats.recentImprovements.slice(0, 3).map((imp: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-card/30 border border-border/20 text-xs">
                <p className="font-medium">{imp.task}</p>
                <p className="text-muted-foreground text-[10px] mt-1">
                  {imp.output.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PerformanceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-card/30 border border-border/20">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <span className="text-sm font-black text-foreground">{value}</span>
    </div>
  )
}

function RevenueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/30">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  )
}

function LearningStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-card/50 border border-border/30">
      <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  )
}

function HealthItem({ label, value, status }: { label: string; value: string; status: string }) {
  const getStatusProps = () => {
    switch (status) {
      case "healthy": return { color: "text-emerald-500", text: "Optimal" }
      case "stable": return { color: "text-blue-500", text: "Stable" }
      case "warning": return { color: "text-amber-500", text: "Monitoring" }
      default: return { color: "text-gray-500", text: "Unknown" }
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

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <span className="text-sm font-black text-foreground">{value}</span>
    </div>
  )
}

function getDefaultStatus() {
  return {
    systemStatus: "operational",
    uptimeHours: 0,
    coreStats: {
      totalCalls: 0,
      errorRate: 0,
      avgLatencyMs: 150,
      totalCostUsd: 0,
      callsByProvider: {
        gemini: 0,
        openai: 0,
        deepseek: 0,
      },
    },
    revenueStats: {
      totalRevenue: 0,
      totalOpportunities: 0,
      successfulOpportunities: 0,
      successRate: 0,
      activeOpportunities: 0,
      pipelineSize: 0,
      recentTransactions: [],
    },
    learningStats: {
      totalExperiences: 0,
      successRate: 0,
      knowledgeBaseSize: 0,
      performanceHistoryDays: 0,
      recentImprovements: [],
    },
  }
}

function getRevenueTrend(status: any) {
  const hourlyRate = status.revenueStats.totalRevenue / Math.max(1, status.uptimeHours)
  if (hourlyRate > 100) return { trend: "up", color: "text-emerald-500", label: "High growth" }
  if (hourlyRate > 50) return { trend: "up", color: "text-green-500", label: "Steady growth" }
  if (hourlyRate > 10) return { trend: "stable", color: "text-blue-500", label: "Stable" }
  return { trend: "down", color: "text-amber-500", label: "Needs attention" }
}
