import { NextRequest, NextResponse } from "next/server";

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing topic ID" }, { status: 400 });
    }

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // We need the topic title + description to send to Claude.
    // Import supabase dynamically to avoid edge bundling issues.
    const { createServiceRoleClient } = await import("@/lib/supabase");
    const supabase = createServiceRoleClient();

    const { data: topic, error } = await supabase
      .from("topics")
      .select("title, description, tags, category")
      .eq("id", id)
      .single();

    if (error || !topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const prompt = `You are a brilliant explainer. Given the following topic idea, write exactly three sentences in plain English that explain what this idea means and why it matters. Be clear, profound, and accessible — like a TED speaker distilling a complex idea.

Title: "${topic.title}"
Description: "${topic.description || "No description provided."}"
Category: ${topic.category || "General"}
Tags: ${(topic.tags || []).join(", ")}

Write exactly three sentences, no more, no less. Do not use markdown or headings.`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("Claude API error:", response.status, errBody);
      return NextResponse.json(
        { error: "Failed to generate explanation" },
        { status: 502 }
      );
    }

    const data = await response.json();

    const explanation: string =
      data?.content?.[0]?.text || "Unable to generate explanation.";

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("Unexpected explain error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
