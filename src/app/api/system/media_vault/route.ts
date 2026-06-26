import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
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
      let publicUrl = supabase.storage.from('assets').getPublicUrl(`optimized/${file.name}`).data.publicUrl;
      // Proxy through Cloudflare CDN
      publicUrl = publicUrl.replace('https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets', 'https://oceanexotic.com/storage');
      
      return {
        id: file.id,
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
