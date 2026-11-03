# FanPulse AI — Local Development & DevOps Operations Guide

**Document Version:** 1.0.0  
**Date:** 2026-11-03  
**Auditor / DevOps Role:** Senior DevOps Engineer  
**Approved Architecture:** React SPA (Vite) + Supabase (PostgreSQL, Auth, Storage, Edge Functions)  
**Strict Policy:** No custom Spring Boot, Java backend, or redundant Docker containers. All backend compute is serverless Supabase.

---

## 1. Architecture Overview & Topology

FanPulse AI is designed around a modern, cloud-native serverless architecture. Local development mirrors production using the official Supabase CLI stack and Vite development server.

```mermaid
flowchart TD
    subgraph Client["Developer Workstation (Port 3000)"]
        Browser["Web Browser\nhttp://localhost:3000"]
        ViteDev["Vite Dev Server (HMR)\nfrontend/src"]
    end

    subgraph SupabaseLocal["Local Supabase Stack (Docker / CLI)"]
        Kong["Kong API Gateway\nhttp://127.0.0.1:54321"]
        Studio["Supabase Studio Web UI\nhttp://127.0.0.1:54323"]
        Inbucket["Inbucket Mail Sandbox\nhttp://127.0.0.1:54324"]
        Postgres["PostgreSQL 17 (Direct)\n127.0.0.1:54322"]
        EdgeRuntime["Deno Edge Functions Runtime\nhttp://127.0.0.1:54321/functions/v1"]
    end

    subgraph ExternalServices["External APIs (Serverless Edge Only)"]
        Gemini["Google Gemini API\n(generativelanguage.googleapis.com)"]
        CricketProvider["Cricket Data Provider\n(api.cricapi.com)"]
    end

    Browser -->|"Loads SPA"| ViteDev
    Browser -->|"Auth & DB via Anon Key"| Kong
    Kong -->|"Routes REST"| Postgres
    Kong -->|"Routes Functions"| EdgeRuntime
    EdgeRuntime -->|"Direct DB Query"| Postgres
    EdgeRuntime -->|"Server-to-Server HTTPS"| Gemini
    EdgeRuntime -->|"Server-to-Server HTTPS"| CricketProvider
    Browser -.->|"Inspects Database"| Studio
    Browser -.->|"Inspects Auth Emails"| Inbucket
```

---

## 2. Port Allocation Table

| Service | Port | Protocol | Bound Interface | Description |
|:---|:---:|:---:|:---:|:---|
| **Vite Frontend Dev Server** | `3000` | HTTP | `0.0.0.0:3000` | Single-page application with Hot Module Replacement |
| **Kong API Gateway** | `54321` | HTTP | `127.0.0.1:54321` | Unified entrypoint for PostgREST, Auth, and Edge Functions |
| **PostgreSQL Database** | `54322` | TCP | `127.0.0.1:54322` | Direct PostgreSQL connection for migrations and admin tools |
| **PostgreSQL Shadow DB** | `54320` | TCP | `127.0.0.1:54320` | Shadow database used by `supabase db diff` for schema diffing |
| **Supabase Studio** | `54323` | HTTP | `127.0.0.1:54323` | Web UI for tables, SQL editor, RLS policies, and logs |
| **Inbucket Mail Sandbox** | `54324` | HTTP | `127.0.0.1:54324` | Local web sandbox capturing magic link & registration emails |

---

## 3. Prerequisites & Toolchain Verification

Before initiating local development, verify that the following command-line tools are installed on your workstation:

```bash
# 1. Verify Node.js (v18.0.0 or higher required; tested on v20.19.0)
node -v

# 2. Verify npm and npx
npm -v
npx -v

# 3. Verify Docker Desktop or Podman (required for local Supabase emulation)
docker --version
docker compose version

# 4. Verify Git
git --version
```

> [!NOTE]
> **Containerization Requirement:** The official Supabase CLI relies on Docker (or Podman) to run PostgreSQL 17, PostgREST, GoTrue Auth, and the Deno Edge Functions runtime locally. If Docker is not installed or running, the application features an automatic **Offline Mock Fallback Mode** enabling full frontend development without Docker.

---

## 4. Development Modes

FanPulse AI supports three development modes to accommodate different workstation configurations:

### Mode A: Full Containerized Local Supabase (Recommended for full-stack work)
- Runs complete Supabase stack locally using Docker.
- Database, Auth, Storage, and Edge Functions run on `127.0.0.1:54321`.
- Enabled by running `npm run supabase:start` and copying `frontend/.env.local.example` to `frontend/.env.local`.

### Mode B: Lightweight Offline Demo Mode (Zero Docker required)
- Frontend runs in standalone mode using built-in deterministic demo telemetry and mock authentication.
- No database or backend containers needed.
- Enabled by default when `VITE_SUPABASE_URL` contains `placeholder` or `your-project-id`.

### Mode C: Cloud Connected Development Mode
- Frontend connects to a dedicated, free Supabase Cloud development project.
- Server-side secrets are deployed via `npx supabase secrets set`.
- Enabled by setting `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`.

---

## 5. Step-by-Step Service Startup Runbook

