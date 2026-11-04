# FanPulse AI — Technical Demonstration Script (3–5 Minutes)

**Target Audience:** Dream11 Technical Interviewers, Forward Deployed Engineers & Technical Evaluators  
**Live Production URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**Presenter Role:** Lead Full-Stack Architect & AI Engineer

---

## Demonstration Overview

| Stage | Duration | Core Focus | Key Technical Concept |
|:---|:---:|:---|:---|
| **0. Hook & Architecture** | 0:30 | Problem statement & decoupled architecture | Deterministic fantasy scoring vs. Generative AI |
| **1. Match Dashboard** | 0:45 | Telemetry ingestion & real-time dashboard | Live match telemetry, PostgREST queries |
| **2. Scorecard & Player Profiling** | 0:45 | Detailed scorecard & career statistics | Relational integrity, GIN trigram indexing |
| **3. Fantasy Team Builder** | 1:00 | 11-player lineup drafting & constraint checks | Server-side validation, Captain (2×) & VC (1.5×) multipliers |
| **4. AI Match Assistant** | 1:00 | Structured Gemini LLM grounding | Zero-hallucination prompt assembly, RAG telemetry |
| **5. Architecture & Closing** | 0:30 | Security, RLS, and forward-deployed vision | Row-Level Security, Edge runtime, Production metrics |

---

## Step-by-Step Demonstration Script

### Stage 0: Introduction & Core Architecture (0:00 – 0:30)

* **Action:** Open [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard) in a clean browser window.
* **Verbal Script:**
  > *"Hello! Today I’m excited to show you **FanPulse AI**, a cricket match intelligence and fantasy companion platform designed for modern sports fans.*
  > 
  > *During live matches, cricket fans juggle multiple apps: one for scores, another for fantasy points, and Twitter or commentary feeds for tactical explanations. FanPulse AI solves this by unifying match intelligence, fantasy drafting, and natural language explanations.*
  > 
  > *From an engineering standpoint, our core decision was strict separation of concerns:*
  > *1. **Fantasy points are 100% deterministic**—calculated by server-side logic in PostgreSQL and Supabase Edge Functions with zero hallucination risk.*
  > *2. **Natural language explanations are handled by Google Gemini 1.5 Flash**, strictly grounded using structured match telemetry assembled server-side."*

---

### Stage 1: Live Dashboard & Match Center (0:30 – 1:15)

* **Action:** Scroll through the `/dashboard` view. Point to the **Featured Match Banner** (`India vs Australia — 3rd T20I`), the **Top Performers Widget**, and the **AI Insights Preview**. Click on **"Matches"** in the top navigation.
* **Verbal Script:**
  > *"Here on the main dashboard, users immediately see high-leverage match telemetry: live scores, required run rate, and current match situation. In our featured fixture, India is chasing 178 at the MCG, currently at 184/4 in the 19th over.*
  > 
  > *Clicking into our Match Center (`/matches`), users can filter across Live, Upcoming, and Completed fixtures. Telemetry is served via PostgREST queries against Supabase PostgreSQL, supported by composite indexes on `(status, match_date DESC)` to ensure sub-50ms query latency under load."*

---

### Stage 2: Deep Scorecard & Player Telemetry (1:15 – 2:00)

* **Action:** Click into the **India vs Australia** fixture (`/matches/m-ind-aus-t20`). Switch between **"1st Innings"** and **"2nd Innings"** scorecard tabs. Click on **"Virat Kohli"** to open his profile (`/players/p-virat-k`).
* **Verbal Script:**
  > *"In the Match Detail view, we break down both innings. You can see Australia's 178/8 and India's chase, complete with individual batter strike rates, dismissals, and bowler economy figures.*
  > 
  > *Clicking on any athlete—like Virat Kohli—takes us to their Player Profile. Notice the career statistics: 117 matches, 4,037 runs, and a 137.96 strike rate. In the database, we use a PostgreSQL GIN trigram index on player names to allow lightning-fast substring search across thousands of cricket players."*

---

### Stage 3: Fantasy Team Builder & Validation Engine (2:00 – 3:00)

