"use client";

import React from "react";
import { motion } from "framer-motion";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  borderRadius?: string;
  borderWidth?: string;
  hoverGlow?: boolean;
}

export function GradientBorder({
  children,
  className = "",
  gradient = "from-[#6366F1] via-[#8B5CF6] to-[#F59E0B]",
  borderRadius = "rounded-2xl",
  borderWidth = "p-[1px]",
  hoverGlow = true,
}: GradientBorderProps) {
  return (
    <motion.div
      whileHover={
        hoverGlow
          ? { boxShadow: "0 0 24px rgba(99, 102, 241, 0.25)" }
          : undefined
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative ${borderWidth} bg-gradient-to-r ${gradient} ${borderRadius} overflow-hidden ${className}`}
    >
      <div
        className={`h-full w-full ${borderRadius} overflow-hidden`}
        style={{ background: "var(--color-surface)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
export default GradientBorder;
