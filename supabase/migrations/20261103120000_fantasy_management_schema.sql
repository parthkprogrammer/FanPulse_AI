-- ==============================================================================
-- FanPulse AI — Database Migration: Fantasy Team Management & Atomic Operations
-- Migration: 20261103120000_fantasy_management_schema.sql
-- Description: Adds is_locked flag, match foreign key constraint, match lock trigger,
--              and atomic stored procedure for transactional squad persistence.
-- ==============================================================================

-- 1. Add is_locked flag to fantasy_teams if not already present
ALTER TABLE public.fantasy_teams
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Trigger function to enforce match deadline lock (BR-TEAM-06)
-- Users cannot edit or delete fantasy teams once the match is in progress or completed
CREATE OR REPLACE FUNCTION public.check_fantasy_team_editable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_match_id VARCHAR(100);
    match_status_val VARCHAR(20);
BEGIN
    target_match_id := COALESCE(NEW.match_id, OLD.match_id);

    -- Query match lifecycle status
    SELECT status INTO match_status_val
    FROM public.matches
    WHERE id = target_match_id;

    IF match_status_val IS NOT NULL AND match_status_val IN ('LIVE', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') THEN
        RAISE EXCEPTION 'Match deadline reached: Fantasy lineups are locked for in-progress or completed matches (BR-TEAM-06).'
            USING ERRCODE = '22023';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_fantasy_team_editable ON public.fantasy_teams;
CREATE TRIGGER trg_check_fantasy_team_editable
    BEFORE INSERT OR UPDATE OR DELETE ON public.fantasy_teams
    FOR EACH ROW EXECUTE FUNCTION public.check_fantasy_team_editable();

-- 3. Atomic Transactional RPC: save_fantasy_team_atomic
-- Persists team header and all 11 drafted players atomically within one transaction
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
    v_player JSONB;
    v_player_count INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Check Caller Authentication
    v_user_id := auth.uid();
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

    -- 4. Insert or Update Header
    IF p_team_id IS NOT NULL THEN
        -- Ownership verification (NFR-SEC-03)
        IF NOT EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = p_team_id AND user_id = v_user_id) THEN
            RAISE EXCEPTION 'Access denied: You cannot modify another user fantasy team.' USING ERRCODE = '42501';
        END IF;

        UPDATE public.fantasy_teams
        SET
            team_name = p_team_name,
            captain_player_id = p_captain_id,
            vice_captain_player_id = p_vice_captain_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_team_id AND user_id = v_user_id
        RETURNING id INTO v_team_id;

        -- Remove existing players for full atomic replacement
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
            p_team_name,
            p_captain_id,
            p_vice_captain_id,
            0.00
        )
        RETURNING id INTO v_team_id;
    END IF;

    -- 5. Insert All 11 Players
    FOR v_player IN SELECT * FROM jsonb_array_elements(p_players)
    LOOP
        INSERT INTO public.fantasy_team_players (
            fantasy_team_id,
            player_id,
            match_id,
            player_name,
            player_role,
            team_code,
            is_captain,
            is_vice_captain
        ) VALUES (
            v_team_id,
            v_player->>'id',
            p_match_id,
            v_player->>'name',
            v_player->>'role',
            v_player->>'teamCode',
            (v_player->>'id' = p_captain_id),
            (v_player->>'id' = p_vice_captain_id)
        );
    END LOOP;

    -- 6. Assemble Full Return Payload
    SELECT jsonb_build_object(
        'id', v_team_id,
        'userId', v_user_id,
        'matchId', p_match_id,
        'teamName', p_team_name,
        'captainPlayerId', p_captain_id,
        'viceCaptainPlayerId', p_vice_captain_id,
        'playersCount', 11
    ) INTO v_result;

    RETURN v_result;
END;
$$;

