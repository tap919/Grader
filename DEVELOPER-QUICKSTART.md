# Developer Quick-Start: Portfolio Integration
> **Purpose:** Step-by-step implementation guide for integrating portfolio systems  
> **Audience:** Backend engineers  
> **Status:** Active  

---

## Before You Start

1. **Read these first (10 minutes total):**
   - [SAAS-ARCHITECTURE.md](.acquisition-tracker/SAAS-ARCHITECTURE.md) - High-level design
   - [INTEGRATION-API-REFERENCE.md](.acquisition-tracker/INTEGRATION-API-REFERENCE.md) - API contracts
   - [IMPLEMENTATION-ROADMAP.md](.acquisition-tracker/IMPLEMENTATION-ROADMAP.md) - Timeline

2. **Environment Setup:**
   ```bash
   # Clone all repos
   cd Billion\ Business
   git clone https://github.com/ncsound919/deterministic-brain.git
   git clone https://github.com/ncsound919/Aetherdesk-Call-Center.git  
   git clone https://github.com/tap919/OpenHub.git
   git clone https://github.com/tap919/Uplift-Venture.git
   
   # Create shared .env for local development
   cat > .env.shared <<EOF
   ENVIRONMENT=development
   LOG_LEVEL=debug
   
   # Services
   AETHERDESK_API_URL=http://localhost:8000
   DETERMINISTIC_BRAIN_API_URL=http://localhost:8001
   OPENHUB_API_URL=http://localhost:8002
   UPLIFT_VENTURE_API_URL=http://localhost:8003
   
   # Auth
   AETHERDESK_WEBHOOK_SECRET=dev_secret_aetherdesk
   BRAIN_WEBHOOK_SECRET=dev_secret_brain
   OPENHUB_API_TOKEN=dev_token_openhub
   EOF
   ```

---

## Phase 1: Aetherdesk Webhook Sender (2 hours)

### Goal
Make Aetherdesk send a webhook to Deterministic Brain when a call ends.

### Step 1.1: Add webhook configuration to Aetherdesk

**File:** `aetherdesk/config/webhooks.py`

```python
import os

WEBHOOK_CONFIG = {
    "brain": {
        "url": os.getenv("DETERMINISTIC_BRAIN_WEBHOOK_URL", 
                        "http://localhost:8001/webhooks/aetherdesk/call_ended"),
        "secret": os.getenv("AETHERDESK_WEBHOOK_SECRET", "dev_secret"),
        "events": ["call_ended"],
        "retry_policy": {
            "max_attempts": 4,
            "backoff_multiplier": 5,
            "initial_delay_seconds": 1
        }
    }
}

def get_brain_webhook_config():
    return WEBHOOK_CONFIG["brain"]
```

### Step 1.2: Implement webhook sender in Aetherdesk

**File:** `aetherdesk/services/webhook_dispatcher.py`

