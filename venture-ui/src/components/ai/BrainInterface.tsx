import React, { useState, useEffect, useRef } from "react"
import { Brain, Terminal, Cpu, MessageSquare, Send, Loader2, ShieldAlert, CheckCircle2, Info, ChevronRight, Play, StopCircle, Pause } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  role: "user" | "agent" | "system"
  content: string
  timestamp: string
  recommendations?: string[]
  threatLevel?: number
  type?: string
}

interface ReasoningResult {
  summary: string
  threats: string[]
  recommendations: string[]
  threatLevel: number
  reasoning: string
}

interface BrainControlsProps {
  onStart?: () => void
  onStop?: () => void
  onPause?: () => void
  status?: "running" | "paused" | "stopped"
}

function OrchestratorStatusBadge({ status }: { status: any }) {
  const getStatusInfo = () => {
    if (!status) return { color: "text-gray-500", bg: "bg-gray-500/10", label: "Offline", icon: Cpu }
    
    if (status.schedulerActive && status.dreamProcessorActive) {
      return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Full", icon: Zap }
    } else if (status.schedulerActive) {
      return { color: "text-blue-500", bg: "bg-blue-500/10", label: "Partial", icon: Activity }
    } else {
      return { color: "text-gray-500", bg: "bg-gray-500/10", label: "Idle", icon: Cpu }
    }
  }
  
  const { color, bg, label, icon: Icon } = getStatusInfo()
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`p-1 rounded-lg ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs capitalize">Orchestrator: {label}</p>
          {status && (
            <p className="text-xs text-muted-foreground">
              Scheduler: {status.schedulerActive ? "✅" : "❌"} | Dreams: {status.dreamProcessorActive ? "✅" : "❌"}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function BrainStatusIndicator({ mode }: { mode: string }) {
  const getStatusInfo = () => {
    switch (mode) {
      case "security":
        return { Icon: ShieldAlert, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Secure" }
      case "oversight":
        return { Icon: Info, color: "text-amber-500", bg: "bg-amber-500/10", label: "Supervised" }
      case "general":
      default:
        return { Icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10", label: "Active" }
    }
  }
  
  const { Icon, color, bg, label } = getStatusInfo()
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`p-1 rounded-lg ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs capitalize">{mode} mode</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function BrainControls({ onStart, onStop, onPause, status = "stopped" }: BrainControlsProps) {
  const getStatusColor = () => {
    switch (status) {
      case "running": return "text-emerald-500"
      case "paused": return "text-amber-500"
      case "stopped": return "text-gray-500"
      default: return "text-gray-500"
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case "running": return "Running"
      case "paused": return "Paused"
      case "stopped": return "Stopped"
      default: return "Unknown"
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onStart}
              disabled={status === "running"}
            >
              <Play className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Start Brain</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onPause}
              disabled={status !== "running"}
            >
              <Pause className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Pause Brain</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onStop}
              disabled={status === "stopped"}
            >
              <StopCircle className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Stop Brain</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className={`text-[10px] font-mono uppercase tracking-widest ${getStatusColor()}`}>
        {getStatusText()}
      </div>
    </div>
  )
}

interface BrainInterfaceProps {
  onSend?: (message: string) => Promise<ReasoningResult>
  initialMessage?: string
  mode?: "security" | "general" | "oversight"
  onStart?: () => void
  onStop?: () => void
  onPause?: () => void
  status?: "running" | "paused" | "stopped"
  orchestratorStatus?: any
}