### Step 1: Clone Repository and Install Dependencies
```bash
git clone https://github.com/<org>/Fanpulse_AI.git
cd Fanpulse_AI

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment Files
```bash
# 1. Copy local frontend environment configuration
cp frontend/.env.local.example frontend/.env.local

# 2. Copy local edge function environment configuration
cp supabase/.env.local.example supabase/.env.local
```

### Step 3: Start Local Supabase Stack
Make sure Docker Desktop is running, then execute:
```bash
# Starts PostgreSQL, Auth, PostgREST, Studio, and Inbucket
npx supabase start
```
*Expected Output:*
```text
Started supabase local development setup.
         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!TIP]
> Update `frontend/.env.local` and `supabase/.env.local` with the actual `anon key` and `service_role key` printed by the command above.

### Step 4: Apply Database Migrations & Seed Baseline Data
```bash
# Applies all 9 migrations in order, then runs supabase/seed.sql
npx supabase db reset
```

### Step 5: Start Local Edge Functions Server
In a separate terminal window:
```bash
# Serves all 9 Edge Functions locally with hot-reloading
npx supabase functions serve --env-file ./supabase/.env.local
```

### Step 6: Start Frontend Development Server
In another terminal window:
```bash
# From repository root
npm run dev

# Or directly in frontend/
cd frontend
npm run dev
```
*Vite will start the dev server at:* `http://localhost:3000`

---

## 6. Service Shutdown Runbook

To shut down services cleanly and preserve resources:

### 1. Stop Frontend and Edge Function Servers
Press `Ctrl + C` in the respective terminal windows running `npm run dev` and `supabase functions serve`.

### 2. Stop Local Supabase Containers
```bash
# Clean stop preserving database volumes (data persists across restarts)
npx supabase stop

# Alternative: Complete teardown including deletion of all database volumes
npx supabase stop --no-backup
```

---

## 7. Database Migrations Workflow

All database changes must be version-controlled in `supabase/migrations/` using timestamp prefixes:

```bash
# 1. Create a new migration file (e.g. adding a new table or policy)
npx supabase migration new <migration_name>

# 2. Edit the generated file in supabase/migrations/<timestamp>_<migration_name>.sql

# 3. Apply pending migrations to local database
npx supabase migration up

# 4. Check status of applied vs pending migrations
npx supabase migration list

# 5. Check schema drift between local database and migrations
npx supabase db diff

# 6. Full rebuild and re-seed of local database
npx supabase db reset
```

---

## 8. Edge Function Development & Testing

All serverless functions reside in `supabase/functions/`:

| Function Name | Entrypoint | Purpose | Auth Requirement |
|:---|:---|:---|:---:|
| **`health-check`** | `functions/health-check/index.ts` | Subsystem diagnostics & health probe | Public |
| **`validate-fantasy-team`** | `functions/validate-fantasy-team/index.ts` | Server-side squad rule validation (BR-TEAM-*) | Public / Custom |
| **`compare-fantasy-teams`** | `functions/compare-fantasy-teams/index.ts` | Differential analysis between 2 squads | Public / Custom |
| **`calculate-fantasy-scoring`** | `functions/calculate-fantasy-scoring/index.ts` | Deterministic scoring engine (BR-SCORE-*) | Service Role / Authed |
| **`manage-fantasy-teams`** | `functions/manage-fantasy-teams/index.ts` | User squad persistence & RLS checks | Authenticated |
| **`manage-matches`** | `functions/manage-matches/index.ts` | Match fixture CRUD & lifecycle updates | Admin Only |
| **`manage-players`** | `functions/manage-players/index.ts` | Player catalog & career stats queries | Public / Admin |
| **`sync-cricket-data`** | `functions/sync-cricket-data/index.ts` | External cricket telemetry proxy & sync | Admin Only |
| **`ai-assistant`** | `functions/ai-assistant/index.ts` | Grounded cricket insights via Gemini API | Public / Authed |

### Testing Individual Edge Functions Locally:
```bash
# Test health-check probe
curl -i http://127.0.0.1:54321/functions/v1/health-check

# Test cricket provider status
curl -i http://127.0.0.1:54321/functions/v1/sync-cricket-data?action=provider-status

# Test AI Assistant with grounded match payload
curl -i -X POST http://127.0.0.1:54321/functions/v1/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"matchId": "m-ind-aus-t20", "question": "Explain the current match situation."}'
```

---

## 9. Security & Secret Hygiene Checklist

1. **Zero Client Secret Exposure:**
   - Under no circumstances should `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `CRICKET_DATA_API_KEY` be prefixed with `VITE_` or added to any file under `frontend/`.
   - Client bundles are public static assets; any key in `frontend/.env.*` is exposed to users.
2. **Git Ignore Integrity:**
   - `.env`, `.env.*`, `frontend/.env.*`, and `supabase/.env.*` are explicitly ignored by `.gitignore`.
   - Only `.env.example`, `frontend/.env.example`, and `supabase/.env.example` are committed as documentation templates.
3. **Row Level Security (RLS):**
   - Direct database access from frontend via PostgREST is governed strictly by RLS policies.
   - The service role key is reserved strictly for backend Edge Functions requiring cross-tenant aggregation.