```python
import json
import asyncio
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import httpx

from aetherdesk.config.webhooks import get_brain_webhook_config
from aetherdesk.models import CallSession
from aetherdesk.logger import get_logger

logger = get_logger(__name__)


class WebhookDispatcher:
    """Send webhooks to external systems (e.g., Deterministic Brain)"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30)
    
    async def dispatch_call_ended(self, call: CallSession) -> bool:
        """Send call_ended webhook to Brain"""
        config = get_brain_webhook_config()
        
        # Build payload
        payload = self._build_call_ended_payload(call)
        payload_json = json.dumps(payload, default=str)
        
        # Create signature
        signature = self._create_signature(payload_json, config["secret"])
        
        # Send webhook with retries
        return await self._send_with_retries(
            url=config["url"],
            payload=payload_json,
            signature=signature,
            retry_policy=config["retry_policy"]
        )
    
    def _build_call_ended_payload(self, call: CallSession) -> Dict[str, Any]:
        """Build standardized call_ended webhook payload"""
        return {
            "event": "call_ended",
            "event_id": f"evt_{call.id}_{datetime.utcnow().timestamp()}",
            "timestamp": call.end_time.isoformat(),
            "tenant_id": call.tenant_id,
            
            "call": {
                "id": call.id,
                "duration_seconds": call.duration_seconds,
                "started_at": call.start_time.isoformat(),
                "ended_at": call.end_time.isoformat(),
                
                "caller": {
                    "number": call.caller_number,
                    "name": call.caller_name or "Unknown",
                    "email": getattr(call.caller, "email", None),
                },
                
                "agent": {
                    "id": call.agent_id,
                    "name": call.agent.name if call.agent else "IVR",
                    "type": "human" if call.agent else "ivr",
                },
                
                "call_metadata": {
                    "sentiment": call.sentiment_score,
                    "intent": call.intent_detected or "unknown",
                    "resolution": call.resolution_status or "unknown",
                    "tags": call.tags or [],
                },
                
                "transcript": {
                    "raw": call.transcription[:500] if call.transcription else "",
                    "summary": call.ai_summary or "",
                    "sentiment_scores": {
                        "positive": 0.0,  # TODO: Extract from sentiment analysis
                        "neutral": 0.0,
                        "negative": 0.0,
                    }
                },
                
                "call_recording": {
                    "url": f"https://aetherdesk.yourcompany.com/recordings/{call.id}.wav",
                    "duration_seconds": call.duration_seconds,
                    "format": "wav"
                } if call.recording_url else None,
            },
            
            "lead": {
                "is_new": not call.caller_exists_in_crm,
                "value_estimate": self._estimate_lead_value(call),
                "urgency": self._calculate_urgency(call),
                "required_action": self._determine_action(call),
            }
        }
    
    def _create_signature(self, payload: str, secret: str) -> str:
        """Create HMAC-SHA256 signature for webhook verification"""
        signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"
    
    async def _send_with_retries(
        self, 
        url: str, 
        payload: str, 
        signature: str,
        retry_policy: Dict[str, Any]
    ) -> bool:
        """Send webhook with exponential backoff retries"""
        max_attempts = retry_policy["max_attempts"]
        backoff_multiplier = retry_policy["backoff_multiplier"]
        initial_delay = retry_policy["initial_delay_seconds"]
        
        for attempt in range(max_attempts):
            try:
                response = await self.client.post(
                    url,
                    content=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Aetherdesk-Signature": signature,
                    }
                )
                
                if response.status_code in [200, 201, 202]:
                    logger.info(
                        f"Webhook sent successfully",
                        extra={
                            "url": url,
                            "attempt": attempt + 1,
                            "status": response.status_code,
                        }
                    )
                    return True
                elif response.status_code >= 500:
                    # Server error - retry
                    logger.warning(
                        f"Webhook failed with server error, will retry",
                        extra={
                            "url": url,
                            "attempt": attempt + 1,
                            "status": response.status_code,
                        }
                    )
                else:
                    # Client error - don't retry
                    logger.error(
                        f"Webhook failed with client error",
                        extra={
                            "url": url,
                            "status": response.status_code,
                            "response": response.text,
                        }
                    )
                    return False
            
            except Exception as e:
                logger.warning(
                    f"Webhook dispatch failed, will retry",
                    extra={
                        "url": url,
                        "attempt": attempt + 1,
                        "error": str(e),
                    }
                )
            
            # Exponential backoff before retry
            if attempt < max_attempts - 1:
                delay = initial_delay * (backoff_multiplier ** attempt)
                await asyncio.sleep(delay)
        
        logger.error(
            f"Webhook delivery failed after {max_attempts} attempts",
            extra={"url": url}
        )
        return False
    
    def _estimate_lead_value(self, call: CallSession) -> int:
        """Estimate lead value based on call characteristics"""
        value = 100  # Base value
        
        if call.duration_seconds > 300:  # Long call = high interest
            value += 200
        if call.intent_detected == "sales_inquiry":
            value += 150
        if "enterprise" in (call.tags or []):
            value += 300
        
        return min(value, 1000)  # Cap at $1000
    
    def _calculate_urgency(self, call: CallSession) -> str:
        """Determine urgency level"""
        if call.sentiment_score and call.sentiment_score < 0.3:
            return "high"  # Negative sentiment = urgent follow-up
        if call.duration_seconds > 600:
            return "high"  # Long call = serious interest
        return "medium"
    
    def _determine_action(self, call: CallSession) -> str:
        """Determine required action"""
        if call.intent_detected == "sales_inquiry":
            return "sales_followup"
        elif call.intent_detected == "support":
            return "support_ticket"
        elif call.intent_detected == "complaint":
            return "escalation"
        return "general_followup"
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()


# Global instance
_dispatcher = None

def get_dispatcher() -> WebhookDispatcher:
    global _dispatcher
    if _dispatcher is None:
        _dispatcher = WebhookDispatcher()
    return _dispatcher
```

