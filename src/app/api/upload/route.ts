import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a unique filename
    const fileName = `original/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    
    // Connect to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      });

    if (error) {
        console.error("❌ Supabase Storage Error:", error);
        return NextResponse.json({ error: "Failed to upload to cloud storage" }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("assets").getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    console.log(`✅ Asset Uploaded to Supabase Cloud: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("❌ Maritime Asset Pipeline Error:", error);
    return NextResponse.json({ error: "Failed to upload asset" }, { status: 500 });
  }
}
