import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// --- FETCH MERCHANT CATALOG OR SPECIFIC NODE ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await queryOne(
        "SELECT p.*, s.name as seller_name FROM products p LEFT JOIN sellers s ON p.seller_id = s.id WHERE p.id = ?",
        [id]
      );
      if (!product) return NextResponse.json({ error: "Asset Not Found" }, { status: 404 });
      return NextResponse.json(product);
    }

    const products = await query(
      "SELECT p.*, s.name as seller_name FROM products p LEFT JOIN sellers s ON p.seller_id = s.id ORDER BY p.created_at DESC"
    );
    return NextResponse.json(products.data);
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

    await query(
      "INSERT INTO products (id, seller_id, name, category, price, stock, status, image_url, gallery, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, resolvedSellerId, name, category || 'PREMIUM SAKU', price, stock || 100, status || 'ACTIVE', image_url || '', gallery || '[]', description || ''],
      'INSERT'
    );

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

    await query(
      "UPDATE products SET name = ?, category = ?, price = ?, stock = ?, status = ?, image_url = ?, gallery = ?, description = ? WHERE id = ?",
      [name, category, price, stock, status, image_url, gallery, description, id],
      'UPDATE'
    );

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

    await query("DELETE FROM products WHERE id = ?", [id], 'DELETE');

    return NextResponse.json({ success: true, message: "Asset Purged from Registry" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