### Step 1.3: Trigger webhook from call completion handler

**File:** `aetherdesk/routers/calls.py` (modify existing call_ended endpoint)

```python
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from aetherdesk.database import get_db
from aetherdesk.models import CallSession
from aetherdesk.services.webhook_dispatcher import get_dispatcher
import asyncio

router = APIRouter(prefix="/api/v1/calls", tags=["calls"])

@router.post("/{call_id}/end")
async def end_call(call_id: str, db: Session = Depends(get_db)):
    """End a call and dispatch webhooks"""
    
    # Get call from database
    call = db.query(CallSession).filter(CallSession.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Mark call as ended
    call.end_time = datetime.utcnow()
    call.duration_seconds = (call.end_time - call.start_time).total_seconds()
    db.add(call)
    db.commit()
    db.refresh(call)
    
    # Dispatch webhook asynchronously
    dispatcher = get_dispatcher()
    success = await dispatcher.dispatch_call_ended(call)
    
    return {
        "status": "success",
        "call_id": call.id,
        "duration": call.duration_seconds,
        "webhook_dispatched": success,
    }
```

### Step 1.4: Add tests

**File:** `aetherdesk/tests/test_webhook_dispatcher.py`

```python
import pytest
import json
import hmac
import hashlib
from unittest.mock import AsyncMock, patch
from datetime import datetime, timedelta
from aetherdesk.services.webhook_dispatcher import WebhookDispatcher
from aetherdesk.models import CallSession


@pytest.mark.asyncio
async def test_webhook_signature_creation():
    """Verify HMAC-SHA256 signature is created correctly"""
    dispatcher = WebhookDispatcher()
    
    payload = json.dumps({"test": "data"})
    secret = "test_secret"
    
    signature = dispatcher._create_signature(payload, secret)
    
    # Verify manually
    expected_sig = "sha256=" + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    assert signature == expected_sig


@pytest.mark.asyncio
async def test_webhook_send_success():
    """Verify webhook is sent successfully"""
    dispatcher = WebhookDispatcher()
    
    mock_response = AsyncMock()
    mock_response.status_code = 202
    
    with patch.object(dispatcher.client, 'post', return_value=mock_response):
        success = await dispatcher._send_with_retries(
            url="http://localhost:8001/webhooks",
            payload=json.dumps({"test": "data"}),
            signature="sha256=test",
            retry_policy={
                "max_attempts": 3,
                "backoff_multiplier": 5,
                "initial_delay_seconds": 1,
            }
        )
    
    assert success is True


@pytest.mark.asyncio
async def test_webhook_send_retries_on_500():
    """Verify webhook retries on server errors"""
    dispatcher = WebhookDispatcher()
    
    mock_responses = [
        AsyncMock(status_code=500),
        AsyncMock(status_code=500),
        AsyncMock(status_code=202),
    ]
    
    with patch.object(dispatcher.client, 'post', side_effect=mock_responses):
        success = await dispatcher._send_with_retries(
            url="http://localhost:8001/webhooks",
            payload=json.dumps({"test": "data"}),
            signature="sha256=test",
            retry_policy={
                "max_attempts": 3,
                "backoff_multiplier": 1,
                "initial_delay_seconds": 0.001,  # Short delay for tests
            }
        )
    
    assert success is True
```

