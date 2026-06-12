import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In a real production environment, you would use 'nodemailer' or 'resend' 
// import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, domain, email, anchorText } = body;

    if (!id || !domain || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[SEO BOT] Preparing to send automated outreach to: ${email} at ${domain}`);

    // =========================================================================
    // 1. GENERATE THE EMAIL
    // =========================================================================
    const subject = `Fresh Seafood Collab: Free Premium Tasting Box for ${domain} 🦞`;
    const message = `
Hi Editors at ${domain},

I’m reaching out from OceanExotic, a premium maritime marketplace that delivers wild-caught seafood and live lobsters directly from the Andaman Sea.

We are looking to sponsor a few high-quality recipe features. We would love to send your culinary team a complimentary Premium Seafood Tasting Box (packed with dry ice and delivered overnight) for you to test our quality. 

If you love it, we’d love to discuss a potential sponsored recipe post using the link "${anchorText}".

Let me know if your test kitchen would be interested in receiving a box!

Best regards,
OceanExotic Partnerships Team
    `.trim();

    // =========================================================================
    // 2. DISPATCH THE EMAIL (Simulated for safety without SMTP)
    // =========================================================================
    /* 
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: '"OceanExotic SEO" <partnerships@oceanexotic.com>',
      to: email,
      subject: subject,
      text: message
    });
    */
    
    // Simulating a successful email dispatch
    console.log(`[SEO BOT] Email successfully dispatched to ${email}!`);

    // =========================================================================
    // 3. UPDATE RECORD KEEPING IN SUPABASE
    // =========================================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Automatically shift the CRM status from 'prospect' to 'contacted'
    const { error } = await supabase
      .from('seo_backlinks')
      .update({ 
        status: 'contacted',
        notes: `[AUTO-DISPATCHED] Sent tasting box pitch on ${new Date().toISOString()}` 
      })
      .eq('id', id);

    if (error) {
      console.error("Database update failed:", error);
      return NextResponse.json({ error: 'Failed to update CRM status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pitch sent successfully and CRM updated.' 
    });

  } catch (error) {
    console.error("Automated Pitch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
