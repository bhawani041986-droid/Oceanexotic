import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM subscribers ORDER BY created_at DESC', [], 'SELECT');
    return NextResponse.json(result.data || []);
  } catch (error: any) {
    console.error("Subscriber Registry Retrieval Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'ID and Status required' }, { status: 400 });

    const newStatus = status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await query('UPDATE subscribers SET status = ? WHERE id = ?', [newStatus, id], 'UPDATE');
    return NextResponse.json({ success: true, newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query('DELETE FROM subscribers WHERE id = ?', [id], 'DELETE');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