### Step 1.5: Run and verify

```bash
# In aetherdesk_scaffold directory
cd aetherdesk_scaffold

# Run tests
pytest aetherdesk/tests/test_webhook_dispatcher.py -v

# Start Aetherdesk
python -m uvicorn aetherdesk.main:app --port 8000

# In another terminal, simulate a call:
curl -X POST http://localhost:8000/api/v1/calls/call_123/end \
  -H "Content-Type: application/json"

# Check if webhook was sent (in Deterministic Brain logs)
```

---

## Phase 2: Deterministic Brain Webhook Receiver (2 hours)

### Goal
Create endpoint in Deterministic Brain to receive Aetherdesk webhook and route it appropriately.

### Step 2.1: Create webhook receiver in Deterministic Brain

**File:** `deterministic-brain/api/routes/webhooks.py`

```python
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import hmac
import hashlib
import json
from datetime import datetime
import structlog

from deterministic_brain.database import get_db
from deterministic_brain.models import WebhookEvent, Lead, Opportunity
from deterministic_brain.brain.router import RouteDecision
from deterministic_brain.orchestration.lead_router import LeadRouter

logger = structlog.get_logger()

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def verify_webhook_signature(
    body: bytes,
    signature: str,
    secret: str
) -> bool:
    """Verify HMAC-SHA256 signature from webhook sender"""
    expected_sig = "sha256=" + hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(signature, expected_sig)


@router.post("/aetherdesk/call_ended")
async def handle_aetherdesk_call_ended(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Receive call_ended webhook from Aetherdesk
    
    Verify signature, extract lead data, route to appropriate business area
    """
    
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature
    signature = request.headers.get("X-Aetherdesk-Signature", "")
    if not signature:
        logger.error("webhook_missing_signature")
        raise HTTPException(status_code=400, detail="Missing signature")
    
    import os
    webhook_secret = os.getenv("AETHERDESK_WEBHOOK_SECRET", "dev_secret")
    
    if not verify_webhook_signature(body, signature, webhook_secret):
        logger.error("webhook_invalid_signature")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        logger.error("webhook_invalid_json")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    logger.info(
        "webhook_received",
        event=payload.get("event"),
        call_id=payload.get("call", {}).get("id"),
    )
    
    # Store raw webhook event
    webhook_event = WebhookEvent(
        source="aetherdesk",
        event_type="call_ended",
        payload=payload,
        received_at=datetime.utcnow(),
    )
    db.add(webhook_event)
    db.flush()  # Get ID without committing
    
    # Extract call data
    call_data = payload.get("call", {})
    lead_data = payload.get("lead", {})
    
    # Create Lead record
    lead = Lead(
        source="aetherdesk",
        source_id=call_data.get("id"),
        caller_name=call_data.get("caller", {}).get("name"),
        caller_email=call_data.get("caller", {}).get("email"),
        caller_phone=call_data.get("caller", {}).get("number"),
        sentiment=call_data.get("call_metadata", {}).get("sentiment"),
        intent=call_data.get("call_metadata", {}).get("intent"),
        call_duration_seconds=call_data.get("duration_seconds"),
        transcript=call_data.get("transcript", {}).get("raw"),
        transcript_summary=call_data.get("transcript", {}).get("summary"),
        estimated_value=lead_data.get("value_estimate"),
        urgency=lead_data.get("urgency"),
        webhook_event_id=webhook_event.id,
    )
    db.add(lead)
    db.flush()
    
    logger.info(
        "lead_created",
        lead_id=lead.id,
        caller=lead.caller_name,
        estimated_value=lead.estimated_value,
    )
    
    # Route lead
    lead_router = LeadRouter(db)
    routing_decision = lead_router.evaluate_and_route(lead)
    
    logger.info(
        "lead_routed",
        lead_id=lead.id,
        route=routing_decision.route,
        priority=routing_decision.priority,
    )
    
    # Create Opportunity if appropriate
    if routing_decision.should_create_opportunity:
        opportunity = Opportunity(
            lead_id=lead.id,
            route=routing_decision.route,
            priority=routing_decision.priority,
            estimated_value=lead.estimated_value,
            description=f"Lead from Aetherdesk: {lead.caller_name}",
            recommended_actions=routing_decision.recommended_actions,
        )
        db.add(opportunity)
    
    # Create OpenHub issue if this is a high-value lead
    if routing_decision.create_github_issue:
        # Import here to avoid circular imports
        from deterministic_brain.integrations.openhub_adapter import OpenHubAdapter
        
        github = OpenHubAdapter()
        issue = await github.create_issue(
            repository="portfolio",
            title=f"Sales Opportunity: {lead.caller_name}",
            description=_build_issue_description(lead, call_data),
            labels=["opportunity", routing_decision.route, f"priority-{routing_decision.priority}"],
            custom_fields={
                "lead_source": "aetherdesk",
                "call_id": call_data.get("id"),
                "estimated_value": lead.estimated_value,
            }
        )
        lead.openhub_issue_id = issue["id"]
        logger.info("github_issue_created", issue_id=issue["id"])
    
    # Commit all changes
    db.commit()
    
    return {
        "success": True,
        "lead_id": lead.id,
        "routing_decision": {
            "route": routing_decision.route,
            "priority": routing_decision.priority,
            "openhub_issue_id": lead.openhub_issue_id,
        },
    }


def _build_issue_description(lead: Lead, call_data: dict) -> str:
    """Build markdown description for OpenHub issue"""
    return f"""
# Sales Opportunity: {lead.caller_name}

## Lead Information
- **Name:** {lead.caller_name}
- **Email:** {lead.caller_email or "N/A"}
- **Phone:** {lead.caller_phone}
- **Estimated Value:** ${lead.estimated_value:,}

## Call Details
- **Duration:** {call_data.get('duration_seconds', 0)} seconds
- **Sentiment:** {lead.sentiment or "Unknown"}
- **Intent:** {lead.intent or "Unknown"}
- **Call ID:** [{call_data.get('id')}](https://aetherdesk.yourcompany.com/calls/{call_data.get('id')})

## Transcript Summary
{lead.transcript_summary or lead.transcript[:500] or "No transcript available"}

## Recommended Actions
- Schedule follow-up call
- Send pricing information
- Assign account manager
"""
```

