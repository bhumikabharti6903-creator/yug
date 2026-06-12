import type { Metadata } from "next";
import { Bebas_Neue, Syne, Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Yugantar — Ideas That Shift Your Era",
    template: "%s — Yugantar",
  },
  description:
    "An editorial platform inspired by TED, built for cataloging profound theories, cosmic paradoxes, and humanity's deepest inquiries.",
  keywords: ["ideas", "philosophy", "science", "technology", "exploration", "TED", "yugantar"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Yugantar",
    title: "Yugantar — Ideas That Shift Your Era",
    description:
      "An editorial platform for cataloging profound theories and humanity's deepest inquiries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yugantar — Ideas That Shift Your Era",
    description:
      "An editorial platform for cataloging profound theories and humanity's deepest inquiries.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${syne.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent FOUC — default dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('yugantar-theme') || 'dark';
                  if (theme === 'light') document.documentElement.classList.add('light');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased transition-colors duration-300">
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
