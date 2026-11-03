-- ==============================================================================
-- FanPulse AI — Database Migration: Supabase Auth Profiles & RLS Security
-- Migration: 20261103090000_auth_profiles_schema.sql
-- Description: Creates profiles table, RBAC security functions, auto-provisioning
--              triggers, and strict Row Level Security policies.
-- ==============================================================================

-- 1. Create profiles table linked 1-to-1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    favorite_team VARCHAR(100) DEFAULT 'India National Team',
    bio TEXT DEFAULT 'Cricket fan & fantasy manager',
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_profile_role CHECK (role IN ('USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN')),
    CONSTRAINT chk_display_name_len CHECK (char_length(trim(display_name)) >= 2 AND char_length(display_name) <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Helper function to check if the caller has administrator privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- Check JWT app_metadata claim first (fast, stateless)
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'ROLE_ADMIN')
    OR
    -- Check profiles table entry for caller UID
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'ROLE_ADMIN')
    ),
    FALSE
  );
$$;

-- 3. Automatic Profile Provisioning Trigger on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    initial_display_name VARCHAR(100);
    initial_role VARCHAR(20);
BEGIN
    initial_display_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'displayName'), ''),
        split_part(NEW.email, '@', 1)
    );

    -- Role defaults to USER unless explicitly granted in app_metadata
    initial_role := COALESCE(
        NULLIF(TRIM(NEW.raw_app_meta_data->>'role'), ''),
        'USER'
    );

    IF initial_role NOT IN ('USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN') THEN
        initial_role := 'USER';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        favorite_team,
        bio,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        initial_display_name,
        initial_role,
        COALESCE(NEW.raw_user_meta_data->>'favorite_team', 'India National Team'),
        COALESCE(NEW.raw_user_meta_data->>'bio', 'Cricket fan & fantasy manager'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Anti-Privilege Escalation Trigger
-- Regular users CANNOT alter their own role or promote themselves to ADMIN
CREATE OR REPLACE FUNCTION public.enforce_profile_role_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Privilege escalation rejected: only administrators can modify user roles.'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_role_security ON public.profiles;
CREATE TRIGGER trg_enforce_profile_role_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_security();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Strict RLS Policies for Profiles
-- A user can read their own profile, and administrators can read all profiles
CREATE POLICY "Users can read own profile or admin can read all"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id OR public.is_admin()
    );

-- Authenticated users can view public display names of other users
CREATE POLICY "Public profile display read for authenticated users"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- A user can update ONLY their own profile (and cannot escalate role due to trigger)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = id OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = id OR public.is_admin()
    );

-- Direct INSERT is restricted to the caller's own UID or ADMIN
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = id OR public.is_admin()
    );

-- Profiles cannot be deleted directly by regular users (only cascading with auth.users or by ADMIN)
CREATE POLICY "Admins can delete profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
    );

