import React from "react";
import { createServerSideClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TopicDetailClient from "./TopicDetailClient";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSideClient();
  const { data: topic } = await supabase
    .from("topics")
    .select("title, description, category, tags")
    .eq("id", params.id)
    .single();

  if (!topic) {
    return { title: "Topic Not Found" };
  }

  const title = `${topic.title} — Yugantar`;
  const description = topic.description || `A ${topic.category || "philosophical"} exploration on Yugantar.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Yugantar",
      tags: topic.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

interface TopicData {
  id: string;
  title: string;
  description: string | null;
  meaning: string | null;
  submitted_by: string | null;
  tags: string[];
  category: string;
  status: string;
  upvotes: number;
  created_at: string;
}

interface CommentData {
  id: string;
  topic_id: string;
  parent_id: string | null;
  author: string;
  content: string;
  created_at: string;
}

export default async function TopicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const supabase = createServerSideClient();

  // Fetch the topic
  const { data: topic, error } = await supabase
    .from("topics")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !topic) {
    notFound();
  }

  const typedTopic: TopicData = {
    id: topic.id,
    title: topic.title,
    description: topic.description || null,
    meaning: topic.meaning || null,
    submitted_by: topic.submitted_by || null,
    tags: topic.tags || [],
    category: topic.category || "Philosophy",
    status: topic.status || "pending",
    upvotes: topic.upvotes ?? 0,
    created_at: topic.created_at,
  };

  // Fetch related topics in the same category (excluding current topic)
  const { data: related } = await supabase
    .from("topics")
    .select("id, title, description, tags, category, upvotes, submitted_by, created_at")
    .eq("category", typedTopic.category)
    .neq("id", id)
    .order("upvotes", { ascending: false })
    .limit(4);

  const relatedTopics = (related ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    tags: t.tags || [],
    category: t.category || "Philosophy",
    upvotes: t.upvotes ?? 0,
    submitted_by: t.submitted_by || null,
    created_at: t.created_at,
  }));

  // Fetch comments for this topic
  const { data: commentsData } = await supabase
    .from("comments")
    .select("*")
    .eq("topic_id", id)
    .order("created_at", { ascending: true });

  const comments: CommentData[] = (commentsData ?? []).map((c) => ({
    id: c.id,
    topic_id: c.topic_id,
    parent_id: c.parent_id,
    author: c.author,
    content: c.content,
    created_at: c.created_at,
  }));

  return (
    <TopicDetailClient
      topic={typedTopic}
      relatedTopics={relatedTopics}
      initialComments={comments}
    />
  );
}
