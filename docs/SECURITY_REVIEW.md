# FanPulse AI — Application Security & Authorization Review

**Document ID:** `DOC-SEC-01`  
**Version:** `1.0.0`  
**Status:** Approved  
**Author:** Senior Application Security Engineer  
**References:** [DATABASE_DESIGN.md](file:///u:/Fanpulse_AI/docs/DATABASE_DESIGN.md), [API_DESIGN.md](file:///u:/Fanpulse_AI/docs/API_REFERENCE.md), [DATABASE_OPTIMIZATION.md](file:///u:/Fanpulse_AI/docs/DATABASE_OPTIMIZATION.md)

---

## 1. Executive Summary & Security Posture

This security audit delivers an exhaustive review of the authentication, authorization, access control, and cryptographic boundary implementations across the **FanPulse AI** platform. The review covers the React client tier, Supabase GoTrue authentication layer, Supabase Edge Functions execution environment, and PostgreSQL Row Level Security (RLS) policies.

### Statement on Security Guarantees
> [!CAUTION]
> **No Absolute Guarantee**: In accordance with rigorous software engineering and cyber-defense principles, **security can never be claimed to be absolute, infallible, or 100% guaranteed**. Modern web architectures operate in dynamic threat environments. Security is a continuous discipline of defense-in-depth, least-privilege enforcement, regular vulnerability audits, and proactive telemetry monitoring.

---

## 2. Identified Vulnerabilities & Confirmed Remediations

During this audit, three specific security weaknesses were uncovered, analyzed, and mitigated in the codebase:

### 2.1 [VULN-01] Privilege Escalation via User-Controlled Metadata (High Severity)
- **Location:** [`supabase/functions/_shared/auth/verifier.ts`](file:///u:/Fanpulse_AI/supabase/functions/_shared/auth/verifier.ts), [`frontend/src/services/authService.js`](file:///u:/Fanpulse_AI/frontend/src/services/authService.js), [`frontend/src/context/AuthContext.jsx`](file:///u:/Fanpulse_AI/frontend/src/context/AuthContext.jsx)
- **Vulnerability Mechanism:**  
  The backend role extractor previously contained a fallback that checked `user.user_metadata?.role`:
  ```typescript
  // VULNERABLE: user_metadata is user-editable
  const rawRole = (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'USER';
  ```
  In Supabase Auth, `user_metadata` is writable by the end user (via `auth.signUp({ options: { data: ... } })` or `auth.updateUser({ data: ... })`). An unprivileged user could pass `{ role: 'ADMIN' }` in `user_metadata` and successfully impersonate an administrator across protected Edge Functions (`manage-matches`, `manage-players`, `calculate-fantasy-scoring`).
- **Remediation Applied:**  
  Purged all reliance on `user_metadata` for authorization. Role resolution now strictly follows an authoritative hierarchy:
  1. Inspect tamper-proof `user.app_metadata.role` (managed exclusively by server/service-role).
  2. If missing, query `public.profiles.role` from PostgreSQL (where the `trg_enforce_profile_role_security` database trigger explicitly blocks non-admins from self-promoting).
  3. Default securely to `'USER'`.

---

### 2.2 [VULN-02] Match Deadline Bypass on Captain / Vice-Captain Re-assignment (Medium Severity)
- **Location:** [`supabase/functions/manage-fantasy-teams/index.ts`](file:///u:/Fanpulse_AI/supabase/functions/manage-fantasy-teams/index.ts) (`assign-roles` action)
- **Vulnerability Mechanism:**  
  While the `update` and `delete` actions verified whether the fixture status was in `['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']`, the `assign-roles` action did not query `match.status`. A user could execute `POST /manage-fantasy-teams` with `action: 'assign-roles'` to swap Captain and Vice-Captain designations after a match had started, gaming points multipliers (2× and 1.5×).
- **Remediation Applied:**  
  Updated the `assign-roles` handler to join `match:matches(status)` and enforce the deadline lock before performing any role updates:
  ```typescript
  if (team.match && ['LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].includes(team.match.status)) {
    throw new ForbiddenError(
      `Cannot modify fantasy team roles: Match is already "${team.match.status}". Lineups are locked (BR-TEAM-06).`
    );
  }
  ```

---

### 2.3 [VULN-03] Overly Permissive Wildcard CORS Policy (Low Severity)
- **Location:** [`supabase/functions/_shared/shared/cors.ts`](file:///u:/Fanpulse_AI/supabase/functions/_shared/shared/cors.ts)
- **Vulnerability Mechanism:**  
  Static wildcard origin (`Access-Control-Allow-Origin: *`) was returned unconditionally, allowing requests from any web origin.
- **Remediation Applied:**  
  Introduced `getCorsHeaders(req)` with dynamic origin validation. When the `ALLOWED_ORIGIN` environment variable is defined in production, requests are strictly validated against authorized domains (e.g. `https://fanpulse.ai`), and the `Vary: Origin` header is attached.

---

## 3. Detailed Security Domain Audits

### 3.1 Supabase Auth & Credential Management
- **Identity & Authentication:** Powered by Supabase GoTrue via JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Password Strength Policy:** Enforced client-side and server-side: minimum 8 characters, requiring uppercase letters, lowercase letters, and numbers ([`frontend/src/utils/validationSchemas.js`](file:///u:/Fanpulse_AI/frontend/src/utils/validationSchemas.js)).
- **Zero Plaintext Storage:** Passwords are sent over TLS directly to Supabase Auth and hashed using Bcrypt. Plaintext passwords are never stored in localStorage, session storage, or logs.
- **Auto-Provisioning Integrity:** Registration triggers [`handle_new_user()`](file:///u:/Fanpulse_AI/supabase/migrations/20261103090000_auth_profiles_schema.sql) in PostgreSQL, populating `public.profiles`. The trigger forces `role := 'USER'` unless explicitly granted in `raw_app_meta_data`.

---

### 3.2 JWT Validation & Session Handling
- **Cryptographic Verification:** Every protected Edge Function invokes [`verifyAuth(req)`](file:///u:/Fanpulse_AI/supabase/functions/_shared/auth/verifier.ts), verifying signature, expiration timestamp (`exp`), issuer (`iss`), and audience (`aud`) via `supabase.auth.getUser(token)`.
- **Token Format:** Strict Bearer scheme validation (`Authorization: Bearer <jwt>`). Malformed or missing headers trigger immediate HTTP 401 Unauthorized responses.
- **Client Session Lifecycle:** `AuthContext` synchronizes with Supabase Auth state changes (`SIGNED_IN`, `TOKEN_REFRESHED`, `SIGNED_OUT`), persisting tokens in memory and clearing sessions upon logout.

---

### 3.3 Secret Isolation & Environment Architecture
| Secret | Allowed Environments | Frontend Bundle Risk | Audit Status |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client & Server | Publicly visible (by design) | Verified Safe |
| `VITE_SUPABASE_ANON_KEY` | Client & Server | Publicly visible (governed by RLS) | Verified Safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets (Edge Functions ONLY) | **Never** imported or bundled | **Zero Exposure Verified** |
| `GEMINI_API_KEY` | Supabase Secrets (Edge Functions ONLY) | **Never** imported or bundled | **Zero Exposure Verified** |

- Automated tests ([`authSecurityAudit.test.js`](file:///u:/Fanpulse_AI/frontend/src/test/authSecurityAudit.test.js)) verify that `import.meta.env` contains zero occurrences of `service_role` or backend API keys.

---

### 3.4 Role-Based Access Control (RBAC) & Ownership Validation
- **Roles:** Two primary roles: `USER` and `ADMIN`.
- **Privilege Boundaries:**
  - `USER`: May view public match/player data, manage own fantasy teams, run authorized comparisons, and interact with the AI assistant.
  - `ADMIN`: Has write access to matches (`manage-matches`), player master catalogs (`manage-players`), scoring recalculation (`calculate-fantasy-scoring`), and audit logs.
- **Insecure Direct Object Reference (IDOR) Protection:**
  - Resource ownership checks are enforced at **both** the Edge Function layer (`existingTeam.user_id === authUser.id`) and the database layer via PostgreSQL RLS policies (`auth.uid() = user_id`).
  - Stored procedure `save_fantasy_team_atomic` extracts the user ID directly from `(SELECT auth.uid())` and rejects user-supplied ownership overrides.

---

### 3.5 Row Level Security (RLS) Policy Audit
All public tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`):
1. `public.teams`: Public read (`USING (true)`), write restricted to `public.is_admin()`.
2. `public.players`: Public read, write restricted to `public.is_admin()`.
3. `public.matches`: Public read, write restricted to `public.is_admin()`.
4. `public.match_rosters`: Public read, write restricted to `public.is_admin()`.
5. `public.match_innings`: Public read, write restricted to `public.is_admin()`.
6. `public.player_match_statistics`: Public read, write restricted to `public.is_admin()`.
7. `public.ball_events`: Public read, write restricted to `public.is_admin()`.
8. `public.profiles`: Public display names readable, sensitive edits restricted to `auth.uid() = id`. Privilege escalation blocked by trigger.
9. `public.fantasy_teams`: Strictly restricted to `user_id = (SELECT auth.uid()) OR public.is_admin()`.
10. `public.fantasy_team_players`: Linked via `EXISTS` check on parent `fantasy_teams.user_id = (SELECT auth.uid())`.
11. `public.fantasy_player_points`: Read restricted to team owners or admins; writes restricted strictly to `public.is_admin()`.
12. `public.scoring_audit_logs`: Read restricted to `public.is_admin()`.
13. `public.ai_conversations`: Restricted to `user_id = (SELECT auth.uid()) OR public.is_admin()`.
14. `public.ai_messages`: Linked via `EXISTS` check on parent `ai_conversations.user_id = (SELECT auth.uid())`.

---

### 3.6 Authentication Failure Handling & Information Disclosure
- **Anti-User Enumeration:** `sanitizeAuthError()` in [`authService.js`](file:///u:/Fanpulse_AI/frontend/src/services/authService.js) masks error responses. Both "user does not exist" and "incorrect password" map to `"Invalid email or password. Please check your credentials."`.
- **Diagnostic Masking:** Internal database errors (`pg_exec`, relation names, syntax errors) are stripped from client-facing messages.
- **Centralized Error Handler:** Edge Functions utilize [`handleError`](file:///u:/Fanpulse_AI/supabase/functions/_shared/utils/errors.ts) to log detailed stack traces server-side while emitting standard RFC-7807-compliant JSON error bodies with generic 500 messages to clients.

---

## 4. Attack Scenario Testing: Accessing Other Users' Fantasy Teams

| Attack Vector | Simulated Scenario | Defense Mechanism | Observed Outcome |
| :--- | :--- | :--- | :--- |
| **Vector 1: Direct Read via List** | User B calls `GET /manage-fantasy-teams` with User A's `teamId`. | Edge Function filters by `authUser.id` AND PostgreSQL RLS filters by `auth.uid()`. | **Blocked**: 0 rows returned. |
| **Vector 2: Unauthorized Update** | User B calls `POST /manage-fantasy-teams` (`action: update`) targeting User A's `teamId`. | `existingTeam.user_id !== authUser.id` check + RLS `FOR UPDATE USING (user_id = auth.uid())`. | **Blocked**: HTTP 403 Forbidden. |
| **Vector 3: Unauthorized Deletion** | User B calls `POST /manage-fantasy-teams` (`action: delete`) targeting User A's `teamId`. | `existingTeam.user_id !== authUser.id` check + RLS `FOR DELETE USING (user_id = auth.uid())`. | **Blocked**: HTTP 403 Forbidden. |
| **Vector 4: Role Tampering (Captain Swap)** | User B calls `action: assign-roles` targeting User A's `teamId`. | `team.user_id !== authUser.id` check + match deadline check. | **Blocked**: HTTP 403 Forbidden. |
| **Vector 5: Spy Comparison** | User B attempts to compare their team with User A's private team via `compare-fantasy-teams`. | PostgREST RLS hides User A's team, causing `NotFoundError` + application `validateComparisonPrivacy` rejects cross-account comparison. | **Blocked**: HTTP 403/404. |
| **Vector 6: Direct SQL RPC Injection** | Caller invokes `save_fantasy_team_atomic` attempting to pass a spoofed user ID. | Stored procedure derives caller ID exclusively via `(SELECT auth.uid())` and verifies row ownership. | **Blocked**: PostgreSQL exception `42501`. |

---

## 5. Security Test Suite Summary

Automated testing is maintained in [`frontend/src/test/authSecurityAudit.test.js`](file:///u:/Fanpulse_AI/frontend/src/test/authSecurityAudit.test.js) and [`frontend/src/test/securityAuth.test.js`](file:///u:/Fanpulse_AI/frontend/src/test/securityAuth.test.js), covering:
1. Rejection of `user_metadata.role` injection attacks.
2. Ownership validation across all Fantasy Team operations.
3. Match deadline lock enforcement.
4. Absence of secrets in client bundles.
5. Error message sanitization and anti-enumeration.
6. CORS origin filtering.

---

## 6. Continuous Security Recommendations

1. **Multi-Factor Authentication (MFA)**: Enable TOTP MFA for administrative accounts in Supabase Auth.
2. **Rate Limiting**: Configure edge rate-limiting (e.g. Cloudflare or Supabase API Gateway) to mitigate brute-force attempts on `/auth/v1/token`.
3. **Audit Log Monitoring**: Establish automated alerts on repeated 403 errors or failed privilege escalation attempts in `scoring_audit_logs`.
4. **Regular Dependency Audits**: Maintain automated dependency scanning (`npm audit`) across frontend and Deno runtime packages.
