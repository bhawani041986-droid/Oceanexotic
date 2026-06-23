import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error("GET settings error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    const settings: Record<string, any> = {};
    for (const row of data) {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    }

    return NextResponse.json(
      { status: "success", settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store'
        }
      }
    );
  } catch (error: any) {
    console.error("Settings API GET Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = body.settings;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
    }

    // Convert object to rows
    const rowsToUpsert = Object.entries(settings).map(([key, value]) => ({
      setting_key: key,
      setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_at: new Date().toISOString()
    }));

    // Perform upsert (since setting_key is UNIQUE)
    const { error } = await supabase
      .from('marketplace_settings')
      .upsert(rowsToUpsert, { onConflict: 'setting_key' });

    if (error) {
      console.error("POST settings upsert error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "success", message: "Settings synced" });
  } catch (error: any) {
    console.error("Settings API POST Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
