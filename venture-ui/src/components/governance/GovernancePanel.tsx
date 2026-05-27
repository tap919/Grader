import { useState } from "react"
import { Shield, ShieldAlert, ShieldCheck, Lock, Eye, AlertTriangle, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"

interface Policy {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "warning"
  tier: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}

interface GovernancePanelProps {
  policies?: Policy[]
  onToggle?: (id: string, status: "active" | "inactive") => void
}

const DEFAULT_POLICIES: Policy[] = [
  {
    id: "POL-001",
    name: "Budget Gate",
    description: "Prevents any agent action exceeding $500 without human approval. Applies to all financial operations.",
    status: "active",
    tier: "CRITICAL",
  },
  {
    id: "POL-002",
    name: "Financial Reconciliation",
    description: "All payment and invoice operations must be verified against Stripe before execution.",
    status: "active",
    tier: "CRITICAL",
  },
  {
    id: "POL-003",
    name: "Code Sandbox",
    description: "Generated code must pass dry-run in isolated sandbox before deployment. No direct production writes.",
    status: "active",
    tier: "HIGH",
  },
  {
    id: "POL-004",
    name: "PII Redaction",
    description: "All prompts are scanned for emails, phone numbers, and SSNs. Detected PII is redacted before LLM processing.",
    status: "active",
    tier: "HIGH",
  },
  {
    id: "POL-005",
    name: "Deployment Guard",
    description: "Production deployments require passing all preflight checks: lint, test, security scan, bundle size.",
    status: "active",
    tier: "HIGH",
  },
  {
    id: "POL-006",
    name: "External API Rate Limit",
    description: "Agent scraping and external API calls are rate-limited to prevent abuse and IP bans.",
    status: "active",
    tier: "MEDIUM",
  },
  {
    id: "POL-007",
    name: "Auth Boundary",
    description: "Agents cannot access or modify authentication tokens, session cookies, or user credentials.",
    status: "active",
    tier: "CRITICAL",
  },
]

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "POL-001": Lock,
  "POL-002": Scale,
  "POL-003": ShieldCheck,
  "POL-004": Eye,
  "POL-005": ShieldAlert,
  "POL-006": AlertTriangle,
  "POL-007": Lock,
}

const TIER_COLORS: Record<string, string> = {
  CRITICAL: "text-destructive border-destructive/30 bg-destructive/5",
  HIGH: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  MEDIUM: "text-blue-500 border-blue-500/30 bg-blue-500/5",
  LOW: "text-muted-foreground border-border bg-muted/50",
}

export function GovernancePanel({ policies: initialPolicies, onToggle }: GovernancePanelProps) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies || DEFAULT_POLICIES)

  const handleToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus as Policy["status"] } : p)))
    onToggle?.(id, newStatus as "active" | "inactive")
  }

  const activeCount = policies.filter((p) => p.status === "active").length
  const criticalActive = policies.filter((p) => p.tier === "CRITICAL" && p.status === "active").length

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Agent Governance Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Machine-enforced boundaries and trust policies.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-500 bg-amber-500/5">
            {activeCount}/{policies.length} ENFORCED
          </Badge>
          {criticalActive < policies.filter((p) => p.tier === "CRITICAL").length && (
            <Badge variant="outline" className="text-[10px] py-0 border-destructive/30 text-destructive bg-destructive/5">
              CRITICAL GAPS
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-4 pb-8">
          {policies.map((policy) => {
            const Icon = ICON_MAP[policy.id] || Shield
            return (
              <Card key={policy.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted border flex items-center justify-center shrink-0">
                      <Icon className={`h-5 w-5 ${policy.status === "active" ? "text-amber-500" : "text-muted-foreground/50"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{policy.name}</h3>
                        <Badge variant="outline" className={`text-[10px] py-0 ${TIER_COLORS[policy.tier]}`}>
                          {policy.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-md">{policy.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                        <span>ID: {policy.id}</span>
                        <span className="flex items-center gap-1">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${policy.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                          STATE: {policy.status === "active" ? "ENFORCED" : "BYPASSED"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch checked={policy.status === "active"} onCheckedChange={() => handleToggle(policy.id, policy.status)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