* **Action:** Navigate to **"Fantasy Create"** (`/matches/m-ind-aus-t20/fantasy/create`). Draft 11 players across both teams (e.g. 1 WK, 4 BAT, 3 AR, 3 BOWL). Show the live composition counters. Assign **Virat Kohli** as Captain and **Jasprit Bumrah** as Vice-Captain. Click **"Save Team"**.
* **Verbal Script:**
  > *"Now let's look at the Fantasy Engine. Fans can draft an 11-player squad across both competing squads.*
  > 
  > *Notice the real-time composition safeguards: it enforces exactly 11 players, minimum role requirements (at least 1 Wicket-Keeper, 1 Batter, 1 All-Rounder, and 1 Bowler), and a maximum cap of 7 players from any single country.*
  > 
  > *When I designate Virat Kohli as Captain (2.0× multiplier) and Jasprit Bumrah as Vice-Captain (1.5× multiplier), the client dispatches to our `validate-fantasy-team` Supabase Edge Function.*
  > 
  > *Even if a user bypasses the client-side UI, the server-side Deno Edge Function and database constraints reject invalid lineups. Once validated, the team is saved atomically into `fantasy_teams` and `fantasy_team_players` protected by Row-Level Security."*

---

### Stage 4: AI Match Assistant with Telemetry Grounding (3:00 – 4:00)

* **Action:** Click **"AI Assistant"** in navigation (`/assistant`). Ensure `India vs Australia — 3rd T20I` is selected. Click the suggested prompt chip: *"Why did Virat Kohli earn 112 fantasy points?"* or type *"Explain the death overs chase and momentum shifts"*.
* **Verbal Script:**
  > *"Now for the centerpiece of our intelligence layer: the AI Match Assistant.*
  > 
  > *When I submit: 'Why did Virat Kohli earn 112 fantasy points?', the request hits our `ai-assistant` Edge Function. The client does NOT pass raw prompts to the LLM directly.*
  > 
  > *Instead, our server-side `contextAssembler.ts` queries PostgreSQL for the exact match state: India's 184/4, Kohli's 74* off 48 balls, boundaries, and official fantasy points. It wraps this in a strict `[MATCH_DATA]` token-budgeted payload with a low temperature of 0.2.*
  > 
  > *Look at the generated explanation: Gemini explains exactly why he earned 112 points—referencing his 74 runs, 6 fours, 2 sixes, milestone bonus, and strike rate—without hallucinating numbers. Furthermore, our output validator sanitizes gambling or odds terminology to uphold Dream11's responsible gaming standards."*

---

### Stage 5: Technical Highlights & Q&A Wrap-Up (4:00 – 4:30)

* **Action:** Navigate back to the Dashboard or show the GitHub repository.
* **Verbal Script:**
  > *"To summarize our technical foundation:*
  > * *Frontend:* React 18 SPA on Vite, deployed globally on Vercel Edge.
  > * *Backend:* 9 Supabase Edge Functions on Deno with zero server maintenance.
  > * *Database:* Supabase PostgreSQL with 14 normalized tables, foreign keys, and Row-Level Security.
  > * *Quality Gates:* Full automated test suite of 461 tests across 30 test files with 100% pass rate in GitHub Actions CI.
  > 
  > *FanPulse AI demonstrates how modern full-stack architecture and grounded LLMs can elevate fantasy sports into an intelligent, immersive fan companion. I'd love to answer any questions about the implementation!"*

---

## Potential Evaluator Questions & Prepared Answers

#### Q1: "Why not let Gemini calculate the fantasy points directly?"
> **Answer:** *"LLMs are probabilistic autoregressive models, which makes them inherently prone to arithmetic drift and hallucinations. In fantasy sports, point calculations impact leaderboards, rankings, and user trust. Therefore, all mathematical scoring is computed deterministically in backend TypeScript/SQL using verified formulas, while Gemini is reserved strictly for natural language synthesis of that verified data."*

#### Q2: "What happens if the Gemini API experiences an outage or latency spike?"
> **Answer:** *"Our `geminiClient.ts` has a built-in 12-second timeout, exponential backoff retries for transient 503/429 errors, and a circuit breaker that trips after 5 consecutive failures for 30 seconds. If unavailable, the UI gracefully informs the user that match explanations are temporarily queued while all match scores, tables, and fantasy leaderboards remain 100% operational."*

#### Q3: "Why did the Fantasy Comparison view return 'teams not found in the database'?"
> **Answer:** *"Because Row-Level Security (RLS) is strictly enforced on `fantasy_teams`. A user can only compare squads that have been persisted under their authenticated `user_id` for that specific fixture. If two squads haven't been created yet in the database, the Edge Function legitimately returns a 404 to protect user privacy and avoid comparing non-existent records."*
