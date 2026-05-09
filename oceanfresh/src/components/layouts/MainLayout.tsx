import React from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background-page">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full glass h-[76px] flex items-center px-6 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            OceanFresh
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary-aqua transition-colors">Marketplace</a>
            <a href="#" className="text-sm font-medium hover:text-primary-aqua transition-colors">Categories</a>
            <a href="#" className="text-sm font-medium hover:text-primary-aqua transition-colors">Sellers</a>
            <a href="#" className="text-sm font-medium hover:text-primary-aqua transition-colors">Deals</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <span className="sr-only">Search</span>
              {/* Search Icon Placeholder */}
              <div className="w-5 h-5 border-2 border-white/50 rounded-full" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <span className="sr-only">Cart</span>
              {/* Cart Icon Placeholder */}
              <div className="w-5 h-5 bg-white/20 rounded-sm" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-purple flex items-center justify-center text-xs font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t border-white/10 flex items-center justify-around z-50">
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-5 h-5 bg-white/50 rounded-sm" />
          <span className="text-[10px]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-primary-aqua">
          <div className="w-5 h-5 bg-primary-aqua rounded-sm" />
          <span className="text-[10px]">Shop</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-5 h-5 bg-white/50 rounded-sm" />
          <span className="text-[10px]">Orders</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-5 h-5 bg-white/50 rounded-sm" />
          <span className="text-[10px]">Profile</span>
        </div>
      </nav>

      <footer className="bg-background-section p-12 border-t border-white/5 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="text-xl font-bold">OceanFresh</div>
            <p className="text-sm text-muted-foreground">Premium seafood marketplace delivering fresh ocean harvest to your doorstep.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>All Seafood</li>
              <li>Fresh Fish</li>
              <li>Shellfish</li>
              <li>Seasonal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>Help Center</li>
              <li>Shipping Info</li>
              <li>Returns</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>About Us</li>
              <li>Sellers</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
