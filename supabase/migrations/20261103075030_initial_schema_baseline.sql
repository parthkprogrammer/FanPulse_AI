-- ==============================================================================
-- FanPulse AI — Database Migration: Baseline Initialization
-- Migration: 20261103075030_initial_schema_baseline.sql
-- Description: Enables core PostgreSQL extensions and prepares schema for FanPulse AI.
-- ==============================================================================

-- Enable standard UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions for tokens and hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for fuzzy text search on player names and match titles
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Baseline schema initialization completed.
-- Domain tables (users, matches, players, fantasy_teams, scoring_rules)
-- will be applied in subsequent incremental migrations.
