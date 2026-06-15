/**
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

export const MASTER_ADDONS_REGISTRY: Addon[] = [
  {
    "id": "ADD-001",
    "name": "Fish Fry Masala",
    "price": 60,
    "type": "Global Addon"
  },
  {
    "id": "ADD-002",
    "name": "Fish Curry Masala",
    "price": 80,
    "type": "Global Addon"
  },
  {
    "id": "ADD-003",
    "name": "Garlic Butter Sauce",
    "price": 120,
    "type": "Premium Addon"
  },
  {
    "id": "ADD-004",
    "name": "Lemon Pack",
    "price": 30,
    "type": "Global Addon"
  },
  {
    "id": "ADD-005",
    "name": "Vacuum Packaging",
    "price": 80,
    "type": "Packaging Addon"
  },
  {
    "id": "ADD-006",
    "name": "Ice Pack",
    "price": 40,
    "type": "Delivery Addon"
  },
  {
    "id": "ADD-007",
    "name": "Seafood BBQ Marinade",
    "price": 150,
    "type": "Premium Addon"
  }
];

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
  {
    id: "surmai-seer-fish",
    name: "Surmai",
    tagline: "Seer Fish",
    category: "SEAWATER FISH",
    price: 1600,
    originalPrice: 1920,
    stock: 50,
    description: "Fresh Surmai (Seer Fish) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/surmai-seer-fish.webp",
    images: [],
    gallery: [],
    badge: "Fresh Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Same Day Delivery",
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
      { id: "v1", label: "500g", price: 900, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 1600, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "bangda-mackerel",
    name: "Bangda",
    tagline: "Mackerel",
    category: "SEAWATER FISH",
    price: 320,
    originalPrice: 384,
    stock: 50,
    description: "Fresh Bangda (Mackerel) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/bangda-mackerel.webp",
    images: [],
    gallery: [],
    badge: "Morning Catch",
    rating: 4.8,
    reviews: 12,
    eta: "30 Min Delivery",
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
      { id: "v1", label: "500g", price: 220, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 320, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "paplet-pomfret",
    name: "Paplet",
    tagline: "Pomfret",
    category: "CRABS & LOBSTERS",
    price: 1800,
    originalPrice: 2160,
    stock: 50,
    description: "Fresh Paplet (Pomfret) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/paplet-pomfret.webp",
    images: [],
    gallery: [],
    badge: "Premium Grade",
    rating: 4.8,
    reviews: 12,
    eta: "Express Delivery",
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
      { id: "v1", label: "500g", price: 850, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 1800, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "yellowfin-tuna",
    name: "Tuna",
    tagline: "Yellowfin Tuna",
    category: "SEAWATER FISH",
    price: 650,
    originalPrice: 780,
    stock: 50,
    description: "Fresh Tuna (Yellowfin Tuna) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/yellowfin-tuna.webp",
    images: [],
    gallery: [],
    badge: "Wild Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Same Day Delivery",
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
      { id: "v1", label: "500g", price: 350, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 650, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "red-snapper",
    name: "Lal Snapper",
    tagline: "Red Snapper",
    category: "SEAWATER FISH",
    price: 900,
    originalPrice: 1080,
    stock: 50,
    description: "Fresh Lal Snapper (Red Snapper) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/red-snapper.webp",
    images: [],
    gallery: [],
    badge: "Fresh Ocean Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Fast Delivery",
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
      { id: "v1", label: "500g", price: 450, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 900, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "fresh-prawns",
    name: "Jhinga",
    tagline: "Prawns",
    category: "PRAWNS & SHRIMPS",
    price: 950,
    originalPrice: 1140,
    stock: 50,
    description: "Fresh Jhinga (Prawns) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/fresh-prawns.webp",
    images: [],
    gallery: [],
    badge: "Premium Fresh",
    rating: 4.8,
    reviews: 12,
    eta: "Ice Packed Delivery",
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
      { id: "v1", label: "500g", price: 350, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 950, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "tiger-prawns",
    name: "Tiger Jhinga",
    tagline: "Tiger Prawns",
    category: "PRAWNS & SHRIMPS",
    price: 2200,
    originalPrice: 2640,
    stock: 50,
    description: "Fresh Tiger Jhinga (Tiger Prawns) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/tiger-prawns.webp",
    images: [],
    gallery: [],
    badge: "Chef Recommended",
    rating: 4.8,
    reviews: 12,
    eta: "Express Delivery",
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
      { id: "v1", label: "500g", price: 950, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 2200, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "mud-crab",
    name: "Kekda",
    tagline: "Mud Crab",
    category: "PRAWNS & SHRIMPS",
    price: 1200,
    originalPrice: 1440,
    stock: 50,
    description: "Fresh Kekda (Mud Crab) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/mud-crab.webp",
    images: [],
    gallery: [],
    badge: "Live Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Cold Chain Delivery",
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
      { id: "v1", label: "500g", price: 450, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 1200, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "sea-lobster",
    name: "Lobster",
    tagline: "Sea Lobster",
    category: "PRAWNS & SHRIMPS",
    price: 4500,
    originalPrice: 5400,
    stock: 50,
    description: "Fresh Lobster (Sea Lobster) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/sea-lobster.webp",
    images: [],
    gallery: [],
    badge: "Premium Live Seafood",
    rating: 4.8,
    reviews: 12,
    eta: "Express Delivery",
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
      { id: "v1", label: "500g", price: 1800, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 4500, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "fresh-sardine",
    name: "Mathi",
    tagline: "Sardine",
    category: "DRY FISH",
    price: 180,
    originalPrice: 216,
    stock: 50,
    description: "Fresh Mathi (Sardine) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/fresh-sardine.webp",
    images: [],
    gallery: [],
    badge: "Daily Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Quick Delivery",
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
      { id: "v1", label: "500g", price: 120, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 180, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "bhetki-barramundi",
    name: "Bhetki",
    tagline: "Barramundi",
    category: "SEAWATER FISH",
    price: 900,
    originalPrice: 1080,
    stock: 50,
    description: "Fresh Bhetki (Barramundi) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/bhetki-barramundi.webp",
    images: [],
    gallery: [],
    badge: "Premium Fresh",
    rating: 4.8,
    reviews: 12,
    eta: "Same Day Delivery",
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
      { id: "v1", label: "500g", price: 450, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 900, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "rohu-carp",
    name: "Rohu",
    tagline: "Rohu Carp",
    category: "FRESHWATER FISH",
    price: 280,
    originalPrice: 336,
    stock: 50,
    description: "Fresh Rohu (Rohu Carp) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/rohu-carp.webp",
    images: [],
    gallery: [],
    badge: "Farm Fresh",
    rating: 4.8,
    reviews: 12,
    eta: "Daily Delivery",
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
      { id: "v1", label: "500g", price: 180, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 280, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "catla-carp",
    name: "Catla",
    tagline: "Catla Carp",
    category: "FRESHWATER FISH",
    price: 320,
    originalPrice: 384,
    stock: 50,
    description: "Fresh Catla (Catla Carp) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/catla-carp.webp",
    images: [],
    gallery: [],
    badge: "Farm Fresh",
    rating: 4.8,
    reviews: 12,
    eta: "Daily Delivery",
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
      { id: "v1", label: "500g", price: 220, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 320, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "fresh-squid",
    name: "Squid",
    tagline: "Calamari Squid",
    category: "FROZEN",
    price: 650,
    originalPrice: 780,
    stock: 50,
    description: "Fresh Squid (Calamari Squid) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/fresh-squid.webp",
    images: [],
    gallery: [],
    badge: "Ocean Fresh",
    rating: 4.8,
    reviews: 12,
    eta: "Fast Delivery",
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
      { id: "v1", label: "500g", price: 350, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 650, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  },
  {
    id: "fresh-octopus",
    name: "Octopus",
    tagline: "Octopus Seafood",
    category: "READY TO COOK",
    price: 950,
    originalPrice: 1140,
    stock: 50,
    description: "Fresh Octopus (Octopus Seafood) sourced directly from Andaman local markets. Perfect for premium cooking.",
    image: "/images/products/fresh-octopus.webp",
    images: [],
    gallery: [],
    badge: "Premium Ocean Catch",
    rating: 4.8,
    reviews: 12,
    eta: "Express Delivery",
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
      { id: "v1", label: "500g", price: 450, status: "ACTIVE" },
      { id: "v2", label: "1kg", price: 950, status: "ACTIVE" }
    ],
    customerReviews: [],
    addons: ["ADD-001", "ADD-002", "ADD-004", "ADD-005", "ADD-006"],
    cutTypes: ["Whole", "Curry Cut", "Cleaned"]
  }
];

export const getProductById = (id: string): Product | undefined => {
  return MASTER_PRODUCT_REGISTRY.find(p => p.id === id);
};
