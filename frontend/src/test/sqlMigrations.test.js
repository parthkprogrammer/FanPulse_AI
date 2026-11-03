/**
 * FanPulse AI — SQL Migration & Supabase CLI Configuration Test Suite
 *
 * Verifies version-controlled database migrations conforming to:
 * - Supabase CLI migration directory structure (supabase/migrations/)
 * - Chronological timestamp ordering (YYYYMMDDHHMMSS_name.sql)
 * - Table creation, primary keys, foreign keys, unique constraints, and indexes
 * - Row Level Security (RLS) policies on all tables
 * - Stored functions and triggers (lineup limits, match locking, auditing timestamps)
 * - Separation of sample development data (supabase/seed.sql)
 * - Supabase CLI config (supabase/config.toml)
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('FanPulse AI — Version-Controlled SQL Migrations & Supabase CLI', () => {
  const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations');
  const seedFilePath = path.resolve(__dirname, '../../../supabase/seed.sql');
  const configFilePath = path.resolve(__dirname, '../../../supabase/config.toml');

  // =========================================================================
  // 1. MIGRATION DIRECTORY & ORDERING
  // =========================================================================
  describe('1. Migration File Ordering & Naming Convention', () => {
    it('verifies all migration files exist in supabase/migrations', () => {
      expect(fs.existsSync(migrationsDir)).toBe(true);
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
      expect(files.length).toBeGreaterThanOrEqual(8);
    });

    it('verifies migration filenames adhere to standard Supabase timestamp prefix (YYYYMMDDHHMMSS)', () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
      const timestampRegex = /^\d{14}_[a-z0-9_]+\.sql$/;

      for (const file of files) {
        expect(file).toMatch(timestampRegex);
      }
    });

    it('verifies migrations are strictly ordered chronologically', () => {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
      const sorted = [...files].sort();
      expect(files).toEqual(sorted);
    });
  });

  // =========================================================================
  // 2. SCHEMA DEFINITION & INTEGRITY CHECKS
  // =========================================================================
  describe('2. Table Definitions & Constraints in Migration Scripts', () => {
    const readMigration = (fileNamePart) => {
      const files = fs.readdirSync(migrationsDir);
      const match = files.find((f) => f.includes(fileNamePart));
      if (!match) throw new Error(`Migration containing ${fileNamePart} not found`);
      return fs.readFileSync(path.join(migrationsDir, match), 'utf-8');
    };

    it('2.1 baseline migration enables required PostgreSQL extensions', () => {
      const content = readMigration('initial_schema_baseline');
      expect(content).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      expect(content).toContain('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      expect(content).toContain('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    });

    it('2.2 fantasy_teams schema declares primary keys and constraints', () => {
      const content = readMigration('fantasy_teams_schema');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.fantasy_teams');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.fantasy_team_players');
      expect(content).toContain('PRIMARY KEY');
      expect(content).toContain('CONSTRAINT chk_diff_captain_vc CHECK (captain_player_id <> vice_captain_player_id)');
      expect(content).toContain('CONSTRAINT uk_fantasy_team_player UNIQUE (fantasy_team_id, player_id)');
      expect(content).toContain('ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY');
    });

    it('2.3 auth_profiles schema defines user profiles, roles, and RLS', () => {
      const content = readMigration('auth_profiles_schema');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
      expect(content).toContain('PRIMARY KEY REFERENCES auth.users(id)');
      expect(content).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY');
    });

    it('2.4 match_management schema defines matches, innings, and scorecards', () => {
      const content = readMigration('match_management_schema');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.teams');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.matches');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.match_rosters');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.match_innings');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.player_match_statistics');
      expect(content).toContain('CONSTRAINT chk_diff_match_teams CHECK (team1_id <> team2_id)');
    });

    it('2.5 player_management schema defines players and career stats', () => {
      const content = readMigration('player_management_schema');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.player_career_statistics');
      expect(content).toContain('REFERENCES public.players(id) ON DELETE CASCADE');
      expect(content).toContain('ALTER TABLE public.player_career_statistics ENABLE ROW LEVEL SECURITY');
    });

    it('2.6 fantasy_management schema defines match lock trigger and atomic RPC', () => {
      const content = readMigration('fantasy_management_schema');
      expect(content).toContain('trg_check_fantasy_team_editable');
      expect(content).toContain('save_fantasy_team_atomic');
      expect(content).toContain("IF TG_OP = 'DELETE' THEN");
      expect(content).toContain('RETURN OLD;');
    });

    it('2.7 fantasy_scoring schema defines scoring_rules and player points', () => {
      const content = readMigration('fantasy_scoring_schema');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.scoring_rules');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.fantasy_player_points');
      expect(content).toContain('CONSTRAINT uk_fpp_team_player UNIQUE (fantasy_team_id, player_id)');
      expect(content).toContain('save_team_fantasy_points_atomic');
    });

    it('2.8 comprehensive_database_relationships establishes foreign keys, 11-player trigger, and AI tables', () => {
      const content = readMigration('comprehensive_database_relationships');
      expect(content).toContain('fk_fantasy_teams_match');
      expect(content).toContain('fk_fantasy_teams_captain');
      expect(content).toContain('fk_fantasy_teams_vice_captain');
      expect(content).toContain('trg_check_fantasy_team_size');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.ai_conversations');
      expect(content).toContain('CREATE TABLE IF NOT EXISTS public.ai_messages');
      expect(content).toContain('ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY');
      expect(content).toContain('ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY');
      expect(content).toContain('set_updated_at_timestamp');
    });
  });

  // =========================================================================
  // 3. SAMPLE DEVELOPMENT DATA SEPARATION (supabase/seed.sql)
  // =========================================================================
  describe('3. Development Seed Script (supabase/seed.sql)', () => {
    it('verifies seed.sql exists and contains structured sample development data', () => {
      expect(fs.existsSync(seedFilePath)).toBe(true);
      const content = fs.readFileSync(seedFilePath, 'utf-8');

      // Verifies sample fixtures, teams, athletes, and scorecards
      expect(content).toContain('INSERT INTO public.teams');
      expect(content).toContain('INSERT INTO public.players');
      expect(content).toContain('INSERT INTO public.player_career_statistics');
      expect(content).toContain('INSERT INTO public.matches');
      expect(content).toContain('INSERT INTO public.match_rosters');
      expect(content).toContain('INSERT INTO public.match_innings');
      expect(content).toContain('INSERT INTO public.player_match_statistics');
      expect(content).toContain('INSERT INTO public.ball_events');
    });

    it('verifies seed.sql uses idempotent ON CONFLICT clauses for safe resets', () => {
      const content = fs.readFileSync(seedFilePath, 'utf-8');
      expect(content).toContain('ON CONFLICT');
    });
  });

  // =========================================================================
  // 4. SUPABASE CLI CONFIGURATION (supabase/config.toml)
  // =========================================================================
  describe('4. Supabase CLI Configuration (supabase/config.toml)', () => {
    it('verifies config.toml enables migrations and points to seed.sql', () => {
      expect(fs.existsSync(configFilePath)).toBe(true);
      const config = fs.readFileSync(configFilePath, 'utf-8');

      expect(config).toContain('project_id = "fanpulse-ai"');
      expect(config).toContain('[db.migrations]');
      expect(config).toContain('enabled = true');
      expect(config).toContain('[db.seed]');
      expect(config).toContain('sql_paths = ["./seed.sql"]');
    });

    it('verifies config.toml declares all 9 production Edge Functions', () => {
      const config = fs.readFileSync(configFilePath, 'utf-8');
      const expectedFunctions = [
        'health-check',
        'validate-fantasy-team',
        'compare-fantasy-teams',
        'calculate-fantasy-scoring',
        'manage-fantasy-teams',
        'manage-matches',
        'manage-players',
        'sync-cricket-data',
        'ai-assistant',
      ];

      for (const fn of expectedFunctions) {
        expect(config).toContain(`[functions.${fn}]`);
      }
    });
  });
});
