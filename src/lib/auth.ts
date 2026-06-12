import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createServiceRoleClient } from "./supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const authOptions: AuthOptions = {
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@yugantar.app",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async signIn({ user, account: _account }) {
      // On first login, create user in Supabase
      if (user.email) {
        try {
          const supabase = createServiceRoleClient();

          // Check if user exists
          const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (!existing) {
            // Create new user with unique username
            const baseUsername = (user.name || user.email.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .slice(0, 30)
              || "user";

            // Try with base username, append suffix if taken
            let username = baseUsername;
            let attempts = 0;
            while (attempts < 10) {
              const { data: collision } = await supabase
                .from("users")
                .select("id")
                .eq("username", username)
                .single();

              if (!collision) break;
              attempts++;
              username = `${baseUsername}-${Math.floor(Math.random() * 9999)}`;
            }

            await supabase.from("users").insert({
              email: user.email,
              name: user.name || "",
              display_name: user.name || "",
              avatar_url: user.image || "",
              username,
              onboarding_complete: false,
            });
          }
        } catch (err) {
          console.error("Error creating user during sign in:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account: _account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // Fetch additional user data from Supabase
        try {
          const supabase = createServiceRoleClient();
          const { data: userData } = await supabase
            .from("users")
            .select("id, display_name, username, avatar_url, bio, onboarding_complete")
            .eq("email", user.email)
            .single();

          if (userData) {
            token.userId = userData.id;
            token.displayName = userData.display_name;
            token.username = userData.username;
            token.avatarUrl = userData.avatar_url;
            token.bio = userData.bio;
            token.onboardingComplete = userData.onboarding_complete;
          }
        } catch (err) {
          console.error("Error fetching user data for JWT:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.displayName = token.displayName as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = token.avatarUrl as string;
        session.user.bio = token.bio as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
