import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      displayName?: string;
      username?: string;
      avatarUrl?: string;
      bio?: string;
      onboardingComplete?: boolean;
    };
  }

  interface User {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    onboardingComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    onboardingComplete?: boolean;
  }
}
