import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Get all uploaded videos for the admin panel
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('product_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Publish a new showcase video and link it to its product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, video_url, title } = body;

    if (!product_id || !video_url) {
      return NextResponse.json({ error: "Missing product_id or video_url" }, { status: 400 });
    }

    // Insert new product video record
    const { data, error: dbError } = await supabase
      .from('product_videos')
      .insert({
        product_id,
        video_url,
        title: title || "Product Showcase",
        is_active: 1
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Sync product entry with the new video link
    const { error: prodError } = await supabase
      .from('products')
      .update({ video_url })
      .eq('id', product_id);

    if (prodError) throw prodError;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Toggle a video's active/inactive status and sync products
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active, product_id, video_url } = body;

    if (!id || !product_id) {
      return NextResponse.json({ error: "Missing video id or product_id" }, { status: 400 });
    }

    // Toggle status in product_videos
    const { error: dbError } = await supabase
      .from('product_videos')
      .update({ is_active })
      .eq('id', id);

    if (dbError) throw dbError;

    // Sync the products table (nullify if turned off, restore if active)
    const { error: prodError } = await supabase
      .from('products')
      .update({ video_url: is_active === 1 ? video_url : null })
      .eq('id', product_id);

    if (prodError) throw prodError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a showcase video and remove links from the product catalog
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const product_id = searchParams.get('product_id');

    if (!id || !product_id) {
      return NextResponse.json({ error: "Missing target id or product_id" }, { status: 400 });
    }

    // Delete record from product_videos
    const { error: dbError } = await supabase
      .from('product_videos')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Remove video reference from products table
    const { error: prodError } = await supabase
      .from('products')
      .update({ video_url: null })
      .eq('id', product_id);

    if (prodError) throw prodError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
