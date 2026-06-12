-- ═══════════════════════════════════════════════════════════════════════════════
-- YUGANTAR — Complete Supabase Schema
-- Execute this entire script in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
CREATE TYPE topic_category AS ENUM (
    'Philosophy',
    'Science',
    'Society',
    'Technology',
    'Art',
    'Economy',
    'Identity'
);

CREATE TYPE topic_status AS ENUM (
    'pending',
    'approved',
    'explored',
    'archived'
);

-- 3. Topics table (core)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    meaning TEXT,
    submitted_by TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    category topic_category DEFAULT 'Philosophy',
    status topic_status DEFAULT 'pending' NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Explorations table (AI content)
CREATE TABLE IF NOT EXISTS public.explorations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Comments table (threaded discussions)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    author TEXT NOT NULL DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS comments_topic_id_idx ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- 6. Users table (authentication)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    display_name TEXT,
    bio TEXT DEFAULT '',
    avatar_url TEXT,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    onboarding_complete BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);

-- 7. Link topics to users
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Topics
CREATE POLICY "Allow public read on topics" ON public.topics
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on topics" ON public.topics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update upvotes or details on topics" ON public.topics
    FOR UPDATE USING (true);

-- Explorations
CREATE POLICY "Allow public read on explorations" ON public.explorations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on explorations" ON public.explorations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on explorations" ON public.explorations
    FOR UPDATE USING (true);

-- Comments
CREATE POLICY "Allow public read on comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- Users
CREATE POLICY "Users can read any profile" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- OPTIONAL: Seed some fallback topics so the homepage isn't empty
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.topics (title, description, tags, category, status, upvotes, submitted_by) VALUES
('The Architecture of Silence', 'How physical spaces of absolute quiet are reshaping modern neuroscience and cognitive recovery in hyper-connected cities.', '{Silence,Cognition,Neuroscience,Architecture}', 'Science', 'approved', 342, 'Aria Vance'),
('Algorithmic Animism', 'Exploring the human psychological tendency to assign spiritual agency and consciousness to LLMs and autonomous systems.', '{AI,Philosophy,Psychology}', 'Philosophy', 'approved', 215, 'Dr. Vikram K.'),
('Chronobiology and the 28-Hour Day', 'Re-engineering human circadian biology for long-duration space flight and deep-submergence naval operations.', '{Chronobiology,Space,Performance}', 'Science', 'approved', 189, 'Cmdr. Sarah Cole'),
('The Great Filter & Civilization Lifespans', 'Exploring Robin Hanson''s hypothesis on why we haven''t encountered advanced alien civilizations yet.', '{Fermi Paradox,Cosmology,Astrobiology}', 'Science', 'approved', 482, 'Dr. Elena Rostova'),
('Time Dilation Around Gargantua', 'How extreme gravitational forces near black holes alter the local spacetime metric relative to external observers.', '{Relativity,Black Holes,Astrophysics}', 'Science', 'approved', 315, 'Kip Thorne (M)'),
('Metamodernism & Digital Nostalgia', 'How online communities leverage aesthetics from the early web to navigate current socio-political transitions.', '{Sociology,Culture,Digital Art}', 'Society', 'approved', 97, 'Jamie Lin')
ON CONFLICT DO NOTHING;