export function BrainInterface({ onSend, initialMessage, mode = "general", onStart, onStop, onPause, status: initialStatus }: BrainInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: initialMessage || "Core reasoning engine initialized. How can I assist?",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
    },
  ])
  const [input, setInput] = useState("")
  const [isReasoning, setIsReasoning] = useState(false)
  const [reasoningLog, setReasoningLog] = useState<ReasoningResult | null>(null)
  const [status, setStatus] = useState<"running" | "paused" | "stopped">(initialStatus || "stopped")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  const handleStart = () => {
    setStatus("running")
    onStart?.()
  }
  
  const handleStop = () => {
    setStatus("stopped")
    onStop?.()
  }
  
  const handlePause = () => {
    setStatus("paused")
    onPause?.()
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsReasoning(true)

    try {
      const result = onSend
        ? await onSend(input)
        : {
            summary: "Local mode — connect an AI provider for full reasoning.",
            threats: [],
            recommendations: ["Configure AI provider in environment"],
            threatLevel: 0,
            reasoning: "No AI provider connected.",
          }

      setReasoningLog(result)

      const agentMessage: Message = {
        role: "agent",
        content: result.summary,
        timestamp: new Date().toLocaleTimeString(),
        recommendations: result.recommendations,
        threatLevel: result.threatLevel,
      }

      setMessages((prev) => [...prev, agentMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Error in reasoning engine.",
          timestamp: new Date().toLocaleTimeString(),
          type: "system",
        },
      ])
    } finally {
      setIsReasoning(false)
    }
  }

  const modeConfig = {
    security: { title: "AI Security Agent", subtitle: "LLM-BASED REASONING ENGINE v2.0", badge: "Autonomous Mode", badgeColor: "text-emerald-500" as const },
    general: { title: "AI Assistant", subtitle: "REASONING ENGINE", badge: "Active", badgeColor: "text-blue-500" as const },
    oversight: { title: "Oversight Agent", subtitle: "HUMAN-IN-THE-LOOP MONITOR", badge: "Supervising", badgeColor: "text-amber-500" as const },
  }

  const config = modeConfig[mode]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription className="text-xs font-mono">{config.subtitle}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BrainStatusIndicator mode={mode} />
              {orchestratorStatus && (
                <OrchestratorStatusBadge status={orchestratorStatus} />
              )}
              <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest border-emerald-500/30 ${config.badgeColor}`}>
                {config.badge}
              </Badge>
              <BrainControls onStart={handleStart} onStop={handleStop} onPause={handlePause} status={status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/50 border rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                      {msg.recommendations && (
                        <div className="mt-4 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Recommended Actions:</p>
                          {msg.recommendations.map((rec, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs bg-background/30 p-2 rounded-lg border border-white/5">
                              <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono px-1">{msg.timestamp}</p>
                  </div>
                </motion.div>
              ))}
              {isReasoning && (
                <div className="flex justify-start">
                  <div className="bg-muted/30 border p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-mono animate-pulse">Agent is reasoning...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t">
          <div className="flex w-full gap-3">
            <Input
              placeholder="Ask the agent..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-background/50"
            />
            <Button onClick={handleSend} disabled={isReasoning || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-mono uppercase tracking-widest">Reasoning Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {reasoningLog ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-background/50 border font-mono text-[11px] leading-relaxed">
                  <span className="text-primary font-bold">LOG_ENTRY:</span> {reasoningLog.reasoning}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Threat Level</p>
                    <p className={`text-xl font-bold ${reasoningLog.threatLevel > 50 ? "text-destructive" : "text-emerald-500"}`}>
                      {reasoningLog.threatLevel}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Confidence</p>
                    <p className="text-xl font-bold text-primary">94%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground opacity-50 border-2 border-dashed rounded-xl">
                <Cpu className="w-8 h-8 mb-2" />
                <p className="text-xs font-mono">Waiting for inference...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Active Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <GuardrailItem icon={CheckCircle2} label="Explainable Decisions" status="Active" color="text-emerald-500" />
            <GuardrailItem icon={ShieldAlert} label="Human-in-the-loop" status="Threshold: High" color="text-amber-500" />
            <GuardrailItem icon={Info} label="Immutable Audit Trail" status="Encrypted" color="text-blue-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GuardrailItem({ icon: Icon, label, status, color }: { icon: React.ComponentType<any>; label: string; status: string; color: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{status}</span>
    </div>
  )
}
