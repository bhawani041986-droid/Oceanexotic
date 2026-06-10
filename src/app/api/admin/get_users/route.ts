import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedUsers = users.map(user => {
      const joinedDate = user.created_at ? new Date(user.created_at) : new Date();
      
      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rank: user.role === 'seller' ? 'Level 2 Node' : 'Level 1 Node',
        orders: 0,
        joined: joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
    });

    // Inject Fleet Agents so Admin can chat with them
    formattedUsers.push({
      id: 'FLEET-8',
      name: 'Agent Maverick (Fleet 8)',
      email: 'maverick@oceanexotic.fleet',
      role: 'Agent',
      status: 'active',
      rank: 'Level 3 Delivery Node',
      orders: 142,
      joined: 'Oct 12, 2025'
    });

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error("Fetch users API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to sync registry: ' + error.message },
      { status: 500 }
    );
  }
}
