-- ==============================================================================
-- FanPulse AI — Database Migration: Comprehensive Relational Architecture
-- Migration: 20261103140000_comprehensive_database_relationships.sql
-- Description: Establishes all approved foreign keys, explicit many-to-many join
--              tables, 1:N / N:M integrity constraints, AI conversation tables,
--              cascade delete policies, and performance indexes.
-- References: DATABASE_DESIGN.md (§1 through §6), REQUIREMENTS.md
-- ==============================================================================

-- ==============================================================================
-- 1. REUSABLE AUDITING TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. HARDEN FOREIGN KEYS & REFERENTIAL INTEGRITY ON FANTASY TEAMS
-- ==============================================================================
-- Add foreign key constraints on fantasy_teams to matches and players safely
DO $$
BEGIN
    -- 2.1 fantasy_teams.match_id -> matches.id (ON DELETE CASCADE)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_fantasy_teams_match' AND table_name = 'fantasy_teams'
    ) THEN
        ALTER TABLE public.fantasy_teams
            ADD CONSTRAINT fk_fantasy_teams_match
            FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;
    END IF;

    -- 2.2 fantasy_teams.captain_player_id -> players.id (ON DELETE RESTRICT)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_fantasy_teams_captain' AND table_name = 'fantasy_teams'
    ) THEN
        ALTER TABLE public.fantasy_teams
            ADD CONSTRAINT fk_fantasy_teams_captain
            FOREIGN KEY (captain_player_id) REFERENCES public.players(id) ON DELETE RESTRICT;
    END IF;

    -- 2.3 fantasy_teams.vice_captain_player_id -> players.id (ON DELETE RESTRICT)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_fantasy_teams_vice_captain' AND table_name = 'fantasy_teams'
    ) THEN
        ALTER TABLE public.fantasy_teams
            ADD CONSTRAINT fk_fantasy_teams_vice_captain
            FOREIGN KEY (vice_captain_player_id) REFERENCES public.players(id) ON DELETE RESTRICT;
    END IF;

    -- 2.4 fantasy_team_players.player_id -> players.id (ON DELETE RESTRICT)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ft_players_player' AND table_name = 'fantasy_team_players'
    ) THEN
        ALTER TABLE public.fantasy_team_players
            ADD CONSTRAINT fk_ft_players_player
            FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE RESTRICT;
    END IF;

    -- 2.5 fantasy_team_players.match_id -> matches.id (ON DELETE CASCADE)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ft_players_match' AND table_name = 'fantasy_team_players'
    ) THEN
        ALTER TABLE public.fantasy_team_players
            ADD CONSTRAINT fk_ft_players_match
            FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes on foreign keys for fast joins and referential integrity checks
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_captain ON public.fantasy_teams(captain_player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_vice_captain ON public.fantasy_teams(vice_captain_player_id);
CREATE INDEX IF NOT EXISTS idx_ft_players_player ON public.fantasy_team_players(player_id);
CREATE INDEX IF NOT EXISTS idx_ft_players_match ON public.fantasy_team_players(match_id);

-- Attach updated_at automatic triggers
DROP TRIGGER IF EXISTS trg_fantasy_teams_updated_at ON public.fantasy_teams;
CREATE TRIGGER trg_fantasy_teams_updated_at
BEFORE UPDATE ON public.fantasy_teams
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ==============================================================================
-- 3. SQUAD SIZE INTEGRITY TRIGGER (DATABASE_DESIGN.md §6.5)
-- Prevents fantasy teams from exceeding 11 players at the database level.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_fantasy_team_player_count()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.fantasy_team_players
    WHERE fantasy_team_id = NEW.fantasy_team_id;

    IF v_count > 11 THEN
        RAISE EXCEPTION 'Data Integrity Violation: Fantasy team cannot exceed 11 players (BR-TEAM-01).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_fantasy_team_size ON public.fantasy_team_players;
CREATE TRIGGER trg_check_fantasy_team_size
AFTER INSERT OR UPDATE ON public.fantasy_team_players
FOR EACH ROW EXECUTE FUNCTION public.check_fantasy_team_player_count();

-- ==============================================================================
-- 4. AI CONVERSATIONS & MESSAGES (DATABASE_DESIGN.md §3.15, §3.16)
-- Completely isolated from transactional fantasy scoring and cricket tables.
-- ==============================================================================

-- 4.1 ai_conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id VARCHAR(100) NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    conversation_type VARCHAR(30) NOT NULL DEFAULT 'MATCH_SUMMARY',
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_conv_type CHECK (
        conversation_type IN ('MATCH_SUMMARY', 'PLAYER_INSIGHT', 'KEY_MOMENTS', 'GENERAL_CRICKET')
    )
);

CREATE INDEX IF NOT EXISTS idx_ai_conv_user_match ON public.ai_conversations(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_updated ON public.ai_conversations(updated_at DESC);

DROP TRIGGER IF EXISTS trg_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER trg_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4.2 ai_messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL,
    message_text TEXT NOT NULL,
    data_context_snapshot JSONB DEFAULT NULL,
    token_count INTEGER DEFAULT NULL CHECK (token_count >= 0 OR token_count IS NULL),
    response_time_ms INTEGER DEFAULT NULL CHECK (response_time_ms >= 0 OR response_time_ms IS NULL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_msg_sender CHECK (sender_role IN ('USER', 'ASSISTANT', 'SYSTEM'))
);

CREATE INDEX IF NOT EXISTS idx_ai_msg_conv_created ON public.ai_messages(conversation_id, created_at ASC);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) FOR AI TABLES (DATABASE_DESIGN.md §6.8)
-- Strict user ownership protection. Users can only access their own conversations.
-- ==============================================================================
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- 5.1 ai_conversations RLS
CREATE POLICY "Users can view own AI conversations"
    ON public.ai_conversations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI conversations"
    ON public.ai_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations"
    ON public.ai_conversations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI conversations"
    ON public.ai_conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- 5.2 ai_messages RLS
CREATE POLICY "Users can view messages in own conversations"
    ON public.ai_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations"
    ON public.ai_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations c
            WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 6. AUDIT TRIGGER FOR UPDATED_AT ON MATCHES, PLAYERS, SCORING RULES
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_players_updated_at ON public.players;
CREATE TRIGGER trg_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_scoring_rules_updated_at ON public.scoring_rules;
CREATE TRIGGER trg_scoring_rules_updated_at
BEFORE UPDATE ON public.scoring_rules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

