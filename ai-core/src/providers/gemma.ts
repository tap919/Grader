import { GenerateOptions, GenerateResult } from "../types"

const GEMMA_DEFAULT_BASE_URL = "http://localhost:11434/v1"
const GEMMA_DEFAULT_MODEL = "hf.co/unsloth/gemma-4-E2B-it-GGUF:UD-IQ2_M"

export class GemmaProvider {
  private baseUrl: string
  private defaultModel: string

  constructor(baseUrl?: string, defaultModel?: string) {
    this.baseUrl = (baseUrl || process.env.GEMMA_BASE_URL || GEMMA_DEFAULT_BASE_URL).replace(/\/+$/, "")
    this.defaultModel = defaultModel || process.env.GEMMA_MODEL || GEMMA_DEFAULT_MODEL
  }

  async generate(prompt: string, options: GenerateOptions & { model?: string } = {}): Promise<GenerateResult> {
    const model = options.model || this.defaultModel
    const startTime = Date.now()

    const messages: Array<{ role: string; content: string }> = []
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    }).catch(() => {
      return null as unknown as Response
    })

    if (!response || !response.ok) {
      if (response) {
        const errorText = await response.text().catch(() => "No details")
        console.warn(`Gemma API error: ${response.status} ${response.statusText} — ${errorText}`)
      }
      return { text: "", provider: "gemma" as const, model, tokensUsed: 0, costUsd: 0, latencyMs: Date.now() - startTime }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""
    const latencyMs = Date.now() - startTime
    const tokensUsed = data.usage?.total_tokens

    return {
      text,
      provider: "gemma" as const,
      model,
      tokensUsed,
      costUsd: 0,
      latencyMs,
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, options: GenerateOptions & { model?: string } = {}): Promise<GenerateResult> {
    const model = options.model || this.defaultModel
    const startTime = Date.now()

    const formattedMessages = messages.map(m => ({
      role: m.role === "system" ? "system" : m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }))

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    }).catch(() => {
      return null as unknown as Response
    })

    if (!response || !response.ok) {
      if (response) {
        const errorText = await response.text().catch(() => "No details")
        console.warn(`Gemma API error: ${response.status} ${response.statusText} — ${errorText}`)
      }
      return { text: "", provider: "gemma" as const, model, tokensUsed: 0, costUsd: 0, latencyMs: Date.now() - startTime }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""
    const latencyMs = Date.now() - startTime
    const tokensUsed = data.usage?.total_tokens

    return {
      text,
      provider: "gemma" as const,
      model,
      tokensUsed,
      costUsd: 0,
      latencyMs,
    }
  }
}
