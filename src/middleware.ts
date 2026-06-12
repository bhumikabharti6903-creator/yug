import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the submit page to render — the client component handles
    // showing the sign-in prompt overlay for unauthenticated users
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only apply middleware to /submit — return true to allow
      // the page to render (the sign-in overlay handles protection)
      authorized: ({ token }) => {
        return true; // Always allow — client-side handles auth UI
      },
    },
  }
);

export const config = {
  matcher: ["/submit"],
};
