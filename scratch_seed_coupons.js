const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function seedCoupons() {
  const coupons = [
    {
      id: `CPN-${Math.floor(100000 + Math.random() * 900000)}`,
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      min_purchase: 0,
      max_discount: 200,
      usage_limit: 5000,
      usage_count: 0,
      status: 'ACTIVE',
      expiry_date: '2026-12-31'
    },
    {
      id: `CPN-${Math.floor(100000 + Math.random() * 900000)}`,
      code: 'OCEAN20',
      type: 'PERCENTAGE',
      value: 20,
      min_purchase: 2000,
      max_discount: 500,
      usage_limit: 1000,
      usage_count: 0,
      status: 'ACTIVE',
      expiry_date: '2026-10-15'
    },
    {
      id: `CPN-${Math.floor(100000 + Math.random() * 900000)}`,
      code: 'SAKUFRESH50',
      type: 'FIXED',
      value: 50,
      min_purchase: 500,
      max_discount: 50,
      usage_limit: 2000,
      usage_count: 0,
      status: 'ACTIVE',
      expiry_date: null
    },
    {
      id: `CPN-${Math.floor(100000 + Math.random() * 900000)}`,
      code: 'ADMIRALVIP',
      type: 'FIXED',
      value: 500,
      min_purchase: 5000,
      max_discount: 500,
      usage_limit: 500,
      usage_count: 0,
      status: 'ACTIVE',
      expiry_date: '2026-12-31'
    }
  ];

  const response = await fetch(`${supabaseUrl}/rest/v1/coupons`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(coupons)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error seeding coupons:", error);
  } else {
    console.log("Successfully seeded 4 genuine coupons.");
  }
}

seedCoupons();
