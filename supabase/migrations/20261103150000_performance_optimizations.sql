-- ==============================================================================
-- FanPulse AI — Database Migration: Performance Optimizations & Indexing Strategy
-- Migration: 20261103150000_performance_optimizations.sql
-- Description: Adds justified composite indexes, unindexed foreign key coverage,
--              GIN trigram text search index, set-based atomic procedures, and
--              RLS InitPlan query optimizations.
-- References: DATABASE_OPTIMIZATION.md, DATABASE_DESIGN.md, API_DESIGN.md
-- ==============================================================================

-- ==============================================================================
-- 1. FOREIGN KEY & COMPOSITE PERFORMANCE INDEXES
-- Every index is strictly justified by an active query pattern in the application.
-- ==============================================================================

-- 1.1 Match Fixtures Filtering & Sorting
-- Query: matchService.getMatches() -> WHERE status = $1 ORDER BY match_date DESC
-- Eliminates in-memory Sort node by serving sorted rows directly from the index.
CREATE INDEX IF NOT EXISTS idx_matches_status_date
    ON public.matches (status, match_date DESC);

-- Unindexed Foreign Keys on matches: prevents sequential scans during team updates/deletes
CREATE INDEX IF NOT EXISTS idx_matches_toss_winner
    ON public.matches (toss_winner_team_id);

CREATE INDEX IF NOT EXISTS idx_matches_winning_team
    ON public.matches (winning_team_id);

-- 1.2 Player Catalog Fuzzy & Substring Search
-- Query: playerService.getPlayers() -> WHERE name ILIKE '%term%'
-- Standard B-Tree cannot index leading wildcards. GIN Trigram index decomposes strings into 3-char trigrams.
CREATE INDEX IF NOT EXISTS idx_players_name_trgm
    ON public.players USING gin (name gin_trgm_ops);

-- Query: playerService.getPlayers() -> WHERE primary_role = $1 ORDER BY name ASC
-- Serves role-filtered tabs with zero in-memory sort cost.
CREATE INDEX IF NOT EXISTS idx_players_role_name
    ON public.players (primary_role, name ASC);

-- 1.3 Match Rosters Referential Integrity & Reverse Lookups
-- Foreign keys on match_rosters lacked standalone indexes.
CREATE INDEX IF NOT EXISTS idx_rosters_team
    ON public.match_rosters (team_id);

CREATE INDEX IF NOT EXISTS idx_rosters_player
    ON public.match_rosters (player_id);

-- 1.4 Match Innings Foreign Key Coverage
CREATE INDEX IF NOT EXISTS idx_innings_batting_team
    ON public.match_innings (batting_team_id);

CREATE INDEX IF NOT EXISTS idx_innings_bowling_team
    ON public.match_innings (bowling_team_id);

-- 1.5 Player Match Statistics Query Optimization
-- Query: playerService.getPlayerMatchPerformance(playerId, matchId)
CREATE INDEX IF NOT EXISTS idx_stats_player_match
    ON public.player_match_statistics (player_id, match_id);

CREATE INDEX IF NOT EXISTS idx_stats_team
    ON public.player_match_statistics (team_id);

