import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Addons GET error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Addons API GET Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ...rest } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "save") {
      if (id) {
        // Update existing
        const { error } = await supabase
          .from('addons')
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
        return NextResponse.json({ status: "success", message: "Add-on successfully updated." });
      } else {
        // Create new
        const newId = 'ADDON-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const { error } = await supabase
          .from('addons')
          .insert({ id: newId, ...rest });
        
        if (error) throw error;
        return NextResponse.json({ status: "success", message: "Add-on successfully commissioned." });
      }
    } else if (action === "toggle_active") {
      const { error } = await supabase
        .from('addons')
        .update({ is_active: rest.is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return NextResponse.json({ status: "success", message: "Add-on status synchronized." });
    } else if (action === "delete") {
      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return NextResponse.json({ status: "success", message: "Add-on successfully decommissioned." });
    }

    return NextResponse.json({ status: "error", message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Addons API POST Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
