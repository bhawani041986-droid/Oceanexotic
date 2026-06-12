/**
 * SOVEREIGN BROADCAST UTILITY
 * Handles multi-platform social media distribution for approved harvests.
 */

export interface BroadcastPayload {
  id: string;
  name: string;
  category: string;
  price: string;
  image_url: string;
  description: string;
}

export async function broadcastHarvest(product: BroadcastPayload) {
  console.log(`[BROADCAST] Initiating social dispatch for ${product.name}...`);

  const message = `🌊 NEW HARVEST ALERT: ${product.name}
📦 Category: ${product.category}
💰 Price: ₹${product.price}
⚓ Direct from OceanExotic Fleet.

Explore the catch: https://oceanexotic.com/customer/products/${product.id}`;

  const endpoints = [
    // Webhook Bridge (Zapier/Make.com)
    { name: 'System Webhook', url: process.env.NEXT_PUBLIC_SOCIAL_WEBHOOK },
    // Direct Telegram Dispatch
    { name: 'Telegram Fleet Bot', url: `https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, method: 'POST', body: { chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID, text: message } }
  ];

  const results = await Promise.allSettled(
    endpoints
      .filter(e => e.url)
      .map(async (e) => {
        const response = await fetch(e.url as string, {
          method: e.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(e.body || { 
            message,
            product_id: product.id,
            product_name: product.name,
            image: product.image_url,
            url: `https://oceanexotic.com/customer/products/${product.id}`
          })
        });
        if (!response.ok) throw new Error(`${e.name} handshake failed`);
        return e.name;
      })
  );

  return results;
}
