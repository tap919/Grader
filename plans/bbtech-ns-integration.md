# Plan: Integrate BB-Tech Research Pipeline with Northside Smoke

## Goal
Establish Northside Smoke as the first digital THC/Hemp research lab that autonomously generates scientifically-backed research papers using BB-Tech formulas, scientific literature, and real-time news.

## Step 1: Establish Research Pipeline Bridge
- **Context:** BB-Tech holds the research formulas/systems. Northside Smoke is the product platform.
- **Task:** Create a bridge service that allows BB-Tech to push research data and Northside Smoke to request papers.
- **Verification:** Establish API endpoint connectivity between `bbtech/` and `northside-smoke/`.

## Step 2: Implement Autonomous Paper Generation Engine
- **Context:** Need to ingest current news, science papers, and BB-Tech formulas.
- **Task:** Implement `ResearchGenerator` service in BB-Tech.
- **Verification:** Generate a test research paper with dummy data and verify format.

## Step 3: Implement Research Database & Forum
- **Context:** Papers need to be stored and disseminated.
- **Task:**
    - Create database schema for storing generated research papers.
    - Build a front-end view in Northside Smoke to display papers (the "forum").
- **Verification:** Successfully store and retrieve a research paper.

## Step 4: Compliance & Scientific Backing
- **Context:** Papers must be credible and scientifically backed.
- **Task:** Implement compliance review flow (hook BB-Tech research decisions into Northside Smoke compliance dashboard).
- **Verification:** Run existing `compliance_bridge.spec.ts` in `northside-smoke/`.
