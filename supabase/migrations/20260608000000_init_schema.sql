-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create topic category enum
CREATE TYPE topic_category AS ENUM (
    'Philosophy',
    'Science',
    'Society',
    'Technology',
    'Art',
    'Economy',
    'Identity'
);

-- Create topic status enum
CREATE TYPE topic_status AS ENUM (
    'pending',
    'approved',
    'explored',
    'archived'
);

-- Create topics table
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

-- Create explorations table
CREATE TABLE IF NOT EXISTS public.explorations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics
CREATE POLICY "Allow public read on topics" ON public.topics
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on topics" ON public.topics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update upvotes or details on topics" ON public.topics
    FOR UPDATE USING (true);

-- RLS Policies for explorations
CREATE POLICY "Allow public read on explorations" ON public.explorations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on explorations" ON public.explorations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on explorations" ON public.explorations
    FOR UPDATE USING (true);

-- Create comments table for threaded discussions
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

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- Create users table for authentication
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Add user_id to topics for linking submissions to authenticated users
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);
