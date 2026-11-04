# FanPulse AI — Application Screenshot Capture Checklist

This document catalogs all verified visual screens within the **FanPulse AI** production deployment at [https://fanpulseai-nine.vercel.app/](https://fanpulseai-nine.vercel.app/).

All screenshots correspond directly to implemented React views and should be captured using the live web application. Mark each item once captured.

---

### Screenshot Verification Catalog

| ID | Module / View | Live Route / URL | Prerequisite Actions | Key Visual Elements to Capture | Status |
|:---|:---|:---|:---|:---|:---:|
| **SS-01** | **Main Match Dashboard** | `/dashboard` | Navigate to home page or click Dashboard. | Hero Match Banner (India vs Australia), Live scores, AI Insights preview widget, Top Performers card, Quick Action buttons. | `[ ] PENDING CAPTURE` |
| **SS-02** | **Cricket Match Center** | `/matches` | Click "Matches" in navigation. | Filter tabs (All, Live, Upcoming, Completed), Match cards showing venues, formats (T20I, ODI), innings totals, and DEMO DATA badges. | `[ ] PENDING CAPTURE` |
| **SS-03** | **Match Detail & Scorecard** | `/matches/m-ind-aus-t20` | Click on "India vs Australia" fixture. | Match Header (MCG venue, toss summary), Innings Tab selector (1st Innings vs 2nd Innings), Batting scorecard, Bowling figures, Run rate. | `[ ] PENDING CAPTURE` |
| **SS-04** | **Ball-by-Ball Timeline** | `/matches/m-ind-aus-t20` | Click "Ball-by-Ball" tab in Match Detail view. | Delivery feed with over-by-over markers, boundary badges (FOUR, SIX), wicket dismissals, and boundary-only filter toggle. | `[ ] PENDING CAPTURE` |
| **SS-05** | **Player Career Profile** | `/players/p-virat-k` | Click player name "Virat Kohli" in match scorecard or lineup. | Player banner (Name, role: BATTER, country: India, batting/bowling style), Career Statistics grid (Matches, Runs, Average, Strike Rate, 100s/50s). | `[ ] PENDING CAPTURE` |
| **SS-06** | **Fantasy Squad Builder** | `/matches/m-ind-aus-t20/fantasy/create` | Log in and click "Create Fantasy Team" for the fixture. | Squad progress counter (e.g. 11/11 players), Role breakdown tabs (WK, BAT, AR, BOWL), Team composition summary, Credit counter. | `[ ] PENDING CAPTURE` |
| **SS-07** | **Captain & Vice-Captain Selection** | `/matches/m-ind-aus-t20/fantasy/create` | Select 11 eligible players and open multiplier modal. | Selected 11-player lineup modal, Captain (2×) selector radio button, Vice-Captain (1.5×) selector radio button, Validation error feedback. | `[ ] PENDING CAPTURE` |
| **SS-08** | **User Fantasy Squads List** | `/fantasy/teams` | Log in and click "My Teams" in top navigation. | List of user's drafted teams, Captain and Vice-Captain badges, total fantasy points tally, match fixture badge, "Compare Squads" link. | `[ ] PENDING CAPTURE` |
| **SS-09** | **Fantasy Team Comparison** | `/fantasy/compare` | Select two distinct user squads (or demo fixture squads). | Side-by-side squad comparison table, Points differential (+53.5), Captain contribution delta widget, Common vs Differential player filter tabs. | `[ ] PENDING CAPTURE` |
| **SS-10** | **AI Match Assistant Interface** | `/assistant` | Click "AI Assistant" in navigation. | Match selector dropdown, suggested prompt chips ("Why did Virat Kohli earn 112 fantasy points?"), conversational chat feed with bold grounded markdown. | `[ ] PENDING CAPTURE` |
| **SS-11** | **AI Telemetry Grounding Notice** | `/assistant` | Submit a match situation question. | Grounding badge (`AUTHORITATIVE_POSTGRES_RECORDS`), anti-hallucination disclaimers, match score context snapshot card. | `[ ] PENDING CAPTURE` |
| **SS-12** | **User Authentication** | `/login` and `/register` | Click Login / Sign Up in navbar. | Email and password input fields, Supabase Auth session handler, error messaging, and demo credentials notice. | `[ ] PENDING CAPTURE` |

---

### Capture Guidelines for Submission & Defense

1. **Resolution:** Recommended 1920×1080 (Full HD) desktop browser viewport.
2. **Theme:** Dark mode theme (Tailwind CSS slate-900 / slate-800 default).
3. **Storage Location:** Save raw screenshot images into `docs/screenshots/` (e.g., `docs/screenshots/SS-01_dashboard.png`).
4. **Data Integrity:** Do not edit numbers or tamper with rendered scores. Grounded demo badges (`DEMO DATA` / `AUTHORITATIVE TELEMETRY`) must remain visible as designed.
