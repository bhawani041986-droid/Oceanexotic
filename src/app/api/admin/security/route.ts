import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('setting_value')
      .eq('setting_key', 'security_config')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for "no rows returned"
      throw error;
    }

    // Default configuration if not found
    const defaultConfig = {
      mfaMethods: [
        { label: "Biometric Handshake", desc: "Require FaceID/TouchID for admin nodes.", active: true },
        { label: "Authenticator App (TOTP)", desc: "Mandatory 6-digit dynamic signal codes.", active: true },
        { label: "SMS Fallback Registry", desc: "Emergency backup via authorized mobile nodes.", active: false },
        { label: "Hardware Security Key", desc: "Support for YubiKey / FIDO2 protocols.", active: false },
      ],
      ipWhitelist: "",
      sessionTimeout: "30 MINUTES",
      maxLoginAttempts: "5 ATTEMPTS"
    };

    const config = data && data.setting_value ? JSON.parse(data.setting_value) : defaultConfig;

    return NextResponse.json({ status: 'success', config });
  } catch (error: any) {
    console.error("Fetch security config API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to fetch security config: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { error } = await supabase
      .from('marketplace_settings')
      .upsert(
        { 
          setting_key: 'security_config', 
          setting_value: JSON.stringify(body),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'setting_key' }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Update security config API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to update security config: ' + error.message },
      { status: 500 }
    );
  }
}
