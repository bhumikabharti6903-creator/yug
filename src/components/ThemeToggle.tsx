"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Read initial theme from localStorage
    const stored = localStorage.getItem("yugantar-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("yugantar-theme", next ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300",
        dark
          ? "bg-white/5 text-muted hover:bg-white/10 hover:text-text"
          : "bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
      )}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
