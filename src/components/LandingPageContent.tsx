"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, ThumbsUp, Heart, TrendingUp,
  ArrowRight, Zap, Globe, Brain
} from "lucide-react";
import Link from "next/link";
import Navbar from "./Navbar";

interface Topic {
  id: string;
  title: string;
  tags: string[];
  upvotes: number;
  description?: string;
  meaning?: string;
  submitted_by?: string;
}

interface LandingPageContentProps {
  topics: Topic[];
  featuredTopics?: Topic[];
}

/* ─── Stagger Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 18 } },
};

/* ─── Tag chip colors ─── */
const tagColorMap: Record<string, string> = {
  Philosophy:    "rgba(139,92,246,0.15)",
  Science:       "rgba(99,102,241,0.15)",
  Technology:    "rgba(99,102,241,0.15)",
  AI:            "rgba(99,102,241,0.15)",
  Society:       "rgba(245,158,11,0.12)",
  Economy:       "rgba(245,158,11,0.12)",
  Art:           "rgba(244,63,94,0.12)",
  Identity:      "rgba(244,63,94,0.12)",
  Space:         "rgba(99,102,241,0.15)",
  Cosmology:     "rgba(99,102,241,0.15)",
};
function tagStyle(tag: string) {
  const bg = tagColorMap[tag] || "rgba(99,102,241,0.1)";
  return { background: bg, border: "1px solid rgba(255,255,255,0.06)", color: "var(--color-text-2)" };
}

/* ─── Feature stat items ─── */
const stats = [
  { icon: Zap, label: "Ideas Catalogued", value: "2,400+" },
  { icon: Globe, label: "Global Thinkers", value: "18K+" },
  { icon: Brain, label: "Topics Explored", value: "340+" },
];

