-- ==============================================================================
-- FanPulse AI — Database Migration: Fantasy Teams and RLS Policies
-- Migration: 20261103080000_fantasy_teams_schema.sql
-- Description: Creates fantasy_teams and fantasy_team_players tables with RLS
-- ==============================================================================

-- 1. Create fantasy_teams table
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    captain_player_id VARCHAR(100) NOT NULL,
    vice_captain_player_id VARCHAR(100) NOT NULL,
    total_points NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_diff_captain_vc CHECK (captain_player_id <> vice_captain_player_id),
    CONSTRAINT chk_team_name_length CHECK (char_length(trim(team_name)) >= 3 AND char_length(team_name) <= 100)
);

-- 2. Create fantasy_team_players junction table
CREATE TABLE IF NOT EXISTS public.fantasy_team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fantasy_team_id UUID NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
    player_id VARCHAR(100) NOT NULL,
    match_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    player_role VARCHAR(30) NOT NULL,
    team_code VARCHAR(10) NOT NULL,
    is_captain BOOLEAN NOT NULL DEFAULT FALSE,
    is_vice_captain BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_fantasy_team_player UNIQUE (fantasy_team_id, player_id),
    CONSTRAINT chk_fantasy_player_role CHECK (player_role IN ('BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_match ON public.fantasy_teams(match_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_team ON public.fantasy_team_players(fantasy_team_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Users can view and manage only their own fantasy teams
CREATE POLICY "Users can view own fantasy teams"
    ON public.fantasy_teams
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fantasy teams"
    ON public.fantasy_teams
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fantasy teams"
    ON public.fantasy_teams
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fantasy teams"
    ON public.fantasy_teams
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5. RLS Policies for fantasy_team_players
CREATE POLICY "Users can view players in own fantasy teams"
    ON public.fantasy_team_players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
              AND ft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert players into own fantasy teams"
    ON public.fantasy_team_players
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
              AND ft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update players in own fantasy teams"
    ON public.fantasy_team_players
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
              AND ft.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete players from own fantasy teams"
    ON public.fantasy_team_players
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
              AND ft.user_id = auth.uid()
        )
    );
