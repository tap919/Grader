import { useState } from "react"
import { Eye, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Zap, Users, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "motion/react"

export type OversightMode = "shadow" | "checkpoint" | "recovery"

interface EscalationEvent {
  id: string
  agent: string
  action: string
  reason: string
  confidence: number
  timestamp: string
  mode: OversightMode
  status: "pending" | "approved" | "rejected" | "escalated"
  risk: "low" | "medium" | "high" | "critical"
}

interface OversightPanelProps {
  events?: EscalationEvent[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  mode?: OversightMode
  onModeChange?: (mode: OversightMode) => void
}

const DEFAULT_EVENTS: EscalationEvent[] = [
  {
    id: "ESC-001",
    agent: "FinanceAuditor_01",
    action: "Process refund of $5,200",
    reason: "Value threshold exceeded ($5K limit)",
    confidence: 0.92,
    timestamp: "18:22:01",
    mode: "checkpoint",
    status: "pending",
    risk: "high",
  },
  {
    id: "ESC-002",
    agent: "ContentDraft_01",
    action: "Publish marketing email to 12,000 contacts",
    reason: "Mass communication requires human review",
    confidence: 0.78,
    timestamp: "18:23:15",
    mode: "shadow",
    status: "pending",
    risk: "medium",
  },
  {
    id: "ESC-003",
    agent: "MarketScraper_01",
    action: "Scrape competitor pricing data",
    reason: "External data collection",
    confidence: 0.95,
    timestamp: "18:24:00",
    mode: "shadow",
    status: "approved",
    risk: "low",
  },
  {
    id: "ESC-004",
    agent: "LeadEnricher_01",
    action: "Update CRM with 340 new leads",
    reason: "Bulk data modification",
    confidence: 0.65,
    timestamp: "18:25:30",
    mode: "checkpoint",
    status: "pending",
    risk: "medium",
  },
]

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  critical: "text-destructive bg-destructive/10 border-destructive/30",
}

const MODE_CONFIG: Record<OversightMode, { label: string; icon: React.ComponentType<any>; description: string }> = {
  shadow: { label: "SHADOW", icon: Eye, description: "Agents act unless flagged" },
  checkpoint: { label: "CHECKPOINT", icon: Shield, description: "Agents pause for approval" },
  recovery: { label: "RECOVERY", icon: AlertTriangle, description: "Humans take control" },
}

export function OversightPanel({
  events: initialEvents,
  onApprove,
  onReject,
  mode = "checkpoint",
  onModeChange,
}: OversightPanelProps) {
  const [events, setEvents] = useState<EscalationEvent[]>(initialEvents || DEFAULT_EVENTS)

  const pendingCount = events.filter((e) => e.status === "pending").length
  const approvedCount = events.filter((e) => e.status === "approved").length
  const rejectedCount = events.filter((e) => e.status === "rejected").length

  const handleApprove = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" as const } : e)))
    onApprove?.(id)
  }

  const handleReject = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" as const } : e)))
    onReject?.(id)
  }

  const ModeIcon = MODE_CONFIG[mode].icon

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-amber-500 tracking-tighter flex items-center gap-3 italic">
            <Eye className="h-8 w-8" />
            HUMAN OVERSIGHT
          </h2>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
            AI supervisor dashboard — approve, reject, escalate
          </p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(MODE_CONFIG) as OversightMode[]).map((m) => {
            const C = MODE_CONFIG[m]
            return (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => onModeChange?.(m)}
                className={mode === m ? "bg-amber-500 text-black hover:bg-amber-600" : ""}
              >
                <C.icon className="h-3 w-3 mr-1" />
                {C.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-black">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">PENDING</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-black">{approvedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">APPROVED</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-black">{rejectedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">REJECTED</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-black">{events.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">TOTAL</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ModeIcon className="h-4 w-4 text-amber-500" />
                {MODE_CONFIG[mode].label} MODE
              </CardTitle>
              <CardDescription>{MODE_CONFIG[mode].description}</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-500 bg-amber-500/5">
              {MODE_CONFIG[mode].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className={`border ${event.status === "pending" ? "border-amber-500/30" : "border-border/50"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] py-0 ${RISK_COLORS[event.risk]}`}>
                                {event.risk.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] font-mono text-muted-foreground">{event.id}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{event.timestamp}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold">{event.action}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-mono text-amber-500">{event.agent}</span> — {event.reason}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                              <span>Confidence: {(event.confidence * 100).toFixed(0)}%</span>
                              <span>Mode: {event.mode}</span>
                            </div>
                          </div>
                          {event.status === "pending" && (
                            <div className="flex gap-2 ml-4 shrink-0">
                              <Button size="sm" onClick={() => handleApprove(event.id)} className="bg-emerald-500 hover:bg-emerald-600 text-black">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(event.id)}>
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {event.status !== "pending" && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 ${
                                event.status === "approved"
                                  ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                                  : "text-destructive border-destructive/30 bg-destructive/5"
                              }`}
                            >
                              {event.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
