import { useState, useCallback } from "react"

export type OversightMode = "shadow" | "checkpoint" | "recovery"

interface OversightState {
  mode: OversightMode
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

interface EscalationPayload {
  action: string
  agent: string
  reason: string
  confidence: number
  risk: "low" | "medium" | "high" | "critical"
  evidence?: Record<string, any>
}

export function useOversight(initialMode: OversightMode = "checkpoint") {
  const [mode, setMode] = useState<OversightMode>(initialMode)
  const [queue, setQueue] = useState<EscalationPayload[]>([])
  const [history, setHistory] = useState<
    Array<EscalationPayload & { status: "approved" | "rejected"; timestamp: string }>
  >([])

  const requestApproval = useCallback(
    async (payload: EscalationPayload): Promise<boolean> => {
      if (mode === "shadow") {
        if (payload.confidence >= 0.8 && payload.risk !== "critical") {
          return true
        }
      }

      if (mode === "recovery") {
        return false
      }

      return new Promise((resolve) => {
        setQueue((prev) => [...prev, payload])

        const checkInterval = setInterval(() => {
          setQueue((current) => {
            const item = current.find(
              (q) =>
                q.action === payload.action && q.agent === payload.agent
            )
            if (!item) {
              clearInterval(checkInterval)
              setHistory((h) => [
                ...h,
                { ...payload, status: "approved", timestamp: new Date().toISOString() },
              ])
              resolve(true)
              return current
            }
            return current
          })
        }, 500)
      })
    },
    [mode]
  )

  const approve = useCallback((action: string, agent: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.action === action && q.agent === agent)
      if (item) {
        setHistory((h) => [
          ...h,
          { ...item, status: "approved", timestamp: new Date().toISOString() },
        ])
      }
      return prev.filter((q) => !(q.action === action && q.agent === agent))
    })
  }, [])

  const reject = useCallback((action: string, agent: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.action === action && q.agent === agent)
      if (item) {
        setHistory((h) => [
          ...h,
          { ...item, status: "rejected", timestamp: new Date().toISOString() },
        ])
      }
      return prev.filter((q) => !(q.action === action && q.agent === agent))
    })
  }, [])

  const state: OversightState = {
    mode,
    pendingCount: queue.length,
    approvedCount: history.filter((h) => h.status === "approved").length,
    rejectedCount: history.filter((h) => h.status === "rejected").length,
  }

  return {
    mode,
    setMode,
    queue,
    history,
    state,
    requestApproval,
    approve,
    reject,
  }
}
