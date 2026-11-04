# FanPulse AI — Technical Demonstration Script (3–5 Minutes)

**Target Audience:** Dream11 Technical Evaluators & Forward Deployed Engineering Leaders  
**Live Production URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**Presenter Role:** Full-Stack & AI Systems Engineer (Candidate)

---

## Presentation Structure (3–5 Minutes)

| Section | Timestamp | Focus Area | Key Technical Point |
|:---|:---:|:---|:---|
| **1. Introduction** | 0:00 – 0:25 | Project title & mission | Unifying cricket intelligence & fantasy companions |
| **2. Real Fan Problem** | 0:25 – 0:50 | Fragmentation & scoreboard opacity | 3–5 apps per match day; scores without tactical context |
| **3. Why I Built FanPulse AI** | 0:50 – 1:15 | Motivation & decoupled vision | Bridging live telemetry, fantasy drafting, and grounded AI |
| **4. Dashboard Demonstration** | 1:15 – 1:50 | Real-time UI & hero banner | MCG T20 fixture, live score status, sub-50ms index query |
| **5. Match & Player Intelligence** | 1:50 – 2:30 | Detailed scorecards & profiles | Multi-innings scorecard, strike rates, GIN trigram athlete search |
| **6. Fantasy Team Features** | 2:30 – 3:15 | Lineup drafting & rule checks | 11 players, role minimums, Captain (2×) & VC (1.5×) multipliers |
| **7. AI Assistant Demonstration** | 3:15 – 4:00 | Natural language explanations | Grounded Gemini integration, zero-hallucination prompts |
| **8. Technical Architecture** | 4:00 – 4:30 | Full-stack serverless foundation | React + Vite on Vercel, 9 Deno Edge Functions, Supabase PostgreSQL |
| **9. Decoupled Scoring vs. Generative AI** | 4:30 – 4:55 | Mathematical vs. probabilistic logic | Zero mathematical hallucination; formulaic point ledger |
| **10. Conclusion & Wrap-Up** | 4:55 – 5:15 | Impact & submission summary | Production deployment, 461 passing tests, enterprise readiness |

---

## Verbatim Presentation Script

### 1. Introduction (0:00 – 0:25)
> *"Hello! My name is Parth Kedar, and today I’m demonstrating **FanPulse AI**, an AI-powered cricket match intelligence and fantasy companion that I built for the Dream11 Forward Deployed Engineer assignment.*
> 
> *FanPulse AI helps cricket fans understand match situations, player contributions, and fantasy performance by combining structured cricket data, deterministic fantasy scoring, and contextual AI explanations."*

### 2. Real Fan Problem (0:25 – 0:50)
> *"During live cricket matches, fans routinely juggle between multiple apps: one for live scores, another for fantasy points, and social feeds for tactical commentary. But more importantly, raw numbers on a scoreboard don't explain the game equation. A score of 184/4 doesn't convey momentum, who anchored the death overs, or why a specific bowler earned 98 fantasy points. Fans are left with fragmented data and no contextual bridge to their fantasy lineups."*

### 3. Why I Built FanPulse AI (0:50 – 1:15)
> *"I built FanPulse AI to solve this fragmentation with a single, coherent application. My goal was not just to display numbers, but to explain what is happening and why it matters—while ensuring that critical fantasy sports calculations remain 100% mathematically exact and audit-logged."*

### 4. Dashboard Demonstration (1:15 – 1:50)
> *(Action: Show the live Dashboard at `https://fanpulseai-nine.vercel.app/dashboard`)*
> *"On the live dashboard, fans immediately see the high-leverage match state. Here in our featured India vs Australia 3rd T20I at the Melbourne Cricket Ground, India is chasing 178 and currently sits at 184/4. Notice our Top Performers widget and AI Insights preview. Under the hood, these telemetry cards are served directly from Supabase PostgreSQL, supported by composite indexes on `(status, match_date DESC)` to ensure instantaneous page rendering."*

### 5. Match & Player Intelligence (1:50 – 2:30)
> *(Action: Navigate to `/matches` and open the MCG fixture `/matches/m-ind-aus-t20`)*
> *"Navigating into the Match Center, we can inspect both innings. We see Australia's 178/8 and India's response, complete with batter strike rates, dismissals, and bowler economy figures. Clicking on any athlete—such as Virat Kohli—opens their Player Profile. We display career statistics across 117 matches and 4,037 runs. In the database, we use a PostgreSQL GIN trigram index on player names to deliver instantaneous substring search across the player catalog."*

### 6. Fantasy Team Features (2:30 – 3:15)
> *(Action: Open Fantasy Builder at `/matches/m-ind-aus-t20/fantasy/create`)*
> *"Our Fantasy Engine allows fans to draft custom 11-player lineups across both competing squads. Real-time composition safeguards enforce standard rules: at least 1 Wicket-Keeper, 1 Batter, 1 All-Rounder, 1 Bowler, and a maximum of 7 players from any single team.*
> 
> *When designating the Captain (for a 2.0× multiplier) and Vice-Captain (for a 1.5× multiplier), the client dispatches to our `validate-fantasy-team` Supabase Edge Function. Both the serverless gateway and PostgreSQL triggers enforce that squads never exceed 11 players."*

