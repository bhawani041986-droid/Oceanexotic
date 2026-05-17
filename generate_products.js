const fs = require('fs');

const text = `
PRODUCT 1
----------------------------------------------------
Local Market Name:
Surmai
International Name:
Seer Fish
Category:
Premium Fish
Price Per KG:
₹900–1600
Freshness Tag:
Fresh Catch
Delivery Tag:
Same Day Delivery
SEO Slug:
surmai-seer-fish
====================================================
PRODUCT 2
----------------------------------------------------
Local Market Name:
Bangda
International Name:
Mackerel
Category:
Daily Fish
Price Per KG:
₹220–320
Freshness Tag:
Morning Catch
Delivery Tag:
30 Min Delivery
SEO Slug:
bangda-mackerel
====================================================
PRODUCT 3
----------------------------------------------------
Local Market Name:
Paplet
International Name:
Pomfret
Category:
Luxury Seafood
Price Per KG:
₹850–1800
Freshness Tag:
Premium Grade
Delivery Tag:
Express Delivery
SEO Slug:
paplet-pomfret
====================================================
PRODUCT 4
----------------------------------------------------
Local Market Name:
Tuna
International Name:
Yellowfin Tuna
Category:
Premium Fish
Price Per KG:
₹350–650
Freshness Tag:
Wild Catch
Delivery Tag:
Same Day Delivery
SEO Slug:
yellowfin-tuna
====================================================
PRODUCT 5
----------------------------------------------------
Local Market Name:
Lal Snapper
International Name:
Red Snapper
Category:
Premium Fish
Price Per KG:
₹450–900
Freshness Tag:
Fresh Ocean Catch
Delivery Tag:
Fast Delivery
SEO Slug:
red-snapper
====================================================
PRODUCT 6
----------------------------------------------------
Local Market Name:
Jhinga
International Name:
Prawns
Category:
Shellfish
Price Per KG:
₹350–950
Freshness Tag:
Premium Fresh
Delivery Tag:
Ice Packed Delivery
SEO Slug:
fresh-prawns
====================================================
PRODUCT 7
----------------------------------------------------
Local Market Name:
Tiger Jhinga
International Name:
Tiger Prawns
Category:
Luxury Shellfish
Price Per KG:
₹950–2200
Freshness Tag:
Chef Recommended
Delivery Tag:
Express Delivery
SEO Slug:
tiger-prawns
====================================================
PRODUCT 8
----------------------------------------------------
Local Market Name:
Kekda
International Name:
Mud Crab
Category:
Shellfish
Price Per KG:
₹450–1200
Freshness Tag:
Live Catch
Delivery Tag:
Cold Chain Delivery
SEO Slug:
mud-crab
====================================================
PRODUCT 9
----------------------------------------------------
Local Market Name:
Lobster
International Name:
Sea Lobster
Category:
Luxury Seafood
Price Per KG:
₹1800–4500
Freshness Tag:
Premium Live Seafood
Delivery Tag:
Express Delivery
SEO Slug:
sea-lobster
====================================================
PRODUCT 10
----------------------------------------------------
Local Market Name:
Mathi
International Name:
Sardine
Category:
Daily Fish
Price Per KG:
₹120–180
Freshness Tag:
Daily Catch
Delivery Tag:
Quick Delivery
SEO Slug:
fresh-sardine
====================================================
PRODUCT 11
----------------------------------------------------
Local Market Name:
Bhetki
International Name:
Barramundi
Category:
Premium Fish
Price Per KG:
₹450–900
Freshness Tag:
Premium Fresh
Delivery Tag:
Same Day Delivery
SEO Slug:
bhetki-barramundi
====================================================
PRODUCT 12
----------------------------------------------------
Local Market Name:
Rohu
International Name:
Rohu Carp
Category:
Freshwater Fish
Price Per KG:
₹180–280
Freshness Tag:
Farm Fresh
Delivery Tag:
Daily Delivery
SEO Slug:
rohu-carp
====================================================
PRODUCT 13
----------------------------------------------------
Local Market Name:
Catla
International Name:
Catla Carp
Category:
Freshwater Fish
Price Per KG:
₹220–320
Freshness Tag:
Farm Fresh
Delivery Tag:
Daily Delivery
SEO Slug:
catla-carp
====================================================
PRODUCT 14
----------------------------------------------------
Local Market Name:
Squid
International Name:
Calamari Squid
Category:
Shellfish
Price Per KG:
₹350–650
Freshness Tag:
Ocean Fresh
Delivery Tag:
Fast Delivery
SEO Slug:
fresh-squid
====================================================
PRODUCT 15
----------------------------------------------------
Local Market Name:
Octopus
International Name:
Octopus Seafood
Category:
Luxury Seafood
Price Per KG:
₹450–950
Freshness Tag:
Premium Ocean Catch
Delivery Tag:
Express Delivery
SEO Slug:
fresh-octopus
`;

