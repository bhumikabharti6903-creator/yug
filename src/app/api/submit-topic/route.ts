import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase";

// ─── Validation Schema ───────────────────────────────────────────────────────

const CATEGORIES = [
  "Philosophy",
  "Science",
  "Society",
  "Technology",
  "Art",
  "Economy",
  "Identity",
] as const;

const submitTopicSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(280, "Description must be 280 characters or fewer"),
  category: z.enum(CATEGORIES),
  anonymous: z.boolean().optional().default(false),
  submitted_by: z.string().optional(),
});

export type SubmitTopicInput = z.infer<typeof submitTopicSchema>;

// ─── Rate Limiting (in-memory) ───────────────────────────────────────────────

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

// Clean up stale entries periodically (every 10 minutes) — only in Node.js runtime
if (typeof setInterval === "function" && typeof process !== "undefined" && process.release?.name === "node") {
  const interval = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
  if (typeof interval === "object" && "unref" in interval) {
    interval.unref();
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit check ──────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = getRateLimitInfo(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many submissions. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // ── Parse and validate body ───────────────────────────────────────────
    const body = await request.json();
    const parsed = submitTopicSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors,
        },
        { status: 422 }
      );
    }

    const { title, description, category, anonymous, submitted_by } = parsed.data;

    // ── Insert into Supabase ──────────────────────────────────────────────
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("topics")
      .insert({
        title,
        description,
        category,
        status: "pending",
        submitted_by: anonymous ? null : submitted_by || null,
        tags: [category],
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit topic. Please try again." },
        { status: 500 }
      );
    }

    // ── Success response ──────────────────────────────────────────────────
    return NextResponse.json(
      {
        id: data.id,
        message: "Your idea has entered the age.",
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error in submit-topic:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