export function LandingPageContent({ topics, featuredTopics = [] }: LandingPageContentProps) {
  const [localTopics, setLocalTopics] = useState<Topic[]>(topics);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, upvotes: upvotedIds.has(id) ? t.upvotes - 1 : t.upvotes + 1 } : t))
    );
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden font-body"
      style={{ background: "var(--color-void)", color: "var(--color-text)" }}
    >
      <Navbar />

      {/* ── Ambient Orbs ── */}
      <div
        className="absolute top-[-5%] left-[-15%] w-[700px] h-[700px] rounded-full animate-blob-1 pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="absolute top-[35%] right-[-15%] w-[700px] h-[700px] rounded-full animate-blob-2 pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-[5%] left-[15%] w-[500px] h-[500px] rounded-full animate-blob-3 pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", filter: "blur(90px)" }}
      />

      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-[calc(100vh-68px)] flex flex-col justify-center items-center text-center px-5 max-w-6xl mx-auto pt-8 pb-24"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-8"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "var(--color-indigo-light)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            <span>Curating Collective Consciousness</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-indigo-light)] animate-pulse" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="font-display font-extrabold leading-[1] tracking-tight mb-6"
          style={{ fontSize: "clamp(52px, 11vw, 130px)" }}
        >
          IDEAS THAT{" "}
          <span
            className="block"
            style={{
              backgroundImage: "var(--brand-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SHIFT ERAS
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-base sm:text-lg leading-relaxed mb-10"
          style={{ color: "var(--color-text-2)" }}
        >
          Yuganta — the turning of an era. Yugantar is an editorial platform for
          cataloging profound theories, cosmic paradoxes, and humanity&apos;s
          deepest inquiries.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none">
          <Link
            href="/submit"
            id="hero-submit-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.04] hover:opacity-90 active:scale-[0.97]"
            style={{
              background: "var(--brand-gradient)",
              boxShadow: "var(--glow-indigo), 0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <PenIcon />
            Submit Your Idea
          </Link>
          <a
            href="#explore"
            id="hero-explore-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
            style={{
              border: "1px solid var(--color-border-hover)",
              color: "var(--color-text)",
              background: "var(--color-surface-2)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-indigo)"; e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-hover)"; e.currentTarget.style.background = "var(--color-surface-2)"; }}
          >
            Explore Topics
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={itemVariants}
          className="mt-16 sm:mt-20 flex flex-wrap justify-center gap-6 sm:gap-12"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--color-indigo-light)" }} />
                <span
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  {value}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════
          FEATURED SECTION
      ═══════════════════════════════ */}
      {featuredTopics.length > 0 && (
        <section className="relative z-10 py-20" style={{ borderTop: "1px solid var(--color-border)" }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8 mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                    Featured Ideas
                  </h2>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>Most upvoted explorations</p>
                </div>
              </div>
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: "var(--color-indigo-light)" }}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar flex gap-5 px-5 md:px-8 py-2">
            {featuredTopics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="w-[270px] sm:w-[310px] shrink-0"
              >
                <Link href={`/topics/${topic.id}`} id={`featured-card-${topic.id}`}>
                  <div
                    className="group relative p-px rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(245,158,11,0.3))" }}
                  >
                    <div
                      className="rounded-[15px] p-5 flex flex-col min-h-[210px] h-full"
                      style={{ background: "var(--color-surface)" }}
                    >
                      {/* Gold badge */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <Heart className="h-3 w-3 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                        <span className="text-xs font-bold" style={{ color: "var(--color-gold)" }}>
                          {topic.upvotes.toLocaleString()}
                        </span>
                        <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "var(--color-gold)" }}>
                          Top Pick
                        </span>
                      </div>
                      <h3
                        className="font-display text-xl font-bold leading-snug flex-1 line-clamp-3"
                        style={{ color: "var(--color-text)" }}
                      >
                        {topic.title}
                      </h3>
                      {topic.submitted_by && (
                        <p
                          className="text-[10px] mt-4 pt-3"
                          style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-muted)" }}
                        >
                          By {topic.submitted_by}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════
          RECENT SUBMISSIONS
      ═══════════════════════════════ */}
      <section
        id="explore"
        className="relative z-10 py-24"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h2
              className="font-display text-4xl sm:text-5xl font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              RECENT IDEAS
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "var(--color-text-2)" }}>
              Explore perspectives shifting our cultural paradigm.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
            <span>Live Feed</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Grid on tablet+, scroll on mobile */}
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-5 overflow-x-auto no-scrollbar pb-2">
            {localTopics.map((topic, i) => (
              <TopicCard key={topic.id} topic={topic} i={i} upvotedIds={upvotedIds} onUpvote={handleUpvote} />
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {localTopics.map((topic, i) => (
              <TopicCard key={topic.id} topic={topic} i={i} upvotedIds={upvotedIds} onUpvote={handleUpvote} grid />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FOOTER
      ═══════════════════════════════ */}
      <footer
        className="relative z-10 py-14 px-5"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-void)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--brand-gradient)" }}
            >
              Y
            </div>
            <span className="font-display text-lg font-bold" style={{ color: "var(--color-text)" }}>
              YUGANTAR
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
            © {new Date().getFullYear()} Yugantar. Built for the curious minds of our era.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-medium transition-colors hover:text-[var(--color-indigo-light)]"
                style={{ color: "var(--color-muted)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Topic Card ─── */
function TopicCard({
  topic, i, upvotedIds, onUpvote, grid
}: {
  topic: Topic;
  i: number;
  upvotedIds: Set<string>;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  grid?: boolean;
}) {
  const isUpvoted = upvotedIds.has(topic.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06, duration: 0.4 }}
      className={grid ? "w-full" : "w-[300px] sm:w-[340px] shrink-0"}
    >
      <Link href={`/topics/${topic.id}`} id={`topic-card-${topic.id}`}>
        <div
          className="group relative rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            minHeight: "240px",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-hover)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(99,102,241,0.1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {topic.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={tagStyle(tag)}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3
            className="font-display text-xl font-bold leading-snug line-clamp-3 flex-1 mb-3"
            style={{ color: "var(--color-text)" }}
          >
            {topic.title}
          </h3>

          {/* Description */}
          {topic.description && (
            <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--color-muted)" }}>
              {topic.description}
            </p>
          )}

          {/* Footer row */}
          <div
            className="flex items-center justify-between pt-4 mt-auto"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
              By <span style={{ color: "var(--color-text-2)" }}>{topic.submitted_by || "Anonymous"}</span>
            </span>
            <button
              onClick={(e) => onUpvote(topic.id, e)}
              id={`upvote-btn-${topic.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isUpvoted ? "rgba(99,102,241,0.2)" : "var(--color-surface-3)",
                border: `1px solid ${isUpvoted ? "var(--color-indigo)" : "var(--color-border)"}`,
                color: isUpvoted ? "var(--color-indigo-light)" : "var(--color-muted)",
              }}
            >
              <ThumbsUp className={`h-3 w-3 ${isUpvoted ? "fill-[var(--color-indigo-light)]" : ""}`} />
              <span>{topic.upvotes}</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Small pen icon inline ─── */
function PenIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default LandingPageContent;
