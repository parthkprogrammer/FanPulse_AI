# FanPulse AI — Database Layer

The FanPulse AI database layer utilizes **Supabase PostgreSQL 16+**.

## Schema Management & Migrations

- Database migrations are maintained using standard SQL scripts managed via the **Supabase CLI**.
- Active migration files are located in [`/supabase/migrations/`](file:///U:/Fanpulse_AI/supabase/migrations/).
- Baseline extension migration: [`supabase/migrations/20261103075030_initial_schema_baseline.sql`](file:///U:/Fanpulse_AI/supabase/migrations/20261103075030_initial_schema_baseline.sql).
- Baseline seed script: [`supabase/seed.sql`](file:///U:/Fanpulse_AI/supabase/seed.sql).

## Documentation & Configuration References

For complete architecture, environment configuration, and migration guidelines:
- [`docs/DATABASE_SCHEMA.md`](file:///U:/Fanpulse_AI/docs/DATABASE_SCHEMA.md) — Comprehensive PostgreSQL 16 schema, 9 migrations, 16 tables, 49 RLS policies, and 47 indexes
- [`database/DATABASE_CONFIG.md`](file:///U:/Fanpulse_AI/database/DATABASE_CONFIG.md) — Operational database configuration, connection pooling, and migration workflow
- [`docs/DATABASE_DESIGN.md`](file:///U:/Fanpulse_AI/docs/DATABASE_DESIGN.md) — Complete ER diagrams, 3NF schema tables, indexing, and RLS policies
- [`docs/SUPABASE_ARCHITECTURE.md`](file:///U:/Fanpulse_AI/docs/SUPABASE_ARCHITECTURE.md) — Supabase platform integration and security rules
