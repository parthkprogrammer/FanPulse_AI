-- ==============================================================================
-- FanPulse AI — Verified Development Seed Data Script
-- File: supabase/seed.sql
-- Description: Loaded automatically by Supabase CLI after running migrations
--              during `supabase db reset`. Populates sample cricket fixtures,
--              teams, players, scorecards, rosters, and scoring configurations.
-- Conforms to: DATABASE_DESIGN.md (§3, §7) and REQUIREMENTS.md
-- ==============================================================================

-- ==============================================================================
-- 1. SEED CRICKET TEAMS
-- ==============================================================================
INSERT INTO public.teams (id, name, short_name, code, country)
VALUES
    ('team-ind', 'India', 'IND', 'IND', 'India'),
    ('team-aus', 'Australia', 'AUS', 'AUS', 'Australia'),
    ('team-eng', 'England', 'ENG', 'ENG', 'England'),
    ('team-sa', 'South Africa', 'SA', 'SA', 'South Africa'),
    ('team-nz', 'New Zealand', 'NZ', 'NZ', 'New Zealand'),
    ('team-pak', 'Pakistan', 'PAK', 'PAK', 'Pakistan')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    country = EXCLUDED.country;

-- ==============================================================================
-- 2. SEED CRICKET ATHLETES (PLAYERS)
-- ==============================================================================
INSERT INTO public.players (id, name, short_name, country, primary_role, batting_style, bowling_style)
VALUES
    -- India Athletes
    ('p-virat-k', 'Virat Kohli', 'V Kohli', 'India', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_MEDIUM'),
    ('p-rohit-s', 'Rohit Sharma', 'R Sharma', 'India', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-shubman-g', 'Shubman Gill', 'S Gill', 'India', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-surya-y', 'Suryakumar Yadav', 'SA Yadav', 'India', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_MEDIUM'),
    ('p-rishabh-p', 'Rishabh Pant', 'R Pant', 'India', 'WICKET_KEEPER', 'LEFT_HAND_BAT', NULL),
    ('p-hardik-p', 'Hardik Pandya', 'H Pandya', 'India', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST_MEDIUM'),
    ('p-ravindra-j', 'Ravindra Jadeja', 'R Jadeja', 'India', 'ALL_ROUNDER', 'LEFT_HAND_BAT', 'SLOW_LEFT_ARM_ORTHODOX'),
    ('p-jasprit-b', 'Jasprit Bumrah', 'J Bumrah', 'India', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST'),
    ('p-arshdeep-s', 'Arshdeep Singh', 'A Singh', 'India', 'BOWLER', 'LEFT_HAND_BAT', 'LEFT_ARM_FAST_MEDIUM'),
    ('p-kuldeep-y', 'Kuldeep Yadav', 'K Yadav', 'India', 'BOWLER', 'LEFT_HAND_BAT', 'LEFT_ARM_WRIST_SPIN'),
    ('p-mohd-s', 'Mohammed Siraj', 'M Siraj', 'India', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST'),

    -- Australia Athletes
    ('p-travis-h', 'Travis Head', 'TM Head', 'Australia', 'BATTER', 'LEFT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-david-w', 'David Warner', 'DA Warner', 'Australia', 'BATTER', 'LEFT_HAND_BAT', 'RIGHT_ARM_LEG_BREAK'),
    ('p-tim-d', 'Tim David', 'TH David', 'Australia', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-matthew-w', 'Matthew Wade', 'MS Wade', 'Australia', 'WICKET_KEEPER', 'LEFT_HAND_BAT', NULL),
    ('p-mitch-m', 'Mitchell Marsh', 'MR Marsh', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST_MEDIUM'),
    ('p-glenn-m', 'Glenn Maxwell', 'GJ Maxwell', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-marcus-s', 'Marcus Stoinis', 'MP Stoinis', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_MEDIUM'),
    ('p-pat-c', 'Pat Cummins', 'PJ Cummins', 'Australia', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST'),
    ('p-mitchell-s', 'Mitchell Starc', 'MA Starc', 'Australia', 'BOWLER', 'LEFT_HAND_BAT', 'LEFT_ARM_FAST'),
    ('p-adam-z', 'Adam Zampa', 'A Zampa', 'Australia', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_LEG_BREAK'),
    ('p-josh-h', 'Josh Hazlewood', 'JR Hazlewood', 'Australia', 'BOWLER', 'LEFT_HAND_BAT', 'RIGHT_ARM_FAST_MEDIUM')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    primary_role = EXCLUDED.primary_role,
    country = EXCLUDED.country;

-- ==============================================================================
-- 3. SEED PLAYER CAREER STATISTICS
-- ==============================================================================
INSERT INTO public.player_career_statistics 
    (player_id, matches_played, innings_batted, runs_scored, highest_score, batting_average, batting_strike_rate, centuries, half_centuries, overs_bowled, wickets_taken, bowling_average, bowling_economy_rate)
VALUES
    ('p-virat-k', 117, 109, 4008, 122, 52.73, 137.96, 1, 37, 25.4, 4, 51.00, 8.05),
    ('p-rohit-s', 151, 143, 3853, 121, 31.32, 139.97, 5, 29, 68.0, 29, 29.50, 7.82),
    ('p-hardik-p', 92, 71, 1348, 71, 25.43, 139.83, 0, 3, 218.2, 73, 26.71, 8.16),
    ('p-jasprit-b', 62, 7, 8, 7, 4.00, 61.53, 0, 0, 226.4, 74, 19.66, 6.55),
    ('p-travis-h', 26, 25, 656, 91, 29.81, 146.42, 0, 3, 12.0, 1, 95.00, 7.91),
    ('p-pat-c', 50, 20, 142, 28, 12.90, 124.56, 0, 0, 185.0, 55, 24.54, 7.34),
    ('p-glenn-m', 106, 98, 2468, 120, 29.73, 155.51, 5, 11, 154.2, 43, 27.58, 7.53)
ON CONFLICT (player_id) DO UPDATE SET
    matches_played = EXCLUDED.matches_played,
    runs_scored = EXCLUDED.runs_scored,
    wickets_taken = EXCLUDED.wickets_taken;

-- ==============================================================================
-- 4. SEED MATCH FIXTURES
-- ==============================================================================
INSERT INTO public.matches 
    (id, title, team1_id, team2_id, format, status, venue, match_date, toss_winner_team_id, toss_decision, winning_team_id, result_type, win_margin, win_margin_type, result_summary)
VALUES
    ('m-ind-aus-t20', 'India vs Australia — 3rd T20I', 'team-ind', 'team-aus', 'T20', 'LIVE', 'Melbourne Cricket Ground, Melbourne', '2026-11-03T13:30:00Z', 'team-aus', 'BOWL', NULL, NULL, NULL, NULL, NULL),
    ('m-eng-sa-odi', 'England vs South Africa — 1st ODI', 'team-eng', 'team-sa', 'ODI', 'COMPLETED', 'Lord''s, London', '2026-11-02T10:00:00Z', 'team-eng', 'BAT', 'team-eng', 'NORMAL', 24, 'RUNS', 'England won by 24 runs'),
    ('m-nz-pak-t20', 'New Zealand vs Pakistan — 2nd T20I', 'team-nz', 'team-pak', 'T20', 'UPCOMING', 'Eden Park, Auckland', '2026-11-04T06:00:00Z', NULL, NULL, NULL, NULL, NULL, NULL, 'Starts tomorrow at 06:00 UTC')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    result_summary = EXCLUDED.result_summary;

-- ==============================================================================
-- 5. SEED MATCH ROSTERS (PLAYING XI)
-- ==============================================================================
INSERT INTO public.match_rosters (match_id, team_id, player_id, is_playing_xi, is_captain, is_wicket_keeper)
VALUES
    -- India Lineup for m-ind-aus-t20
    ('m-ind-aus-t20', 'team-ind', 'p-rohit-s', true, true, false),
    ('m-ind-aus-t20', 'team-ind', 'p-shubman-g', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-virat-k', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-surya-y', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-rishabh-p', true, false, true),
    ('m-ind-aus-t20', 'team-ind', 'p-hardik-p', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-ravindra-j', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-jasprit-b', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-arshdeep-s', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-kuldeep-y', true, false, false),
    ('m-ind-aus-t20', 'team-ind', 'p-mohd-s', true, false, false),

    -- Australia Lineup for m-ind-aus-t20
    ('m-ind-aus-t20', 'team-aus', 'p-travis-h', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-david-w', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-mitch-m', true, true, false),
    ('m-ind-aus-t20', 'team-aus', 'p-glenn-m', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-marcus-s', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-tim-d', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-matthew-w', true, false, true),
    ('m-ind-aus-t20', 'team-aus', 'p-pat-c', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-mitchell-s', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-adam-z', true, false, false),
    ('m-ind-aus-t20', 'team-aus', 'p-josh-h', true, false, false)
ON CONFLICT (match_id, player_id) DO NOTHING;

-- ==============================================================================
-- 6. SEED MATCH INNINGS
-- ==============================================================================
INSERT INTO public.match_innings (match_id, innings_number, batting_team_id, bowling_team_id, total_runs, total_wickets, overs_completed, extras, is_completed)
VALUES
    ('m-ind-aus-t20', 1, 'team-aus', 'team-ind', 178, 8, 20.0, 12, true),
    ('m-ind-aus-t20', 2, 'team-ind', 'team-aus', 184, 4, 19.2, 8, true)
ON CONFLICT (match_id, innings_number) DO UPDATE SET
    total_runs = EXCLUDED.total_runs,
    total_wickets = EXCLUDED.total_wickets,
    overs_completed = EXCLUDED.overs_completed;

-- ==============================================================================
-- 7. SEED PLAYER MATCH STATISTICS (SCORECARDS)
-- ==============================================================================
INSERT INTO public.player_match_statistics 
    (match_id, player_id, team_id, innings_number, runs_scored, balls_faced, fours, sixes, strike_rate, is_out, dismissal_type, overs_bowled, maidens, runs_conceded, wickets_taken, economy_rate, catches, stumpings, run_outs)
VALUES
    -- India Players
    ('m-ind-aus-t20', 'p-virat-k', 'team-ind', 2, 74, 48, 6, 2, 154.17, false, 'NOT_OUT', 0.0, 0, 0, 0, NULL, 1, 0, 0),
    ('m-ind-aus-t20', 'p-rohit-s', 'team-ind', 2, 38, 24, 4, 2, 158.33, true, 'CAUGHT', 0.0, 0, 0, 0, NULL, 0, 0, 0),
    ('m-ind-aus-t20', 'p-hardik-p', 'team-ind', 2, 38, 19, 3, 3, 200.00, false, 'NOT_OUT', 3.0, 0, 24, 1, 8.00, 1, 0, 0),
    ('m-ind-aus-t20', 'p-jasprit-b', 'team-ind', 1, 0, 0, 0, 0, NULL, false, 'NOT_OUT', 4.0, 1, 24, 3, 6.00, 0, 0, 0),
    ('m-ind-aus-t20', 'p-kuldeep-y', 'team-ind', 1, 0, 0, 0, 0, NULL, false, 'NOT_OUT', 4.0, 0, 32, 2, 8.00, 0, 0, 0),
    ('m-ind-aus-t20', 'p-rishabh-p', 'team-ind', 2, 18, 12, 2, 0, 150.00, true, 'BOWLED', 0.0, 0, 0, 0, NULL, 1, 1, 0),

    -- Australia Players
    ('m-ind-aus-t20', 'p-travis-h', 'team-aus', 1, 65, 38, 7, 3, 171.05, true, 'CAUGHT', 0.0, 0, 0, 0, NULL, 1, 0, 0),
    ('m-ind-aus-t20', 'p-glenn-m', 'team-aus', 1, 54, 28, 5, 3, 192.86, true, 'CAUGHT', 3.0, 0, 28, 1, 9.33, 1, 0, 0),
    ('m-ind-aus-t20', 'p-pat-c', 'team-aus', 1, 12, 8, 1, 0, 150.00, true, 'RUN_OUT', 4.0, 0, 38, 1, 9.50, 0, 0, 0),
    ('m-ind-aus-t20', 'p-adam-z', 'team-aus', 1, 4, 3, 0, 0, 133.33, false, 'NOT_OUT', 4.0, 0, 30, 2, 7.50, 0, 0, 0)
ON CONFLICT (match_id, player_id, innings_number) DO UPDATE SET
    runs_scored = EXCLUDED.runs_scored,
    balls_faced = EXCLUDED.balls_faced,
    wickets_taken = EXCLUDED.wickets_taken;

-- ==============================================================================
-- 8. SEED BALL EVENTS (KEY MOMENTS TIMELINE)
-- ==============================================================================
DO $$
DECLARE
    v_inn1_id UUID;
    v_inn2_id UUID;
BEGIN
    SELECT id INTO v_inn1_id FROM public.match_innings WHERE match_id = 'm-ind-aus-t20' AND innings_number = 1;
    SELECT id INTO v_inn2_id FROM public.match_innings WHERE match_id = 'm-ind-aus-t20' AND innings_number = 2;

    IF v_inn1_id IS NOT NULL THEN
        INSERT INTO public.ball_events (innings_id, over_number, ball_number, legal_ball_number, bowler_player_id, batter_player_id, non_striker_player_id, runs_batter, is_boundary_four, is_wicket, commentary_text)
        VALUES
            (v_inn1_id, 1, 1, 1, 'p-jasprit-b', 'p-travis-h', 'p-david-w', 0, false, false, 'Jasprit Bumrah opens with a testing 142kph delivery on off stump.'),
            (v_inn1_id, 4, 3, 3, 'p-jasprit-b', 'p-david-w', 'p-travis-h', 0, false, true, 'OUT! Bumrah cleans up David Warner with an unplayable in-swinging yorker!')
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_inn2_id IS NOT NULL THEN
        INSERT INTO public.ball_events (innings_id, over_number, ball_number, legal_ball_number, bowler_player_id, batter_player_id, non_striker_player_id, runs_batter, is_boundary_four, is_boundary_six, commentary_text)
        VALUES
            (v_inn2_id, 18, 1, 1, 'p-pat-c', 'p-hardik-p', 'p-virat-k', 4, true, false, 'FOUR! Hardik Pandya smashes Pat Cummins through extra cover.'),
            (v_inn2_id, 18, 2, 2, 'p-pat-c', 'p-hardik-p', 'p-virat-k', 6, false, true, 'SIX! What a strike! Hardik lofts it clean into the Melbourne stands!')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
