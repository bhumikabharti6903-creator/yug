"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Sparkles,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  Lightbulb,
  LogIn,
  Lock,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Philosophy",
  "Science",
  "Society",
  "Technology",
  "Art",
  "Economy",
  "Identity",
] as const;

const submitFormSchema = z.object({
  title: z
    .string()
    .min(10, "Make it at least 10 characters — give your idea room to breathe.")
    .max(120, "Keep it under 120 characters. Precision is power."),
  description: z
    .string()
    .min(20, "Go deeper — at least 20 characters to capture the essence.")
    .max(280, "Distill it. 280 characters max."),
  category: z.enum(CATEGORIES),
  anonymous: z.boolean().default(false),
});

type SubmitFormData = z.infer<typeof submitFormSchema>;

// ─── Rotating Quotes ─────────────────────────────────────────────────────────

const QUOTES = [
  {
    text: "What idea keeps you awake at night?",
    author: "— The questions that haunt are the ones worth asking.",
  },
  {
    text: "What does your generation refuse to accept?",
    author: "— Every era has its rebellion. Name yours.",
  },
  {
    text: "Name the one thing the world misunderstands.",
    author: "— Clarity begins with a single, honest observation.",
  },
];

// ─── Animated Checkmark ──────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="relative"
      >
        {/* Outer ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-xl"
        />
        {/* Circle */}
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(255,0,144,0.3)]">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="relative z-10"
          >
            <motion.path
              d="M14 28L24 38L42 18"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Success Overlay ─────────────────────────────────────────────────────────

function SuccessOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A0011] to-[#0D001A]"
    >
      {/* Background orbs */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[120px] animate-blob-1 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px] animate-blob-2 pointer-events-none" />

      <AnimatedCheckmark />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center mt-12 px-6"
      >
        <h2 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase tracking-wider text-white mb-6">
          Your idea has entered the age.
        </h2>
        <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          It will be reviewed and may appear on the explore page if selected.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-10"
        >
          <div className="inline-flex items-center gap-3 text-muted text-sm">
            <span>Redirecting to Explore</span>
            <motion.span
              key={countdown}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-2xl text-white"
            >
              {countdown}
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pill-style Category Selector ────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  Philosophy: "⟁",
  Science: "⎔",
  Society: "⌘",
  Technology: "⎇",
  Art: "◈",
  Economy: "⊞",
  Identity: "◎",
};

interface CategoryPillsProps {
  value: string;
  onChange: (category: string) => void;
  error?: string;
}

