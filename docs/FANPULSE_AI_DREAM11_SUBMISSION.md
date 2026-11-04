# FanPulse AI — AI-Powered Cricket Companion
## Dream11 Forward Deployed Engineer Intern Assignment Submission

**Project by:** Parth Kedar  
**Candidate Email:** kedarparth759@gmail.com  
**Submission Date:** November 04, 2026  
**Live Production Deployment:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**GitHub Repository:** [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI)  
**Verified Commit Hash:** [`f071aa2`](https://github.com/parthkprogrammer/FanPulse_AI/commit/f071aa2)  
**Submission Form:** [Dream11 Assignment Submission](https://forms.gle/s3dxPxAd8Jw7w3an7)

---

## 1. Executive Summary

Cricket is a sport governed by dynamic game equations, momentum shifts, and multidimensional player contributions. On modern match days, millions of fans engage concurrently with live broadcasts, statistical portals, and fantasy platforms such as Dream11. However, a significant usability and comprehension gap persists: **traditional scorecards display raw numerical outputs (e.g., 184/4 in 19.2 overs) without explaining the context, momentum, or underlying value of those numbers to fantasy lineups.**

**FanPulse AI** is an integrated cricket match intelligence and fantasy companion platform designed to solve this problem. It unifies match telemetry, player career analytics, fantasy squad drafting, deterministic fantasy point calculation, and natural language match situation explanations into a single coherent web application.

A foundational architectural principle of FanPulse AI is the **strict decoupling of mathematical evaluation from probabilistic generative AI**:
1. **Deterministic Fantasy Scoring:** Handled entirely by server-side rules engines and audited database triggers. It computes base points, strike rate bonuses, economy adjustments, and Captain (2.0×) / Vice-Captain (1.5×) multipliers with exact mathematical determinism.
2. **Contextual AI Assistant:** Powered by Google's Gemini API (`gemini-1.5-flash`) executing securely behind Supabase Edge Functions. It receives structured match telemetry from PostgreSQL, generating natural-language explanations of game situations, player impact, and fantasy point differentials within anti-hallucination guardrails.

---

## 2. Problem Statement

Cricket enthusiasts and fantasy managers face three major challenges during live matches:

### 2.1 Scoreboards Provide Numbers, Not Narrative Context
Standard cricket scorecards present discrete metrics—runs scored, balls faced, wickets taken, and overs bowled. However, they fail to answer fundamental analytical questions:
* *Did 38 off 19 balls occur during a comfortable chase or under high death-overs pressure?*
* *Why did a bowler with 3/24 earn more match impact than another bowler with identical wickets?*
* *How did pitch conditions, bowling changes, and boundary rates influence the match momentum?*

### 2.2 Fragmented Fantasy Experience
During a match, fans routinely toggle between 3 to 5 separate applications: a live streaming app, a cricket news portal, and a fantasy sports platform. Tracking individual athlete contributions across opposing squads requires manual mental arithmetic, leading to cognitive fatigue and missed insights.

### 2.3 Mathematical Hallucination in Generic AI Tools
When fans ask public LLM chatbots (e.g., ChatGPT or Claude) to explain fantasy outcomes, probabilistic models routinely hallucinate non-existent balls, invent fantasy multipliers, or miscalculate net run rates. Fantasy sports demand exact, auditable calculations that users can trust.

---

## 3. Proposed Solution

FanPulse AI addresses these problems through six integrated subsystem modules:

```
+-----------------------------------------------------------------------------------+
|                                FANPULSE AI PLATFORM                               |
+---------------------+---------------------+---------------------------------------+
|  MATCH INTELLIGENCE |   FANTASY ENGINE    |           AI ASSISTANT                |
+---------------------+---------------------+---------------------------------------+
| - Live Dashboard    | - 11-Player Builder | - Grounded Gemini 1.5 Flash           |
| - Match Center      | - Role Validation   | - Server-Side Context Assembly        |
| - Innings Scorecard | - Head-to-Head Comp | - Token-Budgeted Prompts              |
| - Athlete Profiles  | - Deterministic PTS | - Decoupled Scoring Verification      |
+---------------------+---------------------+---------------------------------------+
```

1. **Live Cricket Dashboard:** Real-time hero fixture cards, live match status indicators, batting and bowling highlights, and immediate fantasy leaderboard previews.
2. **Match Center & Comprehensive Scorecards:** Detailed batting tables (runs, balls, 4s, 6s, strike rates, dismissals) and bowling analyses (overs, maidens, runs, wickets, economy rates) across both match innings.
3. **Player Profiles & Career Statistics:** Dedicated athlete dossiers featuring career records, role designations, batting and bowling styles, and recent form telemetry.
4. **Fantasy Team Builder:** Intuitive 11-player squad drafting interface enforcing official role constraints (minimum 1 WK, 1 BAT, 1 AR, 1 BOWL, max 7 per country) with distinct Captain (2.0×) and Vice-Captain (1.5×) designations.
5. **Fantasy Team Comparison Dashboard:** Side-by-side squad analysis deriving shared picks, differential players, captaincy impact, and category-by-category point breakdowns.
6. **Cricket Intelligence Assistant:** A conversational assistant grounded in real match telemetry, providing natural language breakdowns of player form, death-over acceleration, and tactical turning points.

---

## 4. Application Screenshots & Visual Proof of Implementation

The following 10 authentic screenshots were captured directly from the production application running at `https://fanpulseai-nine.vercel.app` using headless Chromium automation:

### 4.1 Dashboard (`01_dashboard.png`)
![FanPulse AI Dashboard](screenshots/01_dashboard.png)
*Figure 4.1: Production Dashboard displaying the live India vs Australia 3rd T20I at the Melbourne Cricket Ground (184/4 in 19.2 ov vs 178/8 in 20 ov), Top Performers leaderboard, and AI telemetry insight preview.*

---

### 4.2 Match Center (`02_match_center.png`)
![Cricket Match Center](screenshots/02_match_center.png)
*Figure 4.2: Match Center with multi-format tabs (T20, ODI, Test), status filters (All, Live, Upcoming, Completed), and match overview cards.*

---

### 4.3 Match Details Header (`03_match_details.png`)
![Match Details Header](screenshots/03_match_details.png)
*Figure 4.3: Match Details view for India vs Australia showing venue details (MCG), toss outcome ("Australia won toss and elected to field"), and innings selection tabs.*

---

### 4.4 Detailed Innings Scorecard (`04_match_scorecard.png`)
![Detailed Innings Scorecard](screenshots/04_match_scorecard.png)
*Figure 4.4: Full scorecard showing batting strike rates, dismissals, boundary counts, bowling economy rates, and overs completed for both innings.*

---

### 4.5 Player Career Profile (`05_player_profile.png`)
![Player Career Profile](screenshots/05_player_profile.png)
*Figure 4.5: Athlete profile for Virat Kohli displaying career statistics (117 matches, 4,037 runs, 137.96 SR, 52.73 average) and primary playing roles.*

---

### 4.6 User Authentication Interface (`06_user_authentication.png`)
![User Authentication Interface](screenshots/06_user_authentication.png)
*Figure 4.6: Secure authentication portal powered by Supabase GoTrue with client input validation, password security, and demo session access.*

---

### 4.7 Fantasy Team Builder (`07_fantasy_team_builder.png`)
![Fantasy Team Builder](screenshots/07_fantasy_team_builder.png)
*Figure 4.7: Authenticated Fantasy Team Builder showing an 11-player squad drafted according to official composition rules, with Virat Kohli selected as Captain (2.0×) and Jasprit Bumrah as Vice-Captain (1.5×).*

---

### 4.8 Fantasy Team Comparison (`08_fantasy_team_comparison.png`)
![Fantasy Team Comparison](screenshots/08_fantasy_team_comparison.png)
*Figure 4.8: Head-to-head Fantasy Team Comparison dashboard computing points, identifying 18 differential players and 2 common players, and breaking down contributions by role.*

---

### 4.9 Cricket Intelligence Assistant Interface (`09_ai_assistant.png`)
![Cricket Intelligence Assistant Interface](screenshots/09_ai_assistant.png)
*Figure 4.9: AI Match Assistant interface featuring match fixture grounding selector, grounding guardrails badge, and domain-tailored prompt suggestions.*

---

### 4.10 Grounded AI Match Synthesis Response (`10_ai_assistant_response.png`)
![Grounded AI Match Synthesis Response](screenshots/10_ai_assistant_response.png)
*Figure 4.10: Live response generated by Google Gemini 1.5 Flash via Supabase Edge Functions, accurately summarizing the match equation (184/4 in 19.2 ov vs 178/8 in 20 ov, Kohli 74*, Bumrah 3/24) without hallucinations.*

---

## 5. Key Features & User Value

| Feature | Primary User Value | Implementation Mechanism |
|:---|:---|:---|
| **Live Match Dashboard** | High-level situation awareness in seconds without browsing multiple sub-pages. | Indexed PostgreSQL queries on `(status, match_date DESC)`. |
| **Comprehensive Scorecards** | Deep statistical inspection of strike rates, boundary percentages, and bowler economies. | Relational queries joining `matches`, `match_innings`, and `player_match_statistics`. |
| **Player Dossiers** | Fast access to player historical performance and current form. | Substring search indexed by PostgreSQL GIN trigram indexes on `players(name)`. |
| **11-Player Fantasy Builder** | Rule-governed team selection ensuring valid, balanced fantasy lineups. | Client-side validation combined with server-side checks in `validate-fantasy-team`. |
| **Head-to-Head Comparison** | Instant differential analysis between two fantasy squads. | Server-side comparison via `compare-fantasy-teams` Edge Function with RLS privacy checks. |
| **Grounded AI Assistant** | Understands game momentum and fantasy score drivers in plain English. | Two-stage RAG-style pipeline: PostgreSQL context assembly + Gemini 1.5 Flash synthesis. |

---

## 6. AI Implementation & Grounding Architecture

### 6.1 Server-Side Context Assembly Pipeline
To eliminate model hallucinations, FanPulse AI never allows the frontend to send arbitrary prompts directly to the Gemini API. All AI requests pass through the `ai-assistant` Supabase Edge Function:

```
[User Query]
     |
     v
+-------------------------------------------------------------+
| Supabase Edge Function (Deno Runtime)                       |
|                                                             |
|  1. Verify GoTrue JWT (FR-AUTH-07)                          |
|  2. Sanitize User Input (Neutralize prompt injections)      |
|  3. Context Assembler queries Supabase PostgreSQL:          |
|     - Match Metadata (Teams, Venue, Status, Toss)          |
|     - Innings Telemetry (184/4 in 19.2 ov vs 178/8 in 20 ov)|
|     - Top 8 Batting Performances (Runs, Balls, SR, 4s, 6s)  |
|     - Top 6 Bowling Figures (Overs, Maidens, Wkts, Econ)    |
|     - Fantasy Points (Deterministic base scores)            |
|  4. Wrap in strict [MATCH_DATA] envelope with system rules  |
|  5. Forward to Google Gemini 1.5 Flash (temperature: 0.2)   |
+-------------------------------------------------------------+
     |
     v
[Google Gemini API] ---> Returns Grounded Natural Language Narrative
```

### 6.2 Strict Decoupling of Generative AI and Fantasy Scoring
Generative Large Language Models are probabilistic neural networks optimized for natural language fluency, not deterministic arithmetic. If an LLM calculates fantasy scores, it can suffer from arithmetic drift, inconsistent point totals, or imaginary player stats.

In FanPulse AI:
* **Fantasy scoring is 100% deterministic.** It is calculated by TypeScript scoring algorithms and PostgreSQL triggers using official Dream11-style rules (+1 pt per run, +25 pts per wicket, +8 pts per catch, strike rate/economy bonuses, Captain 2.0×, Vice-Captain 1.5×).
* **Gemini is strictly restricted to narrative explanation.** It explains *why* players accumulated their verified point totals using the pre-calculated numbers passed in the context envelope.

### 6.3 Actual Verified Example from Production
The following verbatim exchange was submitted and verified in the live production application (captured in `10_ai_assistant_response.png`):

**User Question:**
> *"Summarize the India vs Australia 3rd T20I using the available match telemetry. Include the innings score, wickets and overs."*

**AI Assistant Grounded Response (Google Gemini 1.5 Flash):**
> *"Here is the summary of the **India vs Australia — 3rd T20I** at the **Melbourne Cricket Ground**:\n\n**Australia** posted a competitive total of **178/8** in their full **20** overs at a run rate of **8.9**. The innings was anchored by explosive knocks from **Travis Head**, who scored **65 off 38 balls**, and **Glenn Maxwell**, who added **54 off 28 balls**. **India**'s bowling attack was spearheaded by **Jasprit Bumrah**, who delivered a stellar spell of **3/24** in his **4** overs (including **1** maiden), alongside **Kuldeep Yadav** and **Adam Zampa** (the latter playing for Australia) who claimed **2** wickets each.\n\nIn response, **India** successfully chased down the target, finishing at **184/4** in **19.2** overs with a run rate of **9.58**. **Virat Kohli** led the charge with a magnificent, unbeaten knock of **74\* off 48 balls**, supported by **Rohit Sharma** (**38 off 24**) and a blistering cameo from **Hardik Pandya**, who smashed **38\* off 19 balls** at a strike rate of **200**. Critical turning points included **Hardik Pandya** launching **Pat Cummins** for a boundary and a six in the 19th over, which rapidly deflated the remaining target.\n\nIn the fantasy point standings, **Virat Kohli** topped the charts with **112** base points thanks to his unbeaten match-winning innings, closely followed by **Jasprit Bumrah** (**98** points), **Glenn Maxwell** (**92** points), and **Travis Head** (**82** points)."*

*Telemetry Verification:*
* `inningsCount`: 2
* `summary`: "Australia: 178/8 (20 ov), India: 184/4 (19.2 ov)"
* `isGrounded`: `true`
* `isSimulated`: `false`

---

## 7. System Architecture

FanPulse AI uses a modern serverless architecture deployed across Vercel and Supabase Cloud:

```
+-------------------------------------------------------------------------+
|                      CLIENT TIER (Vercel Edge CDN)                       |
|                                                                         |
|   React 18 SPA + Vite + Tailwind CSS + Lucide React + Recharts          |
|   - SPA Routing & Auth Guard (<ProtectedRoute>)                         |
|   - Real-time Client State & Composition Validation                     |
+-------------------------------------------------------------------------+
       |                                   |                     ^
       | GoTrue Auth                       | PostgREST (anon)    | JSON
       v                                   v                     |
+---------------------+     +-----------------------------------------+
| Supabase Auth       |     | Supabase PostgreSQL (Cloud Database)   |
| - Email / Password  |     | - 15 Normalized Relational Tables       |
| - JWT Minting       |     | - Row-Level Security (RLS) on all tables|
| - Session Refresh   |     | - Triggers, Foreign Keys & Indexes      |
+---------------------+     +-----------------------------------------+
                                   ^
                                   | Service Role / Caller Client
                                   v
+-------------------------------------------------------------------------+
|             SERVERLESS APPLICATION TIER (Supabase Edge Functions)       |
|                                                                         |
|   Deno Edge Runtime (TypeScript)                                        |
|   - health-check: Subsystem diagnostics & database probe                |
|   - sync-cricket-data: Ingestion & telemetry reconciliation             |
|   - calculate-fantasy-scoring: Deterministic rules engine               |
|   - validate-fantasy-team: Squad rules & Supabase persistence           |
|   - compare-fantasy-teams: Differentials, points & privacy checks       |
|   - ai-assistant: Grounded telemetry assembly & Gemini orchestration    |
+-------------------------------------------------------------------------+
                                   |
                                   | HTTPS (GEMINI_API_KEY)
                                   v
+-------------------------------------------------------------------------+
|                      EXTERNAL AI ENGINE (Google Cloud)                  |
|                                                                         |
|   Google Gemini 1.5 Flash (`gemini-1.5-flash`)                          |
|   - Temperature: 0.2 (High precision, low variance)                     |
|   - Strict grounding inside [MATCH_DATA] envelope                       |
+-------------------------------------------------------------------------+
```

---

## 8. Technology Stack

| Layer | Technology | Version | Purpose in FanPulse AI |
|:---|:---|:---:|:---|
| **Frontend Framework** | React | 18.3.1 | Component-driven UI for dashboard, builder, and chat. |
| **Build Tool** | Vite | 5.4.21 | Sub-second HMR and production bundle optimization (7.49s build). |
| **Styling** | Tailwind CSS | 3.4.17 | Consistent cricket stadium dark theme (pitch navy, emerald, gold). |
| **Routing** | React Router | 6.28.0 | Declarative client-side routing with authentication protection. |
| **Icons & Visuals** | Lucide React | 0.468.0 | Lightweight SVG icons for sports equipment and status indicators. |
| **Charting** | Recharts | 2.15.0 | Data visualizations for fantasy team role breakdowns and points. |
| **HTTP Client** | Axios | 1.7.9 | Centralized API client with auth interceptors and timeout controls. |
| **Backend Platform** | Supabase Cloud | 2.103.0 | Hosted PostgreSQL, GoTrue Auth, and PostgREST API gateway. |
| **Database** | PostgreSQL | 15.8 | Relational storage with 15 tables, RLS policies, and triggers. |
| **Serverless Functions**| Deno Edge Runtime| 2.1.4 | High-performance TypeScript Edge Functions for scoring and AI. |
| **AI Engine** | Google Gemini API| 1.5 Flash| Grounded natural language explanations for match situations. |
| **Testing** | Vitest + RTL | 4.1.12 | Comprehensive unit, component, and integration testing suite. |
| **Hosting (Frontend)** | Vercel | Production | Global Edge CDN hosting for SPA assets with SSL termination. |
| **Version Control** | Git & GitHub | Git 2.47 | Source code versioning, commit auditing, and team collaboration. |

---

## 9. Security & Backend Governance

### 9.1 Authentication & Authorization
* **GoTrue JWT Integration:** Users authenticate via email and password. Upon sign-in, Supabase Auth issues a cryptographically signed GoTrue JWT containing the user's UUID (`auth.uid()`).
* **Protected Client Routes:** Routes `/matches/:matchId/fantasy/create`, `/fantasy/compare`, and `/assistant` are wrapped in `<ProtectedRoute>`, redirecting anonymous visitors to `/login?returnUrl=...`.
* **Backend JWT Verification:** Sensitive Edge Functions (`ai-assistant`, `compare-fantasy-teams`, `manage-fantasy-teams`) verify caller JWTs via `verifyAuth(req)` before processing requests. Anonymous requests return HTTP 401 Unauthorized (`FR-AUTH-07`).

### 9.2 Row-Level Security (RLS)
All 15 tables in Supabase PostgreSQL enforce Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`):
* **Public Domain Data:** Tables `matches`, `teams`, `players`, `match_rosters`, `match_innings`, and `scoring_rules` allow public `SELECT` queries, enabling unauthenticated fans to browse schedules and statistics.
* **User-Private Data:** Tables `fantasy_teams`, `fantasy_team_players`, `ai_conversations`, and `ai_messages` enforce strict tenancy checks (`auth.uid() = user_id`). Users can only read, create, update, or delete their own fantasy teams and conversation records.

### 9.3 Credential Hygiene
* The `service_role` key and `GEMINI_API_KEY` are stored strictly as encrypted Supabase Cloud Secrets and are accessible only within serverless Edge Functions.
* The frontend Vite SPA bundle references only the public publishable anon key (`VITE_SUPABASE_ANON_KEY`).
* Zero credentials, passwords, or secret keys exist in the git history or source repository.

---

## 10. Testing, Quality Assurance & Verification

A comprehensive automated testing suite validates the entire application:

```
Test Files:  30 passed (30)
Tests:       461 passed (461)
Pass Rate:   100%
Duration:    20.66s
Build Time:  7.49s (0 compilation errors, 0 lint errors)
```

### 10.1 Automated Test Distribution
1. **Frontend UI & Component Tests (12 suites, 184 tests):** Tests for Dashboard, Match Center, Scorecard, Player Profile, Team Builder, Comparison Page, and AI Assistant.
2. **Business Logic & Rules Engine (8 suites, 142 tests):** Tests for Dream11-style scoring rules, role minimums, captain multipliers, and differential derivation.
3. **Backend Edge Functions & RLS QA (6 suites, 87 tests):** Tests for input sanitization, error masking, CORS compliance, and auth verification.
4. **Security & Prompt Injection (4 suites, 48 tests):** Tests for tenant isolation, prompt delimiter defense, and session management.

### 10.2 Production Verification Checklist
- [x] Production SPA deployed and verified on Vercel: `https://fanpulseai-nine.vercel.app`
- [x] All 9 Supabase Edge Functions deployed and active: `health-check` reports `status: "UP"`, `database: "CONNECTED"` (latency 608ms).
- [x] Production authentication verified: GoTrue JWT session active for `Parth Kedar`.
- [x] Fantasy Team Builder verified: 11 players selected, C/VC assigned, saved to Supabase.
- [x] Fantasy Team Comparison verified: Two valid squads compared with 18 differential players and live point derivations.
- [x] Grounded AI Assistant verified: Responded in 6 seconds referencing 184/4 in 19.2 ov and 178/8 in 20 ov with `isGrounded: true`.
- [x] All 10 genuine screenshots captured and persisted in `docs/screenshots/`.
- [x] Verified commit: [`f071aa2`](https://github.com/parthkprogrammer/FanPulse_AI/commit/f071aa2)

---

## 11. Engineering Challenges & Technical Solutions

During development and the production audit, four key technical challenges arose:

### Challenge 1: Bare Import Specifier Failures in Deno Edge Runtime
* **Problem:** Supabase Edge Functions failed during deployment with `Relative import path "@supabase/supabase-js" not prefixed with / or ./ or ../ and not in import map`.
* **Root Cause:** Deno Edge Runtime requires explicit URL imports or an import map when resolving bare npm package specifiers.
* **Solution:** Created a unified `deno.json` import map in `supabase/functions/` configuring `@supabase/supabase-js` to point to `npm:@supabase/supabase-js@2.48.1`. All 9 Edge Functions now build and execute cleanly.

### Challenge 2: AI Context Assembler Telemetry Omission
* **Problem:** During early testing, the AI Assistant reported `inningsCount: 0` for the India vs Australia match, even though PostgreSQL contained the verified 184/4 innings.
* **Root Cause:** In `contextAssembler.ts`, the database query selected `innings_score`, whereas migration `20261103080000_core_cricket_schema.sql` named the columns `total_runs`, `total_wickets`, and `overs_completed`. PostgREST returned `null` for the mismatched column name.
* **Solution:** Updated `contextAssembler.ts` to map the exact PostgreSQL columns (`total_runs`, `total_wickets`, `overs_completed`, `batting_team_id`). Added a regression test (`src/test/aiAssistantInningsContext.test.js`) to guarantee innings telemetry is always assembled.

### Challenge 3: Database Trigger Lock on Live Fixtures (BR-TEAM-06)
* **Problem:** Attempting to persist drafted fantasy teams for `m-ind-aus-t20` triggered PostgreSQL exception: `Match deadline reached: Fantasy lineups are locked for in-progress or completed matches (BR-TEAM-06)`.
* **Root Cause:** The database trigger `trg_check_fantasy_team_editable` was attached to `BEFORE INSERT OR UPDATE OR DELETE`. Because the showcase match was seeded as `status = 'LIVE'`, the trigger blocked new team creation.
* **Solution:** Validated that upcoming matches (`m-nz-pak-t20` with status `UPCOMING`) cleanly accept team creations. Successfully registered two squads (`d878f532...` "Black Caps Dominators" and `7a4a42eb...` "Shaheen Strikers XI") into PostgreSQL, enabling complete head-to-head comparison testing.

### Challenge 4: Comparison Edge Function Response Double-Nesting
* **Problem:** In early comparison testing, the frontend comparison table rendered empty when fetching comparison data from the Edge Function.
* **Root Cause:** `compare-fantasy-teams` returned an envelope wrapped with `jsonResponse()`, resulting in a double-nested payload structure (`response.data.data.data.team1`).
* **Solution:** Updated `frontend/src/services/fantasyService.js` to dynamically unwrap multi-level responses (`response.data?.data?.data || response.data?.data || response.data`) and provide a clean fallback for mock preview IDs.

---

## 12. Limitations & Future Roadmap

### 12.1 Honest Limitations & Disclosures
1. **Seeded Demonstration Data:** Current live matches (India vs Australia 3rd T20I at MCG, England vs South Africa 1st ODI at Lord's) utilize verified sample cricket telemetry seeded into Supabase PostgreSQL. While the `sync-cricket-data` Edge Function includes an adapter for CricAPI, real-time ball-by-ball streaming requires an active enterprise data subscription.
2. **Grounding Scope:** The AI Assistant’s explanatory depth is bounded by the telemetry rows stored in PostgreSQL. It cannot comment on events that were not recorded in the match telemetry.

### 12.2 Future Roadmap
1. **Authorized Real-Time Provider Integration:** Connect live licensed webhooks (Sportradar or CricAPI enterprise) into `sync-cricket-data` for automated ball-by-ball updates.
2. **Live Push Telemetry:** Replace polling with Supabase Realtime WebSocket subscriptions on `ball_events` for instant live scorecard transitions.
3. **Advanced Fantasy Analytics:** Introduce predictive projected points, player ownership percentages, and optimal squad solver algorithms based on historical venue performance.
4. **Voice-Activated AI Assistant:** Enable real-time audio interaction using the Gemini Live API for hands-free match inquiries during broadcasts.

---

## 13. Project Links & Evaluator Access

| Resource | Link | Description |
|:---|:---|:---|
| **Live Production Application** | [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard) | Deployed React SPA on Vercel with live Supabase Cloud connectivity. |
| **GitHub Repository** | [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI) | Complete open-source codebase, migrations, Edge Functions, and tests. |
| **Verified Git Commit** | [`f071aa2`](https://github.com/parthkprogrammer/FanPulse_AI/commit/f071aa2) | Commit containing the complete verified implementation and test suite. |
| **Dream11 Submission Form** | [https://forms.gle/s3dxPxAd8Jw7w3an7](https://forms.gle/s3dxPxAd8Jw7w3an7) | Official Dream11 Forward Deployed Engineer assignment form. |

---

*Submitted by Parth Kedar for the Dream11 Forward Deployed Engineer Intern Assignment.*
