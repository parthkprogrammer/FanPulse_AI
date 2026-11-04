-- ==============================================================================
-- FanPulse AI — Database Migration: Fantasy Scoring Engine Schema & Rules
-- Migration: 20261103130000_fantasy_scoring_schema.sql
-- Description: Creates scoring_rules, fantasy_player_points, scoring_audit_logs
--              tables, RLS policies, and atomic score recalculation procedures.
-- References: DATABASE_DESIGN.md (§3.11, §3.14, §7.2), REQUIREMENTS.md (§4.2 BR-SCORE-*)
-- ==============================================================================

-- 1. Create scoring_rules table (Configuration-Driven Ruleset)
CREATE TABLE IF NOT EXISTS public.scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    format VARCHAR(20) NOT NULL DEFAULT 'ALL',
    rule_category VARCHAR(30) NOT NULL,
    event_key VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    points_value NUMERIC(6, 2) NOT NULL,
    condition_threshold NUMERIC(6, 2) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_rules_format_event_ver UNIQUE (format, event_key, version),
    CONSTRAINT chk_rules_format CHECK (format IN ('ALL', 'T20', 'ODI', 'TEST')),
    CONSTRAINT chk_rules_category CHECK (rule_category IN ('BATTING', 'BOWLING', 'FIELDING', 'BONUS', 'PENALTY', 'MULTIPLIER'))
);

CREATE INDEX IF NOT EXISTS idx_rules_format_active ON public.scoring_rules(format, is_active);
CREATE INDEX IF NOT EXISTS idx_rules_version ON public.scoring_rules(version);

-- 2. Seed approved scoring rules (Version v1.0 matching REQUIREMENTS.md §4.2)
INSERT INTO public.scoring_rules 
    (format, rule_category, event_key, event_name, points_value, condition_threshold, description, version, is_active)
VALUES
    -- Batting points (BR-SCORE-BAT-01 through 06)
    ('ALL', 'BATTING', 'RUN_SCORED', 'Run Scored', 1.0, NULL, 'Each run scored with the bat awards +1 point.', 'v1.0', TRUE),
    ('ALL', 'BATTING', 'BOUNDARY_FOUR', 'Boundary Four', 1.0, NULL, 'Each boundary four awards +1 bonus point.', 'v1.0', TRUE),
    ('ALL', 'BATTING', 'BOUNDARY_SIX', 'Boundary Six', 2.0, NULL, 'Each boundary six awards +2 bonus points.', 'v1.0', TRUE),
    ('ALL', 'BONUS', 'HALF_CENTURY_BONUS', 'Half-Century Bonus', 10.0, 50.0, 'Scoring 50 to 99 runs awards +10 bonus points.', 'v1.0', TRUE),
    ('ALL', 'BONUS', 'CENTURY_BONUS', 'Century Bonus', 25.0, 100.0, 'Scoring 100 or more runs awards +25 bonus points.', 'v1.0', TRUE),
    ('ALL', 'PENALTY', 'DUCK_PENALTY', 'Duck Dismissal Penalty', -5.0, 0.0, 'Dismissal for 0 runs incurs a -5 penalty (excludes bowlers in ODI/Test).', 'v1.0', TRUE),

    -- Bowling points (BR-SCORE-BOWL-01 through 06)
    ('ALL', 'BOWLING', 'WICKET_TAKEN', 'Wicket Taken', 25.0, NULL, 'Each wicket taken by bowler (excluding run-outs) awards +25 points.', 'v1.0', TRUE),
    ('ALL', 'BOWLING', 'MAIDEN_OVER', 'Maiden Over', 10.0, NULL, 'Each maiden over bowled awards +10 points.', 'v1.0', TRUE),
    ('ALL', 'BONUS', 'THREE_WICKET_HAUL', '3-Wicket Haul Bonus', 10.0, 3.0, 'Taking 3 to 4 wickets awards +10 bonus points.', 'v1.0', TRUE),
    ('ALL', 'BONUS', 'FIVE_WICKET_HAUL', '5-Wicket Haul Bonus', 25.0, 5.0, 'Taking 5 or more wickets awards +25 bonus points.', 'v1.0', TRUE),
    ('ALL', 'BONUS', 'ECONOMY_RATE_BONUS', 'Economy Rate Bonus', 10.0, 4.0, 'Economy rate <= 4.00 (minimum 2 overs bowled) awards +10 bonus points.', 'v1.0', TRUE),
    ('ALL', 'PENALTY', 'ECONOMY_RATE_PENALTY', 'Economy Rate Penalty', -10.0, 10.0, 'Economy rate >= 10.00 (minimum 2 overs bowled) incurs a -10 penalty.', 'v1.0', TRUE),

    -- Fielding points (BR-SCORE-FIELD-01 through 04)
    ('ALL', 'FIELDING', 'CATCH_TAKEN', 'Catch Taken', 10.0, NULL, 'Each catch taken by fielder or wicketkeeper awards +10 points.', 'v1.0', TRUE),
    ('ALL', 'FIELDING', 'RUN_OUT_DIRECT', 'Direct Hit Run-Out', 15.0, NULL, 'Direct hit run-out dismissal awards +15 points.', 'v1.0', TRUE),
    ('ALL', 'FIELDING', 'RUN_OUT_INDIRECT', 'Indirect Run-Out', 10.0, NULL, 'Assisted / indirect run-out dismissal awards +10 points.', 'v1.0', TRUE),
    ('ALL', 'FIELDING', 'STUMPING', 'Stumping Dismissal', 15.0, NULL, 'Stumping dismissal by wicketkeeper awards +15 points.', 'v1.0', TRUE),

    -- Role multipliers (BR-SCORE-MULT-01 and 02)
    ('ALL', 'MULTIPLIER', 'CAPTAIN_MULTIPLIER', 'Captain Multiplier', 2.0, NULL, 'Captain earns 2.0x base fantasy points.', 'v1.0', TRUE),
    ('ALL', 'MULTIPLIER', 'VICE_CAPTAIN_MULTIPLIER', 'Vice-Captain Multiplier', 1.5, NULL, 'Vice-Captain earns 1.5x base fantasy points.', 'v1.0', TRUE)
