# FanPulse AI — Backend Services

In accordance with the approved FanPulse AI architecture, backend services are powered by **Supabase Edge Functions** (Deno / TypeScript runtime) and **Supabase PostgreSQL**.

## Directory Structure

- All serverless backend Edge Functions are located in [`/supabase/functions/`](file:///U:/Fanpulse_AI/supabase/functions/).
- Reusable server modules, CORS policies, response formatters, and client factories reside in [`/supabase/functions/_shared/`](file:///U:/Fanpulse_AI/supabase/functions/_shared/).
- Database migrations, RLS policies, and schema definitions reside in [`/supabase/migrations/`](file:///U:/Fanpulse_AI/supabase/migrations/).

## Architecture Reference

For detailed architectural flow, Edge Function specifications, and communication contracts with the React frontend, see [`docs/SUPABASE_ARCHITECTURE.md`](file:///U:/Fanpulse_AI/docs/SUPABASE_ARCHITECTURE.md).
