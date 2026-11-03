/**
 * FanPulse AI — Database Optimization & Performance Verification Test Suite
 *
 * Verifies that performance optimizations codified in migration:
 * 20261103150000_performance_optimizations.sql and docs/DATABASE_OPTIMIZATION.md
 * adhere strictly to PostgreSQL indexing, set-based execution, and RLS guidelines.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('FanPulse AI — Database Performance Optimizations & Query Tuning', () => {
  const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations');
  const optMigrationPath = path.resolve(migrationsDir, '20261103150000_performance_optimizations.sql');
  const docPath = path.resolve(__dirname, '../../../docs/DATABASE_OPTIMIZATION.md');
  const compareFunctionPath = path.resolve(__dirname, '../../../supabase/functions/compare-fantasy-teams/index.ts');

  // =========================================================================
  // 1. MIGRATION FILE & ORDERING
  // =========================================================================
  describe('1. Performance Optimization Migration File Integrity', () => {
    it('verifies 20261103150000_performance_optimizations.sql exists', () => {
      expect(fs.existsSync(optMigrationPath)).toBe(true);
    });

    it('verifies migration ordering remains strictly chronological with 9 total migrations', () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
      expect(files.length).toBeGreaterThanOrEqual(9);
      const sorted = [...files].sort();
      expect(files).toEqual(sorted);
      expect(files[files.length - 1]).toBe('20261103150000_performance_optimizations.sql');
    });

    it('verifies docs/DATABASE_OPTIMIZATION.md exists and is populated', () => {
      expect(fs.existsSync(docPath)).toBe(true);
      const docContent = fs.readFileSync(docPath, 'utf-8');
      expect(docContent).toContain('FanPulse AI — PostgreSQL Performance Optimization');
      expect(docContent).toContain('Measurement Integrity Policy');
      expect(docContent).toContain('EXPLAIN (ANALYZE, BUFFERS, VERBOSE)');
    });
  });

  // =========================================================================
  // 2. JUSTIFIED PERFORMANCE INDEX DEFINITIONS
  // =========================================================================
  describe('2. Foreign Key, Composite, and Trigram Index Definitions', () => {
    const migrationContent = fs.readFileSync(optMigrationPath, 'utf-8');

    it('2.1 creates composite index on matches(status, match_date DESC) to eliminate sort nodes', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_matches_status_date');
      expect(migrationContent).toContain('ON public.matches (status, match_date DESC)');
    });

    it('2.2 indexes unindexed foreign keys on matches (toss winner, winning team)', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_matches_toss_winner');
      expect(migrationContent).toContain('ON public.matches (toss_winner_team_id)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_matches_winning_team');
      expect(migrationContent).toContain('ON public.matches (winning_team_id)');
    });

    it('2.3 creates GIN trigram index on players(name gin_trgm_ops) for wildcard search acceleration', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_players_name_trgm');
      expect(migrationContent).toContain('ON public.players USING gin (name gin_trgm_ops)');
    });

    it('2.4 creates composite index on players(primary_role, name ASC)', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_players_role_name');
      expect(migrationContent).toContain('ON public.players (primary_role, name ASC)');
    });

    it('2.5 indexes match_rosters foreign keys (team_id, player_id)', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_rosters_team');
      expect(migrationContent).toContain('ON public.match_rosters (team_id)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_rosters_player');
      expect(migrationContent).toContain('ON public.match_rosters (player_id)');
    });

    it('2.6 indexes match_innings foreign keys (batting_team_id, bowling_team_id)', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_innings_batting_team');
      expect(migrationContent).toContain('ON public.match_innings (batting_team_id)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_innings_bowling_team');
      expect(migrationContent).toContain('ON public.match_innings (bowling_team_id)');
    });

    it('2.7 indexes player_match_statistics (player_id, match_id) and team_id', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_stats_player_match');
      expect(migrationContent).toContain('ON public.player_match_statistics (player_id, match_id)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_stats_team');
      expect(migrationContent).toContain('ON public.player_match_statistics (team_id)');
    });

    it('2.8 indexes fantasy_teams composite user queries for zero-sort listing', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_created');
      expect(migrationContent).toContain('ON public.fantasy_teams (user_id, created_at DESC)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_match_created');
      expect(migrationContent).toContain('ON public.fantasy_teams (user_id, match_id, created_at DESC)');
    });

    it('2.9 indexes scoring_audit_logs(triggered_by) and ai_conversations(user_id, updated_at DESC)', () => {
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_scoring_audit_triggered_by');
      expect(migrationContent).toContain('ON public.scoring_audit_logs (triggered_by)');
      expect(migrationContent).toContain('CREATE INDEX IF NOT EXISTS idx_ai_conv_user_updated');
      expect(migrationContent).toContain('ON public.ai_conversations (user_id, updated_at DESC)');
    });
  });

  // =========================================================================
  // 3. SET-BASED PROCEDURAL REFACTORING
  // =========================================================================
  describe('3. Set-Based Relational Operations in Stored Procedures', () => {
    const migrationContent = fs.readFileSync(optMigrationPath, 'utf-8');

    it('3.1 refactors save_fantasy_team_atomic to use set-based batch insert without loop', () => {
      expect(migrationContent).toContain('CREATE OR REPLACE FUNCTION public.save_fantasy_team_atomic');
      expect(migrationContent).toContain('INSERT INTO public.fantasy_team_players');
      expect(migrationContent).toContain('FROM jsonb_array_elements(p_players) AS p');
      // Must not contain procedural cursor loop
      expect(migrationContent).not.toMatch(/FOR v_player IN SELECT \* FROM jsonb_array_elements\(p_players\)\s+LOOP/);
    });

    it('3.2 refactors save_team_fantasy_points_atomic to use set-based batch upsert without loop', () => {
      expect(migrationContent).toContain('CREATE OR REPLACE FUNCTION public.save_team_fantasy_points_atomic');
      expect(migrationContent).toContain('INSERT INTO public.fantasy_player_points');
      expect(migrationContent).toContain('FROM jsonb_array_elements(p_player_points) AS p');
      expect(migrationContent).toContain('ON CONFLICT (fantasy_team_id, player_id) DO UPDATE SET');
      expect(migrationContent).not.toMatch(/FOR v_player IN SELECT \* FROM jsonb_array_elements\(p_player_points\)\s+LOOP/);
    });
  });

  // =========================================================================
  // 4. RLS INITPLAN OPTIMIZATIONS
  // =========================================================================
  describe('4. Row Level Security (RLS) Query Optimizations', () => {
    const migrationContent = fs.readFileSync(optMigrationPath, 'utf-8');

    it('4.1 wraps auth.uid() in (SELECT auth.uid()) for InitPlan elevation across policies', () => {
      expect(migrationContent).toContain('(SELECT auth.uid())');
      expect(migrationContent).toContain('user_id = (SELECT auth.uid()) OR public.is_admin()');
    });

    it('4.2 removes obsolete user_roles references and unifies under public.is_admin()', () => {
      expect(migrationContent).not.toContain('FROM public.user_roles');
      expect(migrationContent).toContain('DROP POLICY IF EXISTS "Admin write access for fantasy_player_points"');
      expect(migrationContent).toContain('USING (public.is_admin())');
    });

    it('4.3 optimizes public.is_admin() with stateless JWT check and InitPlan fallback', () => {
      expect(migrationContent).toContain("auth.jwt() -> 'app_metadata' ->> 'role'");
      expect(migrationContent).toContain('WHERE id = (SELECT auth.uid()) AND role IN (\'ADMIN\', \'ROLE_ADMIN\')');
    });
  });

  // =========================================================================
  // 5. EDGE FUNCTION BATCHING & N+1 ELIMINATION
  // =========================================================================
  describe('5. Edge Function Query Batching', () => {
    it('5.1 verifies compare-fantasy-teams batches team lookups via .in()', () => {
      const edgeFnContent = fs.readFileSync(compareFunctionPath, 'utf-8');
      expect(edgeFnContent).toContain('.in(\'id\', [team1Id, team2Id])');
      expect(edgeFnContent).toContain('.in(\'fantasy_team_id\', [team1.id, team2.id])');
      // Confirms elimination of separate sequential roundtrips
      expect(edgeFnContent).not.toContain(".eq('id', team1Id)\n      .maybeSingle()");
    });
  });
});
