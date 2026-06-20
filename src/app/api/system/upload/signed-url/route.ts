import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
       return NextResponse.json({ status: 'error', message: 'Missing Supabase Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ status: "error", message: "Missing fileName" }, { status: 400 });
    }

    // Generate signed upload URL bypassing RLS
    const { data, error } = await supabase.storage
      .from('assets')
      .createSignedUploadUrl(fileName);

    if (error) {
      if (error.message.includes('Bucket not found')) {
         await supabase.storage.createBucket('assets', { public: true });
         const retry = await supabase.storage.from('assets').createSignedUploadUrl(fileName);
         if (retry.error) throw retry.error;
         return NextResponse.json({ status: "success", data: retry.data });
      }
      throw error;
    }

    return NextResponse.json({ status: "success", data });
  } catch (error: any) {
    console.error("Signed URL generation failed:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
