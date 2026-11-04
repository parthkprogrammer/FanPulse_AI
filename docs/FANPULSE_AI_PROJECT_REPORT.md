# FANPULSE AI — FINAL TECHNICAL PROJECT REPORT
## AI-Powered Cricket Match Intelligence & Fantasy Companion

---

```
================================================================================
                                 FANPULSE AI
          AI-POWERED CRICKET MATCH INTELLIGENCE AND FANTASY COMPANION
================================================================================

      Assignment Track: Dream11 – "Show Us What You Would Build"
      Role: Forward Deployed Engineer Intern Assignment
      Candidate / Author: Parth Kedar
      GitHub Repository: https://github.com/parthkprogrammer/FanPulse_AI
      Production Application: https://fanpulseai-nine.vercel.app/dashboard
      Active Development Branch: feat/fanpulse-development
      Evaluation Date: November 2026
================================================================================
```

---

## 1. Cover Page

* **Project Title:** FanPulse AI: AI-Powered Cricket Match Intelligence and Fantasy Companion
* **Target Domain:** Sports Analytics, Fantasy Sports Systems, Grounded Generative AI, Distributed Serverless Architecture
* **Applicant:** Parth Kedar
* **Target Role:** Forward Deployed Engineer Intern — Dream11
* **Live Production URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)
* **GitHub Repository:** [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI)
* **Branch:** `feat/fanpulse-development`

---

## 2. Abstract

During live cricket fixtures, fans routinely switch between 3 to 5 separate applications: one for ball-by-ball scores, another for fantasy leagues, a third for player career statistics, and social commentary feeds for tactical explanations. This fragmented experience causes severe cognitive overload and disconnects match dynamics from fantasy point calculations.

**FanPulse AI** unifies the cricket match experience into a single responsive web platform. It integrates live-style match telemetry, 11-player fantasy squad drafting, deterministic backend fantasy scoring, side-by-side squad comparison, and an AI-powered Match Assistant.

To guarantee mathematical integrity, the platform strictly separates deterministic arithmetic from generative AI:
1. **Deterministic Fantasy Scoring:** Handled entirely by server-side TypeScript business logic and PostgreSQL triggers. It calculates exact base points, milestone bonuses, and Captain (2.0×) / Vice-Captain (1.5×) multipliers with audit logging, eliminating mathematical hallucination.
2. **AI Match Assistant:** Uses Google’s Gemini API (`gemini-1.5-flash`) via a secure Supabase Edge Function. It injects structured PostgreSQL telemetry (`matches`, `match_innings`, `player_match_statistics`) into token-budgeted prompts, generating natural-language explanations of game equations, death-over tactics, and fantasy point drivers with anti-hallucination guardrails.

Built on React 18, Vite, Tailwind CSS, Supabase PostgreSQL with Row-Level Security, and 9 Deno Edge Functions, FanPulse AI is fully verified by an automated 461-test suite and deployed live on Vercel and Supabase Cloud.

---

## 3. Introduction

Cricket is the world's second most-watched sport, with over 2.5 billion followers globally. The explosive growth of fantasy sports platforms like Dream11 has transformed fans from passive spectators into active match strategists. However, cricket's multi-innings dynamics (run rates, bowling economies, powerplays, death-over equations) make it difficult for fans to understand *why* a match is shifting and *how* on-field events translate into fantasy leaderboard movements.

FanPulse AI bridges this gap. By combining real-time match telemetry with grounded AI intelligence, it serves as an interactive companion that educates, informs, and engages fans throughout the match lifecycle.

---

## 4. Problem Statement

