# FanPulse AI — System Architecture & Engineering Blueprint

**Project Title:** FanPulse AI — AI-Powered Cricket Match Intelligence and Fantasy Companion  
**Live URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**Primary Stack:** React 18 (Vite) + Tailwind CSS + Supabase Edge Functions (Deno) + PostgreSQL 16 + Google Gemini API (`gemini-1.5-flash`)

---

## 1. High-Level Architectural Decomposition

FanPulse AI is structured around a decoupled, serverless micro-services paradigm designed to solve cricket fan fragmentation.

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Presentation Tier)"]
        UI["React 18 SPA (Vite + Tailwind CSS)"]
        Router["React Router v6"]
        AxiosClient["Axios API Client (Bearer Token Interceptor)"]
        SupabaseJS["@supabase/supabase-js (Auth & PostgREST Client)"]
        UI --> Router --> AxiosClient
        UI --> SupabaseJS
    end

    subgraph EdgeTier["Backend Serverless Tier (Supabase Deno Runtime)"]
        CORS["CORS Preflight & Rate Limiting"]
        AuthV["GoTrue JWT Verifier (verifyAuth)"]
        
        EF1["health-check"]
        EF2["validate-fantasy-team"]
        EF3["compare-fantasy-teams"]
        EF4["calculate-fantasy-scoring"]
        EF5["manage-fantasy-teams"]
        EF6["manage-matches"]
        EF7["manage-players"]
        EF8["sync-cricket-data"]
        EF9["ai-assistant"]

        AxiosClient --> CORS --> AuthV
        AuthV --> EF1 & EF2 & EF3 & EF4 & EF5 & EF6 & EF7 & EF8 & EF9
    end

    subgraph DatabaseTier["Authoritative Storage & Database Tier (PostgreSQL 16)"]
        RLS["Row Level Security (RLS Engine)"]
        TablesMatch["matches, match_innings, ball_events"]
        TablesPlayer["players, match_rosters, player_match_statistics"]
        TablesFantasy["fantasy_teams, fantasy_team_players, fantasy_player_points"]
        TablesAI["ai_conversations, ai_messages"]
        Procedures["save_fantasy_team_atomic, check_fantasy_team_size"]

        EF2 & EF3 & EF4 & EF5 & EF6 & EF7 & EF8 & EF9 --> RLS
        SupabaseJS -->|Direct Public Reads| RLS
        RLS --> TablesMatch & TablesPlayer & TablesFantasy & TablesAI & Procedures
    end

    subgraph ExternalServices["External Intelligence & Telemetry Tier"]
        GeminiAPI["Google Gemini API (gemini-1.5-flash)"]
        CricketFeed["External Cricket Provider (CricAPI / Sample Data Provider)"]

        EF9 -->|Token-Budgeted Structured Prompt| GeminiAPI
        EF8 -->|Live Telemetry Sync| CricketFeed
    end