-- 1.6 Fantasy Teams Dashboard & History Lookups
-- Query: manage-fantasy-teams?action=list -> WHERE user_id = $1 [AND match_id = $2] ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_created
    ON public.fantasy_teams (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_match_created
    ON public.fantasy_teams (user_id, match_id, created_at DESC);

-- 1.7 Scoring Audit Logs Foreign Key Coverage
CREATE INDEX IF NOT EXISTS idx_scoring_audit_triggered_by
    ON public.scoring_audit_logs (triggered_by);

-- 1.8 AI Conversations Listing Optimization
-- Query: ai-assistant -> WHERE user_id = $1 ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_ai_conv_user_updated
    ON public.ai_conversations (user_id, updated_at DESC);


-- ==============================================================================
-- 2. SET-BASED ATOMIC STORED PROCEDURES (ELIMINATING ROW-BY-ROW PL/PGSQL LOOPS)
-- ==============================================================================

-- 2.1 Refactored save_fantasy_team_atomic:
-- Converts iterative row-by-row INSERT loop into a single relational set-based operation.
CREATE OR REPLACE FUNCTION public.save_fantasy_team_atomic(
    p_match_id VARCHAR(100),
    p_team_name VARCHAR(100),
    p_captain_id VARCHAR(100),
    p_vice_captain_id VARCHAR(100),
    p_players JSONB,
    p_team_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_team_id UUID;
    v_player_count INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Authenticate Caller
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
    END IF;

    -- 2. Validate Captain & Vice-Captain Distinction (BR-TEAM-04)
    IF p_captain_id = p_vice_captain_id THEN
        RAISE EXCEPTION 'Captain and Vice-Captain cannot be the same player.' USING ERRCODE = '22023';
    END IF;

    -- 3. Validate Squad Size (BR-TEAM-01)
    v_player_count := jsonb_array_length(p_players);
    IF v_player_count <> 11 THEN
        RAISE EXCEPTION 'Fantasy squad must contain exactly 11 players. Provided: %', v_player_count
            USING ERRCODE = '22023';
    END IF;

    -- 4. Upsert Team Header
    IF p_team_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = p_team_id AND user_id = v_user_id) THEN
            RAISE EXCEPTION 'Access denied: You cannot modify another user fantasy team.' USING ERRCODE = '42501';
        END IF;

        UPDATE public.fantasy_teams
        SET
            team_name = trim(p_team_name),
            captain_player_id = p_captain_id,
            vice_captain_player_id = p_vice_captain_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_team_id AND user_id = v_user_id
        RETURNING id INTO v_team_id;

        -- Remove existing players for atomic replacement
        DELETE FROM public.fantasy_team_players WHERE fantasy_team_id = v_team_id;
    ELSE
        INSERT INTO public.fantasy_teams (
            user_id,
            match_id,
            team_name,
            captain_player_id,
            vice_captain_player_id,
            total_points
        ) VALUES (
            v_user_id,
            p_match_id,
            trim(p_team_name),
            p_captain_id,
            p_vice_captain_id,
            0.00
        )
        RETURNING id INTO v_team_id;
    END IF;

    -- 5. Set-Based Relational Batch Insert (Zero row-by-row iteration)
    INSERT INTO public.fantasy_team_players (
        fantasy_team_id,
        player_id,
        match_id,
        player_name,
        player_role,
        team_code,
        is_captain,
        is_vice_captain
    )
    SELECT
        v_team_id,
        p->>'id',
        p_match_id,
        p->>'name',
        p->>'role',
        p->>'teamCode',
        (p->>'id' = p_captain_id),
        (p->>'id' = p_vice_captain_id)
    FROM jsonb_array_elements(p_players) AS p;

    -- 6. Assemble Return Payload
    SELECT jsonb_build_object(
        'id', v_team_id,
        'userId', v_user_id,
        'matchId', p_match_id,
        'teamName', trim(p_team_name),
        'captainPlayerId', p_captain_id,
        'viceCaptainPlayerId', p_vice_captain_id,
        'playersCount', 11
    ) INTO v_result;

    RETURN v_result;
END;
$$;


-- 2.2 Refactored save_team_fantasy_points_atomic:
-- Converts iterative upsert loop into a single set-based SQL statement.
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
SET search_path = public
AS $$
DECLARE
    v_team_owner UUID;
BEGIN
    SELECT user_id INTO v_team_owner
    FROM public.fantasy_teams
    WHERE id = p_fantasy_team_id;

    IF v_team_owner IS NULL THEN
        RAISE EXCEPTION 'Fantasy team % not found', p_fantasy_team_id;
    END IF;

    -- Set-Based Batch Upsert
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
    )
    SELECT
        p_fantasy_team_id,
        p->>'playerId',
        p_match_id,
        (p->>'basePoints')::NUMERIC(7, 2),
        (p->>'multiplier')::NUMERIC(3, 1),
        (p->>'finalPoints')::NUMERIC(7, 2),
        COALESCE(p->'breakdown', '[]'::JSONB),
        p_ruleset_version,
        CURRENT_TIMESTAMP
    FROM jsonb_array_elements(p_player_points) AS p
    ON CONFLICT (fantasy_team_id, player_id) DO UPDATE SET
        base_points = EXCLUDED.base_points,
        multiplier = EXCLUDED.multiplier,
        final_points = EXCLUDED.final_points,
        breakdown_json = EXCLUDED.breakdown_json,
        ruleset_version = EXCLUDED.ruleset_version,
        calculated_at = CURRENT_TIMESTAMP;

    -- Update total team points header
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


-- ==============================================================================
-- 3. RLS POLICY INITPLAN OPTIMIZATIONS
-- Wrapping auth.uid() in (SELECT auth.uid()) evaluates the function ONCE per
-- statement as an InitPlan, replacing per-row Volatile re-evaluations.
-- ==============================================================================

-- 3.1 Optimize public.is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- Fast stateless check: JWT app_metadata claim (avoids any DB query)
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'ROLE_ADMIN')
    OR
    -- Cached subquery on profiles table
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role IN ('ADMIN', 'ROLE_ADMIN')
    ),
    FALSE
  );
$$;

-- 3.2 Update fantasy_teams RLS policies with (SELECT auth.uid())
DROP POLICY IF EXISTS "Users can view own fantasy teams" ON public.fantasy_teams;
CREATE POLICY "Users can view own fantasy teams"
    ON public.fantasy_teams
    FOR SELECT
    USING (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own fantasy teams" ON public.fantasy_teams;
CREATE POLICY "Users can update own fantasy teams"
    ON public.fantasy_teams
    FOR UPDATE
    USING (user_id = (SELECT auth.uid()) OR public.is_admin())
    WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own fantasy teams" ON public.fantasy_teams;
CREATE POLICY "Users can delete own fantasy teams"
    ON public.fantasy_teams
    FOR DELETE
    USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- 3.3 Update fantasy_team_players RLS policies
DROP POLICY IF EXISTS "Users can view players in own fantasy teams" ON public.fantasy_team_players;
CREATE POLICY "Users can view players in own fantasy teams"
    ON public.fantasy_team_players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
              AND (ft.user_id = (SELECT auth.uid()) OR public.is_admin())
        )
    );

-- 3.4 Update fantasy_player_points RLS policies (removes non-existent user_roles reference)
DROP POLICY IF EXISTS "Users can view player points for their teams" ON public.fantasy_player_points;
CREATE POLICY "Users can view player points for their teams"
    ON public.fantasy_player_points
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_player_points.fantasy_team_id
              AND (ft.user_id = (SELECT auth.uid()) OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Admin write access for fantasy_player_points" ON public.fantasy_player_points;
CREATE POLICY "Admin write access for fantasy_player_points"
    ON public.fantasy_player_points
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin read access for scoring_audit_logs" ON public.scoring_audit_logs;
CREATE POLICY "Admin read access for scoring_audit_logs"
    ON public.scoring_audit_logs
    FOR SELECT
    USING (public.is_admin());

-- 3.5 Update AI conversations & messages RLS
DROP POLICY IF EXISTS "Users can view own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own AI conversations"
    ON public.ai_conversations
    FOR SELECT
    USING (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.ai_messages;
CREATE POLICY "Users can view messages in own conversations"
    ON public.ai_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = ai_messages.conversation_id
              AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
        )
    );
