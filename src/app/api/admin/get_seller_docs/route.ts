import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');

    // Return mock documents since we don't have a docs table yet
    const mockDocs = [
      {
        id: 1,
        display_id: 'DOC-GST-001',
        title: 'GST Registration Certificate',
        type: 'TAX_DOCUMENT',
        status: 'VERIFIED',
        file_path: '#'
      },
      {
        id: 2,
        display_id: 'DOC-FSSAI-002',
        title: 'FSSAI License',
        type: 'COMPLIANCE',
        status: 'PENDING',
        file_path: '#'
      }
    ];

    return NextResponse.json(mockDocs);
  } catch (error: any) {
    console.error("Fetch seller docs API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to retrieve dossier: ' + error.message },
      { status: 500 }
    );
  }
}
