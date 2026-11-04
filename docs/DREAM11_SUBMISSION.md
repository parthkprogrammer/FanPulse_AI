# Dream11 Submission: Show Us What You Would Build

**Project Name:** FanPulse AI  
**Working Artifact URL:** [https://fanpulseai-nine.vercel.app/dashboard](https://fanpulseai-nine.vercel.app/dashboard)  
**GitHub Repository:** [https://github.com/parthkprogrammer/FanPulse_AI](https://github.com/parthkprogrammer/FanPulse_AI)  
**Branch:** `feat/fanpulse-development`

---

### Submission Overview (<200 Words)

Cricket fans struggle to understand match situations beyond static scoreboards, especially connecting live play to fantasy team performance during a match.

**FanPulse AI** helps cricket fans understand match situations, player contributions and fantasy performance by combining structured cricket data, deterministic fantasy scoring and contextual AI explanations.

Built with React 18, Vite, Tailwind CSS, Supabase PostgreSQL with Row-Level Security, and 9 Deno Edge Functions, FanPulse AI strictly separates arithmetic evaluation from generative AI:
1. **Deterministic Fantasy Scoring:** Handled entirely by server-side backend logic. It calculates base points, milestone bonuses, and Captain (2.0×) / Vice-Captain (1.5×) multipliers with audit logging, eliminating mathematical hallucination.
2. **Contextual AI Assistant:** Uses Google’s Gemini API (`gemini-1.5-flash`) via a secure Edge Function. It injects structured PostgreSQL telemetry into token-budgeted prompts to explain game equations, death-over tactics, and fantasy point drivers in natural language with anti-hallucination guardrails.

*Honest Disclosure:* Current cricket fixtures utilize verified seeded demonstration data, not an authorized paid live cricket API feed. All scoring logic, telemetry queries, and AI grounding pipelines are fully operational.
