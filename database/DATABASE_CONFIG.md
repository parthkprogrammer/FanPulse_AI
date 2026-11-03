# FanPulse AI — PostgreSQL Database Configuration & Migration Workflow

> Operational guide and environment specification for Supabase PostgreSQL 16+.
> Derived from [DATABASE_DESIGN.md](file:///U:/Fanpulse_AI/docs/DATABASE_DESIGN.md) and [SUPABASE_ARCHITECTURE.md](file:///U:/Fanpulse_AI/docs/SUPABASE_ARCHITECTURE.md).

---

## 1. Database Overview & Technology Stack

The FanPulse AI persistence tier is powered by **Supabase PostgreSQL 16+**. 
In accordance with the approved architecture update:
- **Persistence Engine:** PostgreSQL 16+ with extensions (`uuid-ossp`, `pgcrypto`, `pg_trgm`).
- **Migration Engine:** Supabase CLI native SQL migrations (replacing Flyway / Liquibase).
- **ORM / Data Access:** PostgREST via `@supabase/supabase-js` (client-side) and Supabase Edge Functions with direct SQL / client queries (server-side), eliminating Spring Data JPA and Hibernate.
- **Connection Management:** Supabase Built-in Connection Pooler (PgBouncer / Supavisor) supporting session and transaction pooling modes.

---

## 2. Environment Configuration (Development vs Production)

FanPulse AI maintains strict separation between environments:

| Parameter | Development Environment | Production Environment |
| :--- | :--- | :--- |
| **Project Ref** | `dev-fanpulse-ai` (isolated cloud project) | `prod-fanpulse-ai` (production cloud project) |
| **Direct DB Host** | `db.<dev-ref>.supabase.co:5432` | `db.<prod-ref>.supabase.co:5432` |
| **Transaction Pooler** | `<dev-pooler-host>:6543` | `<prod-pooler-host>:6543` |
| **DDL / Migrations** | Applied via `supabase db push` / CLI | Applied via GitHub Actions CI/CD pipeline |
| **Frontend Connection** | `frontend/.env.development` (`VITE_SUPABASE_URL`) | Vercel Environment Variables |
| **Server Secrets** | Local environment / Supabase Vault | Supabase Secrets Vault (`supabase secrets set`) |
| **Seed Data** | Reference data + dummy matches via `supabase/seed.sql` | Strictly configuration-only reference data |

### Connection String Strategy

1. **Direct Connection (`DATABASE_URL`, Port 5432)**:
   - Used exclusively for DDL operations, schema migrations, and admin maintenance.
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
2. **Transaction Pooler (`DATABASE_POOLER_URL`, Port 6543)**:
   - Used by Supabase Edge Functions and stateless serverless executions to prevent connection exhaustion.
   - Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres?pgbouncer=true`

---

## 3. SQL Migration Workflow

All database modifications are tracked as version-controlled SQL files in [`supabase/migrations/`](file:///U:/Fanpulse_AI/supabase/migrations/):

```
supabase/migrations/
├── 20261103075030_initial_schema_baseline.sql   # Extensions & baseline setup
└── <timestamp>_<migration_name>.sql              # Incremental schema changes
```

### Developer Migration Lifecycle

1. **Create an Incremental Migration**:
   ```bash
   npx supabase migration new <descriptive_name>
   ```
2. **Author Idempotent SQL**:
   Always use guarded statements:
   - `CREATE TABLE IF NOT EXISTS ...`
   - `CREATE INDEX IF NOT EXISTS ...`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
   - `DO $$ BEGIN ... END $$;` for conditional block execution
3. **Verify Migration History**:
   ```bash
   npx supabase migration list
   ```
4. **Deploy to Remote Supabase Database**:
   ```bash
   npx supabase db push
   ```

---

## 4. Security & Credential Protection

1. **Zero Hardcoded Credentials:**
   - Database passwords, personal access tokens, and service role keys are **never** committed to version control.
   - Environment variables are templated safely in [`supabase/.env.example`](file:///U:/Fanpulse_AI/supabase/.env.example) and [`frontend/.env.example`](file:///U:/Fanpulse_AI/frontend/.env.example).
2. **Git Ignore Enforcement:**
   - Both root [`.gitignore`](file:///U:/Fanpulse_AI/.gitignore) and [`supabase/.gitignore`](file:///U:/Fanpulse_AI/supabase/.gitignore) ignore:
     - `.env`, `.env.development`, `.env.production`, `.env.local`, `.env.*.local`
     - `supabase/.temp/`, `supabase/.branches/`
3. **Row Level Security (RLS):**
   - RLS is enabled by default on all tables created in `public`.
   - The frontend `anon` key only accesses public or user-scoped data defined by RLS policies.
   - Privileged operations (scoring computation) run in Edge Functions using the server-side `SUPABASE_SERVICE_ROLE_KEY`.

---

## 5. Connectivity Verification & Actual Status Report

During this initialization milestone, connectivity was actively probed using local tools:

| Probe Target | Command Executed | Result | Status / Reason |
| :--- | :--- | :--- | :--- |
| **Local PostgreSQL** | `Test-NetConnection -Port 5432 / 54322` | **Failed (`ECONNREFUSED`)** | No local PostgreSQL service is actively running on ports 5432 or 54322. |
| **Local Docker Engine** | `supabase status` | **Failed (`docker: command not found`)** | Neither Docker Desktop nor Podman is installed on this host environment. |
| **Remote Supabase Project** | `supabase projects list` | **Blocked (`AccessTokenRequiredError`)** | No `SUPABASE_ACCESS_TOKEN` is configured and `supabase login` has not been run. |

### Steps to Connect to a Live Project

When ready to link to a live Supabase project:
1. Run `npx supabase login` to authenticate with your Supabase account.
2. Run `npx supabase link --project-ref <your-project-id>` to link the local repository.
3. Apply pending migrations using `npx supabase db push`.
