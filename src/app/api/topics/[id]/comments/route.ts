import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

// ─── GET: List comments for a topic (flat, sorted by creation) ─────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing topic ID" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("topic_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Comments fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: data ?? [] });
  } catch (err) {
    console.error("Unexpected comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST: Create a new comment (or reply) ─────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing topic ID" }, { status: 400 });
    }

    const body = await request.json();
    const { content, author, parent_id } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 422 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be 2000 characters or fewer" },
        { status: 422 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        topic_id: id,
        content: content.trim(),
        author: (author || "Anonymous").trim().slice(0, 60) || "Anonymous",
        parent_id: parent_id || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Comment insert error:", error);
      return NextResponse.json(
        { error: "Failed to post comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected comment create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
