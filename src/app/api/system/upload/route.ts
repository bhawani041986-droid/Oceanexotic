import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ status: "error", message: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const seoName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '');
    const finalFilename = `cms/${Date.now()}-${seoName}`;

    let uploadResult = await supabase.storage
      .from("assets")
      .upload(finalFilename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadResult.error && uploadResult.error.message.includes('Bucket not found')) {
        await supabase.storage.createBucket('assets', { public: true });
        uploadResult = await supabase.storage
          .from("assets")
          .upload(finalFilename, buffer, {
            contentType: file.type,
            upsert: true,
          });
    }

    if (uploadResult.error) {
        throw uploadResult.error;
    }

    let publicUrl = supabase.storage.from("assets").getPublicUrl(finalFilename).data.publicUrl;
    // Proxy through Cloudflare CDN
    publicUrl = publicUrl.replace('https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets', 'https://oceanexotic.com/storage');

    return NextResponse.json({ status: "success", url: publicUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
