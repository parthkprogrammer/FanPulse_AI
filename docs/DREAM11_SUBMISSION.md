# Dream11 Submission: Show Us What You Would Build

**Project Title:** FanPulse AI — AI-Powered Cricket Match Intelligence & Fantasy Companion  
**Live Production URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**GitHub Repository:** [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI)  
**Branch:** `feat/fanpulse-development`

---

### Executive Summary (<200 Words)

Cricket fans struggle to understand match situations beyond static scoreboards, especially connecting live play to fantasy sports performance. Fragmented apps cause information overload and disconnect match dynamics from fantasy point calculations.

**FanPulse AI** unifies cricket intelligence by combining live-style match telemetry, custom 11-player fantasy squad drafting, deterministic fantasy scoring, and an AI-powered Match Assistant into a single responsive web platform.

The core architecture strictly decouples mathematical evaluation from natural language processing:
1. **Deterministic Fantasy Scoring:** Handled entirely by server-side backend logic and Supabase Edge Functions. It calculates exact base points, milestone bonuses, and Captain (2.0×) / Vice-Captain (1.5×) multipliers with audit logging, eliminating mathematical hallucination.
2. **AI Match Assistant:** Uses Google’s Gemini API (`gemini-1.5-flash`) via a secure Supabase Edge Function. It injects structured PostgreSQL telemetry (`matches`, `match_innings`, `player_match_statistics`) into token-budgeted prompts, generating natural-language explanations of game equations, death-over tactics, and fantasy point drivers with anti-hallucination guardrails.

Built on React 18, Vite, Tailwind CSS, Supabase PostgreSQL with Row-Level Security, and 9 Deno Edge Functions, FanPulse AI delivers an authentic, secure, and insightful match companion for cricket enthusiasts.
