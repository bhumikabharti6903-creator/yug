"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Calendar, MessageCircle, Sparkles, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import GradientBorder from "@/components/ui/GradientBorder";


interface UserData {
  id: string;
  email: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

interface TopicSummary {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  category: string;
  upvotes: number;
  submitted_by: string | null;
  created_at: string;
}

interface ProfileClientProps {
  user: UserData;
  topics: TopicSummary[];
  totalUpvotes: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_EMOJI: Record<string, string> = {
  Philosophy: "⟁",
  Science: "⎔",
  Society: "⌘",
  Technology: "⎇",
  Art: "◈",
  Economy: "⊞",
  Identity: "◎",
};

export default function ProfileClient({
  user,
  topics,
  totalUpvotes,
}: ProfileClientProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void text-text font-body">
        {/* Ambient orbs */}
        <div className="fixed top-[10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px] animate-blob-1 pointer-events-none z-0" />
        <div className="fixed bottom-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-blob-2 pointer-events-none z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-24">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-text transition-colors group mb-12"
          >
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Explore
          </Link>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16"
          >
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-[0_0_30px_rgba(255,0,144,0.2)]">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user.displayName)
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-white mb-2">
                {user.displayName}
              </h1>
              <p className="text-muted text-sm mb-3">@{user.username}</p>
              {user.bio && (
                <p className="text-text/70 text-sm max-w-md leading-relaxed">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-2 text-[10px] text-muted mt-3 justify-center md:justify-start">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(user.createdAt)}
              </div>
            </div>

            {/* Stats Badge */}
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="text-center px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-display text-2xl text-white">{topics.length}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider">
                  Topics
                </p>
              </div>
              <div className="text-center px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-display text-2xl text-white flex items-center justify-center gap-1">
                  {totalUpvotes}
                  <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
                </p>
                <p className="text-[10px] text-muted uppercase tracking-wider">
                  Upvotes
                </p>
              </div>
            </div>
          </motion.div>

          {/* Topics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Submitted Topics
              </h2>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
                <MessageCircle className="h-10 w-10 text-muted/50 mx-auto mb-3" />
                <p className="text-sm text-muted">
                  No topics submitted yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, i) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                  >
                    <Link href={`/topics/${topic.id}`}>
                      <GradientBorder
                        borderRadius="rounded-xl"
                        hoverGlow
                        className="block h-full"
                      >
                        <div className="p-5 flex flex-col h-full min-h-[180px]">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs">
                              {CATEGORY_EMOJI[topic.category] || "◈"}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted">
                              {topic.category}
                            </span>
                          </div>
                          <h3 className="font-display text-xl uppercase tracking-wide text-white line-clamp-2 leading-tight mb-2">
                            {topic.title}
                          </h3>
                          {topic.description && (
                            <p className="text-xs text-muted line-clamp-2 leading-relaxed flex-1">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <span className="text-[10px] text-muted">
                              {formatDate(topic.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted">
                              <Heart className="h-3 w-3" />
                              {topic.upvotes}
                            </span>
                          </div>
                        </div>
                      </GradientBorder>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
