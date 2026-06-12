"use client";

import React, { useState, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowUp,
  MessageCircle,
  Clock,
  User,
  Sparkles,
  ChevronLeft,
  Send,
  Loader2,
  Lightbulb,
  Quote,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import GradientBorder from "@/components/ui/GradientBorder";
import { cn } from "@/lib/utils";
import "@fontsource/playfair-display";

// ─── Types ──────────────────────────────────────────────────────────────────

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

interface RelatedTopic {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  category: string;
  upvotes: number;
  submitted_by: string | null;
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

interface TopicDetailClientProps {
  topic: TopicData;
  relatedTopics: RelatedTopic[];
  initialComments: CommentData[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Philosophy: "from-violet-500 to-purple-600",
  Science: "from-cyan-500 to-blue-600",
  Society: "from-amber-500 to-orange-600",
  Technology: "from-emerald-500 to-teal-600",
  Art: "from-pink-500 to-rose-600",
  Economy: "from-yellow-500 to-amber-600",
  Identity: "from-indigo-500 to-violet-600",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Philosophy: "⟁",
  Science: "⎔",
  Society: "⌘",
  Technology: "⎇",
  Art: "◈",
  Economy: "⊞",
  Identity: "◎",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── ScrollReveal wrapper ───────────────────────────────────────────────────

function ScrollReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Upvote Button ──────────────────────────────────────────────────────────

function UpvoteButton({
  topicId,
  initialCount,
}: {
  topicId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleUpvote = async () => {
    if (upvoted || animating) return;
    setAnimating(true);
    setUpvoted(true);
    setCount((c) => c + 1);

    try {
      const res = await fetch(`/api/topics/${topicId}/upvote`, {
        method: "POST",
      });
      if (!res.ok) {
        setCount((c) => c - 1);
        setUpvoted(false);
      } else {
        const data = await res.json();
        setCount(data.upvotes);
      }
    } catch {
      setCount((c) => c - 1);
      setUpvoted(false);
    } finally {
      setAnimating(false);
    }
  };

  return (
    <motion.button
      onClick={handleUpvote}
      disabled={upvoted}
      whileTap={!upvoted ? { scale: 0.9 } : undefined}
      className={cn(
        "inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border",
        upvoted
          ? "bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-[0_0_20px_rgba(255,0,144,0.3)]"
          : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
      )}
      aria-label={upvoted ? "Upvoted" : "Upvote this topic"}
    >
      <motion.div
        animate={upvoted ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart className={cn("h-5 w-5", upvoted && "fill-white")} />
      </motion.div>
      <span className="tabular-nums">{count}</span>
    </motion.button>
  );
}

// ─── Author Card ────────────────────────────────────────────────────────────

function AuthorCard({ name }: { name: string | null }) {
  const displayName = name || "Anonymous";
  const initials = getInitials(displayName);

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{displayName}</p>
        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
          <User className="h-3 w-3" />
          Contributor
        </p>
      </div>
    </div>
  );
}

// ─── AI Explanation Section ─────────────────────────────────────────────────

function AIExplanationSection({ topicId }: { topicId: string }) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExplanation = useCallback(async () => {
    if (explanation || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/topics/${topicId}/explain`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate explanation");
      }
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [topicId, explanation, loading]);

  return (
    <GlassCard
      gradient="from-[#FF0090] via-[#7B00FF] to-[#FF0090]"
      className="w-full"
      hoverGlow={false}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">What This Means</h3>
            <p className="text-xs text-muted">Powered by Claude AI</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!explanation && !loading && !error && (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted leading-relaxed mb-5">
                Let AI distill this idea into three clear sentences — what it
                means and why it matters.
              </p>
              <motion.button
                onClick={generateExplanation}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(255,0,144,0.2)] hover:shadow-[0_0_25px_rgba(255,0,144,0.35)] transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                Generate Explanation
              </motion.button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 py-4"
            >
              <Loader2 className="h-5 w-5 text-pink-400 animate-spin" />
              <span className="text-sm text-muted">Consulting Claude...</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              <p className="text-red-400 text-xs">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  generateExplanation();
                }}
                className="text-xs text-pink-400 hover:text-pink-300 mt-2 underline"
              >
                Try again
              </button>
            </motion.div>
          )}

          {explanation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative pl-6">
                {/* Gradient left accent bar — uses absolutely positioned div */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-pink-500 to-purple-500" />
                <Quote className="absolute -left-2 -top-0.5 h-4 w-4 text-pink-400" />
                <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">
                  {explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

// ─── Related Topic Card ─────────────────────────────────────────────────────

function RelatedTopicCard({ topic }: { topic: RelatedTopic }) {
  return (
    <Link href={`/topics/${topic.id}`}>
      <GradientBorder
        borderRadius="rounded-xl"
        hoverGlow
        className="block h-full"
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted">
              {topic.category}
            </span>
          </div>
          <h4 className="font-display text-lg uppercase tracking-wide text-white line-clamp-2 leading-tight mb-2">
            {topic.title}
          </h4>
          {topic.description && (
            <p className="text-xs text-muted line-clamp-2 leading-relaxed flex-1">
              {topic.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-[10px] text-muted">
              {topic.submitted_by || "Anonymous"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted">
              <Heart className="h-3 w-3" />
              {topic.upvotes}
            </span>
          </div>
        </div>
      </GradientBorder>
    </Link>
  );
}

// ─── Comment Thread ─────────────────────────────────────────────────────────

function CommentItem({
  comment,
  allComments,
  depth = 0,
}: {
  comment: CommentData;
  allComments: CommentData[];
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const replies = allComments.filter((c) => c.parent_id === comment.id);

  return (
    <div className={cn(depth > 0 && "ml-6 sm:ml-10")}>
      <div className="relative pl-5 border-l-2 border-white/5 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/40 to-purple-500/40 flex items-center justify-center text-[10px] font-bold text-white">
            {getInitials(comment.author)}
          </div>
          <span className="text-xs font-semibold text-white">
            {comment.author}
          </span>
          <span className="text-[10px] text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(comment.created_at)}
          </span>
        </div>

        <p className="text-sm text-white/70 leading-relaxed mb-2">
          {comment.content}
        </p>

        <button
          onClick={() => setShowReply(!showReply)}
          className="text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-pink-400 transition-colors"
        >
          {showReply ? "Cancel" : "Reply"}
        </button>

        <AnimatePresence>
          {showReply && (
            <CommentForm
              topicId={comment.topic_id}
              parentId={comment.id}
              onSuccess={() => setShowReply(false)}
              compact
            />
          )}
        </AnimatePresence>

        {replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            allComments={allComments}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Comment Form ───────────────────────────────────────────────────────────

function CommentForm({
  topicId,
  parentId,
  onSuccess,
  compact,
}: {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/topics/${topicId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim() || "Anonymous",
          parent_id: parentId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment. Please try again.");

      setContent("");
      setAuthor("");
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to post comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={compact ? { opacity: 0, height: 0 } : undefined}
      animate={compact ? { opacity: 1, height: "auto" } : undefined}
      exit={compact ? { opacity: 0, height: 0 } : undefined}
      onSubmit={handleSubmit}
      className={cn("space-y-3", compact ? "mt-3 overflow-hidden" : "mt-6")}
    >
      {/* Error feedback */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-400 text-xs flex items-center gap-1.5"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className={cn(
            "bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-muted/50 focus:outline-none focus:border-pink-500/50 transition-colors",
            compact ? "w-32" : "w-full sm:w-48"
          )}
          aria-label="Your name"
        />
      </div>
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            compact
              ? "Write a reply..."
              : "Share your thoughts on this topic..."
          }
          rows={compact ? 2 : 3}
          maxLength={2000}
          required
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-muted/50 focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
          aria-label="Comment content"
        />
        <motion.button
          type="submit"
          disabled={!content.trim() || submitting}
          whileHover={content.trim() ? { scale: 1.05 } : undefined}
          whileTap={content.trim() ? { scale: 0.95 } : undefined}
          className={cn(
            "shrink-0 self-end p-2.5 rounded-lg transition-all duration-300",
            content.trim()
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_10px_rgba(255,0,144,0.2)]"
              : "bg-white/5 text-muted cursor-not-allowed"
          )}
          aria-label="Submit comment"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TopicDetailClient({
  topic,
  relatedTopics,
  initialComments,
}: TopicDetailClientProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Refresh comments from server after new ones are posted
  const refreshComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/topics/${topic.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } catch {
      // silently fail
    }
  }, [topic.id]);

  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <>
      <Navbar />

      {/* ── Cinematic Hero ──────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative w-full min-h-[70vh] sm:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#1A0011] to-[#0D001A]" />
        <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[150px] animate-blob-1 pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[130px] animate-blob-2 pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[120px] animate-blob-3 pointer-events-none" />

        {/* Back link */}
        <div className="absolute top-6 left-6 sm:left-10 z-10">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-text transition-colors group"
          >
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24 pb-16 sm:pb-20">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r text-white shadow-lg",
                CATEGORY_COLORS[topic.category] || "from-gray-500 to-gray-600"
              )}
            >
              <span className="text-xs">
                {CATEGORY_EMOJI[topic.category] || "◈"}
              </span>
              {topic.category}
            </span>
          </motion.div>

          {/* Title in Playfair Display */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] tracking-tight text-white mb-6 max-w-4xl mx-auto"
          >
            {topic.title}
          </motion.h1>

          {/* Description */}
          {topic.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              {topic.description}
            </motion.p>
          )}

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8"
          >
            <AuthorCard name={topic.submitted_by} />
            <span className="text-muted text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(topic.created_at)}
            </span>
          </motion.div>

          {/* Upvote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8"
          >
            <UpvoteButton topicId={topic.id} initialCount={topic.upvotes} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-muted">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUp className="h-4 w-4 text-muted rotate-180" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Content Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            {/* AI Explanation */}
            <ScrollReveal>
              <AIExplanationSection topicId={topic.id} />
            </ScrollReveal>

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <ScrollReveal>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Comment Section */}
            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <MessageCircle className="h-5 w-5 text-pink-400" />
                  <h2 className="font-semibold text-white text-lg">
                    Discussion
                  </h2>
                  <span className="text-xs text-muted">
                    ({comments.length}{" "}
                    {comments.length === 1 ? "comment" : "comments"})
                  </span>
                </div>
                <p className="text-xs text-muted mb-6">
                  Share your perspective on this exploration.
                </p>

                {/* New Comment Form */}
                <GlassCard
                  gradient="from-[#FF0090] via-[#7B00FF] to-[#FF0090]"
                  className="w-full mb-8"
                  hoverGlow={false}
                >
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Add to the Discussion
                    </h4>
                    <CommentForm
                      topicId={topic.id}
                      onSuccess={refreshComments}
                    />
                  </div>
                </GlassCard>

                {/* Comment List */}
                {topLevelComments.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                    <MessageCircle className="h-8 w-8 text-muted/50 mx-auto mb-3" />
                    <p className="text-sm text-muted">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topLevelComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        allComments={comments}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar (1/3) — Related Topics */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <ScrollReveal>
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                      Related Explorations
                    </h3>
                  </div>

                  {relatedTopics.length === 0 ? (
                    <p className="text-xs text-muted">
                      No related topics in this category yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {relatedTopics.map((rt) => (
                        <RelatedTopicCard key={rt.id} topic={rt} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
