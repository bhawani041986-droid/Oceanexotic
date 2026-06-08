import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH MERCHANT CATALOG OR SPECIFIC NODE ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (!productData) return NextResponse.json({ error: "Asset Not Found" }, { status: 404 });
      
      const product = { ...productData, seller_name: '' };
      return NextResponse.json(product);
    }

    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const products = (productsData || []).map((p: any) => ({
      ...p,
      seller_name: ''
    }));
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- CREATE/COMMISSION NEW PRODUCT ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, stock, status, image_url, gallery, description, seller_id } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ error: "Missing Product Identity Nodes" }, { status: 400 });
    }

    const resolvedSellerId = seller_id || 'SEL-001';

    const { error } = await supabase.from('products').insert([{
      id,
      seller_id: resolvedSellerId,
      name,
      category: category || 'PREMIUM SAKU',
      price,
      stock: stock || 100,
      status: status || 'ACTIVE',
      image_url: image_url || '',
      gallery: gallery || '[]',
      description: description || ''
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Harvest commissioned in Sovereign Registry" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// --- UPDATE ASSET NODE ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, stock, status, image_url, gallery, description } = body;

    if (!id) return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });

    const { error } = await supabase.from('products').update({
      name, category, price, stock, status, image_url, gallery, description
    }).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Asset Node Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- DECOMMISSION ASSET ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Asset Purged from Registry" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
