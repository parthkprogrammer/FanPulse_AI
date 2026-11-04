# FanPulse AI — Backend Services

In accordance with the approved FanPulse AI architecture, backend services are powered by **Supabase Edge Functions** (Deno / TypeScript runtime) and **Supabase PostgreSQL**.

## Directory Structure

- All serverless backend Edge Functions are located in [`/supabase/functions/`](file:///U:/Fanpulse_AI/supabase/functions/).
- Reusable server modules, CORS policies, response formatters, and client factories reside in [`/supabase/functions/_shared/`](file:///U:/Fanpulse_AI/supabase/functions/_shared/).
- Database migrations, RLS policies, and schema definitions reside in [`/supabase/migrations/`](file:///U:/Fanpulse_AI/supabase/migrations/).

## Architecture & API References

For detailed architectural flows and Edge Function API contracts:
- [`docs/SYSTEM_ARCHITECTURE.md`](file:///U:/Fanpulse_AI/docs/SYSTEM_ARCHITECTURE.md) — Production architecture specification and sequence flows
- [`docs/API_REFERENCE.md`](file:///U:/Fanpulse_AI/docs/API_REFERENCE.md) — Authoritative endpoint contracts for all 9 deployed Edge Functions
- [`docs/SUPABASE_ARCHITECTURE.md`](file:///U:/Fanpulse_AI/docs/SUPABASE_ARCHITECTURE.md) — Supabase platform integration and security rules
- [`docs/AI_IMPLEMENTATION.md`](file:///U:/Fanpulse_AI/docs/AI_IMPLEMENTATION.md) — Google Gemini 1.5 Flash integration and telemetry grounding
