# FanPulse AI — Deterministic Fantasy Scoring Engine

> **Authoritative specification of fantasy scoring formulas, player role constraints, captain multipliers, and validation mechanics.**

---

## 1. Engine Philosophy & Architectural Separation

FanPulse AI adheres to an uncompromising engineering principle: **AI models must never compute fantasy scores.**

While the generative AI Match Assistant provides narrative explanations and contextual breakdowns, all fantasy calculations are executed by a **deterministic, mathematical rules engine** implemented in TypeScript (`supabase/functions/_shared/scoring/index.ts`) and mirrored in client validation services (`frontend/src/services/scoringService.js`).

```mermaid
flowchart LR
    Tele[Match Telemetry & Scorecard] --> Engine[Deterministic Scoring Engine]
    Engine --> Multipliers[Captain / VC Multiplier Stage]
    Multipliers --> Persist[(PostgreSQL fantasy_teams & points)]
    
    Tele -.-> Context[Context Assembler]
    Context -.-> Gemini[Gemini 1.5 Flash (Explanations Only)]
```

---

## 2. Squad Composition & Validation Rules

Before fantasy points can be awarded, a squad must pass strict composition validation enforced by both client-side Zod schemas and server-side Edge Functions (`validate-fantasy-team`):

| Constraint | Rule Boundary | Validation Message |
| :--- | :--- | :--- |
| **Total Squad Size** | Exactly **11 players** | Squad must contain exactly 11 players. |
| **Credit Budget** | Total credits $\le$ **100.0** | Total credits spent cannot exceed 100.0. |
| **Wicket-Keepers (WK)** | Min **1**, Max **4** | Squad must include between 1 and 4 Wicket-Keepers. |
| **Batters (BAT)** | Min **3**, Max **6** | Squad must include between 3 and 6 Batters. |
| **All-Rounders (AR)** | Min **1**, Max **4** | Squad must include between 1 and 4 All-Rounders. |
| **Bowlers (BOWL)** | Min **3**, Max **6** | Squad must include between 3 and 6 Bowlers. |
| **Team Cap** | Max **7 players** from one team | Cannot select more than 7 players from a single competing team. |
| **Captain (C)** | Exactly **1 player** | Exactly one Captain must be designated (2.0x points). |
| **Vice-Captain (VC)** | Exactly **1 player** | Exactly one Vice-Captain must be designated (1.5x points). |
| **Captain $\neq$ Vice-Captain**| Distinct players | The Captain and Vice-Captain cannot be the same player. |
| **Match Deadline Lock** | Prior to `start_time` | Squad changes locked once match status transitions to LIVE. |

---

## 3. Mathematical Scoring Ruleset (`v1.0`)

### 3.1 Batting Points Formula

$$\text{Points}_{\text{batting}} = \text{Runs} \times 1.0 + \text{Fours} \times 1.0 + \text{Sixes} \times 2.0 + \text{Milestone Bonus} + \text{Duck Penalty}$$

| Event Key | Point Value | Condition / Notes |
| :--- | :--- | :--- |
| `RUN` | **+1.0 pt** | Every run scored off the bat. |
| `BOUNDARY_FOUR` | **+1.0 pt** | Bonus for each boundary four (total 5 pts for a four). |
| `BOUNDARY_SIX` | **+2.0 pts** | Bonus for each boundary six (total 8 pts for a six). |
| `HALF_CENTURY_BONUS` | **+10.0 pts** | Awarded when batter scores $\ge$ 50 runs in an innings. |
| `CENTURY_BONUS` | **+25.0 pts** | Awarded when batter scores $\ge$ 100 runs in an innings (replaces half-century bonus). |
| `DUCK_PENALTY` | **-5.0 pts** | Dismissed for 0 runs (applies to BAT, WK, AR; pure bowlers exempt). |

---

### 3.2 Bowling Points Formula

$$\text{Points}_{\text{bowling}} = \text{Wickets} \times 25.0 + \text{Maidens} \times 10.0 + \text{Haul Bonus} + \text{Economy Modifier}$$

| Event Key | Point Value | Condition / Notes |
| :--- | :--- | :--- |
| `WICKET` | **+25.0 pts** | Wicket taken (bowled, caught, LBW, stumped, hit-wicket). Excludes run-outs. |
| `MAIDEN_OVER` | **+10.0 pts** | An over completed with 0 runs conceded. |
| `THREE_WICKET_HAUL` | **+10.0 pts** | Bonus awarded when bowler claims 3 or 4 wickets in a match. |
| `FIVE_WICKET_HAUL` | **+25.0 pts** | Bonus awarded when bowler claims 5+ wickets in a match (replaces 3-wicket bonus). |
| `ECONOMY_RATE_BONUS` | **+10.0 pts** | Economy rate $\le 4.00$ runs/over (minimum 2.0 overs bowled). |
| `ECONOMY_RATE_PENALTY`| **-10.0 pts** | Economy rate $\ge 10.00$ runs/over (minimum 2.0 overs bowled). |

---

### 3.3 Fielding Points Formula

$$\text{Points}_{\text{fielding}} = \text{Catches} \times 10.0 + \text{Stumpings} \times 15.0 + \text{Direct Run-outs} \times 15.0 + \text{Indirect Run-outs} \times 10.0$$

| Event Key | Point Value | Condition / Notes |
| :--- | :--- | :--- |
| `CATCH` | **+10.0 pts** | Direct catch taken in the field or behind the stumps. |
| `STUMPING` | **+15.0 pts** | Stumping executed by designated Wicket-Keeper. |
| `RUN_OUT_DIRECT` | **+15.0 pts** | Thrower hits stumps directly resulting in dismissal. |
| `RUN_OUT_INDIRECT` | **+10.0 pts** | Fielder touches/throws ball to partner who completes dismissal. |

---

### 3.4 Multipliers & Aggregate Squad Points

$$\text{Player Total} = (\text{Points}_{\text{batting}} + \text{Points}_{\text{bowling}} + \text{Points}_{\text{fielding}}) \times \text{Multiplier}$$

Where:
- $\text{Multiplier} = 2.0$ for **Captain (C)**
- $\text{Multiplier} = 1.5$ for **Vice-Captain (VC)**
- $\text{Multiplier} = 1.0$ for all other 9 squad players

$$\text{Squad Total} = \sum_{i=1}^{11} \text{Player Total}_i$$

---

## 4. Verification Example: India vs Australia 3rd T20I

| Player | Role | Match Statistics | Raw Points | Multiplier | Final Fantasy Pts |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Virat Kohli** (C) | BAT | 68 runs (44b), 6 fours, 2 sixes, 1 catch | $68 + 6(1) + 2(2) + 10 (\text{50s}) + 10 (\text{ct}) = 98$ | **2.0x** | **196.0 pts** |
| **Glenn Maxwell** (VC)| AR | 54 runs (31b), 4 fours, 3 sixes, 1 wicket | $54 + 4(1) + 3(2) + 10 (\text{50s}) + 25 (\text{wkt}) = 99$ | **1.5x** | **148.5 pts** |
| **Jasprit Bumrah** | BOWL | 4.0 ov, 1 maiden, 24 runs, 3 wickets | $3 \times 25 + 10 (\text{mdn}) + 10 (\text{3-wkt}) = 95$ | **1.0x** | **95.0 pts** |
| **Pat Cummins** | BOWL | 4.0 ov, 32 runs, 2 wickets | $2 \times 25 = 50$ | **1.0x** | **50.0 pts** |

---

*Related Documentation:*
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Testing and QA](TESTING_AND_QA.md)