```

---

## 2. Decoupled Subsystem Architecture

The platform separates arithmetic evaluation from natural language processing to guarantee factual integrity:

### Subsystem A: Deterministic Fantasy Scoring Engine
* **Rule:** Fantasy points, multipliers, and leaderboards are **never** generated or predicted by LLMs.
* **Mechanism:** All point calculations are computed strictly by server-side business logic in [`calculate-fantasy-scoring`](file:///U:/Fanpulse_AI/supabase/functions/calculate-fantasy-scoring/index.ts) and [`_shared/scoring/index.ts`](file:///U:/Fanpulse_AI/supabase/functions/_shared/scoring/index.ts).
* **Mathematical Formula:**
  $$\text{Final Points} = \text{Multiplier} \times \left( \sum \text{Batting Points} + \sum \text{Bowling Points} + \sum \text{Fielding Points} \right)$$
* **Multipliers:** Designated Captain receives **2.0×** points; designated Vice-Captain receives **1.5×** points; all other players receive **1.0×**.
* **Audit Trail:** Every point calculation is saved in `public.fantasy_player_points` with a full JSON breakdown (`breakdown_json`) and logged in `scoring_audit_logs`.

### Subsystem B: AI Match Assistant (Grounded Gemini Integration)
* **Rule:** The LLM does not speculate on fantasy rules, invent numbers, or guess unrecorded statistics.
* **Mechanism:** When a query arrives, [`contextAssembler.ts`](file:///U:/Fanpulse_AI/supabase/functions/_shared/ai/contextAssembler.ts) queries authoritative PostgreSQL tables (`matches`, `match_innings`, `player_match_statistics`, `fantasy_player_points`) and injects them into a structured `[MATCH_DATA]` envelope.
* **Model Configuration:**
  - Model: `gemini-1.5-flash`
  - Temperature: `0.2` (low temperature eliminates creative extrapolation)
  - Max Output Tokens: `800`
  - Timeout: `12,000ms` with circuit breaker protection
* **Guardrails:** Pre-prompt query sanitation rejects prompt injections. Post-generation validation via [`outputValidator.ts`](file:///U:/Fanpulse_AI/supabase/functions/_shared/ai/outputValidator.ts) sanitizes betting/gambling terminology.

---

## 3. Detailed Data Flow Sequence Diagrams

### 3.1 Fantasy Team Drafting & Server-Side Validation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Fan as Cricket Fan (User)
    participant UI as React Frontend (/fantasy/create)
    participant EF as validate-fantasy-team Edge Function
    participant DB as PostgreSQL (fantasy_teams & RLS)

    Fan->>UI: Selects 11 players, designates Captain (2×) & VC (1.5×)
    UI->>UI: Client validation: 11 players, 1 WK, 1 BAT, 1 AR, 1 BOWL, max 7 per country
    Fan->>UI: Clicks "Save Fantasy Team"
    UI->>EF: POST /validate-fantasy-team (Bearer JWT, payload)
    EF->>EF: Verify JWT and extract user_id
    EF->>EF: Server-Side Rule Checks (BR-TEAM-01 through BR-TEAM-06)
    alt Validation Fails
        EF-->>UI: 400 Bad Request (JSON array of validation errors)
        UI-->>Fan: Displays composition alert messages
    else Validation Passes
        EF->>DB: INSERT INTO fantasy_teams & fantasy_team_players
        DB->>DB: Fire trigger check_fantasy_team_player_count()
        DB-->>EF: 201 Created (team_id, total_points: 0.0)
        EF-->>UI: 200 OK (Success envelope with persisted team_id)
        UI-->>Fan: Redirects to /fantasy/teams with success notification
    end
```

### 3.2 AI Match Assistant Grounded Telemetry Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Cricket Fan
    participant UI as React Frontend (/assistant)
    participant EF as ai-assistant Edge Function
    participant DB as Supabase PostgreSQL
    participant Gemini as Google Gemini API (1.5-flash)

    User->>UI: Submits question: "Why did Virat Kohli earn 112 fantasy points?"
    UI->>EF: POST /ai-assistant { matchId: "m-ind-aus-t20", question: "..." }
    EF->>EF: Sanitize question (remove injections, check length <= 250)
    EF->>DB: Query matches (metadata, status, toss, result)
    EF->>DB: Query match_innings (total_runs, total_wickets, overs_completed)
    EF->>DB: Query player_match_statistics (runs, wickets, strike_rate)
    EF->>DB: Query fantasy_player_points (base_points, final_points)
    DB-->>EF: Authoritative telemetry records
    EF->>EF: contextAssembler: compiles structured JSON into [MATCH_DATA]
    EF->>Gemini: POST /v1beta/models/gemini-1.5-flash:generateContent (Header: x-goog-api-key)
    Gemini-->>EF: Raw generated natural language analysis
    EF->>EF: outputValidator: check for betting/odds keywords, verify grounding
    EF->>DB: (Optional) Insert prompt and response into ai_messages
    EF-->>UI: 200 OK { explanation: "...", isGrounded: true, dataContext: { scores: ... } }
    UI-->>User: Renders formatted markdown commentary with bold players & scores
```

---

## 4. Supabase Edge Functions Catalog

All 9 Edge Functions reside in `supabase/functions/` and are built for the Deno Edge Runtime with native TypeScript and ESM imports mapped via `import_map.json`:

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

## 5. Security & Boundary Enforcement

1. **Zero Credential Exposure:**
   - `GEMINI_API_KEY` is injected exclusively into the `ai-assistant` Deno environment via Supabase Secrets.
   - Frontend client uses only `VITE_SUPABASE_ANON_KEY` (public publishable key). Service-role keys and database passwords never leave the serverless runtime.
2. **Row-Level Security (RLS):**
   - Direct PostgREST queries from the frontend are governed by PostgreSQL policies (`auth.uid() = user_id`). Users cannot read, modify, or delete another user's fantasy squads.
3. **Transport Security:**
   - All client-to-edge and edge-to-database communication occurs over TLS 1.3.
4. **Anti-Injection & Guardrails:**
   - All user prompts undergo input sanitization to strip control characters and block prompt injection patterns (e.g., `"ignore previous instructions"`, `"system prompt"`).
