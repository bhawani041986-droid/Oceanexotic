import { NextRequest, NextResponse } from 'next/server';
import { getPhpServerUrl } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/reviews/create.php`;
    
    const response = await fetch(phpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Create Review API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
