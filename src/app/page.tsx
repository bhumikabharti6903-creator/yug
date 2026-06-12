import React from "react";
import { createServerSideClient } from "@/lib/supabase";
import LandingPageContent from "@/components/LandingPageContent";

// Prevent static generation caching so database reads are dynamic
export const revalidate = 0;

interface Topic {
  id: string;
  title: string;
  tags: string[];
  upvotes: number;
  description?: string;
  meaning?: string;
  submitted_by?: string;
}

const fallbackTopics: Topic[] = [
  {
    id: "1",
    title: "The Architecture of Silence",
    tags: ["Silence", "Cognition", "Neuroscience", "Architecture"],
    upvotes: 342,
    description: "How physical spaces of absolute quiet are reshaping modern neuroscience and cognitive recovery in hyper-connected cities.",
    submitted_by: "Aria Vance",
  },
  {
    id: "2",
    title: "Algorithmic Animism",
    tags: ["Artificial Intelligence", "Philosophy", "Psychology"],
    upvotes: 215,
    description: "Exploring the human psychological tendency to assign spiritual agency and consciousness to LLMs and autonomous systems.",
    submitted_by: "Dr. Vikram K.",
  },
  {
    id: "3",
    title: "Chronobiology and the 28-Hour Day",
    tags: ["Chronobiology", "Space Travel", "Performance"],
    upvotes: 189,
    description: "Re-engineering human circadian biology for long-duration space flight and deep-submergence naval operations.",
    submitted_by: "Cmdr. Sarah Cole",
  },
  {
    id: "4",
    title: "The Great Filter & Civilization Lifespans",
    tags: ["Fermi Paradox", "Cosmology", "Astrobiology"],
    upvotes: 482,
    description: "Exploring Robin Hanson's hypothesis on why we haven't encountered advanced alien civilizations yet.",
    submitted_by: "Dr. Elena Rostova",
  },
  {
    id: "5",
    title: "Time Dilation Around Gargantua",
    tags: ["Relativity", "Black Holes", "Astrophysics"],
    upvotes: 315,
    description: "How extreme gravitational forces near black holes alter the local spacetime metric relative to external observers.",
    submitted_by: "Kip Thorne (M)",
  },
  {
    id: "6",
    title: "Metamodernism & Digital Nostalgia",
    tags: ["Sociology", "Culture", "Digital Art"],
    upvotes: 97,
    description: "How online communities leverage aesthetics from the early web to navigate current socio-political transitions.",
    submitted_by: "Jamie Lin",
  },
];

export default async function Page() {
  const supabase = createServerSideClient();
  let dbTopics: Topic[] = [];

  try {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && !error) {
      dbTopics = (data as {
        id: string;
        title: string;
        tags?: string[];
        upvotes?: number;
        description?: string;
        meaning?: string;
        submitted_by?: string;
      }[]).map((t) => ({
        id: t.id,
        title: t.title,
        tags: t.tags || [],
        upvotes: t.upvotes || 0,
        description: t.description || "",
        meaning: t.meaning || "",
        submitted_by: t.submitted_by || "Anonymous",
      }));
    }
  } catch (e) {
    console.error("Failed to query Supabase database in Server Component:", e);
  }

  // Also fetch top-upvoted topics for "Featured Ideas"
  let featuredTopics: Topic[] = [];
  try {
    const { data: featured } = await supabase
      .from("topics")
      .select("*")
      .order("upvotes", { ascending: false })
      .limit(4);

    if (featured) {
      featuredTopics = featured.map((t) => ({
        id: t.id,
        title: t.title,
        tags: t.tags || [],
        upvotes: t.upvotes || 0,
        description: t.description || "",
        meaning: t.meaning || "",
        submitted_by: t.submitted_by || "Anonymous",
      }));
    }
  } catch {
    // silent
  }

  // Fallback to gorgeous mocked entries if Supabase database query returns empty or fails
  const displayTopics = dbTopics.length > 0 ? dbTopics : fallbackTopics;
  const displayFeatured = featuredTopics.length > 0 ? featuredTopics : fallbackTopics.slice(0, 4);

  return <LandingPageContent topics={displayTopics} featuredTopics={displayFeatured} />;
}
