# FanPulse AI — Edge Functions & API Reference

> **Authoritative REST API specification for all 9 deployed Supabase Edge Functions and frontend service integrations.**

---

## 1. Global API Architecture

- **Base URL:** `https://zovgiiqamqfbqiopkooc.supabase.co/functions/v1`
- **Runtime:** Supabase Edge Runtime (Deno / TypeScript).
- **CORS Handling:** Managed uniformly via `_shared/cors.ts` (accepts authorized origin, handles `OPTIONS` preflight with `204 No Content`).
- **Response Format:** Standard JSON (`Content-Type: application/json`).
- **Authentication:** Standard HTTP Bearer Token header (`Authorization: Bearer <supabase_jwt>`).

---

## 2. Edge Function Directory

| # | Function Name | Method | Auth Level | Primary Purpose |
| :- | :--- | :--- | :--- | :--- |
| 1 | [`health-check`](#1-health-check) | `GET` | Public (`--no-verify-jwt`) | Heartbeat, environment info, and database verification. |
| 2 | [`manage-matches`](#2-manage-matches) | `GET` | Public (`--no-verify-jwt`) | Retrieve matches, live situations, and scorecards. |
| 3 | [`manage-players`](#3-manage-players) | `GET` | Public (`--no-verify-jwt`) | Query player profiles, roles, and career statistics. |
| 4 | [`validate-fantasy-team`](#4-validate-fantasy-team) | `POST` | Authenticated (JWT) | Validates 11-player squad composition and budget caps. |
| 5 | [`manage-fantasy-teams`](#5-manage-fantasy-teams) | `GET, POST, DELETE`| Authenticated (JWT) | CRUD operations for user fantasy squads. |
| 6 | [`compare-fantasy-teams`](#6-compare-fantasy-teams) | `POST` | Authenticated (JWT) | Side-by-side squad comparison and differential analysis. |
| 7 | [`calculate-fantasy-scoring`](#7-calculate-fantasy-scoring)| `POST` | Service / Admin | Deterministic fantasy points computation. |
| 8 | [`sync-cricket-data`](#8-sync-cricket-data) | `POST` | Admin / Cron | Cricket data ingestion and fallback synchronization. |
| 9 | [`ai-assistant`](#9-ai-assistant) | `POST` | Authenticated (JWT) | Context-assembled cricket chat via Gemini 1.5 Flash. |

---

## 3. Detailed Endpoint Contracts

### 1. `health-check`
Verifies Edge Function runtime status and database connectivity.
- **Endpoint:** `GET /health-check`
- **Auth:** Public
- **Response `200 OK`:**
```json
{
  "status": "success",
  "service": "fanpulse-ai-edge-functions",
  "environment": "production",
  "database": "connected",
  "timestamp": "2026-11-04T12:00:00.000Z"
}
```

---

### 2. `manage-matches`
Retrieves match listings or detailed scorecard telemetry for a specific fixture.
- **Endpoint:** `GET /manage-matches`
- **Auth:** Public
- **Query Parameters:**
  - `id` *(optional, string)*: Match fixture ID (e.g., `m-ind-aus-t20`).
  - `status` *(optional, string)*: Filter by `LIVE`, `UPCOMING`, or `COMPLETED`.
  - `format` *(optional, string)*: Filter by `T20`, `ODI`, or `TEST`.
- **Response `200 OK` (Single Match Detail):**
```json
{
  "id": "m-ind-aus-t20",
  "title": "India vs Australia - 3rd T20I",
  "format": "T20",
  "status": "COMPLETED",
  "venue": "Melbourne Cricket Ground",
  "toss": "India won the toss and elected to bowl",
  "innings": [
    {
      "inningsNumber": 1,
      "battingTeam": "Australia",
      "bowlingTeam": "India",
      "totalRuns": 178,
      "totalWickets": 8,
      "oversCompleted": 20.0,
      "extras": 12
    },
    {
      "inningsNumber": 2,
      "battingTeam": "India",
      "bowlingTeam": "Australia",
      "totalRuns": 184,
      "totalWickets": 4,
      "oversCompleted": 19.2,
      "extras": 8
    }
  ],
  "result": "India won by 6 wickets"
}
```

---

### 3. `manage-players`
Retrieves player profiles, career aggregate records, and match statistics.
- **Endpoint:** `GET /manage-players`
- **Auth:** Public
- **Query Parameters:**
  - `id` *(optional, string)*: Player ID.
  - `teamId` *(optional, string)*: Filter by team ID.
  - `role` *(optional, string)*: Filter by `BAT`, `BOWL`, `AR`, or `WK`.
- **Response `200 OK`:**
```json
{
  "players": [
    {
      "id": "player-ind-01",
      "name": "Virat Kohli",
      "shortName": "V. Kohli",
      "country": "India",
      "role": "BAT",
      "battingStyle": "Right-hand bat",
      "credits": 10.5,
      "stats": {
        "matchesPlayed": 115,
        "runs": 4008,
        "battingAverage": 52.73,
        "strikeRate": 137.96
      }
    }
  ]
}
```

---

### 4. `validate-fantasy-team`
Validates an 11-player squad against strict fantasy roster and budget rules.
- **Endpoint:** `POST /validate-fantasy-team`
- **Auth:** Authenticated (Bearer JWT)
- **Request Body:**
```json
{
  "matchId": "m-ind-aus-t20",
  "players": [
    { "playerId": "player-ind-01", "isCaptain": true, "isViceCaptain": false },
    { "playerId": "player-aus-01", "isCaptain": false, "isViceCaptain": true },
    { "playerId": "player-ind-02", "isCaptain": false, "isViceCaptain": false }
  ]
}
```
- **Response `200 OK` (Validation Passed):**
```json
{
  "valid": true,
  "errors": [],
  "summary": {
    "totalPlayers": 11,
    "creditsSpent": 98.5,
    "creditsRemaining": 1.5,
    "roleBreakdown": { "WK": 1, "BAT": 4, "AR": 3, "BOWL": 3 },
    "teamBreakdown": { "team-ind": 6, "team-aus": 5 }
  }
}
```
- **Response `400 Bad Request` (Validation Failed):**
```json
{
  "valid": false,
  "errors": [
    "Squad must contain exactly 11 players (currently 10).",
    "Total credits spent (101.5) exceeds maximum budget cap of 100.0."
  ]
}
```

---

### 5. `manage-fantasy-teams`
Provides CRUD persistence for user-created fantasy squads with tenant isolation.
- **Endpoint:** `/manage-fantasy-teams`
- **Auth:** Authenticated (Bearer JWT)
- **Supported Methods:**
  - `GET`: Retrieve fantasy squads created by the authenticated user (`auth.uid() = user_id`).
  - `POST`: Persist a newly validated squad into `fantasy_teams` and `fantasy_team_players`.
  - `DELETE`: Remove a squad prior to fixture commencement.
- **Response `201 Created`:**
```json
{
  "teamId": "d7a12b4e-8f2c-491a-b32c-7b1982cf9a12",
  "teamName": "India Victory XI",
  "matchId": "m-ind-aus-t20",
  "totalCreditsSpent": 98.5,
  "status": "SAVED"
}
```

---

### 6. `compare-fantasy-teams`
Performs side-by-side differential analysis between two registered fantasy squads.
- **Endpoint:** `POST /compare-fantasy-teams`
- **Auth:** Authenticated (Bearer JWT)
- **Request Body:**
```json
{
  "team1Id": "team-uuid-1",
  "team2Id": "team-uuid-2",
  "matchId": "m-ind-aus-t20"
}
```
- **Response `200 OK`:**
```json
{
  "matchId": "m-ind-aus-t20",
  "team1": {
    "id": "team-uuid-1",
    "name": "Squad Alpha",
    "totalPoints": 582.5,
    "captain": { "name": "V. Kohli", "multiplier": 2.0, "points": 142.0 },
    "viceCaptain": { "name": "G. Maxwell", "multiplier": 1.5, "points": 93.0 }
  },
  "team2": {
    "id": "team-uuid-2",
    "name": "Squad Beta",
    "totalPoints": 514.0,
    "captain": { "name": "R. Sharma", "multiplier": 2.0, "points": 88.0 },
    "viceCaptain": { "name": "P. Cummins", "multiplier": 1.5, "points": 84.0 }
  },
  "differentialAnalysis": {
    "pointDifference": 68.5,
    "commonPlayersCount": 2,
    "differentialPlayersCount": 18,
    "commonPlayers": ["player-ind-01", "player-aus-04"]
  }
}
```

---

### 7. `ai-assistant`
Generates natural-language match explanations grounded in structured database telemetry.
- **Endpoint:** `POST /ai-assistant`
- **Auth:** Authenticated (Bearer JWT)
- **Request Body:**
```json
{
  "matchId": "m-ind-aus-t20",
  "question": "How did India chase down the target and who bowled the key death overs?",
  "conversationHistory": []
}
```
- **Response `200 OK`:**
```json
{
  "explanation": "India successfully chased down the target of 179, scoring 184/4 in 19.2 overs to defeat Australia by 6 wickets at the Melbourne Cricket Ground. Virat Kohli anchored the chase with 68 runs off 44 balls. During the death overs, Pat Cummins bowled the 18th over conceding only 7 runs, but Mitchell Starc conceded 16 runs in the 19th over, allowing India to seal victory with 4 balls to spare.",
  "matchId": "m-ind-aus-t20",
  "isGrounded": true,
  "notice": "Analysis grounded in verified match scorecard telemetry."
}
```

---

## 4. Frontend Service Layer Mapping

| Service Module | Source File | Connected Endpoints |
| :--- | :--- | :--- |
| `cricketService` | `frontend/src/services/cricketService.js` | `manage-matches`, `manage-players` |
| `fantasyService` | `frontend/src/services/fantasyService.js` | `validate-fantasy-team`, `manage-fantasy-teams`, `compare-fantasy-teams` |
| `scoringService` | `frontend/src/services/scoringService.js` | `calculate-fantasy-scoring`, Client Points Engine |
| `aiService` | `frontend/src/services/aiService.js` | `ai-assistant` |
| `authService` | `frontend/src/services/authService.js` | Supabase GoTrue Auth API |
| `dashboardService` | `frontend/src/services/dashboardService.js` | Aggregated match, player, and summary telemetry |

---

*Related Documentation:*
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [AI Implementation](AI_IMPLEMENTATION.md)
- [Fantasy Scoring](FANTASY_SCORING.md)
- [Security Architecture](SECURITY.md)
