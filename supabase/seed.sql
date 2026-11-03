-- ==============================================================================
-- FanPulse AI — Database Seed Data Script
-- Location: supabase/seed.sql
-- Description: Seeds baseline development reference data (roles, scoring rules,
--              sample teams/players) during local database reset.
-- ==============================================================================

-- Notice: Domain tables are created incrementally via migrations.
-- This file provides the schema-ready seed structure for development environments.

DO $$
BEGIN
    RAISE NOTICE 'FanPulse AI seed script executed. Application tables will be seeded after migrations.';
END $$;