### 7. AI Assistant Demonstration (3:15 – 4:00)
> *(Action: Navigate to `/assistant`)*
> *"The centerpiece of our platform is the AI Match Assistant. When a fan asks: 'Why did Virat Kohli earn 112 fantasy points?', the request hits our `ai-assistant` Edge Function.*
> 
> *The client does NOT send raw prompts to the LLM directly. Instead, our server-side `contextAssembler` queries PostgreSQL for the exact match state: Kohli’s 74* off 48 balls, 6 boundaries, milestone bonuses, and team innings totals. It wraps this telemetry in a token-budgeted `[MATCH_DATA]` envelope with temperature set to 0.2.*
> 
> *Gemini 1.5 Flash explains the exact tactical drivers—such as boundary bonuses and death-over strike rates—strictly adhering to facts with zero mathematical hallucination."*

### 8. Technical Architecture (4:00 – 4:30)
> *"Our architecture is fully modern and serverless:*
> * *Frontend:* React 18 SPA built with Vite and Tailwind CSS, hosted globally on Vercel Edge.
> * *Backend:* 9 specialized Supabase Edge Functions running on Deno v2.
> * *Database:* Supabase PostgreSQL with 14 normalized relational tables, foreign key constraints, and Row-Level Security."*

### 9. Why Deterministic Scoring & Generative AI Are Separated (4:30 – 4:55)
> *"A fundamental engineering rule in FanPulse AI is the strict decoupling of arithmetic evaluation from generative AI. LLMs are probabilistic models; they are prone to arithmetic drift and hallucination. In fantasy sports, point calculations impact rankings and user trust. Therefore, fantasy points are computed 100% deterministically by backend business logic in TypeScript and SQL. Gemini is reserved exclusively for synthesizing natural language explanations of those verified calculations."*

### 10. Conclusion & Wrap-Up (4:55 – 5:15)
> *"FanPulse AI is fully implemented, verified with 461 passing automated tests across 30 test files, and deployed live on Vercel and Supabase Cloud. It showcases how forward-deployed engineering, robust database design, and grounded AI can transform fantasy sports. Thank you, and I look forward to your questions!"*

---

## Prepared Answers to Tough Technical Questions

#### Q1: "Why did you choose Supabase over a custom backend like Express or Spring Boot?"
> **Answer:** *"For this application, Supabase provided enterprise-grade PostgreSQL with built-in Row-Level Security, GoTrue authentication, and instant PostgREST API capabilities out of the box. Coupled with Deno Edge Functions, it allowed me to build a globally distributed, serverless backend without managing persistent servers, while maintaining full SQL relational power and sub-second query latency."*

#### Q2: "Why Google Gemini API instead of OpenAI GPT-4?"
> **Answer:** *"Gemini 1.5 Flash offers industry-leading processing speed, a large token context window, and highly competitive pricing. In sports companion apps, sub-second latency is critical. Gemini Flash allowed us to pass rich structured match telemetry (`[MATCH_DATA]`) and receive grounded, lively responses within our 12-second timeout window."*

#### Q3: "How do you prevent AI hallucinations?"
> **Answer:** *"We use a three-tier anti-hallucination defense:
> 1. **Prompt Injection & Length Sanitization:** User questions are bounded to 250 characters and stripped of system prompt injection attempts.
> 2. **Strict Telemetry Grounding:** We assemble verified PostgreSQL records into a structured `[MATCH_DATA]` block and set the model temperature to a low 0.2.
> 3. **Output Validation & Guardrails:** All generated text is scanned by regex sanitizers in `outputValidator.ts` to block betting, odds, and gambling terms, falling back to safe sports analysis if ungrounded claims are detected."*

#### Q4: "Why is fantasy scoring deterministic rather than AI-generated?"
> **Answer:** *"Fantasy sports rules are mathematical contracts. Points must be repeatable, transparent, and auditable down to the decimal point. Entrusting points to an LLM introduces non-deterministic variation and arithmetic errors. By computing points deterministically in backend TypeScript/SQL and persisting them in `fantasy_player_points` with a JSON breakdown, we maintain 100% mathematical integrity."*

#### Q5: "How does Row-Level Security (RLS) protect user data?"
> **Answer:** *"In PostgreSQL, RLS policies are applied at the database engine level. On tables like `fantasy_teams`, `fantasy_team_players`, and `ai_conversations`, the policy enforces `auth.uid() = user_id`. Even if a malicious user tampers with the frontend client or makes direct PostgREST calls, the database itself filters out any rows that do not belong to the caller's verified JWT token."*

#### Q6: "What would you improve or build next as a Forward Deployed Engineer at Dream11?"
> **Answer:** *"Three key priorities:
> 1. **Real-time WebSockets:** Replace polling with Supabase Realtime WebSocket subscriptions to stream ball-by-ball animations and instant leaderboard updates.
> 2. **Live Feed Production Integration:** Connect the `sync-cricket-data` adapter to Dream11's live enterprise cricket provider feeds.
> 3. **Personalized Squad Recommendations:** Build pre-match AI intelligence that analyzes pitch wear and historical batter-vs-bowler matchups to suggest strategic differential picks."*
