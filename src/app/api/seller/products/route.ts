import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateObject, translateArray } from '@/lib/translate';

// --- FETCH MERCHANT CATALOG OR SPECIFIC NODE ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const targetLang = request.headers.get('Accept-Language');

    if (id) {
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (!productData) return NextResponse.json({ error: "Asset Not Found" }, { status: 404 });
      
      let product = { ...productData, seller_name: '' };
      if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
        product = await translateObject(product, ['name', 'description', 'category', 'tagline'], targetLang);
      }
      return NextResponse.json(product);
    }

    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    let products = (productsData || []).map((p: any) => ({
      ...p,
      seller_name: ''
    }));

    if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
      products = await translateArray(products, ['name', 'description', 'category', 'tagline'], targetLang);
    }
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- CREATE/COMMISSION NEW PRODUCT ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, name, category, price, stock, status, image_url, gallery, description, seller_id,
      is_live_inventory, catch_time, batch_label, harbor_node
    } = body;

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

    // --- SYNCHRONIZE WITH LIVE HARBOR INVENTORY ---
    if (is_live_inventory) {
      const todayDate = new Date().toISOString().split('T')[0];
      const timeStr = catch_time || "05:30";
      const freshnessDate = new Date(`${todayDate}T${timeStr}:00.000Z`);
      const expiryDate = new Date(freshnessDate.getTime() + 24 * 60 * 60 * 1000);

      await supabase.from('todays_catch').insert({
        id: `CTH-${id}-${Date.now().toString().slice(-4)}`,
        product_id: id,
        seller_id: resolvedSellerId,
        catch_date: todayDate,
        harbor_node: harbor_node || 'Phoenix Bay Harbor',
        quantity_kg: stock || 50,
        remaining_kg: stock || 50,
        price_per_kg: price || 0,
        freshness_timestamp: freshnessDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        catch_image_url: image_url || '',
        batch_label: batch_label || 'MORNING',
        status: 'FRESH'
      });
    }

    return NextResponse.json({ success: true, message: "Harvest commissioned in System Registry" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// --- UPDATE ASSET NODE ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, name, category, price, stock, status, image_url, gallery, description,
      seller_id, is_live_inventory, catch_time, batch_label, harbor_node
    } = body;

    if (!id) return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });

    const { error } = await supabase.from('products').update({
      name, category, price, stock, status, image_url, gallery, description
    }).eq('id', id);

    if (error) throw error;

    // --- SYNCHRONIZE WITH LIVE HARBOR INVENTORY ---
    if (is_live_inventory) {
      // Calculate freshness timestamp combining today's date and the given catch_time
      const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = catch_time || "05:30";
      const freshnessDate = new Date(`${todayDate}T${timeStr}:00.000Z`);
      
      // Expire exactly 24 hours after catch
      const expiryDate = new Date(freshnessDate.getTime() + 24 * 60 * 60 * 1000);

      // Generate a unique Catch ID if needed, or upsert by product_id
      // We will check if there's already an active catch for this product today
      const { data: existingCatch } = await supabase
        .from('todays_catch')
        .select('id')
        .eq('product_id', id)
        .eq('catch_date', todayDate)
        .single();

      const catchPayload = {
        product_id: id,
        seller_id: seller_id || 'SEL-001',
        catch_date: todayDate,
        harbor_node: harbor_node || 'Phoenix Bay Harbor',
        quantity_kg: stock || 50,
        remaining_kg: stock || 50,
        price_per_kg: price || 0,
        freshness_timestamp: freshnessDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        catch_image_url: image_url || '',
        batch_label: batch_label || 'MORNING',
        status: 'FRESH'
      };

      if (existingCatch) {
        await supabase.from('todays_catch').update(catchPayload).eq('id', existingCatch.id);
      } else {
        await supabase.from('todays_catch').insert({
          id: `CTH-${id}-${Date.now().toString().slice(-4)}`,
          ...catchPayload
        });
      }
    } else {
      // If turned off, pull it from live inventory
      await supabase.from('todays_catch')
        .update({ status: 'ARCHIVED' })
        .eq('product_id', id);
    }

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
