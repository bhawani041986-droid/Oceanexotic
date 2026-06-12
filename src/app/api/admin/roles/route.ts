import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ROLES_SETTING_KEY = 'RBAC_ROLES';

const DEFAULT_ROLES = [
  { id: "ROLE-ADMIN", name: "System Admiral", users: 0, level: "LEVEL 10 (TOTAL)", status: "ACTIVE" },
  { id: "ROLE-SELLER", name: "Marketplace Overseer", users: 0, level: "LEVEL 7 (GOVERNANCE)", status: "ACTIVE" },
  { id: "ROLE-AGENT", name: "Logistics Node", users: 0, level: "LEVEL 5 (DELIVERY)", status: "ACTIVE" },
  { id: "ROLE-CUSTOMER", name: "Global Citizen", users: 0, level: "LEVEL 1 (BASIC)", status: "ACTIVE" }
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('setting_value')
      .eq('setting_key', ROLES_SETTING_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data || !data.setting_value) {
      // Return default if not initialized
      return NextResponse.json(DEFAULT_ROLES);
    }

    return NextResponse.json(JSON.parse(data.setting_value));
  } catch (error: any) {
    console.error("Fetch Roles API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to fetch roles: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { roles } = await request.json();

    if (!Array.isArray(roles)) {
      return NextResponse.json({ status: 'error', message: 'Roles must be an array' }, { status: 400 });
    }

    // Upsert into marketplace_settings
    const { error } = await supabase
      .from('marketplace_settings')
      .upsert({ 
        setting_key: ROLES_SETTING_KEY, 
        setting_value: JSON.stringify(roles),
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'success', message: 'Roles registry updated successfully' });
  } catch (error: any) {
    console.error("Update Roles API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to update roles: ' + error.message },
      { status: 500 }
    );
  }
}
