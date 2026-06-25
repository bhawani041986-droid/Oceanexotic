import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("recipe_id");
    if (!id) {
      return NextResponse.json({ status: "error", message: "Missing recipe_id parameter" }, { status: 400 });
    }

    // Query interactions for this recipe
    const { data, error } = await supabase
      .from("recipe_interactions")
      .select("*")
      .eq("recipe_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const likesCount = data.filter((d: any) => d.interaction_type === "LIKE").length;
    const comments = data
      .filter((d: any) => d.interaction_type === "COMMENT")
      .map((c: any) => ({
        id: c.id,
        user: c.user_name || "Guest Chef",
        avatar: c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || "Guest Chef")}&background=random`,
        text: c.comment_text || "",
        time: new Date(c.created_at).toLocaleDateString(),
        rating: c.rating_value || 5,
      }));

    return NextResponse.json({
      status: "success",
      likesCount,
      comments,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipe_id, user_name, user_avatar, interaction_type, comment_text, rating_value } = body;

    if (!recipe_id || !interaction_type) {
      return NextResponse.json({ status: "error", message: "Missing recipe_id or interaction_type" }, { status: 400 });
    }

    if (!["LIKE", "COMMENT"].includes(interaction_type)) {
      return NextResponse.json({ status: "error", message: "Invalid interaction_type" }, { status: 400 });
    }

    const payload: any = {
      recipe_id,
      user_name: user_name || (interaction_type === "LIKE" ? "Guest User" : "Guest Chef"),
      interaction_type,
    };

    if (interaction_type === "COMMENT") {
      payload.comment_text = comment_text || "";
      payload.rating_value = rating_value || 5;
      if (user_avatar) {
        payload.user_avatar = user_avatar;
      }
    }

    const { error } = await supabase.from("recipe_interactions").insert([payload]);
    if (error) throw error;

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
