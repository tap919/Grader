# @billion-business/venture-ui

Shared UI component library for the Billion Business ecosystem.

## Installation

```bash
npm install @billion-business/venture-ui
```

## Components

### Base UI
- `Button` — cva-powered button with variants (default, outline, ghost, destructive, link)
- `Card` — Card with Header, Title, Description, Content, Footer
- `Input` — Styled text input
- `Badge` — Status badges with variants (default, secondary, destructive, outline, success, warning)
- `Dialog` — Accessible modal dialog
- `Tabs` — Tabbed interface
- `Switch` — Toggle switch
- `Select` — Dropdown select
- `ScrollArea` — Custom scrollable container
- `Separator` — Visual divider
- `Progress` — Progress bar
- `Textarea` — Multi-line text input
- `Label` — Form label
- `Avatar` — User avatar with fallback

### AI Components
- `BrainInterface` — AI chat interface with reasoning log and guardrails
- `AgentFleet` — Multi-agent orchestrator visualization with worker status

### Governance Components
- `GovernancePanel` — Policy engine UI with toggle enforcement
- `OversightPanel` — Human-in-the-loop oversight dashboard (shadow/checkpoint/recovery modes)

### Hooks
- `useOversight` — Oversight state management with approval queue

## Usage

```tsx
import { Button, Card, BrainInterface, useOversight } from "@billion-business/venture-ui"

function App() {
  const { mode, queue, requestApproval } = useOversight("checkpoint")
  
  return (
    <Card>
      <BrainInterface mode="oversight" onSend={async (msg) => {
        // Your AI logic here
        return { summary: "Done", threats: [], recommendations: [], threatLevel: 0, reasoning: "OK" }
      }} />
    </Card>
  )
}
```

## Tailwind Setup

Add these CSS variables to your global stylesheet:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
  }
}
```
