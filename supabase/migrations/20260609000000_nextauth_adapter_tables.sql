-- ═══════════════════════════════════════════════════════════════════════════════
-- NextAuth.js Supabase Adapter — Required Tables
-- Run this in: Supabase Dashboard → SQL Editor
-- Reference: https://authjs.dev/reference/adapter/supabase
-- ═══════════════════════════════════════════════════════════════════════════════

-- NextAuth accounts table (links OAuth providers to users)
CREATE TABLE IF NOT EXISTS public.accounts (
    id                   UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId"             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type                 TEXT NOT NULL,
    provider             TEXT NOT NULL,
    "providerAccountId"  TEXT NOT NULL,
    refresh_token        TEXT,
    access_token         TEXT,
    expires_at           BIGINT,
    token_type           TEXT,
    scope                TEXT,
    id_token             TEXT,
    session_state        TEXT,

    PRIMARY KEY (id),
    UNIQUE (provider, "providerAccountId")
);

-- NextAuth sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id             UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId"       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires        TIMESTAMPTZ NOT NULL,

    PRIMARY KEY (id)
);

-- NextAuth verification tokens table (used by EmailProvider magic links)
CREATE TABLE IF NOT EXISTS public.verification_tokens (
    identifier TEXT NOT NULL,
    token      TEXT NOT NULL UNIQUE,
    expires    TIMESTAMPTZ NOT NULL,

    PRIMARY KEY (identifier, token)
);

-- RLS: these tables are managed server-side only (service role bypasses RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
