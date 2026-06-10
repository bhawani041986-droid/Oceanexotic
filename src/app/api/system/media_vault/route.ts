import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
       return NextResponse.json({ status: 'success', assets: [] }); // Graceful fallback
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    // Attempt to list files from the 'assets' bucket
    const { data, error } = await supabase.storage.from('assets').list('optimized', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
       // If the bucket doesn't exist, we will mock it gracefully for the UI
       if (error.message.includes('Bucket not found') || error.message.includes('not exist')) {
           return NextResponse.json({
             status: 'success',
             assets: []
           });
       }
       throw error;
    }

    const assets = (data || []).filter(file => file.name !== '.emptyFolderPlaceholder').map(file => {
      const publicUrl = supabase.storage.from('assets').getPublicUrl(`optimized/${file.name}`).data.publicUrl;
      return {
        name: file.name,
        size_kb: Math.round((file.metadata?.size || 0) / 1024),
        url: publicUrl,
        created_at: file.created_at
      };
    });

    return NextResponse.json({
      status: 'success',
      assets
    });
  } catch (error: any) {
    console.error("Vault Sync Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
