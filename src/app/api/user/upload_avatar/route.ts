import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("user_id") as string;

    if (!file || !userId) {
      return NextResponse.json({ success: false, message: "Missing file or user_id" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `avatars/${userId}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true
      });

    if (error) {
        console.error("❌ Avatar Upload Error:", error);
        return NextResponse.json({ success: false, message: "Failed to upload to cloud storage" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from("assets").getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    // Update User Database
    const { error: dbError } = await supabase
      .from("users")
      .update({ avatar: publicUrl })
      .eq("id", userId);

    if (dbError) {
      console.error("❌ Avatar DB Update Error:", dbError);
      return NextResponse.json({ success: false, message: "Failed to update user profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, avatar_url: publicUrl });
  } catch (error) {
    console.error("❌ Profile Avatar Pipeline Error:", error);
    return NextResponse.json({ success: false, message: "Failed to process avatar" }, { status: 500 });
  }
}
