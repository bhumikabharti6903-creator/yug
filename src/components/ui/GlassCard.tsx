"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  borderRadius?: string;
  hoverGlow?: boolean;
  blur?: string;
  opacity?: string;
}

export function GlassCard({
  children,
  className = "",
  gradient = "from-[#FF0090] via-[#7B00FF] to-[#FF0090]",
  borderRadius = "rounded-2xl",
  hoverGlow = true,
  blur = "backdrop-blur-xl",
  opacity = "bg-black/40",
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hoverGlow
          ? {
              boxShadow: "0 0 30px rgba(255, 0, 144, 0.2), 0 0 60px rgba(123, 0, 255, 0.1)",
            }
          : undefined
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative p-[1px] bg-gradient-to-r overflow-hidden",
        gradient,
        borderRadius,
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden relative",
          borderRadius,
          opacity,
          blur
        )}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;
