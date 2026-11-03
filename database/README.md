# FanPulse AI — Database Layer

The FanPulse AI database layer utilizes **Supabase PostgreSQL 16+**.

## Schema Management & Migrations

- Database migrations are maintained using standard SQL scripts managed via the **Supabase CLI**.
- Active migration files are located in [`/supabase/migrations/`](file:///U:/Fanpulse_AI/supabase/migrations/).
- Baseline extension migration: [`supabase/migrations/20261103075030_initial_schema_baseline.sql`](file:///U:/Fanpulse_AI/supabase/migrations/20261103075030_initial_schema_baseline.sql).

## Relational Schema Specifications

For complete ER diagrams, table schemas, Row Level Security (RLS) rules, and indexing strategies, consult:
- [`docs/DATABASE_DESIGN.md`](file:///U:/Fanpulse_AI/docs/DATABASE_DESIGN.md)
- [`docs/SUPABASE_ARCHITECTURE.md`](file:///U:/Fanpulse_AI/docs/SUPABASE_ARCHITECTURE.md)
