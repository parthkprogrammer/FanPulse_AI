# FanPulse AI — Setup & Deployment Guide

> **Operational manual for local development, Supabase cloud configuration, Edge Function deployment, and Vercel hosting.**

---

## 1. System Prerequisites

Before starting, ensure your workstation has the following installed:
- **Node.js:** v18.0.0 or higher (v20+ LTS recommended)
- **npm:** v9.0.0 or higher
- **Git:** v2.30+
- **Supabase CLI:** v1.190+ (`npm install -g supabase` or via `npx supabase`)
- **Web Browser:** Chrome, Edge, Safari, or Firefox with ES2022+ support

---

## 2. Repository Cloning & Branch Setup

```bash
# Clone the repository
git clone https://github.com/parthkprogrammer/FanPulse_AI.git

# Enter project root
cd FanPulse_AI

# Switch to the active development branch
git checkout feat/fanpulse-development
```

---

## 3. Dependency Installation

```bash
# Install root orchestration dependencies
npm install

# Install frontend SPA dependencies
cd frontend
npm install
cd ..
```

---

## 4. Environment Configuration

### 4.1 Frontend Environment (`frontend/.env.local`)
Create `frontend/.env.local` based on `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env.local
```

Populate the required environment variables:
```ini
# Supabase Project Connection
VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<YOUR_ANON_PUBLIC_KEY>

# Supabase Edge Functions Base URL
VITE_EDGE_FUNCTIONS_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1

# Application Operational Mode ('production' or 'development')
VITE_APP_MODE=production
```

> [!CAUTION]
> **Secret Hygiene:** Never insert your `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` into frontend `.env` files. Frontend bundles are public!

---

## 5. Supabase Cloud Configuration

### 5.1 Link Supabase Cloud Project
```bash
# Login to Supabase CLI
npx supabase login

# Link your local repo to the remote project
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

### 5.2 Apply Database Migrations
Apply all 9 sequential SQL migrations to initialize schemas, foreign keys, triggers, and Row-Level Security:

```bash
npx supabase migration up
```

### 5.3 Seed Demo Cricket Data
To populate teams, players, fixtures, and scorecards:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to your project -> **SQL Editor**.
3. Open [`supabase/seed.sql`](file:///U:/Fanpulse_AI/supabase/seed.sql).
4. Paste the SQL script and click **Run**.
5. Verify that `teams` (4), `players` (44), and `matches` (3) records appear in the Table Editor.

---

## 6. Edge Function Deployment

### 6.1 Set Server-Side Secrets
In your Supabase project settings or via CLI, configure the upstream Gemini API key:

```bash
npx supabase secrets set GEMINI_API_KEY="AIzaSy...<YOUR_GOOGLE_AI_STUDIO_KEY>"
```

### 6.2 Deploy All 9 Edge Functions
Deploy the serverless Edge Functions to Supabase's global Deno network:

```bash
# Deploy utility and diagnostics
npx supabase functions deploy health-check --no-verify-jwt

# Deploy cricket data functions
npx supabase functions deploy manage-matches --no-verify-jwt
npx supabase functions deploy manage-players --no-verify-jwt
npx supabase functions deploy sync-cricket-data --no-verify-jwt

# Deploy fantasy management functions
npx supabase functions deploy validate-fantasy-team --no-verify-jwt
npx supabase functions deploy manage-fantasy-teams --no-verify-jwt
npx supabase functions deploy compare-fantasy-teams --no-verify-jwt
npx supabase functions deploy calculate-fantasy-scoring --no-verify-jwt

# Deploy AI assistant
npx supabase functions deploy ai-assistant --no-verify-jwt
```

> [!NOTE]
> Functions deployed with `--no-verify-jwt` delegate authorization to internal function code (e.g., extracting user credentials from the `Authorization: Bearer <jwt>` header via `supabase.auth.getUser()`), allowing customized CORS and structured error responses.

---

## 7. Local Development & Verification

### 7.1 Start Development Server
```bash
# From repository root
npm run dev

# Alternatively, inside frontend directory
cd frontend && npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7.2 Run Verification Commands
```bash
# Execute automated test suite (Vitest)
npm run test --prefix frontend

# Execute ESLint validation
npm run lint --prefix frontend

# Verify production bundle compilation
npm run build --prefix frontend
```

---

## 8. Vercel Production Deployment

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add Environment Variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_EDGE_FUNCTIONS_URL`
   - `VITE_APP_MODE` = `production`
4. Click **Deploy**. Vercel will build and distribute the SPA across its global Edge Network.

---

## 9. Troubleshooting & FAQ

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **CORS Error in Browser** | Preflight `OPTIONS` request not returning 204 or incorrect headers. | Ensure `_shared/cors.ts` is imported and invoked at the top of the Edge Function handler before body parsing. |
| **`401 Unauthorized` on Protected Route** | Missing or expired GoTrue session token. | Ensure user logs in via `/login` and the JWT is included in the `Authorization: Bearer <token>` header. |
| **AI Assistant Returns Fallback** | `GEMINI_API_KEY` secret is missing or exhausted rate limits. | Verify `GEMINI_API_KEY` in Supabase Secrets. Ensure Gemini 1.5 Flash quota is available in Google AI Studio. |
| **Empty Scorecard on Match Page** | Database migrations or seed data not applied. | Run `npx supabase migration up` and re-run `supabase/seed.sql` in Supabase SQL Editor. |

---

*Related Documentation:*
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Testing and QA](TESTING_AND_QA.md)
- [Security Architecture](SECURITY.md)

