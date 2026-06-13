const supabaseUrl = 'https://iklzcaqqvbrfxevufebi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHpjYXFxdmJyZnhldnVmZWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzY1MzQsImV4cCI6MjA5NjExMjUzNH0.VagvlMH0R3a6Z2x_quTxS3tgN5zWMiE5ypGzVPsT5lU';

async function seed() {
  console.log("Seeding todays_catch...");
  
  const catches = [
    {
      id: 'CATCH-DEMO-001', 
      product_id: 'PRD-001', 
      seller_id: 'SEL-001', 
      catch_date: new Date().toISOString().split('T')[0], 
      harbor_node: 'Port Blair Harbor', 
      quantity_kg: 150.00, 
      remaining_kg: 150.00, 
      price_per_kg: 25.50, 
      freshness_timestamp: new Date().toISOString(), 
      expires_at: new Date(Date.now() + 86400000).toISOString(), 
      catch_image_url: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62', 
      batch_label: 'MORNING', 
      status: 'FRESH'
    },
    {
      id: 'CATCH-DEMO-002', 
      product_id: 'PRD-002', 
      seller_id: 'SEL-001', 
      catch_date: new Date().toISOString().split('T')[0], 
      harbor_node: 'Andaman Deep Sea', 
      quantity_kg: 80.00, 
      remaining_kg: 80.00, 
      price_per_kg: 45.00, 
      freshness_timestamp: new Date().toISOString(), 
      expires_at: new Date(Date.now() + 86400000).toISOString(), 
      catch_image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', 
      batch_label: 'AFTERNOON', 
      status: 'FRESH'
    },
    {
      id: 'CATCH-DEMO-003', 
      product_id: 'PRD-003', 
      seller_id: 'SEL-001', 
      catch_date: new Date().toISOString().split('T')[0], 
      harbor_node: 'Nicobar Coastal', 
      quantity_kg: 200.00, 
      remaining_kg: 200.00, 
      price_per_kg: 18.75, 
      freshness_timestamp: new Date().toISOString(), 
      expires_at: new Date(Date.now() + 86400000).toISOString(), 
      catch_image_url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b', 
      batch_label: 'EVENING', 
      status: 'FRESH'
    }
  ];

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/todays_catch`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(catches)
    });
    
    if (!res.ok) {
      console.error('Failed to seed todays_catch:', await res.text());
    } else {
      console.log('todays_catch seeded successfully!');
    }
  } catch (e) {
    console.error(e);
  }
}

seed();
