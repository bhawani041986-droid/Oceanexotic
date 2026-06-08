import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product Detail API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