Modern sports enthusiasts face four fundamental challenges:
1. **Application Fragmentation:** Fans constantly switch between live score apps (Cricbuzz), fantasy apps (Dream11), and statistics databases (ESPNcricinfo).
2. **Scoreboard Without Context:** A raw score like `184/4 (19.2 ov)` does not explain whether the batting side holds momentum, who anchored the chase, or how pitch conditions impacted the bowler's economy.
3. **Fantasy Point Opacity:** Fantasy platforms display calculated totals but rarely explain the tactical causes behind player points (e.g., how dot balls, economy rate thresholds, and milestone bonuses contributed to a player's 112-point tally).
4. **LLM Hallucination Risk in Sports:** General-purpose AI chatbots invent scores, fabricate bowling figures, and hallucinate player statistics because they lack real-time grounding in authoritative relational databases.

---

## 5. Objectives

* **Decoupled Architecture:** Build an application where fantasy point calculation is 100% deterministic, while natural language explanations are handled by a grounded LLM.
* **Serverless Edge Performance:** Deploy 9 specialized Deno Edge Functions on Supabase to eliminate server provisioning and cold-start bottlenecks.
* **Zero Credential Exposure:** Store sensitive API keys (`GEMINI_API_KEY`, service-role keys) server-side, exposing only a public publishable key to the client.
* **Grounded AI RAG Architecture:** Query PostgreSQL directly to inject structured telemetry into Gemini prompts, maintaining a low temperature (`0.2`) to eliminate hallucinations.
* **Automated CI/CD Quality Gates:** Validate every pull request through GitHub Actions running linting, database migration tests, unit tests, and production asset bundling.

---

## 6. Proposed Solution

FanPulse AI replaces fragmented sports tools with a unified three-tier architecture:
1. **Client Tier:** A single-page application built with React 18, Vite, and Tailwind CSS, featuring dark-mode responsive layouts, accessible navigation, and Recharts data visualizations.
2. **Serverless Edge Tier:** 9 Supabase Deno Edge Functions acting as an API gateway, enforcing authentication, CORS preflights, input validation, and LLM prompt assembly.
3. **Authoritative Relational Database:** PostgreSQL 16 hosted on Supabase Cloud, enforcing Row-Level Security, composite indexing, and transactional stored procedures.

---

## 7. Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   FANPULSE AI STACK                    │
├─────────────────┬──────────────────────────────────────┤
│ Frontend SPA    │ React 18.3.1, Vite 5.4.10, JS        │
│ Styling         │ Tailwind CSS 3.4.14, Lucide Icons    │
│ Data Viz        │ Recharts 2.13.0                      │
│ Backend Runtime │ Supabase Edge Functions (Deno v2)    │
│ Database        │ PostgreSQL 16.4 (Supabase Cloud)     │
│ Auth & Security │ Supabase GoTrue Auth + JWT + RLS     │
│ Artificial Int. │ Google Gemini API (gemini-1.5-flash) │
│ CI/CD Pipeline  │ GitHub Actions (Node 20 + Deno v2)   │
│ Production Host │ Vercel Edge Network (Global CDN)     │
└─────────────────┴──────────────────────────────────────┘
```

---

## 8. System Architecture

The architecture maintains strict isolation between presentation, serverless execution, and persistent relational storage:
* **The Presentation Tier (`frontend/`):** Consumes JSON API responses, renders accessible cricket widgets, and optimistic UI updates.
* **The Serverless Edge Gateway (`supabase/functions/`):** Manages authorization, external API calls, prompt templates, and scoring logic.
* **The Persistent Data Tier (`supabase/migrations/`):** Guarantees data durability, relationship enforcement, and tenant isolation via PostgreSQL RLS.

---

## 9. Architecture Diagram

```mermaid
graph TD
    Client["Client Browser (React 18 SPA)"] -->|HTTPS / WSS| Vercel["Vercel Global Edge CDN"]
    Vercel -->|Serves Static Assets| Client
    Client -->|Axios REST / Bearer JWT| EdgeGateway["Supabase Edge Functions (Deno Runtime)"]
    Client -->|Supabase-JS Public Reads| PostgREST["Supabase PostgREST Engine"]

    subgraph EdgeRuntime ["Serverless Micro-Services (9 Edge Functions)"]
        EdgeGateway --> HCheck["health-check"]
        EdgeGateway --> VTeam["validate-fantasy-team"]
        EdgeGateway --> CTeam["compare-fantasy-teams"]
        EdgeGateway --> CScore["calculate-fantasy-scoring"]
        EdgeGateway --> MTeam["manage-fantasy-teams"]
        EdgeGateway --> MMatch["manage-matches"]
        EdgeGateway --> MPlayer["manage-players"]
        EdgeGateway --> SData["sync-cricket-data"]
        EdgeGateway --> AIAssist["ai-assistant"]
    end

    subgraph DataStorage ["Authoritative Storage (PostgreSQL 16)"]
        PostgREST --> RLSFilter["Row Level Security (RLS)"]
        VTeam & CTeam & CScore & MTeam & MMatch & MPlayer & SData & AIAssist --> RLSFilter
        RLSFilter --> Tables["14 Relational Tables (matches, rosters, innings, fantasy)"]
    end

    subgraph ExternalIntelligence ["External Providers"]
        AIAssist -->|JSON Payload [MATCH_DATA]| Gemini["Google Gemini 1.5 Flash API"]
        SData -->|Sync Telemetry| CricketAPI["External Cricket Provider"]
    end
```

---

## 10. Database Design

The database is built on 9 sequential SQL migrations establishing 14 core relational entities:
* `teams` & `players`: Master sports catalogs.
* `matches`, `match_rosters`, `match_innings`, `ball_events`: Granular fixture telemetry.
* `player_match_statistics` & `player_career_statistics`: Scorecards and career metrics.
* `scoring_rules`: Versioned, configurable fantasy point matrices.
* `fantasy_teams` & `fantasy_team_players`: Custom user-drafted lineups.
* `fantasy_player_points` & `scoring_audit_logs`: Deterministic point ledgers.
* `ai_conversations` & `ai_messages`: User conversational message history.

---

## 11. ER Diagram

```mermaid
erDiagram
    TEAMS ||--o{ MATCHES : "competes_in"
    TEAMS ||--o{ MATCH_INNINGS : "bats_or_bowls"
    PLAYERS ||--o{ MATCH_ROSTERS : "rostered"
    PLAYERS ||--o{ PLAYER_MATCH_STATISTICS : "produces"
    PLAYERS ||--o{ FANTASY_TEAM_PLAYERS : "drafted_into"
    PLAYERS ||--o{ FANTASY_PLAYER_POINTS : "awarded"
    MATCHES ||--o{ MATCH_INNINGS : "contains"
    MATCHES ||--o{ PLAYER_MATCH_STATISTICS : "records"
    MATCHES ||--o{ FANTASY_TEAMS : "contested_for"
    MATCHES ||--o{ AI_CONVERSATIONS : "context_of"
    USERS ||--o{ FANTASY_TEAMS : "creates"
    USERS ||--o{ AI_CONVERSATIONS : "interacts_with"
    FANTASY_TEAMS ||--o{ FANTASY_TEAM_PLAYERS : "consists_of_11"
    FANTASY_TEAMS ||--o{ FANTASY_PLAYER_POINTS : "scored_in"
    AI_CONVERSATIONS ||--o{ AI_MESSAGES : "contains"
```

---

## 12. Functional Modules

### 1. Dashboard (`/dashboard`)
Serves as the command center. Displays the Featured Match Banner, Live Scores, Top Performers Widget, and AI Insights Preview.

### 2. Match Center (`/matches`)
Displays scheduled, ongoing, and completed fixtures with format filters (T20, ODI, Test) and live score summaries.

### 3. Match Details & Scorecards (`/matches/:matchId`)
Breaks down innings scorecards, batting figures (runs, balls, fours, sixes, strike rates, dismissals), bowling figures (overs, maidens, runs, wickets, economies), and a ball-by-ball timeline stream.

### 4. Player Profiles (`/players/:playerId`)
Displays comprehensive athlete metadata, batting/bowling styles, and career statistics grids.

### 5. Fantasy Team Builder (`/matches/:matchId/fantasy/create`)
Interactive 11-player drafting interface. Enforces role limits (at least 1 WK, 1 BAT, 1 AR, 1 BOWL), team caps (max 7 per country), captaincy multipliers, and server validation.

### 6. Fantasy Scoring Engine
Evaluates player performances against active scoring rulesets, applying bonuses and multipliers deterministically.

### 7. Fantasy Comparison (`/fantasy/compare`)
Side-by-side squad differential engine comparing total points, captaincy deltas, and common vs. unique player picks.

### 8. AI Match Assistant (`/assistant`)
Context-aware conversational interface. Features suggested prompt chips, markdown commentary rendering, and match telemetry grounding badges.

---

## 13. Backend and Edge Functions

All 9 Edge Functions reside in `supabase/functions/` and are built for the Deno Edge Runtime:

| # | Function Name | Method | Public / Protected | Primary Tables Accessed | Purpose |
|:---:|:---|:---:|:---:|:---|:---|
| 1 | `health-check` | `GET` | Public (`--no-verify-jwt`) | `matches` (read probe) | Service heartbeat, environment check, database latency probe. |
| 2 | `validate-fantasy-team` | `POST` | Public / Hybrid Auth | `fantasy_teams`, `fantasy_team_players` | Validates 11-player lineup rules (BR-TEAM-01 to 06) and persists team if authenticated. |
| 3 | `compare-fantasy-teams` | `GET, POST` | Protected (JWT) | `fantasy_teams`, `fantasy_team_players`, `fantasy_player_points` | Batched side-by-side squad differential comparison. |
| 4 | `calculate-fantasy-scoring` | `POST, GET` | Admin / Service Role | `matches`, `scoring_rules`, `player_match_statistics`, `fantasy_player_points` | Deterministic recalculation of player & team points for a match fixture. |
| 5 | `manage-fantasy-teams` | `GET, POST, PUT, DELETE` | Protected (JWT) | `fantasy_teams`, `fantasy_team_players` | Full CRUD operations for user fantasy squads. |
| 6 | `manage-matches` | `POST, PUT, PATCH` | Admin Only | `matches`, `teams` | Fixture creation, score updates, and match status lifecycle. |
| 7 | `manage-players` | `POST, PUT, PATCH` | Admin Only | `players`, `player_career_statistics` | Master athlete registry management. |
| 8 | `sync-cricket-data` | `POST, GET` | Admin / Internal | `matches`, `player_match_statistics`, `match_innings` | External provider polling with sample provider fallback. |
| 9 | `ai-assistant` | `POST` | Public / Hybrid Auth | `matches`, `match_innings`, `player_match_statistics`, `ai_conversations`, `ai_messages` | Context-grounded Gemini conversational query engine. |

---

## 14. AI Integration

### The Context Assembler (`contextAssembler.ts`)
The AI Assistant Edge Function does not pass raw user questions directly to the LLM. Instead:
1. It validates question length (max 250 characters) and strips disallowed injection phrases.
2. It queries PostgreSQL for the exact match state:
   - Match metadata from `matches`
   - Total runs, wickets, and overs from `match_innings`
   - Batting strike rates and bowling figures from `player_match_statistics`
   - Authoritative fantasy points from `fantasy_player_points`
3. It compiles this telemetry into a structured JSON string enclosed within a `[MATCH_DATA]` envelope.

### Token Budgeting & Model Parameters
* **Target Token Budget:** 1,200 to 2,200 tokens.
* **LLM Engine:** Google Gemini API (`gemini-1.5-flash`).
* **Temperature:** `0.2` (Low temperature strictly confines generation to facts).
* **System Prompt:** Instructs Gemini to rely solely on `[MATCH_DATA]`, avoid predicting upcoming winners, and bold all player names, teams, and scores.

### Anti-Hallucination Guardrails (`outputValidator.ts`)
Generated responses pass through an output sanitizer that checks for forbidden betting, gambling, and odds-related terms. If detected, the response is replaced with a safe sports analysis notice.

---

## 15. Deterministic Fantasy Scoring

Fantasy points are computed using deterministic formulas matching standard industry rules:

### 1. Batting Rules
* Run: **+1.0 pt**
* Boundary Four Bonus: **+1.0 pt** (Total: 4 + 1 = 5 pts)
* Boundary Six Bonus: **+2.0 pts** (Total: 6 + 2 = 8 pts)
* Half-Century Bonus (>=50 runs): **+10.0 pts**
* Century Bonus (>=100 runs): **+25.0 pts**
* Duck Penalty (Dismissed for 0): **-5.0 pts**

### 2. Bowling Rules
* Wicket (Excluding run-outs): **+25.0 pts**
* Maiden Over: **+10.0 pts**
* 3-Wicket Haul Bonus: **+10.0 pts**
* 5-Wicket Haul Bonus: **+25.0 pts**
* Economy Rate Bonus (Economy <= 4.0, min 2 overs): **+10.0 pts**
* Economy Rate Penalty (Economy >= 10.0, min 2 overs): **-10.0 pts**

### 3. Fielding Rules
* Catch: **+10.0 pts**
* Stumping: **+15.0 pts**
* Direct Run-Out: **+15.0 pts**
* Indirect Run-Out: **+10.0 pts**

### 4. Multipliers
$$\text{Captain Points} = 2.0 \times \text{Base Points}$$
$$\text{Vice-Captain Points} = 1.5 \times \text{Base Points}$$

---

## 16. Security and RLS

1. **Supabase Authentication:** GoTrue JWT issuance with stateless Bearer tokens.
2. **PostgreSQL Row-Level Security (RLS):** Policies on `fantasy_teams`, `fantasy_team_players`, `fantasy_player_points`, and `ai_conversations` restrict SELECT, INSERT, UPDATE, and DELETE operations to the authenticated user (`auth.uid() = user_id`).
3. **Secret Isolation:** `GEMINI_API_KEY` and Supabase service-role keys are configured strictly in serverless runtime environments and never exposed in client bundles.
4. **CORS Hardening:** Standard preflight headers restrict unauthorized cross-origin requests.

---

## 17. Implementation Details

* **Frontend Framework:** React 18 Single Page Application initialized with Vite and structured into atomic folders (`components/`, `pages/`, `services/`, `context/`).
* **Routing:** React Router v6 with `ProtectedRoute` guards for `/fantasy/teams`, `/fantasy/create`, and `/assistant`.
* **State Management:** Local React state and Context API (`AuthContext`), eliminating heavy Redux overhead.
* **Styling:** Utility-first Tailwind CSS configured with a slate-900 / slate-800 dark theme palette.

---

## 18. Testing and Results

### Testing Matrix
The project maintains a rigorous, multi-layered automated test suite built with **Vitest**:

| Test Layer | Test Files | Total Tests | Pass Rate | Key Areas Covered |
|:---|:---:|:---:|:---:|:---|
| **Unit Tests** | 10 files | 148 tests | 100% | Scoring engine, validation schemas, rate limiters, output sanitizers. |
| **Component UI Tests** | 8 files | 94 tests | 100% | Dashboard, MatchCenter, FantasyBuilder, Comparison, Modals, Forms. |
| **Edge Function & DB QA** | 6 files | 114 tests | 100% | Edge Function mocks, CORS headers, RLS policy logic, SQL constraints. |
| **Integration & Verification** | 6 files | 105 tests | 100% | End-to-end fantasy creation, AI context assembly, RAG evaluation. |
| **TOTAL** | **30 files** | **461 tests** | **100%** | **All 461 tests passing cleanly.** |

### Build Verification
* **Tool:** Vite v5.4.10 / Rollup.
* **Duration:** 7.33 seconds.
* **Output:** Clean production bundle (`dist/index.html` 0.90 kB, `dist/assets/index-*.js` 1,207 kB / 335.8 kB gzip) with zero compilation or lint errors.

---

## 19. Production Deployment

* **Frontend Hosting:** Vercel Global Edge Network connected to the GitHub repository. Deployed live at: [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard).
* **Backend Hosting:** Supabase Managed Cloud (`zovgiiqamqfbqiopkooc`).
* **CI/CD Pipeline (`.github/workflows/ci.yml`):**
  - Triggered on push and pull requests to `main` and `feat/**`.
  - Job 1 (`frontend-ci`): Node 20, `npm ci`, ESLint, Vitest run, Vite production build, artifact archiving.
  - Job 2 (`supabase-ci`): Deno v2, Supabase CLI, `config.toml` validation, 9 SQL migrations syntax check, `seed.sql` integrity check, backend test suite execution.

---

## 20. Actual Application Screenshots

The following screenshots were captured from the live deployment at `https://fanpulseai-nine.vercel.app` using automated Chromium headless browser capture:

### 20.1 Main Match Dashboard
![FanPulse AI Dashboard](screenshots/01_dashboard.png)
*Figure 20.1: Live Dashboard featuring the India vs Australia 3rd T20I at the MCG, Live Scores, AI Insights Preview, and Top Performers.*

### 20.2 Cricket Match Center
![Cricket Match Center](screenshots/02_match_center.png)
*Figure 20.2: Match Center with multi-format tabs (T20, ODI, Test), status filters (All, Live, Upcoming, Completed), and match cards.*

### 20.3 Match Detail View
![Match Details](screenshots/03_match_details.png)
*Figure 20.3: Match Header for India vs Australia with venue, toss summary, and innings tabs.*

### 20.4 Innings Scorecards
![Match Scorecard](screenshots/04_match_scorecard.png)
*Figure 20.4: Scorecard breakdown showing individual batter strike rates, dismissals, and bowler economy figures.*

### 20.5 Player Profile
![Player Profile](screenshots/05_player_profile.png)
*Figure 20.5: Athlete profile for Virat Kohli with career statistics across matches, runs, average, and strike rate.*

### 20.6 User Authentication Screen
![User Authentication](screenshots/06_user_authentication.png)
*Figure 20.6: User authentication interface with GoTrue session handling, input validation, and security notice.*

### 20.7 Fantasy Team Builder
![Fantasy Team Builder](screenshots/07_fantasy_team_builder.png)
*Figure 20.7: Fantasy Team Builder interface showing 11 drafted players, role constraint validation (1 WK, 4 BAT, 3 AR, 3 BOWL), and Captain (Virat Kohli 2.0×) and Vice-Captain (Jasprit Bumrah 1.5×) designated.*

### 20.8 Fantasy Team Comparison
![Fantasy Team Comparison](screenshots/08_fantasy_team_comparison.png)
*Figure 20.8: Head-to-head Fantasy Team Comparison dashboard displaying total fantasy points, point differentials, common vs differential player badges (18 differentials, 2 common), and role breakdown chart.*

### 20.9 Cricket Intelligence Assistant Interface
![Cricket Intelligence Assistant](screenshots/09_ai_assistant.png)
*Figure 20.9: AI Assistant workspace displaying match context selection, grounding guardrails badge, and domain-tailored prompt suggestions.*

### 20.10 Grounded AI Match Synthesis
![AI Assistant Response](screenshots/10_ai_assistant_response.png)
*Figure 20.10: Grounded Gemini 1.5 Flash natural language explanation summarizing India vs Australia (184/4 in 19.2 ov vs 178/8 in 20 ov, Kohli 74*, Bumrah 3/24) with zero hallucinations.*

---

## 21. Limitations

1. **Seeded Fixture Data:** Current live matches (e.g. India vs Australia 3rd T20I) utilize realistic sample telemetry seeded into PostgreSQL. Real-time authorized CricAPI sync is implemented in `sync-cricket-data` but requires an active third-party enterprise subscription for live ball updates.
2. **Fantasy Comparison Service RLS Dependency:**
   - In production, calling `/compare-fantasy-teams` without two pre-created teams belonging to the authenticated user for that fixture legitimately returns `404 Not Found: One or both fantasy teams were not found in the database.`
   - This occurs because Row-Level Security protects squad privacy, preventing comparison against non-existent or other users' squads.
3. **AI Explanation Depth:** The accuracy of the AI Assistant's narrative depends on the completeness of telemetry rows present in `match_innings` and `player_match_statistics`.

---

## 22. Future Scope

1. **WebSocket Telemetry Streaming:** Replace polling with Supabase Realtime WebSocket channels for live ball-by-ball animations and instant fantasy leaderboard shifts.
2. **Voice Assistant Mode:** Integrate Web Speech API and Gemini Multimodal Live API for spoken cricket commentary.
3. **Automated Contest Matching:** Allow users to enter drafted fantasy squads into peer-to-peer leagues with automated leaderboard ranking.
4. **Predictive Fantasy Projections:** Introduce machine learning models to project expected player performance based on pitch wear and historical matchups.

---

## 23. Conclusion

**FanPulse AI** demonstrates how sports analytics, deterministic business logic, and generative AI can be harmoniously unified. By decoupling mathematical fantasy scoring from natural language synthesis and grounding Google Gemini in authoritative PostgreSQL telemetry, the platform solves the problem of sports app fragmentation without falling prey to AI hallucinations.

The application stands fully implemented, verified through an automated 461-test suite, and deployed live on Vercel and Supabase, making it a compelling, production-ready submission for the **Dream11 Forward Deployed Engineer Intern Assignment**.

---

## 24. References

1. **Project Repository:** [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI)
2. **Live Production Artifact:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)
3. **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
4. **Google Gemini API Documentation:** [https://ai.google.dev/docs](https://ai.google.dev/docs)
5. **React 18 & Vite Documentation:** [https://react.dev/](https://react.dev/), [https://vitejs.dev/](https://vitejs.dev/)
6. **PostgreSQL 16 Documentation:** [https://www.postgresql.org/docs/16/](https://www.postgresql.org/docs/16/)
7. **Dream11 Fantasy Rules:** Standard Dream11 T20 & ODI Scoring Guidelines.