function CategoryPills({ value, onChange, error }: CategoryPillsProps) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
        Category
      </label>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Select a category for your topic"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat;
          return (
            <button
              key={cat}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(cat)}
              className={cn(
                "group relative px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                isSelected
                  ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white shadow-[0_0_15px_rgba(255,0,144,0.15)]"
                  : "bg-white/5 border-white/10 text-muted hover:border-white/25 hover:text-text hover:bg-white/[0.07]"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xs opacity-60">{CATEGORY_EMOJI[cat]}</span>
                {cat}
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="h-3 w-3 text-pink-400" />
                  </motion.span>
                )}
              </span>
              {isSelected && (
                <motion.span
                  layoutId="pill-glow"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-sm"
                />
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-2 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onChange,
  id,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        enabled
          ? "bg-gradient-to-r from-pink-500 to-purple-500"
          : "bg-white/10"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ─── Main Submit Page ────────────────────────────────────────────────────────

function SignInPrompt() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[120px] animate-blob-1 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px] animate-blob-2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-6 max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,144,0.3)]">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-white mb-4">
          Join the Age
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Sign in to submit your ideas and contribute to the collective exploration of humanity&apos;s deepest questions.
        </p>
        <motion.button
          onClick={() => signIn()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-brand-gradient shadow-[0_0_25px_rgba(224,0,110,0.3)] hover:shadow-[0_0_40px_rgba(224,0,110,0.5)] transition-all duration-300"
        >
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </motion.button>
        <p className="text-[10px] text-muted mt-4">
          Or sign in with a magic link sent to your email
        </p>
      </motion.div>
    </div>
  );
}

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Show sign-in prompt while loading or if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <SignInPrompt />
      </>
    );
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmitFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(submitFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      anonymous: false,
    },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const categoryValue = watch("category");
  const anonymousValue = watch("anonymous");

  // ── Rotating quotes ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Handle success redirect ────────────────────────────────────────────
  const handleSuccessComplete = useCallback(() => {
    router.push("/explore");
  }, [router]);

  // ── Submit handler ─────────────────────────────────────────────────────
  const onSubmit: (data: SubmitFormData) => Promise<void> = async (data) => {
    setServerError(null);

    try {
      const res = await fetch("/api/submit-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          anonymous: data.anonymous,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Handle field validation errors
        if (res.status === 422 && errData.fieldErrors) {
          // The form validation should catch these, but just in case:
          setServerError(errData.error || "Validation failed. Please check your inputs.");
          return;
        }
        if (res.status === 429) {
          setServerError("Too many submissions. Please wait before submitting again.");
          return;
        }
        setServerError(errData.error || "Something went wrong. Please try again.");
        return;
      }

      setShowSuccess(true);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-void text-text overflow-hidden font-body relative">
        {/* Ambient background orbs */}
        <div className="fixed top-[10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px] animate-blob-1 pointer-events-none z-0" />
        <div className="fixed bottom-[10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] animate-blob-2 pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
          {/* Back link */}
          <div className="pt-8 px-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-text transition-colors group"
            >
              <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Explore
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start px-6 pt-8 pb-24">
            {/* ── Left Panel: Motivational Copy ─────────────────────────── */}
            <div className="sticky top-28 lg:pt-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-widest uppercase text-muted mb-8">
                  <Sparkles className="h-3 w-3 text-pink-500 animate-pulse" />
                  <span>Submit a Topic</span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[72px] leading-[0.95] uppercase tracking-tight text-white mb-8">
                  Propose an{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-500 to-purple-500">
                    exploration
                  </span>
                </h1>

                <p className="text-muted text-base leading-relaxed max-w-md mb-12">
                  Yugantar is built on ideas that challenge perception. Every
                  great exploration begins with a single question. What&apos;s yours?
                </p>

                {/* Rotating Quote Display */}
                <div className="relative h-[130px] sm:h-[110px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <blockquote className="relative pl-6">
                        {/* Gradient left accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500" />
                        <p className="text-xl sm:text-2xl italic text-white/80 leading-snug mb-3 font-light">
                          &ldquo;{QUOTES[quoteIndex].text}&rdquo;
                        </p>
                        <footer className="text-xs text-muted tracking-wider">
                          {QUOTES[quoteIndex].author}
                        </footer>
                      </blockquote>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Quote dots indicator */}
                <div className="flex gap-2 mt-8">
                  {QUOTES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuoteIndex(idx)}
                      aria-label={`Show quote ${idx + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        idx === quoteIndex
                          ? "w-8 bg-gradient-to-r from-pink-500 to-purple-500"
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right Panel: Form ──────────────────────────────────────── */}
            <div className="lg:pt-4">
              <GlassCard
                gradient="from-[#FF0090] via-[#7B00FF] to-[#FF0090]"
                className="w-full"
                hoverGlow={true}
              >
                <div className="p-6 sm:p-8 md:p-10">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-7"
                    noValidate
                  >
                    {/* ── Server error ────────────────────────────────── */}
                    <AnimatePresence>
                      {serverError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                        >
                          <p className="text-red-400 text-xs font-medium flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                            {serverError}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Title Field ─────────────────────────────────── */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2"
                      >
                        Topic Title
                      </label>
                      <div className="relative group">
                        <input
                          id="title"
                          type="text"
                          aria-label="Topic title"
                          aria-invalid={!!errors.title}
                          aria-describedby={errors.title ? "title-error" : undefined}
                          placeholder="e.g., The Architecture of Silence"
                          className={cn(
                            "w-full bg-transparent border-0 border-b-2 pb-3 pt-2 text-2xl sm:text-3xl font-bold text-white placeholder-muted/40 focus:outline-none focus:ring-0 transition-colors duration-300",
                            errors.title
                              ? "border-transparent"
                              : "border-white/10"
                          )}
                          {...register("title")}
                        />
                        {/* Default bottom bar */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full" />
                        {/* Gradient bottom bar on focus — CSS group-focus-within */}
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 h-[2px] transition-opacity duration-300 bg-gradient-to-r from-pink-500 to-purple-500",
                            errors.title ? "opacity-0" : "opacity-0 group-focus-within:opacity-100"
                          )}
                          style={{ width: "100%" }}
                        />
                        {/* Red gradient bottom bar on error */}
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={errors.title ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-red-500 via-red-400 to-rose-500 origin-left"
                          style={{ transformOrigin: "left" }}
                        />
                      </div>
                      <AnimatePresence mode="wait">
                        {errors.title && (
                          <motion.p
                            id="title-error"
                            key="title-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-red-400 text-xs mt-2 flex items-center gap-1.5"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                            {errors.title.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      {/* Character counter */}
                      <div className="flex justify-end mt-1">
                        <span
                          className={cn(
                            "text-[10px] font-mono transition-colors duration-300",
                            titleValue.length > 120
                              ? "text-red-400"
                              : titleValue.length > 100
                                ? "text-orange-400"
                                : "text-muted"
                          )}
                        >
                          {titleValue.length}/120
                        </span>
                      </div>
                    </div>

                    {/* ── Description Field ───────────────────────────── */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2"
                      >
                        Why does this matter?
                      </label>
                      <div
                        className={cn(
                          "relative rounded-xl transition-all duration-300",
                          errors.description
                            ? "p-[1px] bg-gradient-to-r from-red-500 via-red-400 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                            : ""
                        )}
                      >
                        <div className={cn(errors.description ? "rounded-[11px] bg-void" : "")}>
                          <textarea
                            id="description"
                            aria-label="Why does this matter?"
                            aria-invalid={!!errors.description}
                            aria-describedby={
                              errors.description ? "description-error" : undefined
                            }
                            placeholder="Explain why this idea deserves exploration. What makes it urgent, beautiful, or misunderstood?"
                            rows={4}
                            className={cn(
                              "w-full bg-white/[0.03] border rounded-xl px-4 py-3.5 text-sm text-white placeholder-muted/40 focus:outline-none transition-all duration-300 resize-none",
                              errors.description
                                ? "border-transparent focus:border-transparent"
                                : "border-white/10 focus:border-pink-500/50 focus:shadow-[0_0_15px_rgba(255,0,144,0.05)]"
                            )}
                            {...register("description")}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <AnimatePresence mode="wait">
                          {errors.description && (
                            <motion.p
                              id="description-error"
                              key="description-error"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="text-red-400 text-xs flex items-center gap-1.5"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                              {errors.description.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <span
                          className={cn(
                            "text-[10px] font-mono ml-auto transition-colors duration-300",
                            descriptionValue.length > 280
                              ? "text-red-400"
                              : descriptionValue.length > 240
                                ? "text-orange-400"
                                : "text-muted"
                          )}
                        >
                          {descriptionValue.length}/280
                        </span>
                      </div>
                    </div>

                    {/* ── Category Field ──────────────────────────────── */}
                    <CategoryPills
                      value={categoryValue}
                      onChange={(cat) => setValue("category", cat as SubmitFormData["category"], { shouldValidate: true })}
                      error={errors.category?.message}
                    />

                    {/* ── Anonymous Toggle ────────────────────────────── */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5">
                          {anonymousValue ? (
                            <EyeOff className="h-4 w-4 text-muted" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted" />
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="anonymous-toggle"
                            className="text-sm font-medium text-white cursor-pointer"
                          >
                            Submit anonymously
                          </label>
                          <p className="text-[10px] text-muted mt-0.5">
                            Your name won&apos;t be associated with this topic
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        id="anonymous-toggle"
                        enabled={anonymousValue}
                        onChange={(v) => setValue("anonymous", v)}
                      />
                    </div>

                    {/* ── Submit Button ───────────────────────────────── */}
                    <div className="pt-4">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                        whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                        className={cn(
                          "w-full py-4 rounded-xl font-semibold uppercase tracking-wider text-sm text-white transition-all duration-300 flex items-center justify-center gap-3",
                          isSubmitting
                            ? "bg-white/10 cursor-not-allowed"
                            : "bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_25px_rgba(255,0,144,0.25)] hover:shadow-[0_0_40px_rgba(255,0,144,0.4)]"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4" />
                            Submit for Review
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* ── Success Overlay ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showSuccess && (
            <SuccessOverlay onComplete={handleSuccessComplete} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