const products = [];
const rawProducts = text.split('====================================================');
for (const rp of rawProducts) {
    if (rp.includes('Local Market Name:')) {
        const p = {};
        const lines = rp.split('\n').map(l => l.trim()).filter(l => l);
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === 'Local Market Name:') p.name = lines[i+1];
            if (lines[i] === 'International Name:') p.tagline = lines[i+1];
            if (lines[i] === 'Category:') p.category = lines[i+1];
            if (lines[i] === 'Price Per KG:') p.price_range = lines[i+1];
            if (lines[i] === 'Freshness Tag:') p.freshness_tag = lines[i+1];
            if (lines[i] === 'Delivery Tag:') p.delivery_tag = lines[i+1];
            if (lines[i] === 'SEO Slug:') p.id = lines[i+1];
        }
        products.push(p);
    }
}

const addons = [
  {id: 'ADD-001', name: 'Fish Fry Masala', price: 60, type: 'Global Addon'},
  {id: 'ADD-002', name: 'Fish Curry Masala', price: 80, type: 'Global Addon'},
  {id: 'ADD-003', name: 'Garlic Butter Sauce', price: 120, type: 'Premium Addon'},
  {id: 'ADD-004', name: 'Lemon Pack', price: 30, type: 'Global Addon'},
  {id: 'ADD-005', name: 'Vacuum Packaging', price: 80, type: 'Packaging Addon'},
  {id: 'ADD-006', name: 'Ice Pack', price: 40, type: 'Delivery Addon'},
  {id: 'ADD-007', name: 'Seafood BBQ Marinade', price: 150, type: 'Premium Addon'}
];

let out = `/**
 * MASTER MARITIME REGISTRY
 * The single source of truth for all OceanExotic Global products.
 */

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  status: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: string | number;
  description: string;
  image: string; // Emoji fallback
  images: string[]; // Physical vault URLs or high-res fallbacks
  gallery: string[];
  badge: string;
  rating: number;
  reviews: number;
  eta: string;
  freshness: number;
  weight: string;
  seller: string;
  sellerId: string;
  discount: string | null;
  status: "ACTIVE" | "LOW STOCK" | "OUT OF STOCK" | "DRAFT";
  nutrition: {
    protein: string;
    omega3: string;
    calories: string;
    fat: string;
  };
  trustBadges: string[];
  recipes: { title: string; time: string; difficulty: string }[];
  variants: ProductVariant[];
  customerReviews: { name: string; rating: number; date: string; comment: string }[];
  addons?: string[]; // IDs of addons
  cutTypes?: string[];
}

export const MASTER_ADDONS_REGISTRY: Addon[] = ` + JSON.stringify(addons, null, 2) + `;

export const CUT_TYPES = [
  "Whole",
  "Curry Cut",
  "Steak Cut",
  "Fillet",
  "Boneless",
  "Cleaned"
];

export const MARKETPLACE_TAGS = [
  "Fresh Catch",
  "Best Seller",
  "Premium",
  "Wild Catch",
  "Chef Recommended",
  "Trending",
  "Same Day Catch"
];

export const MASTER_PRODUCT_REGISTRY: Product[] = [
`;

for (const p of products) {
    const priceStr = p.price_range.replace('₹', '');
    let price_500, price_1000;
    if (priceStr.includes('–')) {
        const [p1, p2] = priceStr.split('–');
        price_500 = parseInt(p1);
        price_1000 = parseInt(p2);
    } else if (priceStr.includes('-')) {
        const [p1, p2] = priceStr.split('-');
        price_500 = parseInt(p1);
        price_1000 = parseInt(p2);
    } else {
        price_1000 = parseInt(priceStr);
        price_500 = Math.floor(price_1000 / 2);
    }
    
    let emoji = '🐟';
    if (p.category.includes('Shellfish') || p.tagline.includes('Crab') || p.tagline.includes('Lobster') || p.tagline.includes('Prawn')) {
        emoji = p.tagline.includes('Crab') ? '🦀' : (p.tagline.includes('Prawn') ? '🦐' : '🦞');
    }
    if (p.name.includes('Squid') || p.name.includes('Octopus')) {
        emoji = '🦑';
    }

    out += `  {
    id: "${p.id}",
    name: "${p.name}",
    tagline: "${p.tagline}",
    category: "${p.category}",
    price: ${price_1000},
    originalPrice: ${Math.floor(price_1000 * 1.2)},
    stock: 50,
    description: "Fresh ${p.name} (${p.tagline}) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "${emoji}",
    images: [],
    gallery: [],
    badge: "${p.freshness_tag}",
    rating: 4.8,
    reviews: 12,
    eta: "${p.delivery_tag}",
    freshness: 100,
    weight: "1kg",
    seller: "Andaman Local Catch",
    sellerId: "SEL-LOCAL",
    discount: null,
    status: "ACTIVE",
    nutrition: { protein: "20g", omega3: "300mg", calories: "100 kcal", fat: "2g" },
    trustBadges: ["Fresh Catch", "Andaman Sourced"],
    recipes: [],
    variants: [
      { id: "v1", label: "500g", price: ${price_500}, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: ${price_1000}, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
`;
}

out += `];

export const getProductById = (id: string): Product | undefined => {
  return MASTER_PRODUCT_REGISTRY.find(p => p.id === id);
};
`;

fs.writeFileSync('src/constants/products.ts', out, 'utf-8');
