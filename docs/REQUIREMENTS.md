# FanPulse AI — Requirements Specification

> Derived from [PROJECT_VISION.md](file:///U:/Fanpulse_AI/docs/PROJECT_VISION.md) and [COMPETITOR_ANALYSIS.md](file:///U:/Fanpulse_AI/docs/COMPETITOR_ANALYSIS.md).

---

## 1. User Roles

| Role ID | Role | Description | Authentication |
|---------|------|-------------|----------------|
| `ROLE-01` | **USER** | A registered cricket fan who views matches, explores player stats, creates fantasy teams, and requests AI explanations. | Required — email/password registration and login. |
| `ROLE-02` | **ADMIN** | A system administrator who manages match data, player data, and system configuration. | Required — elevated credentials. |
| `ROLE-03` | **SYSTEM** | The application backend acting autonomously — calculating fantasy points, invoking the AI service, and enforcing business rules. | N/A — internal process identity. |

> [!NOTE]
> **MVP scope:** The ADMIN role is defined here for completeness but an admin UI is **out of scope** for the MVP (see [PROJECT_VISION.md §8.2](file:///U:/Fanpulse_AI/docs/PROJECT_VISION.md#L114)). Initial match and player data will be loaded via database seeds or scripts. ADMIN endpoints may exist in the API but will not have a dedicated frontend.

---

## 2. Functional Requirements

### 2.1 Authentication (AUTH)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-AUTH-01` | The system shall allow a new user to register with a unique email address and a password. | USER | ✅ | A POST to the registration endpoint with valid email/password returns HTTP 201 and creates a user record in the database. |
| `FR-AUTH-02` | The system shall reject registration if the email is already associated with an existing account. | SYSTEM | ✅ | A POST with a duplicate email returns HTTP 409 with an appropriate error message. |
| `FR-AUTH-03` | The system shall allow a registered user to log in with their email and password. | USER | ✅ | A POST with valid credentials returns HTTP 200 and a session token or cookie. |
| `FR-AUTH-04` | The system shall reject login attempts with incorrect credentials. | SYSTEM | ✅ | A POST with an invalid password returns HTTP 401. |
| `FR-AUTH-05` | The system shall hash and salt passwords before storing them. | SYSTEM | ✅ | No plaintext passwords exist in the `users` table; passwords are stored as bcrypt (or equivalent) hashes. |
| `FR-AUTH-06` | The system shall allow a logged-in user to log out, invalidating their session. | USER | ✅ | After logout, subsequent requests with the old session token return HTTP 401. |
| `FR-AUTH-07` | The system shall protect all fantasy team and AI endpoints so that only authenticated users can access them. | SYSTEM | ✅ | Unauthenticated requests to protected endpoints return HTTP 401. |
| `FR-AUTH-08` | The system shall allow a user to view and update their own profile (display name). | USER | ✅ | A GET to the profile endpoint returns the current user's data; a PUT updates the display name. |

### 2.2 Match Management (MATCH)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-MATCH-01` | The system shall display a list of all available matches. | USER | ✅ | A GET to the matches endpoint returns a JSON array containing all matches with their IDs, teams, format, date, and status. |
| `FR-MATCH-02` | The system shall display detailed information for a single match, including teams, innings, overs, individual scores, wickets, and match result or status. | USER | ✅ | A GET to the match detail endpoint returns complete scorecard data for both innings. |
| `FR-MATCH-03` | The system shall support filtering matches by status (upcoming, in-progress, completed). | USER | ✅ | A GET with a `status` query parameter returns only matches matching that status. |
| `FR-MATCH-04` | The system shall support match data for the three major cricket formats: Test, ODI, and T20. | SYSTEM | ✅ | Sample data includes at least one match of each format, and the UI renders format-appropriate labels. |
| `FR-MATCH-05` | The system shall allow an ADMIN to create, update, and delete match data. | ADMIN | ✅ | ADMIN-authenticated POST/PUT/DELETE to match endpoints succeed; USER-authenticated requests return HTTP 403. |
| `FR-MATCH-06` | The system shall seed the database with sample match data on initial setup. | SYSTEM | ✅ | After running database seeds, the matches list endpoint returns pre-populated matches. |
| `FR-MATCH-07` | The system shall integrate with an authorized live cricket data API to replace sample data. | SYSTEM | ❌ | *Future — Phase 2.* |

### 2.3 Player Statistics (STATS)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-STATS-01` | The system shall display a player profile with basic information: name, country, playing role (batter, bowler, all-rounder, wicket-keeper), and profile image placeholder. | USER | ✅ | A GET to the player endpoint returns player metadata including role and country. |
| `FR-STATS-02` | The system shall display batting statistics for a player: matches, innings, runs, highest score, batting average, strike rate, centuries, and half-centuries. | USER | ✅ | The player profile response includes a `batting` object with all listed fields populated from stored data. |
| `FR-STATS-03` | The system shall display bowling statistics for a player: matches, innings, overs bowled, wickets, bowling average, economy rate, best bowling figures. | USER | ✅ | The player profile response includes a `bowling` object with all listed fields populated from stored data. |
| `FR-STATS-04` | The system shall display a player's performance within a specific match: runs scored, balls faced, wickets taken, overs bowled, catches, and run-outs in that match. | USER | ✅ | A GET to the player-match performance endpoint returns match-specific stats that match the scorecard data. |
| `FR-STATS-05` | The system shall provide a list of all players in the system, filterable by country and playing role. | USER | ✅ | A GET with `country` and/or `role` query parameters returns a filtered player list. |
| `FR-STATS-06` | The system shall allow an ADMIN to create, update, and delete player data. | ADMIN | ✅ | ADMIN-authenticated POST/PUT/DELETE to player endpoints succeed; USER-authenticated requests return HTTP 403. |

### 2.4 Fantasy Team Management (FANTASY)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-FANTASY-01` | An authenticated user shall be able to create a fantasy team for a specific match by selecting players from that match's roster. | USER | ✅ | A POST with a valid match ID and a list of player IDs creates a fantasy team and returns HTTP 201. |
| `FR-FANTASY-02` | The system shall enforce a maximum team size of 11 players per fantasy team. | SYSTEM | ✅ | A POST with more than 11 players returns HTTP 400 with a validation error. |
| `FR-FANTASY-03` | The system shall enforce that a fantasy team includes players from both teams in the match. | SYSTEM | ✅ | A POST with all 11 players from a single team returns HTTP 400 with a validation error. |
| `FR-FANTASY-04` | The system shall enforce minimum composition rules: at least 1 wicket-keeper, at least 1 batter, at least 1 all-rounder, and at least 1 bowler. | SYSTEM | ✅ | A POST violating any role minimum returns HTTP 400 identifying the violated constraint. |
| `FR-FANTASY-05` | The system shall allow a user to designate one player as Captain (2× points) and one as Vice-Captain (1.5× points) for each fantasy team. | USER | ✅ | The fantasy team record stores captain and vice-captain IDs; points for those players are multiplied accordingly in scoring. |
| `FR-FANTASY-06` | The system shall allow a user to give their fantasy team a custom name. | USER | ✅ | A POST with a `teamName` field stores it; a GET returns it. |
| `FR-FANTASY-07` | The system shall allow a user to view all of their own fantasy teams. | USER | ✅ | A GET to the user's fantasy teams endpoint returns only teams belonging to the authenticated user. |
| `FR-FANTASY-08` | The system shall allow a user to edit their fantasy team (change players, captain, vice-captain, or team name) only while the match status is "upcoming." | USER | ✅ | A PUT to a fantasy team for an upcoming match succeeds; a PUT for an in-progress or completed match returns HTTP 403. |
| `FR-FANTASY-09` | The system shall allow a user to delete their fantasy team only while the match status is "upcoming." | USER | ✅ | A DELETE for an upcoming match succeeds; a DELETE for an in-progress or completed match returns HTTP 403. |
| `FR-FANTASY-10` | The system shall prevent a user from accessing, editing, or deleting another user's fantasy teams. | SYSTEM | ✅ | A request targeting another user's team returns HTTP 403. |
| `FR-FANTASY-11` | The system shall allow a user to create multiple fantasy teams for the same match. | USER | ✅ | Two consecutive POSTs for the same match with different lineups both succeed and create distinct team records. |

### 2.5 Fantasy Scoring (SCORE)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-SCORE-01` | The system shall calculate fantasy points for each player in a fantasy team based on their actual match performance and the defined scoring rules. | SYSTEM | ✅ | For a completed sample match, the calculated points for every player match a manual calculation using the scoring rules table. |
| `FR-SCORE-02` | The system shall apply the Captain multiplier (2×) and Vice-Captain multiplier (1.5×) to the respective player's base points. | SYSTEM | ✅ | Captain's displayed points equal 2× base; Vice-Captain's equal 1.5× base. |
| `FR-SCORE-03` | The system shall calculate a total fantasy team score as the sum of all 11 players' points (including captain/vice-captain multipliers). | SYSTEM | ✅ | The total equals the sum of individual player points (with multipliers) for the team. |
| `FR-SCORE-04` | The system shall display a per-player breakdown of fantasy points alongside each player's match performance data within the fantasy team view. | USER | ✅ | The fantasy team detail response includes both performance stats and calculated points for each of the 11 players. |
| `FR-SCORE-05` | The system shall recalculate fantasy points when the underlying match performance data changes (e.g., data correction by ADMIN). | SYSTEM | ✅ | After an ADMIN updates a player's match stats, the fantasy points for all teams containing that player reflect the change. |
| `FR-SCORE-06` | The scoring rules shall cover batting events (runs, boundaries, milestones), bowling events (wickets, maidens, economy bonuses/penalties), and fielding events (catches, run-outs, stumpings). | SYSTEM | ✅ | The scoring rules table covers all three categories, and sample data exercises at least one event from each. |

### 2.6 Fantasy Team Comparison (COMPARE)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-COMPARE-01` | An authenticated user shall be able to compare two of their own fantasy teams for the same match in a side-by-side view. | USER | ✅ | A GET with two fantasy team IDs for the same match returns comparison data including both teams' player lists and points. |
| `FR-COMPARE-02` | The comparison view shall display total team scores, per-player points, and highlight which team scores higher. | USER | ✅ | The response includes `totalPoints` for each team and a `winner` indicator; the UI renders both side by side. |
| `FR-COMPARE-03` | The comparison view shall highlight players that differ between the two teams. | USER | ✅ | Players not common to both teams are flagged in the response and visually distinguished in the UI. |
| `FR-COMPARE-04` | The system shall reject comparison requests where the two teams belong to different matches. | SYSTEM | ✅ | A comparison request with team IDs from different matches returns HTTP 400. |

### 2.7 AI Match Assistant (AI)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-AI-01` | An authenticated user shall be able to request an AI-generated summary of a match's current or final situation. | USER | ✅ | A POST to the AI match summary endpoint with a valid match ID returns a natural-language text summary. |
| `FR-AI-02` | The AI summary shall be generated using only the structured match data supplied by the backend — no external knowledge or fabricated statistics. | SYSTEM | ✅ | The AI prompt includes only data from the match record; the response text references no facts absent from that data. |
| `FR-AI-03` | The AI summary shall cover: match state, key batting and bowling performances, and the match result or projected situation. | SYSTEM | ✅ | The summary text references the match score, at least one batting and one bowling performance, and the outcome or current state. |
| `FR-AI-04` | The system shall handle AI service failures gracefully, returning an informative error message without crashing. | SYSTEM | ✅ | When the AI service is unavailable or returns an error, the endpoint returns HTTP 503 with a user-friendly message. |
| `FR-AI-05` | The system shall be designed to support swapping the AI provider (e.g., different LLM APIs) without changes to the frontend or the controller layer. | SYSTEM | ✅ | The AI integration is behind an interface/abstraction layer; a different implementation can be substituted by configuration change. |
| `FR-AI-06` | The system shall include the AI's source data context (or a reference to it) alongside the generated summary so users understand the basis of the explanation. | USER | ✅ | The AI response payload includes a `dataContext` field or equivalent that references the match and data snapshot used. |

### 2.8 Match Insights (INSIGHT)

| ID | Requirement | Role | MVP | Testable Criteria |
|----|-------------|------|:---:|-------------------|
| `FR-INSIGHT-01` | An authenticated user shall be able to request an AI-generated explanation of a specific player's performance in a match. | USER | ✅ | A POST with a match ID and player ID returns a natural-language narrative about that player's match contribution. |
| `FR-INSIGHT-02` | An authenticated user shall be able to request an AI-generated explanation of key turning points in a match. | USER | ✅ | A POST with a match ID returns a narrative identifying pivotal moments (e.g., a batting collapse, a crucial wicket partnership). |
| `FR-INSIGHT-03` | The system shall derive key moments from the structured match data (e.g., fall-of-wickets, scoring rate changes, milestone events). | SYSTEM | ✅ | The backend constructs a "key moments" data payload from match data before passing it to the AI service. |

---

## 3. Non-Functional Requirements

### 3.1 Security (NFR-SEC)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-SEC-01` | All passwords shall be hashed using bcrypt (or equivalent) with a minimum work factor of 10. | Database inspection confirms hashed passwords; no plaintext storage. |
| `NFR-SEC-02` | All API endpoints that modify data or access user-specific resources shall require authentication. | Automated tests confirm HTTP 401 for unauthenticated requests to all protected endpoints. |
| `NFR-SEC-03` | Users shall only be able to access their own fantasy teams; accessing another user's team data shall return HTTP 403. | Tests confirm cross-user access is denied for all fantasy team CRUD operations. |
| `NFR-SEC-04` | ADMIN-only endpoints (match and player CRUD) shall reject requests from users with the USER role. | Tests confirm HTTP 403 for USER-role requests to ADMIN endpoints. |
| `NFR-SEC-05` | API inputs shall be validated and sanitized to prevent SQL injection and XSS attacks. | Security tests with malicious payloads confirm no injection or script execution. |
| `NFR-SEC-06` | Session tokens shall expire after a configurable inactivity period (default: 30 minutes). | After the inactivity period, requests with the expired token return HTTP 401. |
| `NFR-SEC-07` | The application shall transmit data over HTTPS in all deployed environments. | Deployment configuration enforces TLS; HTTP requests are redirected to HTTPS. |

### 3.2 Performance (NFR-PERF)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-PERF-01` | API responses for match list, match detail, and player stats shall return within 500ms under normal load with sample data. | Load testing confirms p95 response time ≤ 500ms for these endpoints. |
| `NFR-PERF-02` | Fantasy points calculation for a single team (11 players) shall complete within 1 second. | Timed test confirms calculation completes within the limit. |
| `NFR-PERF-03` | AI match summary generation shall return within 15 seconds (dependent on external AI service latency). | Timed test confirms end-to-end response within 15 seconds under normal AI service conditions. |
| `NFR-PERF-04` | The frontend shall achieve a Lighthouse Performance score of 70 or higher on initial load with sample data. | Lighthouse audit confirms score ≥ 70. |

### 3.3 Scalability (NFR-SCALE)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-SCALE-01` | The backend architecture shall support horizontal scaling by being stateless (no server-side session state that prevents load balancing). | Application startup with multiple instances behind a load balancer serves requests without session affinity errors. |
| `NFR-SCALE-02` | The database schema shall support growth from sample data to thousands of matches and players without requiring schema changes. | Schema review confirms appropriate indexing, foreign keys, and no hard-coded limits. |

### 3.4 Reliability (NFR-REL)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-REL-01` | The application shall remain functional when the AI service is unavailable — all non-AI features continue to work. | With the AI service stopped, match dashboard, stats, and fantasy team features work normally; AI endpoints return HTTP 503. |
| `NFR-REL-02` | Database operations shall use transactions to ensure data consistency (e.g., fantasy team creation is atomic). | A simulated failure mid-transaction results in a full rollback; no partial data is committed. |
| `NFR-REL-03` | The application shall log errors with sufficient context (timestamp, user ID, endpoint, error message) for debugging. | Error logs contain all required fields; a test error scenario produces a complete log entry. |

### 3.5 Maintainability (NFR-MAINT)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-MAINT-01` | The frontend and backend shall be separate, independently deployable applications communicating via a documented REST API. | Each application builds, starts, and passes its tests independently. |
| `NFR-MAINT-02` | The backend shall use a layered architecture: controller → service → repository. | Code review confirms no direct repository access from controllers, and no business logic in controllers. |
| `NFR-MAINT-03` | The AI integration shall be behind an abstraction layer (interface or service contract) to allow provider changes without modifying business logic. | Swapping the AI implementation class does not require changes to the service or controller layers. |
| `NFR-MAINT-04` | Database schema changes shall be managed through versioned migration scripts (e.g., Supabase CLI migrations or Liquibase). | All schema changes are tracked in numbered migration files; running migrations on a fresh database produces the expected schema. |

### 3.6 Usability (NFR-USE)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-USE-01` | The web application shall be responsive and usable on desktop (1024px+) and tablet (768px+) viewports. | Manual or automated viewport testing confirms layouts render without horizontal overflow or broken elements at both breakpoints. |
| `NFR-USE-02` | Form validation errors shall display inline next to the offending field with a clear error message. | Submitting invalid data shows error messages adjacent to each invalid field without a page reload. |
| `NFR-USE-03` | Loading states shall be visually indicated (spinner or skeleton) for all asynchronous data fetches. | Every API-driven view shows a loading indicator between request initiation and data render. |
| `NFR-USE-04` | Error states (API failures, network errors) shall display a user-friendly message with a retry option where applicable. | Simulating a network failure shows an error message and a "Retry" button; clicking "Retry" re-fetches. |

### 3.7 Data Integrity (NFR-DATA)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-DATA-01` | All fantasy team player selections shall reference valid player IDs that exist in the match roster. | A POST with a non-existent or out-of-roster player ID returns HTTP 400. |
| `NFR-DATA-02` | Fantasy points shall be deterministic — the same match data and scoring rules always produce the same points. | Running the scoring calculation twice on the same data yields identical results. |
| `NFR-DATA-03` | Deleting a match shall not orphan associated fantasy teams; the system shall either cascade-delete or prevent deletion when teams exist. | Attempting to delete a match with associated fantasy teams either deletes all related teams or returns HTTP 409. |
| `NFR-DATA-04` | Player statistics displayed on player profiles shall be consistent with the aggregated data from individual match performances. | For a player with performances in 3 sample matches, the profile's aggregate stats equal the sum/average of the individual match stats. |

### 3.8 Testing (NFR-TEST)

| ID | Requirement | Testable Criteria |
|----|-------------|-------------------|
| `NFR-TEST-01` | The backend shall have unit tests covering all service-layer business logic, including fantasy point calculations and team validation rules. | Running `mvn test` (or equivalent) executes unit tests with ≥ 80% line coverage on service classes. |
| `NFR-TEST-02` | The backend shall have integration tests covering all REST API endpoints. | Integration tests exercise every endpoint with valid and invalid inputs, asserting correct HTTP status codes and response bodies. |
| `NFR-TEST-03` | The frontend shall have component tests for critical user flows: registration, login, team creation, and match view. | Running the frontend test suite executes component tests for the listed flows, all passing. |
| `NFR-TEST-04` | The fantasy scoring engine shall have a dedicated test suite that validates points for every scoring rule against manually calculated expected values. | The test suite includes at least one test case per scoring rule row, and all pass. |

---

## 4. Business Rules

### 4.1 Fantasy Team Composition (BR-TEAM)

| ID | Rule | Enforcement |
|----|------|-------------|
| `BR-TEAM-01` | A fantasy team must contain exactly 11 players. | `FR-FANTASY-02` — server-side validation. |
| `BR-TEAM-02` | A fantasy team must include players from both competing teams in the match (no single-team lineups). | `FR-FANTASY-03` — server-side validation. |
| `BR-TEAM-03` | A fantasy team must include at least 1 wicket-keeper, 1 batter, 1 all-rounder, and 1 bowler. | `FR-FANTASY-04` — server-side validation. |
| `BR-TEAM-04` | Each fantasy team must have exactly 1 Captain and exactly 1 Vice-Captain, both selected from the team's 11 players. | `FR-FANTASY-05` — server-side validation. |
| `BR-TEAM-05` | A player can only be added to a fantasy team if they are on the match roster for the selected match. | `NFR-DATA-01` — server-side validation against match roster. |
| `BR-TEAM-06` | A fantasy team can only be created or edited while the match status is "upcoming." Once the match is "in-progress" or "completed," the team is locked. | `FR-FANTASY-08`, `FR-FANTASY-09` — status check before mutation. |

### 4.2 Fantasy Scoring Rules (BR-SCORE)

> [!IMPORTANT]
> The scoring rules below are an initial proposal. Final point values are a **product decision** that should be confirmed before implementation. See [§9 — Unresolved Product Decisions](#9-unresolved-product-decisions).

#### Batting Points

| ID | Event | Points |
|----|-------|-------:|
| `BR-SCORE-BAT-01` | Run scored | +1 |
| `BR-SCORE-BAT-02` | Boundary (4) | +1 bonus |
| `BR-SCORE-BAT-03` | Six (6) | +2 bonus |
| `BR-SCORE-BAT-04` | Half-century (50 runs) | +10 bonus |
| `BR-SCORE-BAT-05` | Century (100 runs) | +25 bonus |
| `BR-SCORE-BAT-06` | Duck (0 runs, dismissed, excluding bowlers in Test/ODI) | −5 |

#### Bowling Points

| ID | Event | Points |
|----|-------|-------:|
| `BR-SCORE-BOWL-01` | Wicket taken (excluding run-outs) | +25 |
| `BR-SCORE-BOWL-02` | Maiden over | +10 |
| `BR-SCORE-BOWL-03` | 3-wicket haul | +10 bonus |
| `BR-SCORE-BOWL-04` | 5-wicket haul | +25 bonus |
| `BR-SCORE-BOWL-05` | Economy rate ≤ 4.0 (minimum 2 overs bowled) | +10 bonus |
| `BR-SCORE-BOWL-06` | Economy rate ≥ 10.0 (minimum 2 overs bowled) | −10 |

#### Fielding Points

| ID | Event | Points |
|----|-------|-------:|
| `BR-SCORE-FIELD-01` | Catch taken | +10 |
| `BR-SCORE-FIELD-02` | Run-out (direct hit) | +15 |
| `BR-SCORE-FIELD-03` | Run-out (indirect) | +10 |
| `BR-SCORE-FIELD-04` | Stumping | +15 |

#### Multipliers

| ID | Rule | Multiplier |
|----|------|:----------:|
| `BR-SCORE-MULT-01` | Captain's base points are multiplied. | 2× |
| `BR-SCORE-MULT-02` | Vice-Captain's base points are multiplied. | 1.5× |

### 4.3 Match Lifecycle (BR-MATCH)

| ID | Rule |
|----|------|
| `BR-MATCH-01` | A match has one of three statuses: `UPCOMING`, `IN_PROGRESS`, or `COMPLETED`. |
| `BR-MATCH-02` | Fantasy teams can only be created or modified when the match status is `UPCOMING`. |
| `BR-MATCH-03` | Fantasy points are calculated only after match performance data is available (status `IN_PROGRESS` or `COMPLETED`). |
| `BR-MATCH-04` | AI match explanations can be requested for matches with status `IN_PROGRESS` or `COMPLETED`. |

### 4.4 AI Behavior (BR-AI)

| ID | Rule |
|----|------|
| `BR-AI-01` | AI output must be derived solely from the structured match data supplied in the prompt. |
| `BR-AI-02` | AI must not generate predictions, betting advice, or win probabilities. |
| `BR-AI-03` | If the AI service is unavailable, the system must return a clear error and not degrade other features. |

---

## 5. Use Cases

### UC-01: User Registration

| Field | Detail |
|-------|--------|
| **Actor** | Unregistered visitor |
| **Preconditions** | None |
| **Main Flow** | 1. User navigates to the registration page. 2. User enters email, password, and display name. 3. System validates inputs (unique email, password strength). 4. System creates the user account and hashes the password. 5. System redirects to the login page with a success message. |
| **Alternate Flow** | 3a. Email already exists → system shows error: "An account with this email already exists." 3b. Password does not meet strength requirements → system shows inline validation error. |
| **Postconditions** | A new user record exists in the database with a hashed password. |
| **Requirements** | `FR-AUTH-01`, `FR-AUTH-02`, `FR-AUTH-05` |

### UC-02: User Login

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Preconditions** | User has a registered account. |
| **Main Flow** | 1. User navigates to the login page. 2. User enters email and password. 3. System validates credentials. 4. System creates a session and redirects to the match dashboard. |
| **Alternate Flow** | 3a. Invalid credentials → system shows error: "Invalid email or password." |
| **Postconditions** | User is authenticated and holds a valid session. |
| **Requirements** | `FR-AUTH-03`, `FR-AUTH-04` |

### UC-03: Browse Matches

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated or unauthenticated) |
| **Preconditions** | Sample match data is loaded. |
| **Main Flow** | 1. User navigates to the match dashboard. 2. System displays a list of matches with team names, format, date, and status. 3. User optionally filters by status. 4. User clicks a match to view details. |
| **Postconditions** | User views the selected match's full scorecard. |
| **Requirements** | `FR-MATCH-01`, `FR-MATCH-02`, `FR-MATCH-03` |

### UC-04: View Player Statistics

| Field | Detail |
|-------|--------|
| **Actor** | USER |
| **Preconditions** | Player data is loaded. |
| **Main Flow** | 1. User navigates to the player list or clicks a player name within a match scorecard. 2. System displays the player's profile with batting and bowling statistics. 3. User optionally views the player's performance in a specific match. |
| **Postconditions** | User views the player's aggregate and/or match-level stats. |
| **Requirements** | `FR-STATS-01`, `FR-STATS-02`, `FR-STATS-03`, `FR-STATS-04`, `FR-STATS-05` |

### UC-05: Create Fantasy Team

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | User is logged in. Match exists with status `UPCOMING`. Match roster is available. |
| **Main Flow** | 1. User navigates to the fantasy team creation page for a specific match. 2. System displays the match roster (both teams). 3. User selects 11 players respecting composition rules. 4. User designates a Captain and Vice-Captain. 5. User names the team and submits. 6. System validates the team against all business rules. 7. System saves the fantasy team. |
| **Alternate Flow** | 6a. Validation fails (wrong count, missing roles, single-team lineup) → system shows specific validation errors. User corrects and resubmits. |
| **Postconditions** | A new fantasy team record exists, associated with the user and match. |
| **Requirements** | `FR-FANTASY-01` through `FR-FANTASY-06`, `BR-TEAM-01` through `BR-TEAM-06` |

### UC-06: View Fantasy Team and Points

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | User has created at least one fantasy team. |
| **Main Flow** | 1. User navigates to "My Fantasy Teams." 2. System displays a list of the user's teams grouped by match. 3. User selects a team. 4. System displays the team lineup with per-player fantasy points (if match data is available) and the total team score. |
| **Postconditions** | User views their fantasy team's players and calculated points. |
| **Requirements** | `FR-FANTASY-07`, `FR-SCORE-01` through `FR-SCORE-04` |

### UC-07: Compare Fantasy Teams

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | User has at least two fantasy teams for the same match. |
| **Main Flow** | 1. User navigates to the comparison feature. 2. User selects two of their teams for the same match. 3. System displays a side-by-side comparison: total scores, per-player points, and differing player selections. |
| **Alternate Flow** | 2a. User selects teams from different matches → system shows error: "Teams must be for the same match." |
| **Postconditions** | User views a comparative breakdown of two fantasy teams. |
| **Requirements** | `FR-COMPARE-01` through `FR-COMPARE-04` |

### UC-08: Request AI Match Summary

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | Match status is `IN_PROGRESS` or `COMPLETED`. |
| **Main Flow** | 1. User views a match detail page. 2. User clicks "Explain This Match." 3. System gathers structured match data and sends it to the AI service. 4. AI service returns a natural-language summary. 5. System displays the summary alongside a reference to the data used. |
| **Alternate Flow** | 4a. AI service is unavailable → system displays: "Match explanation is temporarily unavailable. Please try again later." All other match data remains accessible. |
| **Postconditions** | User reads an AI-generated match explanation grounded in actual match data. |
| **Requirements** | `FR-AI-01` through `FR-AI-06`, `BR-AI-01` through `BR-AI-03` |

### UC-09: Request AI Player Performance Insight

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | Match has performance data for the selected player. |
| **Main Flow** | 1. User views a player's match performance. 2. User clicks "Explain This Performance." 3. System gathers the player's match data and sends it to the AI service. 4. AI service returns a narrative about the player's contribution. 5. System displays the narrative. |
| **Alternate Flow** | 4a. AI service unavailable → graceful error message. |
| **Postconditions** | User reads an AI-generated player performance narrative. |
| **Requirements** | `FR-INSIGHT-01`, `BR-AI-01` |

### UC-10: Request AI Key Moments Analysis

| Field | Detail |
|-------|--------|
| **Actor** | USER (authenticated) |
| **Preconditions** | Match status is `IN_PROGRESS` or `COMPLETED`. |
| **Main Flow** | 1. User views a match detail page. 2. User clicks "Key Moments." 3. System derives key moments from match data (fall-of-wickets, partnerships, scoring rate changes). 4. System sends key moments data to the AI service. 5. AI service returns a narrative of pivotal moments. 6. System displays the narrative. |
| **Alternate Flow** | 5a. AI service unavailable → graceful error message. |
| **Postconditions** | User reads an AI-generated analysis of key turning points. |
| **Requirements** | `FR-INSIGHT-02`, `FR-INSIGHT-03`, `BR-AI-01` |

---

## 6. Acceptance Criteria

### 6.1 Authentication

| ID | Criterion |
|----|-----------|
| `AC-AUTH-01` | A new user can register with a valid email and password, and subsequently log in with those credentials. |
| `AC-AUTH-02` | Duplicate email registration is rejected with a clear error message. |
| `AC-AUTH-03` | Incorrect login credentials produce an error without revealing whether the email or password was wrong. |
| `AC-AUTH-04` | A logged-out user cannot access fantasy team or AI endpoints (HTTP 401). |

### 6.2 Match Dashboard

| ID | Criterion |
|----|-----------|
| `AC-MATCH-01` | The match list page displays all seeded matches with team names, format, date, and status. |
| `AC-MATCH-02` | Clicking a match opens a detail view showing full scorecard data (both innings). |
| `AC-MATCH-03` | Filtering by "completed" shows only completed matches; filtering by "upcoming" shows only upcoming matches. |

### 6.3 Player Statistics

| ID | Criterion |
|----|-----------|
| `AC-STATS-01` | A player profile page displays batting and bowling aggregate statistics. |
| `AC-STATS-02` | Clicking a player within a match scorecard shows that player's match-specific performance. |
| `AC-STATS-03` | Aggregate stats on the profile are consistent with the sum/average of individual match performances in the system. |

### 6.4 Fantasy Team Management

| ID | Criterion |
|----|-----------|
| `AC-FANTASY-01` | A user can create a valid 11-player fantasy team for an upcoming match and see it listed under "My Fantasy Teams." |
| `AC-FANTASY-02` | Submitting a team with fewer or more than 11 players is rejected with a validation error. |
| `AC-FANTASY-03` | Submitting a team violating role composition rules is rejected with a specific error identifying the violated rule. |
| `AC-FANTASY-04` | A user cannot edit or delete a fantasy team once the match is in-progress or completed. |
| `AC-FANTASY-05` | A user cannot see, edit, or delete another user's fantasy teams. |

### 6.5 Fantasy Scoring

| ID | Criterion |
|----|-----------|
| `AC-SCORE-01` | For a completed sample match, every player in a fantasy team has correctly calculated points matching the scoring rules. |
| `AC-SCORE-02` | The Captain's points are exactly 2× their base points; the Vice-Captain's points are exactly 1.5× their base points. |
| `AC-SCORE-03` | The total team score equals the sum of all 11 players' individual points (with multipliers). |

### 6.6 Team Comparison

| ID | Criterion |
|----|-----------|
| `AC-COMPARE-01` | A side-by-side comparison of two teams for the same match shows both teams' total scores and per-player breakdowns. |
| `AC-COMPARE-02` | Players that differ between the two teams are visually highlighted. |
| `AC-COMPARE-03` | Attempting to compare teams from different matches is rejected. |

### 6.7 AI Match Assistant

| ID | Criterion |
|----|-----------|
| `AC-AI-01` | Clicking "Explain This Match" on a completed match returns a natural-language summary that references actual match scores and performances. |
| `AC-AI-02` | The AI summary does not contain facts absent from the match data supplied to it. |
| `AC-AI-03` | When the AI service is down, the user sees a friendly error message and all other features continue to work. |

### 6.8 Match Insights

| ID | Criterion |
|----|-----------|
| `AC-INSIGHT-01` | Clicking "Explain This Performance" on a player's match stats returns a narrative about that player's contribution. |
| `AC-INSIGHT-02` | Clicking "Key Moments" returns a narrative identifying pivotal events in the match. |

---

## 7. MVP Requirements Summary

All requirements with **MVP = ✅** in Sections 2 and 3 constitute the MVP. For reference, the MVP delivers:

| Area | Requirement IDs |
|------|----------------|
| Authentication | `FR-AUTH-01` through `FR-AUTH-08` |
| Match Dashboard | `FR-MATCH-01` through `FR-MATCH-06` |
| Player Statistics | `FR-STATS-01` through `FR-STATS-06` |
| Fantasy Team Management | `FR-FANTASY-01` through `FR-FANTASY-11` |
| Fantasy Scoring | `FR-SCORE-01` through `FR-SCORE-06` |
| Team Comparison | `FR-COMPARE-01` through `FR-COMPARE-04` |
| AI Match Assistant | `FR-AI-01` through `FR-AI-06` |
| Match Insights | `FR-INSIGHT-01` through `FR-INSIGHT-03` |
| Security | `NFR-SEC-01` through `NFR-SEC-07` |
| Performance | `NFR-PERF-01` through `NFR-PERF-04` |
| Scalability | `NFR-SCALE-01` through `NFR-SCALE-02` |
| Reliability | `NFR-REL-01` through `NFR-REL-03` |
| Maintainability | `NFR-MAINT-01` through `NFR-MAINT-04` |
| Usability | `NFR-USE-01` through `NFR-USE-04` |
| Data Integrity | `NFR-DATA-01` through `NFR-DATA-04` |
| Testing | `NFR-TEST-01` through `NFR-TEST-04` |

**Total: 71 requirements (42 functional + 29 non-functional)**

---

## 8. Future Enhancements

The following are **out of scope for the MVP** and planned for future phases, as defined in [PROJECT_VISION.md §13](file:///U:/Fanpulse_AI/docs/PROJECT_VISION.md#L194):

| ID | Enhancement | Phase | Dependencies |
|----|-------------|-------|-------------|
| `FE-01` | Authorized live cricket API integration — replace sample data with real-time data from a licensed provider. | Phase 2 | API provider selection, data mapping, `FR-MATCH-07`. |
| `FE-02` | Real-time WebSocket score updates on the match dashboard. | Phase 2 | `FE-01` (live data source). |
| `FE-03` | Fantasy leagues and leaderboards — multi-user contests, league creation, and ranked leaderboards. | Phase 3 | New domain entities (League, Contest, Leaderboard). |
| `FE-04` | Advanced AI analysis — win probability narratives, predictive insights, strategy breakdowns. | Phase 3 | `BR-AI-02` must be revisited; requires richer data and prompt engineering. |
| `FE-05` | Native mobile applications (iOS / Android). | Phase 4 | Stable API; mobile-specific design. |
| `FE-06` | Push notifications for match events, fantasy point updates, and league activity. | Phase 4 | `FE-02` (real-time data), `FE-05` (mobile). |
| `FE-07` | Social features — comments, match discussions, fantasy team sharing. | Future | Moderation system, new domain entities. |
| `FE-08` | Internationalization / multi-language support. | Future | Content strategy, translation infrastructure. |
| `FE-09` | Admin dashboard — UI for managing match data, player data, and system configuration. | Future | ADMIN role endpoints (partially in MVP), frontend ADMIN views. |

---

## 9. Unresolved Product Decisions

The following decisions need to be resolved before or during implementation. They are flagged here because the existing project documentation does not specify them.

| ID | Decision | Impact | Options / Notes |
|----|----------|--------|-----------------|
| `PD-01` | **Fantasy scoring point values** — Are the proposed values in §4.2 confirmed? | `BR-SCORE-*`, `FR-SCORE-01` | The values in this document are proposals. Final values should be confirmed by the product owner. Consider whether point values should differ by format (T20 vs. ODI vs. Test). |
| `PD-02` | **Maximum players per team from one side** — Should there be a cap (e.g., max 7 from one team)? | `BR-TEAM-02`, `FR-FANTASY-03` | `BR-TEAM-02` requires players from both teams but does not specify a maximum from one side. Dream11 uses a max of 7 from one team. |
| `PD-03` | **Duck penalty scope** — Should the duck penalty apply to all batters, or exclude bowlers in Test/ODI as proposed? | `BR-SCORE-BAT-06` | Excluding lower-order bowlers from the duck penalty is standard in fantasy cricket but increases implementation complexity. |
| `PD-04` | **Fantasy team edit window** — Should teams lock at a specific time before the match (e.g., 30 minutes before toss), or only when the match status changes to `IN_PROGRESS`? | `BR-TEAM-06`, `FR-FANTASY-08` | A time-based lock before toss prevents last-second lineup changes after the toss is announced. A status-based lock is simpler to implement. |
| `PD-05` | **AI provider and model selection** — Which LLM API will be used? | `FR-AI-05`, `NFR-MAINT-03` | Noted as TBD in [PROJECT_VISION.md §10](file:///U:/Fanpulse_AI/docs/PROJECT_VISION.md#L160). Must be decided before AI feature implementation. The abstraction layer (`FR-AI-05`) allows deferring this, but test data and prompt engineering depend on the provider. |
| `PD-06` | **Match data access for unauthenticated users** — Can anonymous users browse matches and player stats, or is authentication required for all features? | `FR-MATCH-01`, `FR-STATS-01` | Current requirements assume match and stats browsing is public. Fantasy and AI features require authentication. This should be explicitly confirmed. |
| `PD-07` | **Password strength requirements** — What are the minimum password rules (length, complexity)? | `FR-AUTH-01` | Not specified. Recommend minimum 8 characters with at least one letter and one digit. |
| `PD-08` | **Fantasy team limit per user per match** — Should there be a maximum number of fantasy teams a user can create for one match? | `FR-FANTASY-11` | Current requirements allow unlimited teams per match. Consider whether a cap (e.g., 5 teams) is appropriate. |

---

## 10. Requirements Traceability

| Source Document | Section | Requirement IDs |
|-----------------|---------|-----------------|
| PROJECT_VISION.md §8.1.1 — Match Dashboard | | `FR-MATCH-01` through `FR-MATCH-06` |
| PROJECT_VISION.md §8.1.2 — Player Statistics | | `FR-STATS-01` through `FR-STATS-06` |
| PROJECT_VISION.md §8.1.3 — User Authentication | | `FR-AUTH-01` through `FR-AUTH-08` |
| PROJECT_VISION.md §8.1.4 — Fantasy Team Management | | `FR-FANTASY-01` through `FR-FANTASY-11` |
| PROJECT_VISION.md §8.1.5 — Fantasy Points Calculation | | `FR-SCORE-01` through `FR-SCORE-06` |
| PROJECT_VISION.md §8.1.6 — Fantasy Team Comparison | | `FR-COMPARE-01` through `FR-COMPARE-04` |
| PROJECT_VISION.md §8.1.7 — AI Match Explanations | | `FR-AI-01` through `FR-AI-06`, `FR-INSIGHT-01` through `FR-INSIGHT-03` |
| PROJECT_VISION.md §9 — AI Strategy | | `BR-AI-01` through `BR-AI-03` |
| PROJECT_VISION.md §11 — Quality Goals | | `NFR-SEC-*`, `NFR-PERF-*`, `NFR-MAINT-*`, `NFR-USE-*`, `NFR-DATA-*` |
| PROJECT_VISION.md §13 — Future Enhancements | | `FE-01` through `FE-09` |
| COMPETITOR_ANALYSIS.md §2.3 — Dream11 | Fantasy mechanics inspiration | `BR-TEAM-*`, `BR-SCORE-*` |
| COMPETITOR_ANALYSIS.md §6 — Regulatory Context | Free-to-play compliance | `BR-AI-02` (no predictions/betting) |

---

*Document created: November 2, 2026*
*Status: Draft — 8 product decisions pending resolution (§9).*