### Step 2.2: Add LeadRouter business logic

**File:** `deterministic-brain/orchestration/lead_router.py`

```python
from dataclasses import dataclass
from typing import List
from sqlalchemy.orm import Session
from deterministic_brain.models import Lead


@dataclass
class RouteDecision:
    route: str  # sales | support | research | escalation
    priority: str  # low | medium | high
    should_create_opportunity: bool
    create_github_issue: bool
    recommended_actions: List[str]


class LeadRouter:
    """Route leads based on characteristics and business rules"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def evaluate_and_route(self, lead: Lead) -> RouteDecision:
        """Evaluate lead and make routing decision"""
        
        # Score the lead
        score = self._calculate_lead_score(lead)
        
        # Determine route based on characteristics
        if lead.intent == "complaint":
            route = "escalation"
            priority = "high"
        elif lead.estimated_value > 500:
            route = "sales"
            priority = "high"
        elif lead.intent == "support":
            route = "support"
            priority = "medium"
        elif lead.intent == "research":
            route = "research"
            priority = "medium"
        else:
            route = "sales"
            priority = "low"
        
        # Upgrade priority if positive sentiment and long call
        if lead.sentiment and lead.sentiment > 0.7 and lead.call_duration_seconds > 300:
            priority = "high"
        
        # Determine if we should create opportunity
        should_create_opportunity = (
            score > 50 and
            lead.estimated_value > 0 and
            lead.caller_email is not None
        )
        
        # Create GitHub issue for high-value opportunities
        create_github_issue = should_create_opportunity and priority == "high"
        
        # Recommend actions
        recommended_actions = self._get_recommended_actions(lead, route)
        
        return RouteDecision(
            route=route,
            priority=priority,
            should_create_opportunity=should_create_opportunity,
            create_github_issue=create_github_issue,
            recommended_actions=recommended_actions,
        )
    
    def _calculate_lead_score(self, lead: Lead) -> float:
        """Score lead on 0-100 scale"""
        score = 0
        
        # Value scoring
        if lead.estimated_value:
            score += min(lead.estimated_value / 10, 30)  # Max 30 points
        
        # Engagement scoring
        if lead.call_duration_seconds > 600:
            score += 20
        elif lead.call_duration_seconds > 300:
            score += 10
        
        # Sentiment scoring
        if lead.sentiment and lead.sentiment > 0.7:
            score += 15
        elif lead.sentiment and lead.sentiment < 0.3:
            score += 5  # Negative sentiment still valuable for escalation
        
        # Intent scoring
        if lead.intent == "sales_inquiry":
            score += 20
        elif lead.intent in ["demo_request", "consultation"]:
            score += 15
        
        # Email present
        if lead.caller_email:
            score += 10
        
        return min(score, 100)
    
    def _get_recommended_actions(self, lead: Lead, route: str) -> List[str]:
        """Generate recommended next actions"""
        actions = []
        
        if route == "sales":
            actions.append("Schedule demo")
            actions.append("Send pricing sheet")
            if lead.estimated_value > 1000:
                actions.append("Assign account manager")
        elif route == "support":
            actions.append("Create support ticket")
            actions.append("Assign to support team")
        elif route == "escalation":
            actions.append("Escalate to manager")
            actions.append("Send apology + compensation offer")
        
        return actions
```

