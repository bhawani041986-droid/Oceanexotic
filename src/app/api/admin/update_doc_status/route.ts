import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { status: "error", message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock success response
    return NextResponse.json({
      status: "success",
      db_status: status
    });
  } catch (error: any) {
    console.error("Update doc status API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to update credential status: ' + error.message },
      { status: 500 }
    );
  }
}
