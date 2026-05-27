import { useState } from "react"
import { Users, Cpu, Zap, Activity, Network, Bot, Terminal as TerminalIcon, CheckCircle2, Loader2, Plus, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AgentWorker {
  id: string
  name: string
  task: string
  status: "idle" | "working" | "complete" | "error" | "awaiting_approval"
  load: number
  confidence?: number
}

interface AgentFleetProps {
  workers?: AgentWorker[]
  onSpawnWorker?: () => void
  onViewNodeGraph?: () => void
}

export function AgentFleet({ workers: initialWorkers, onSpawnWorker, onViewNodeGraph }: AgentFleetProps) {
  const [workers, setWorkers] = useState<AgentWorker[]>(
    initialWorkers || [
      { id: "1", name: "MarketScraper_01", task: "Scraping tech crunch for funding news", status: "working", load: 78 },
      { id: "2", name: "LeadEnricher_01", task: "Awaiting leads from Scraper", status: "idle", load: 0 },
      { id: "3", name: "ContentDraft_01", task: "Generating social media copy", status: "working", load: 45 },
      { id: "4", name: "FinanceAuditor_01", task: "Verifying daily revenue sync", status: "complete", load: 0 },
    ]
  )

  const handleSpawn = () => {
    if (onSpawnWorker) {
      onSpawnWorker()
      return
    }
    const newWorker: AgentWorker = {
      id: Math.random().toString(36).slice(2, 8),
      name: `Worker_${Math.floor(Math.random() * 1000)}`,
      task: "Initializing strategic analysis...",
      status: "idle",
      load: 0,
    }
    setWorkers((prev) => [...prev, newWorker])
  }

  const activeCount = workers.filter((w) => w.status === "working").length
  const awaitingApproval = workers.filter((w) => w.status === "awaiting_approval").length
  const errorCount = workers.filter((w) => w.status === "error").length
  const avgLoad = workers.length > 0 ? Math.round(workers.reduce((sum, w) => sum + w.load, 0) / workers.length) : 0

  return (
    <div className="h-full p-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-black text-emerald-500 tracking-tighter flex items-center gap-3 italic">
            <Network className="h-8 w-8" />
            MULTI-AGENT ORCHESTRATOR
          </h2>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
            Parallel reasoning & distributed task execution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewNodeGraph}>
            View Node Graph
          </Button>
          <Button onClick={handleSpawn} className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-[10px] tracking-widest">
            Spawn Worker <Plus className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-emerald-500/30 border-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Cpu className="h-24 w-24 text-emerald-500" />
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-base italic uppercase tracking-widest">Master Orchestrator</CardTitle>
              </div>
              <Badge className="bg-emerald-500 text-black animate-pulse">OPTIMIZED</Badge>
            </div>
            <CardDescription className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mt-2">
              Core Coordination Logic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase italic">
                <span className="text-muted-foreground">GLOBAL COORDINATION LOAD</span>
                <span className="text-emerald-400">{avgLoad}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${avgLoad}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs font-black text-white">{activeCount}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-black">ACTIVE AGENTS</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs font-black text-white">{workers.length}</p>
                <p className="text-[8px] text-muted-foreground uppercase font-black">TOTAL WORKERS</p>
              </div>
              {awaitingApproval > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                  <p className="text-xs font-black text-amber-500">{awaitingApproval}</p>
                  <p className="text-[8px] text-amber-500/70 uppercase font-black">AWAITING APPROVAL</p>
                </div>
              )}
              {errorCount > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
                  <p className="text-xs font-black text-destructive">{errorCount}</p>
                  <p className="text-[8px] text-destructive/70 uppercase font-black">ERRORS</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
            <Activity className="h-3 w-3" /> Worker Fleet Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="p-4 bg-card border rounded-xl hover:border-border transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      worker.status === "working" && "bg-emerald-500/10 text-emerald-500",
                      worker.status === "complete" && "bg-blue-500/10 text-blue-500",
                      worker.status === "error" && "bg-destructive/10 text-destructive",
                      worker.status === "awaiting_approval" && "bg-amber-500/10 text-amber-500",
                      worker.status === "idle" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {worker.status === "working" && <Loader2 className="h-5 w-5 animate-spin" />}
                    {worker.status === "complete" && <CheckCircle2 className="h-5 w-5" />}
                    {worker.status === "error" && <AlertTriangle className="h-5 w-5" />}
                    {worker.status === "awaiting_approval" && <Users className="h-5 w-5" />}
                    {worker.status === "idle" && <Bot className="h-5 w-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{worker.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{worker.task}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-500">{worker.load}%</p>
                  <div className="h-1 w-12 bg-muted rounded-full mt-1">
                    <div className="h-full bg-emerald-500/50 transition-all" style={{ width: `${worker.load}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <div className="h-8 border-b flex items-center px-4">
          <TerminalIcon className="h-3 w-3 text-emerald-500 mr-2" />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Distributed Logic Logs</span>
        </div>
        <div className="p-6 font-mono text-[10px] space-y-2 text-muted-foreground leading-relaxed italic">
          <div className="flex gap-4">
            <span className="text-muted-foreground/30 shrink-0">{new Date().toLocaleTimeString()}</span>
            <span>[MASTER] Orchestrator initialized. Fleet ready.</span>
          </div>
          {workers
            .filter((w) => w.status === "working")
            .map((w) => (
              <div key={w.id} className="flex gap-4">
                <span className="text-muted-foreground/30 shrink-0">{new Date().toLocaleTimeString()}</span>
                <span className="text-emerald-500">[{w.name}] {w.task}</span>
              </div>
            ))}
          {workers
            .filter((w) => w.status === "awaiting_approval")
            .map((w) => (
              <div key={w.id} className="flex gap-4">
                <span className="text-muted-foreground/30 shrink-0">{new Date().toLocaleTimeString()}</span>
                <span className="text-amber-500">[{w.name}] Awaiting human approval...</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
