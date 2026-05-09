import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import ProductCard from "@/components/customer/ProductCard";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wild Atlantic Salmon",
    description: "Premium wild-caught salmon from the cold Atlantic waters.",
    price: 32.50,
    category: "Fresh Fish",
    sellerId: "s1",
    images: [],
    stock: 50,
    isAvailable: true,
    freshnessScore: 9,
    deliveryEta: "2 hours",
  },
  {
    id: "2",
    name: "Yellowfin Tuna Saku",
    description: "Sashimi-grade tuna block, perfect for sushi and searing.",
    price: 45.00,
    category: "Exotic",
    sellerId: "s2",
    images: [],
    stock: 20,
    isAvailable: true,
    freshnessScore: 10,
    deliveryEta: "3 hours",
  },
  {
    id: "3",
    name: "Tiger Prawns (Large)",
    description: "Extra large tiger prawns, succulent and sweet.",
    price: 28.00,
    category: "Shellfish",
    sellerId: "s1",
    images: [],
    stock: 100,
    isAvailable: true,
    freshnessScore: 8,
    deliveryEta: "1 hour",
  },
  {
    id: "4",
    name: "Alaskan King Crab",
    description: "Massive legs filled with sweet, tender meat.",
    price: 85.00,
    category: "Crustaceans",
    sellerId: "s3",
    images: [],
    stock: 15,
    isAvailable: true,
    freshnessScore: 9,
    deliveryEta: "4 hours",
  },
];

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-12">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">Discover the finest selection of premium seafood.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-[12px] border-white/10 glass">
              Filters
            </Button>
            <select className="h-10 px-4 rounded-[12px] border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-purple transition-all">
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {['All Seafood', 'Fresh Fish', 'Shellfish', 'Crustaceans', 'Exotic', 'Frozen'].map((cat, i) => (
            <button
              key={cat}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                i === 0 
                  ? 'bg-primary-purple text-white shadow-glow' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {/* Repeating for demo */}
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={`${product.id}-copy`} product={product} />
          ))}
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-white/5">←</Button>
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              variant={n === 1 ? 'default' : 'outline'}
              className={`w-10 h-10 p-0 rounded-full ${n === 1 ? '' : 'border-white/5'}`}
            >
              {n}
            </Button>
          ))}
          <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-white/5">→</Button>
        </div>
      </div>
    </MainLayout>
  );
}
