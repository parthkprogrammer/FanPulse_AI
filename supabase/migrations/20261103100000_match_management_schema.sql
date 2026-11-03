-- ==============================================================================
-- FanPulse AI — Database Migration: Match Management Schema & Public RLS
-- Migration: 20261103100000_match_management_schema.sql
-- Description: Creates teams, players, matches, match_rosters, match_innings,
--              player_match_statistics, and ball_events tables.
--              Implements public read access and admin-only write RLS policies.
-- ==============================================================================

-- 1. Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    short_name VARCHAR(30) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);

-- 2. Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    primary_role VARCHAR(30) NOT NULL,
    batting_style VARCHAR(50),
    bowling_style VARCHAR(50),
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_player_primary_role CHECK (primary_role IN ('BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'))
);

CREATE INDEX IF NOT EXISTS idx_players_country ON public.players(country);
CREATE INDEX IF NOT EXISTS idx_players_role ON public.players(primary_role);

-- 3. Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    team1_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    team2_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    format VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    venue VARCHAR(200) NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    toss_winner_team_id VARCHAR(100) REFERENCES public.teams(id),
    toss_decision VARCHAR(10),
    winning_team_id VARCHAR(100) REFERENCES public.teams(id),
    result_type VARCHAR(30),
    result_summary VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_diff_match_teams CHECK (team1_id <> team2_id),
    CONSTRAINT chk_match_format CHECK (format IN ('T20', 'ODI', 'TEST')),
    CONSTRAINT chk_match_status CHECK (status IN ('UPCOMING', 'SCHEDULED', 'LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    CONSTRAINT chk_toss_decision CHECK (toss_decision IN ('BAT', 'BOWL') OR toss_decision IS NULL),
    CONSTRAINT chk_result_type CHECK (result_type IN ('NORMAL', 'TIE', 'NO_RESULT', 'SUPER_OVER') OR result_type IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_format ON public.matches(format);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_team1 ON public.matches(team1_id);
CREATE INDEX IF NOT EXISTS idx_matches_team2 ON public.matches(team2_id);

-- 4. Create match_rosters table (Connecting matches, teams, and players)
CREATE TABLE IF NOT EXISTS public.match_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    player_id VARCHAR(100) NOT NULL REFERENCES public.players(id),
    is_playing_xi BOOLEAN NOT NULL DEFAULT TRUE,
    is_captain BOOLEAN NOT NULL DEFAULT FALSE,
    is_wicket_keeper BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_match_roster UNIQUE (match_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_rosters_match ON public.match_rosters(match_id);

-- 5. Create match_innings table
CREATE TABLE IF NOT EXISTS public.match_innings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    innings_number SMALLINT NOT NULL CHECK (innings_number BETWEEN 1 AND 4),
    batting_team_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    bowling_team_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    total_runs INTEGER NOT NULL DEFAULT 0 CHECK (total_runs >= 0),
    total_wickets SMALLINT NOT NULL DEFAULT 0 CHECK (total_wickets BETWEEN 0 AND 10),
    overs_completed NUMERIC(4, 1) NOT NULL DEFAULT 0.0 CHECK (overs_completed >= 0.0),
    extras INTEGER NOT NULL DEFAULT 0 CHECK (extras >= 0),
    is_declared BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_match_innings UNIQUE (match_id, innings_number)
);

CREATE INDEX IF NOT EXISTS idx_innings_match ON public.match_innings(match_id);

-- 6. Create player_match_statistics table (Scorecard entries)
CREATE TABLE IF NOT EXISTS public.player_match_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id VARCHAR(100) NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    team_id VARCHAR(100) NOT NULL REFERENCES public.teams(id),
    innings_number SMALLINT NOT NULL DEFAULT 1,
    runs_scored INTEGER NOT NULL DEFAULT 0 CHECK (runs_scored >= 0),
    balls_faced INTEGER NOT NULL DEFAULT 0 CHECK (balls_faced >= 0),
    fours INTEGER NOT NULL DEFAULT 0 CHECK (fours >= 0),
    sixes INTEGER NOT NULL DEFAULT 0 CHECK (sixes >= 0),
    strike_rate NUMERIC(6, 2),
    is_out BOOLEAN NOT NULL DEFAULT FALSE,
    dismissal_type VARCHAR(30),
    overs_bowled NUMERIC(4, 1) NOT NULL DEFAULT 0.0 CHECK (overs_bowled >= 0.0),
    maidens SMALLINT NOT NULL DEFAULT 0 CHECK (maidens >= 0),
    runs_conceded INTEGER NOT NULL DEFAULT 0 CHECK (runs_conceded >= 0),
    wickets_taken SMALLINT NOT NULL DEFAULT 0 CHECK (wickets_taken >= 0),
    economy_rate NUMERIC(5, 2),
    catches SMALLINT NOT NULL DEFAULT 0 CHECK (catches >= 0),
    stumpings SMALLINT NOT NULL DEFAULT 0 CHECK (stumpings >= 0),
    run_outs SMALLINT NOT NULL DEFAULT 0 CHECK (run_outs >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_player_match_stats UNIQUE (match_id, player_id, innings_number),
    CONSTRAINT chk_dismissal_type CHECK (
        dismissal_type IN ('BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'NOT_OUT', 'RETIRED_HURT') OR dismissal_type IS NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_stats_match ON public.player_match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_stats_player ON public.player_match_statistics(player_id);

-- 7. Create ball_events table
CREATE TABLE IF NOT EXISTS public.ball_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    innings_number SMALLINT NOT NULL DEFAULT 1,
    over_number SMALLINT NOT NULL,
    ball_number SMALLINT NOT NULL,
    legal_ball_number SMALLINT NOT NULL,
    bowler_name VARCHAR(100) NOT NULL,
    batter_name VARCHAR(100) NOT NULL,
    runs_batter SMALLINT NOT NULL DEFAULT 0,
    runs_extras SMALLINT NOT NULL DEFAULT 0,
    extra_type VARCHAR(20),
    is_wicket BOOLEAN NOT NULL DEFAULT FALSE,
    dismissal_type VARCHAR(30),
    commentary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_balls_match_innings ON public.ball_events(match_id, innings_number);
CREATE INDEX IF NOT EXISTS idx_balls_seq ON public.ball_events(match_id, innings_number, over_number, ball_number);

-- 8. Enable Row Level Security (RLS) across all match entities
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ball_events ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies: Public Read Access (PD-06: Anonymous and authenticated users can view match data)
CREATE POLICY "Public read access for teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public read access for players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public read access for matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read access for match_rosters" ON public.match_rosters FOR SELECT USING (true);
CREATE POLICY "Public read access for match_innings" ON public.match_innings FOR SELECT USING (true);
CREATE POLICY "Public read access for player_match_statistics" ON public.player_match_statistics FOR SELECT USING (true);
CREATE POLICY "Public read access for ball_events" ON public.ball_events FOR SELECT USING (true);

-- 10. RLS Policies: Write Permissions (NFR-SEC-04: ADMIN role required for Match and Player CRUD)
CREATE POLICY "Admin write access for teams" ON public.teams
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for players" ON public.players
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for matches" ON public.matches
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for match_rosters" ON public.match_rosters
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for match_innings" ON public.match_innings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for player_match_statistics" ON public.player_match_statistics
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin write access for ball_events" ON public.ball_events
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 11. Initial Seed Data (Verified Baseline Reference Data)
INSERT INTO public.teams (id, name, short_name, code, country)
VALUES
    ('team-ind', 'India', 'IND', 'IND', 'India'),
    ('team-aus', 'Australia', 'AUS', 'AUS', 'Australia'),
    ('team-eng', 'England', 'ENG', 'ENG', 'England'),
    ('team-sa', 'South Africa', 'SA', 'SA', 'South Africa'),
    ('team-nz', 'New Zealand', 'NZ', 'NZ', 'New Zealand'),
    ('team-pak', 'Pakistan', 'PAK', 'PAK', 'Pakistan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.matches (id, title, team1_id, team2_id, format, status, venue, match_date, result_summary)
VALUES
    ('m-ind-aus-t20', 'India vs Australia — 3rd T20I', 'team-ind', 'team-aus', 'T20', 'LIVE', 'Melbourne Cricket Ground, Melbourne', '2026-11-03T13:30:00Z', NULL),
    ('m-eng-sa-odi', 'England vs South Africa — 1st ODI', 'team-eng', 'team-sa', 'ODI', 'COMPLETED', 'Lord''s, London', '2026-11-02T10:00:00Z', 'England won by 24 runs'),
    ('m-nz-pak-t20', 'New Zealand vs Pakistan — 2nd T20I', 'team-nz', 'team-pak', 'T20', 'UPCOMING', 'Eden Park, Auckland', '2026-11-04T06:00:00Z', 'Starts tomorrow at 06:00 UTC')
ON CONFLICT (id) DO NOTHING;

