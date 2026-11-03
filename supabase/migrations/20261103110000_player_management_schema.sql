-- ==============================================================================
-- FanPulse AI — Database Migration: Player Management & Career Statistics
-- Migration: 20261103110000_player_management_schema.sql
-- Description: Creates player_career_statistics table, indexes, RLS policies,
--              and seeds controlled sample player master data.
-- ==============================================================================

-- 1. Create player_career_statistics table
CREATE TABLE IF NOT EXISTS public.player_career_statistics (
    player_id VARCHAR(100) PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
    matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
    innings_batted INTEGER NOT NULL DEFAULT 0 CHECK (innings_batted >= 0),
    runs_scored INTEGER NOT NULL DEFAULT 0 CHECK (runs_scored >= 0),
    highest_score INTEGER NOT NULL DEFAULT 0 CHECK (highest_score >= 0),
    batting_average NUMERIC(6, 2) CHECK (batting_average >= 0.0 OR batting_average IS NULL),
    batting_strike_rate NUMERIC(6, 2) CHECK (batting_strike_rate >= 0.0 OR batting_strike_rate IS NULL),
    centuries SMALLINT NOT NULL DEFAULT 0 CHECK (centuries >= 0),
    half_centuries SMALLINT NOT NULL DEFAULT 0 CHECK (half_centuries >= 0),
    overs_bowled NUMERIC(6, 1) NOT NULL DEFAULT 0.0 CHECK (overs_bowled >= 0.0),
    wickets_taken INTEGER NOT NULL DEFAULT 0 CHECK (wickets_taken >= 0),
    bowling_average NUMERIC(6, 2) CHECK (bowling_average >= 0.0 OR bowling_average IS NULL),
    bowling_economy_rate NUMERIC(5, 2) CHECK (bowling_economy_rate >= 0.0 OR bowling_economy_rate IS NULL),
    best_bowling_figures VARCHAR(20),
    catches_taken INTEGER NOT NULL DEFAULT 0 CHECK (catches_taken >= 0),
    stumpings_taken INTEGER NOT NULL DEFAULT 0 CHECK (stumpings_taken >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.player_career_statistics ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public Read Access: Everyone can view career player statistics (PD-06)
CREATE POLICY "Public read access for player_career_statistics"
    ON public.player_career_statistics
    FOR SELECT
    USING (true);

-- Admin Write Access: Only ADMIN can modify career player statistics (NFR-SEC-04)
CREATE POLICY "Admin write access for player_career_statistics"
    ON public.player_career_statistics
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Seed Controlled Sample Player Master Records
INSERT INTO public.players (id, name, short_name, country, primary_role, batting_style, bowling_style)
VALUES
    -- India Squad
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
    -- Australia Squad
    ('p-travis-h', 'Travis Head', 'TM Head', 'Australia', 'BATTER', 'LEFT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-david-w', 'David Warner', 'DA Warner', 'Australia', 'BATTER', 'LEFT_HAND_BAT', 'RIGHT_ARM_LEG_BREAK'),
    ('p-tim-d', 'Tim David', 'TH David', 'Australia', 'BATTER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-matthew-w', 'Matthew Wade', 'MS Wade', 'Australia', 'WICKET_KEEPER', 'LEFT_HAND_BAT', NULL),
    ('p-mitch-m', 'Mitchell Marsh', 'MR Marsh', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST_MEDIUM'),
    ('p-glenn-m', 'Glenn Maxwell', 'GJ Maxwell', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_OFFBREAK'),
    ('p-marcus-s', 'Marcus Stoinis', 'MP Stoinis', 'Australia', 'ALL_ROUNDER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_MEDIUM'),
    ('p-pat-c', 'Pat Cummins', 'PJ Cummins', 'Australia', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_FAST'),
    ('p-mitch-s', 'Mitchell Starc', 'MA Starc', 'Australia', 'BOWLER', 'LEFT_HAND_BAT', 'LEFT_ARM_FAST'),
    ('p-josh-h', 'Josh Hazlewood', 'JR Hazlewood', 'Australia', 'BOWLER', 'LEFT_HAND_BAT', 'RIGHT_ARM_FAST_MEDIUM'),
    ('p-adam-z', 'Adam Zampa', 'A Zampa', 'Australia', 'BOWLER', 'RIGHT_HAND_BAT', 'RIGHT_ARM_LEG_BREAK')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    primary_role = EXCLUDED.primary_role;

-- 5. Seed Controlled Sample Career Statistics (API_DESIGN.md §4.2)
INSERT INTO public.player_career_statistics (
    player_id, matches_played, innings_batted, runs_scored, highest_score,
    batting_average, batting_strike_rate, centuries, half_centuries,
    overs_bowled, wickets_taken, bowling_average, bowling_economy_rate, best_bowling_figures,
    catches_taken, stumpings_taken
)
VALUES
    ('p-virat-k', 117, 109, 4188, 122, 48.69, 137.04, 1, 38, 25.4, 4, 51.00, 7.94, '1/13', 52, 0),
    ('p-rohit-s', 159, 151, 4231, 121, 32.05, 140.89, 5, 32, 11.2, 1, 68.00, 8.12, '1/22', 65, 0),
    ('p-jasprit-b', 70, 7, 18, 7, 6.00, 64.28, 0, 0, 250.0, 89, 17.74, 6.27, '3/11', 14, 0),
    ('p-hardik-p', 100, 78, 1492, 71, 26.64, 139.83, 0, 4, 218.4, 84, 25.42, 8.18, '4/16', 48, 0),
    ('p-travis-h', 38, 37, 1094, 91, 34.18, 159.24, 0, 5, 8.0, 1, 62.00, 8.50, '1/12', 15, 0),
    ('p-pat-c', 57, 30, 192, 28, 12.00, 128.00, 0, 0, 204.0, 66, 23.40, 7.42, '3/15', 22, 0),
    ('p-glenn-m', 106, 98, 2468, 145, 29.73, 153.29, 5, 11, 152.0, 43, 27.50, 7.82, '3/10', 44, 0)
ON CONFLICT (player_id) DO NOTHING;

