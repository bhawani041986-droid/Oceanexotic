import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateObject, translateArray } from '@/lib/translate';

// --- FETCH MERCHANT CATALOG OR SPECIFIC NODE ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const targetLang = request.headers.get('Accept-Language');

    // Get live harbor inventory
    const todayDate = new Date().toISOString().split('T')[0];
    const { data: catches } = await supabase
      .from('todays_catch')
      .select('product_id, batch_label, freshness_timestamp, harbor_node')
      .eq('status', 'FRESH')
      .eq('catch_date', todayDate);

    const liveCatchMap = new Map();
    if (catches) {
      catches.forEach(c => liveCatchMap.set(c.product_id, c));
    }

    if (id) {
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          sellers (
            name
          )
        `)
        .eq('id', id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (!productData) return NextResponse.json({ error: "Asset Not Found" }, { status: 404 });
      
      const liveData = liveCatchMap.get(id);
      const sellerObj = (productData as any).sellers;
      const sellerName = sellerObj?.name || 'OceanExotic Seller';

      let sellerLocation = 'Port Blair, Andaman';
      try {
        const sellerId = productData.seller_id;
        const cleanId = sellerId ? sellerId.replace('SEL-', '') : '';
        const { data: sellerUser } = await supabase
          .from('users')
          .select(`
            territory_id,
            maritime_territories:territory_id (
              name
            )
          `)
          .or(`id.eq.${sellerId},id.eq.${cleanId}`)
          .maybeSingle();

        if (sellerUser && (sellerUser as any).maritime_territories) {
          sellerLocation = (sellerUser as any).maritime_territories.name || sellerLocation;
        }
      } catch (locErr) {
        console.error("Error fetching seller location in API:", locErr);
      }

      let product = { 
        ...productData, 
        seller_name: sellerName,
        sellerName: sellerName,
        seller_location: sellerLocation || liveData?.harbor_node || productData.harbor_node || 'Port Blair, Andaman',
        sellerLocation: sellerLocation || liveData?.harbor_node || productData.harbor_node || 'Port Blair, Andaman',
        is_live_inventory: liveData ? 1 : 0,
        batch_label: liveData?.batch_label,
        freshness_timestamp: liveData?.freshness_timestamp,
        harbor_node: liveData?.harbor_node || productData.harbor_node
      };
      
      if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
        product = await translateObject(product, ['name', 'description', 'category', 'tagline'], targetLang);
      }
      return NextResponse.json(product);
    }

    const { data: productsData, error } = await supabase
      .from('products')
      .select(`
        *,
        sellers (
          name
        )
      `)
      .order('created_at', { ascending: false });
      
      if (error) throw error;
      
    const userIds = Array.from(new Set((productsData || []).map((p: any) => p.seller_id).filter(Boolean)));
    const cleanUserIds = userIds.map(id => id.replace('SEL-', ''));
    const allIds = [...userIds, ...cleanUserIds];
    
    let locationMap = new Map();
    if (allIds.length > 0) {
      try {
        const { data: sellerUsers } = await supabase
          .from('users')
          .select(`
            id,
            territory_id,
            maritime_territories:territory_id (
              name
            )
          `)
          .in('id', allIds);
          
        if (sellerUsers) {
          sellerUsers.forEach((su: any) => {
            if (su.maritime_territories?.name) {
              locationMap.set(su.id, su.maritime_territories.name);
            }
          });
        }
      } catch (locErr) {
        console.error("Error fetching batched seller locations:", locErr);
      }
    }

    let products = (productsData || []).map((p: any) => {
      const liveData = liveCatchMap.get(p.id);
      const sellerId = p.seller_id;
      const cleanId = sellerId ? sellerId.replace('SEL-', '') : '';
      const loc = locationMap.get(sellerId) || locationMap.get(cleanId) || p.harbor_node || 'Port Blair, Andaman';
      const sellerName = p.sellers?.name || 'OceanExotic Seller';
      return {
        ...p,
        seller_name: sellerName,
        sellerName: sellerName,
        seller_location: loc,
        sellerLocation: loc,
        is_live_catch: !!liveData,
        harbor_node: liveData?.harbor_node || p.harbor_node,
        catch_date: todayDate,
        batch_label: liveData?.batch_label
      };
    });

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
      description: description || '',
      landed_at: body.landed_at || null,
      storage_temp: body.storage_temp !== undefined && body.storage_temp !== '' ? Number(body.storage_temp) : null,
      recipes: typeof body.recipes === 'string' ? body.recipes : JSON.stringify(body.recipes || []),
      nutrition: typeof body.nutrition === 'string' ? body.nutrition : JSON.stringify(body.nutrition || {}),
      harbor_node: harbor_node || 'Phoenix Bay Harbor',
      is_live_inventory: !!is_live_inventory,
      quality_rank: body.quality_rank || 'VERIFIED',
      discount_percent: body.discount_percent !== undefined && body.discount_percent !== '' ? Number(body.discount_percent) : 0,
      unit: body.unit || 'kg'
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
      name, category, price, stock, status, image_url, gallery, description,
      landed_at: body.landed_at || null,
      storage_temp: body.storage_temp !== undefined && body.storage_temp !== '' ? Number(body.storage_temp) : null,
      recipes: typeof body.recipes === 'string' ? body.recipes : JSON.stringify(body.recipes || []),
      nutrition: typeof body.nutrition === 'string' ? body.nutrition : JSON.stringify(body.nutrition || {}),
      harbor_node: harbor_node || 'Phoenix Bay Harbor',
      is_live_inventory: !!is_live_inventory,
      quality_rank: body.quality_rank || 'VERIFIED',
      discount_percent: body.discount_percent !== undefined && body.discount_percent !== '' ? Number(body.discount_percent) : 0,
      unit: body.unit || 'kg'
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
