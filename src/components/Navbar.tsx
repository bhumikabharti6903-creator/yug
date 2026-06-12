"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Menu, X, LogOut, Sparkles, Mail, Chrome,
  User, ChevronDown, BookOpen, PenSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

/* ─── Login Modal ─── */
function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setLoading(false);
    setEmailSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-brand-gradient" />

        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
        />

        <div className="relative p-8">
          {/* Close */}
          <button
            onClick={onClose}
            id="login-modal-close"
            className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors hover:bg-white/5 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gradient-subtle border border-[var(--color-border)] mb-4">
              <Sparkles className="h-5 w-5 text-[var(--color-indigo-light)]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
              Welcome to Yugantar
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Sign in to share and explore ideas
            </p>
          </div>

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--color-text)] mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                We sent a magic link to <span className="text-[var(--color-indigo-light)]">{email}</span>.
                Click it to sign in instantly.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="mt-6 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Google */}
              <button
                id="login-google-btn"
                onClick={() => signIn("google")}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm text-[var(--color-text)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-border-hover)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                <Chrome className="h-4 w-4" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-muted)] font-medium">or</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--color-indigo)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <button
                  id="login-email-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-gradient hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ boxShadow: "var(--glow-indigo)" }}
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[10px] text-[var(--color-muted)] pt-1">
                By signing in, you agree to our{" "}
                <span className="text-[var(--color-indigo-light)] cursor-pointer hover:underline">Terms</span>
                {" & "}
                <span className="text-[var(--color-indigo-light)] cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Navbar ─── */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { name: "Explore", href: "/", icon: BookOpen },
    { name: "Submit", href: "/submit", icon: PenSquare },
  ];

  return (
    <>
      <AnimatePresence>
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      </AnimatePresence>

      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? "rgba(6,7,13,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-7xl h-[68px] items-center justify-between px-5 md:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="navbar-logo">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
              style={{ background: "var(--brand-gradient)" }}
            >
              Y
            </div>
            <span
              className="font-display text-xl font-bold tracking-wider transition-all duration-300"
              style={{ color: "var(--color-text)" }}
            >
              YUGANTAR
            </span>
            <span className="relative flex h-1.5 w-1.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-indigo)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-indigo)]" />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                id={`nav-link-${link.name.toLowerCase()}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200"
                style={{ color: "var(--color-text-2)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-2)"; e.currentTarget.style.background = "transparent"; }}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/u/${(session.user as { username?: string }).username || "me"}`}
                  id="nav-profile-link"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ border: "1px solid var(--color-border)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-border-hover)"; e.currentTarget.style.background = "var(--color-surface-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--brand-gradient)" }}
                  >
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline" style={{ color: "var(--color-text)" }}>
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3" style={{ color: "var(--color-muted)" }} />
                </Link>
                <button
                  id="nav-signout-btn"
                  onClick={() => signOut()}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ color: "var(--color-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.background = "transparent"; }}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: "var(--brand-gradient)", boxShadow: "var(--glow-indigo-sm)" }}
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {!session?.user && (
              <button
                id="mobile-signin-btn"
                onClick={() => setLoginOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--brand-gradient)" }}
              >
                Sign In
              </button>
            )}
            <button
              id="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.background = "var(--color-surface-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.background = "transparent"; }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
              style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="px-5 py-6 flex flex-col gap-2">
                {links.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      id={`mobile-nav-${link.name.toLowerCase()}`}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{ color: "var(--color-text-2)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--color-text)"; e.currentTarget.style.background = "var(--color-surface-2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--color-text-2)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-2 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                  {session?.user ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/u/${(session.user as { username?: string }).username || "me"}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        style={{ background: "var(--color-surface-2)" }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: "var(--brand-gradient)" }}
                        >
                          {(session.user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{session.user.name}</p>
                          <p className="text-xs" style={{ color: "var(--color-muted)" }}>View Profile</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => { signOut(); setIsOpen(false); }}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setLoginOpen(true); setIsOpen(false); }}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{ background: "var(--brand-gradient)", boxShadow: "var(--glow-indigo-sm)" }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Sign In to Yugantar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Navbar;
