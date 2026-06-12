import React from "react";
import { createServerSideClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";
import type { Metadata } from "next";

export const revalidate = 0;

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSideClient();
  const { data: user } = await supabase
    .from("users")
    .select("display_name, bio")
    .eq("username", params.username)
    .single();

  if (!user) return { title: "User Not Found — Yugantar" };

  return {
    title: `${user.display_name || params.username} — Yugantar`,
    description: user.bio || `Explore topics submitted by ${user.display_name || params.username}.`,
    openGraph: {
      title: `${user.display_name || params.username} — Yugantar`,
      description: user.bio || `Profile on Yugantar`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = params;
  const supabase = createServerSideClient();

  // Fetch user profile
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    notFound();
  }

  // Fetch user's submitted topics
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("submitted_by", user.display_name || user.name)
    .or(`user_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(30);

  // Calculate total upvotes
  const totalUpvotes = (topics ?? []).reduce(
    (sum, t) => sum + (t.upvotes ?? 0),
    0
  );

  const typedTopics = (topics ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    tags: t.tags || [],
    category: t.category || "Philosophy",
    upvotes: t.upvotes ?? 0,
    submitted_by: t.submitted_by || null,
    created_at: t.created_at,
  }));

  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email,
        displayName: user.display_name || user.name || "Anonymous",
        username: user.username,
        bio: user.bio || "",
        avatarUrl: user.avatar_url || "",
        createdAt: user.created_at,
      }}
      topics={typedTopics}
      totalUpvotes={totalUpvotes}
    />
  );
}
