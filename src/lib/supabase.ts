import { createBrowserClient, createServerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Creates a Supabase client for use in Client Components (browser environment).
 */
export const createClientSideClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, or Server Actions.
 * Uses dynamic import to prevent browser bundling issues with `next/headers`.
 */
export const createServerSideClient = () => {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Server Components (read-only cookie context)
          }
        },
      },
    });
  }
  throw new Error("createServerSideClient can only be run on the server");
};

/**
 * Creates a Supabase client with the service role key for use in API routes.
 * This bypasses RLS and should only be used on the server.
 */
export const createServiceRoleClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("createServiceRoleClient can only be run on the server");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