### Step 2.3: Add models

**File:** `deterministic-brain/models.py` (add these models)

```python
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False)  # aetherdesk, etc.
    event_type = Column(String, nullable=False)  # call_ended, etc.
    payload = Column(JSON, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)


class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, nullable=False)  # aetherdesk, manual, etc.
    source_id = Column(String, nullable=True)  # Caller ID in source system
    
    caller_name = Column(String, nullable=True)
    caller_email = Column(String, nullable=True)
    caller_phone = Column(String, nullable=True)
    
    sentiment = Column(Float, nullable=True)  # -1.0 to 1.0
    intent = Column(String, nullable=True)
    call_duration_seconds = Column(Integer, nullable=True)
    
    transcript = Column(String, nullable=True)
    transcript_summary = Column(String, nullable=True)
    
    estimated_value = Column(Float, nullable=True)
    urgency = Column(String, nullable=True)  # low, medium, high
    
    webhook_event_id = Column(String, ForeignKey("webhook_events.id"))
    openhub_issue_id = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    
    route = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    estimated_value = Column(Float, nullable=True)
    description = Column(String, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    
    status = Column(String, default="open")  # open, assigned, won, lost
    assigned_to = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Step 2.4: Update Deterministic Brain main app

**File:** `deterministic-brain/main.py` (add webhook routes)

```python
from fastapi import FastAPI
from deterministic_brain.api.routes import webhooks
from deterministic_brain.database import Base, engine

app = FastAPI(title="Deterministic Brain", version="1.0.0")

# Create tables
Base.metadata.create_all(bind=engine)

# Include webhook routes
app.include_router(webhooks.router)

# ... other routes ...
```

### Step 2.5: Test the integration

**File:** `tests/integration/test_aetherdesk_integration.py`

```python
import pytest
import json
import hmac
import hashlib
from fastapi.testclient import TestClient
from datetime import datetime

from deterministic_brain.main import app
from deterministic_brain.database import get_db

client = TestClient(app)

WEBHOOK_SECRET = "dev_secret"


def create_webhook_signature(payload: str, secret: str) -> str:
    """Create valid webhook signature"""
    sig = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={sig}"


