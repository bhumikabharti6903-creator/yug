import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function POST(
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
      .from("topics")
      .select("upvotes")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const newCount = (data.upvotes ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("topics")
      .update({ upvotes: newCount })
      .eq("id", id);

    if (updateError) {
      console.error("Upvote update error:", updateError);
      return NextResponse.json(
        { error: "Failed to upvote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ upvotes: newCount });
  } catch (err) {
    console.error("Unexpected upvote error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
