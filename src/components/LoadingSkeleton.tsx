"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("rounded-lg bg-white/5", className)}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="p-[1px] bg-gradient-to-r from-[#E0006E]/20 via-[#FF6A00]/20 to-[#7B00FF]/20 rounded-2xl overflow-hidden">
      <div className="h-[260px] bg-[#000000] rounded-2xl p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Pulse className="h-4 w-16 rounded-full" />
            <Pulse className="h-4 w-20 rounded-full" />
          </div>
          <Pulse className="h-8 w-3/4" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TopicDetailSkeleton() {
  return (
    <div className="min-h-screen bg-void">
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <Pulse className="h-6 w-40 rounded-full mb-8" />
        <Pulse className="h-16 sm:h-20 md:h-24 w-full max-w-3xl mb-6" />
        <Pulse className="h-5 w-full max-w-xl mb-4" />
        <Pulse className="h-5 w-3/4 max-w-lg mb-8" />
        <div className="flex items-center gap-4 mt-4">
          <Pulse className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Pulse className="h-48 w-full rounded-2xl" />
            <Pulse className="h-24 w-full rounded-2xl" />
            <Pulse className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Pulse className="h-6 w-40" />
            <Pulse className="h-32 w-full rounded-xl" />
            <Pulse className="h-32 w-full rounded-xl" />
            <Pulse className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <Pulse className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-3 w-16" />
        </div>
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
          <Pulse className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <Pulse className="h-8 w-48 mx-auto md:mx-0" />
            <Pulse className="h-4 w-32 mx-auto md:mx-0" />
            <Pulse className="h-4 w-64 mx-auto md:mx-0" />
          </div>
          <Pulse className="h-16 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <TopicCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