ON CONFLICT (format, event_key, version) DO UPDATE SET
    points_value = EXCLUDED.points_value,
    condition_threshold = EXCLUDED.condition_threshold,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Create fantasy_player_points table (Authoritative per-player points)
CREATE TABLE IF NOT EXISTS public.fantasy_player_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fantasy_team_id UUID NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
    player_id VARCHAR(100) NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    base_points NUMERIC(7, 2) NOT NULL DEFAULT 0.00,
    multiplier NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
    final_points NUMERIC(7, 2) NOT NULL DEFAULT 0.00,
    breakdown_json JSONB NOT NULL DEFAULT '[]',
    ruleset_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_fpp_team_player UNIQUE (fantasy_team_id, player_id),
    CONSTRAINT chk_points_multiplier CHECK (multiplier IN (1.0, 1.5, 2.0))
);

CREATE INDEX IF NOT EXISTS idx_fpp_team ON public.fantasy_player_points(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fpp_player_match ON public.fantasy_player_points(player_id, match_id);
CREATE INDEX IF NOT EXISTS idx_fpp_match ON public.fantasy_player_points(match_id);

-- 4. Create scoring_audit_logs table (Tracks calculation executions)
CREATE TABLE IF NOT EXISTS public.scoring_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES auth.users(id),
    teams_evaluated INTEGER NOT NULL DEFAULT 0,
    players_scored INTEGER NOT NULL DEFAULT 0,
    ruleset_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    execution_duration_ms INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scoring_audit_match ON public.scoring_audit_logs(match_id);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_player_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_audit_logs ENABLE ROW LEVEL SECURITY;

-- Scoring Rules RLS: Public read, Admin-only write
CREATE POLICY "Public read access for scoring_rules"
    ON public.scoring_rules
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admin write access for scoring_rules"
    ON public.scoring_rules
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Fantasy Player Points RLS:
-- Users can view points for their own fantasy teams or match scoreboards
CREATE POLICY "Users can view player points for their teams"
    ON public.fantasy_player_points
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_player_points.fantasy_team_id
              AND (ft.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Authoritative write access to fantasy_player_points is restricted to service_role and ADMIN
CREATE POLICY "Admin write access for fantasy_player_points"
    ON public.fantasy_player_points
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Scoring Audit Logs RLS: Admin read
CREATE POLICY "Admin read access for scoring_audit_logs"
    ON public.scoring_audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 6. Atomic Stored Procedure: Persist Fantasy Points For Team
CREATE OR REPLACE FUNCTION public.save_team_fantasy_points_atomic(
    p_fantasy_team_id UUID,
    p_match_id VARCHAR(100),
    p_total_points NUMERIC(8, 2),
    p_player_points JSONB,
    p_ruleset_version VARCHAR(20) DEFAULT 'v1.0'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_player JSONB;
    v_team_owner UUID;
BEGIN
    -- Verify team existence and fetch owner
    SELECT user_id INTO v_team_owner
    FROM public.fantasy_teams
    WHERE id = p_fantasy_team_id;

    IF v_team_owner IS NULL THEN
        RAISE EXCEPTION 'Fantasy team % not found', p_fantasy_team_id;
    END IF;

    -- Upsert individual player points
    FOR v_player IN SELECT * FROM jsonb_array_elements(p_player_points)
    LOOP
        INSERT INTO public.fantasy_player_points (
            fantasy_team_id,
            player_id,
            match_id,
            base_points,
            multiplier,
            final_points,
            breakdown_json,
            ruleset_version,
            calculated_at
        ) VALUES (
            p_fantasy_team_id,
            v_player->>'playerId',
            p_match_id,
            (v_player->>'basePoints')::NUMERIC(7, 2),
            (v_player->>'multiplier')::NUMERIC(3, 1),
            (v_player->>'finalPoints')::NUMERIC(7, 2),
            COALESCE(v_player->'breakdown', '[]'::JSONB),
            p_ruleset_version,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (fantasy_team_id, player_id) DO UPDATE SET
            base_points = EXCLUDED.base_points,
            multiplier = EXCLUDED.multiplier,
            final_points = EXCLUDED.final_points,
            breakdown_json = EXCLUDED.breakdown_json,
            ruleset_version = EXCLUDED.ruleset_version,
            calculated_at = CURRENT_TIMESTAMP;
    END LOOP;

    -- Update total points in fantasy_teams header
    UPDATE public.fantasy_teams
    SET total_points = p_total_points,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_fantasy_team_id;

    RETURN jsonb_build_object(
        'success', true,
        'fantasyTeamId', p_fantasy_team_id,
        'totalPoints', p_total_points
    );
END;
$$;
