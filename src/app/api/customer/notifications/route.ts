import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: Fetch all notifications for a specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ status: "error", message: "User ID is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData, error: userError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (userError) {
      return NextResponse.json({ status: "error", message: userError.message }, { status: 500 });
    }

    const { data: sysData, error: sysError } = await supabase
      .from('system_broadcasts')
      .select('*')
      .in('channel', ['GLOBAL', 'ALL'])
      .eq('status', 'SENT');

    // It's okay if sysError exists (e.g., table not created yet), we just fallback to empty array
    const mappedUserData = (userData || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.is_read,
      time: new Date(n.created_at).toLocaleDateString() + ' ' + new Date(n.created_at).toLocaleTimeString(),
      timestamp: new Date(n.created_at).getTime()
    }));

    const mappedSysData = (sysData || []).map((b: any) => ({
      id: b.id,
      type: b.type,
      title: b.title,
      message: b.content,
      read: false, // Handled locally
      time: new Date(b.created_at).toLocaleDateString() + ' ' + new Date(b.created_at).toLocaleTimeString(),
      timestamp: new Date(b.created_at).getTime()
    }));

    const combinedData = [...mappedUserData, ...mappedSysData].sort((a, b) => b.timestamp - a.timestamp);
    combinedData.forEach(d => { delete (d as any).timestamp; });

    return NextResponse.json({ status: "success", data: combinedData });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

// POST: Mark notification(s) as read, or delete them
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId, userId } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'MARK_ALL_READ' && userId) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      return NextResponse.json({ status: "success", message: "All marked read" });
    } 
    
    if (action === 'MARK_READ' && notificationId) {
      if (notificationId.startsWith('SIG-')) {
         return NextResponse.json({ status: "success", message: "Marked read locally" });
      }
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      return NextResponse.json({ status: "success", message: "Marked read" });
    }

    if (action === 'DELETE' && notificationId) {
      if (notificationId.startsWith('SIG-')) {
         return NextResponse.json({ status: "success", message: "Deleted locally" });
      }
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) throw error;
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ status: "error", message: "Invalid action or missing parameters" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