def test_webhook_call_ended_success():
    """Test successful webhook reception and lead creation"""
    
    payload = {
        "event": "call_ended",
        "event_id": "evt_test_123",
        "timestamp": datetime.utcnow().isoformat(),
        "tenant_id": "test_tenant",
        
        "call": {
            "id": "call_xyz123",
            "duration_seconds": 342,
            "started_at": "2026-05-24T14:27:18Z",
            "ended_at": "2026-05-24T14:32:00Z",
            
            "caller": {
                "number": "+1-555-0123",
                "name": "John Doe",
                "email": "john@example.com",
            },
            
            "agent": {
                "id": "agent_123",
                "name": "Support Team",
                "type": "human",
            },
            
            "call_metadata": {
                "sentiment": 0.8,
                "intent": "sales_inquiry",
                "resolution": "resolved",
                "tags": ["sales"],
            },
            
            "transcript": {
                "raw": "Customer asked about pricing...",
                "summary": "Customer interested in Pro plan",
            },
        },
        
        "lead": {
            "is_new": True,
            "value_estimate": 500,
            "urgency": "high",
            "required_action": "sales_followup",
        }
    }
    
    payload_json = json.dumps(payload)
    signature = create_webhook_signature(payload_json, WEBHOOK_SECRET)
    
    # Patch the secret
    import os
    os.environ["AETHERDESK_WEBHOOK_SECRET"] = WEBHOOK_SECRET
    
    response = client.post(
        "/webhooks/aetherdesk/call_ended",
        content=payload_json,
        headers={
            "Content-Type": "application/json",
            "X-Aetherdesk-Signature": signature,
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "lead_id" in data
    assert data["routing_decision"]["priority"] == "high"


def test_webhook_invalid_signature():
    """Test webhook with invalid signature is rejected"""
    
    payload = {"test": "data"}
    payload_json = json.dumps(payload)
    
    response = client.post(
        "/webhooks/aetherdesk/call_ended",
        content=payload_json,
        headers={
            "Content-Type": "application/json",
            "X-Aetherdesk-Signature": "sha256=invalid",
        }
    )
    
    assert response.status_code == 401
```

---

## Phase 3: OpenHub Integration (2 hours)

### Goal
When a high-value lead is routed, automatically create an issue in OpenHub.

### Quick implementation:

**File:** `deterministic-brain/integrations/openhub_adapter.py`

```python
import httpx
import os
from typing import Dict, Any

class OpenHubAdapter:
    """Adapter for OpenHub API"""
    
    def __init__(self):
        self.base_url = os.getenv("OPENHUB_API_URL", "http://localhost:8002")
        self.token = os.getenv("OPENHUB_API_TOKEN", "dev_token")
        self.client = httpx.Client(
            headers={"Authorization": f"Bearer {self.token}"},
            timeout=30
        )
    
    async def create_issue(
        self,
        repository: str,
        title: str,
        description: str,
        labels: list,
        custom_fields: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create issue in OpenHub"""
        
        payload = {
            "repository": repository,
            "title": title,
            "description": description,
            "labels": labels,
            "custom_fields": custom_fields or {},
        }
        
        response = self.client.post(
            f"{self.base_url}/api/v1/brain/issues/create",
            json=payload
        )
        response.raise_for_status()
        return response.json()
```

---

## Testing Your Integration

```bash
# Terminal 1: Start Aetherdesk
cd aetherdesk_scaffold
.\.venv\Scripts\python.exe -m uvicorn apps.api.main:app --port 8000

# Terminal 2: Start Deterministic Brain
cd deterministic-brain-main
python main.py --port 8001

# Terminal 3: Start OpenHub
cd OpenHub-main
npm start  # or appropriate start command

# Terminal 4: Run integration test
cd deterministic-brain-main
pytest tests/integration/test_aetherdesk_integration.py -v
```

---

## Success Criteria

✅ Aetherdesk sends webhook when call ends  
✅ Deterministic Brain receives and verifies signature  
✅ Lead is created in Brain database  
✅ Lead is routed based on characteristics  
✅ OpenHub issue is created for high-value leads  
✅ All systems stay healthy and no data is lost  

Next: Move to Phase 4 - Uplift Venture Integration

