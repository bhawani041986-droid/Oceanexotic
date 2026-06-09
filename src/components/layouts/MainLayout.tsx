"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { 
  ShoppingCart, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Receipt, 
  User as UserIcon,
  Instagram,
  Youtube,
  MessageCircle,
  Phone,
  MapPin,
  Facebook,
  Search,
  Bell,
  Heart,
  ChevronDown,
  ShieldCheck,
  ChefHat
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface MainLayoutProps {
  children: React.ReactNode;
}

const CATEGORIES = [
  { name: "Fresh Fish", slug: "fish" },
  { name: "Prawns", slug: "prawns" },
  { name: "Crab", slug: "crab" },
  { name: "Lobster", slug: "lobster" },
  { name: "Salmon", slug: "salmon" },
  { name: "Bluefin Tuna", slug: "tuna" },
  { name: "Frozen", slug: "frozen" },
  { name: "Collections", slug: "premium" },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const settings = useSettingsStore();
  const { items } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Home", href: "/customer", icon: <Home className="w-5 h-5" /> },
    { label: "Market", href: "/customer/products", icon: <ShoppingBag className="w-5 h-5" /> },
    { label: "Recipes", href: "/customer/recipes", icon: <ChefHat className="w-5 h-5" /> },
    { label: "Orders", href: "/customer/orders", icon: <Receipt className="w-5 h-5" /> },
    { label: "Profile", href: "/customer/profile", icon: <UserIcon className="w-5 h-5" /> },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans selection:bg-[var(--c-primary)]/30 pb-[120px] lg:pb-0 overflow-x-hidden transition-all duration-500"
    )}>
      
      {/* 1. UNIVERSAL RESPONSIVE NAVBAR - THEME AWARE */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b",
        scrolled 
          ? "h-16 md:h-20 bg-[var(--c-bg)]/90 backdrop-blur-3xl border-[var(--foreground)]/10" 
  : "h-20 md:h-24 bg-[var(--c-bg)]/60 backdrop-blur-xl border-[var(--foreground)]/5"
      )}>
        <div className="container mx-auto px-0 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-10">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[var(--c-text-primary)]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/customer" className="flex items-center gap-2 group">
              <Logo size="lg" className="!w-[130px] !h-[35px] sm:!w-[160px] sm:!h-[42px] md:!w-[200px] md:!h-[53px] lg:!w-[240px] lg:!h-[64px]" />
            </Link>

            <nav className="hidden lg:flex items-center gap-8 ml-6">
              <div className="relative">
                <button 
                  onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-text-primary)] hover:text-[var(--c-primary)] transition-colors h-full py-4"
                >
                  Categories <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isCategoryDropdownOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                      onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                      className="absolute top-[80%] left-0 w-[400px] p-6 bg-[var(--c-card)]/95 backdrop-blur-3xl border border-[var(--foreground)]/5 rounded-[var(--c-radius-card)] shadow-2xl z-[200] grid grid-cols-2 gap-4"
                    >
                      {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={`/customer/products?category=${cat.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-all group">
                          <p className="text-[10px] font-black text-[var(--c-text-primary)] uppercase italic group-hover:text-[var(--c-primary)]">{cat.name}</p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                    pathname === item.href ? "text-[var(--c-primary)]" : "text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
                  )}
                >
                  <span className="opacity-50">{React.cloneElement(item.icon as React.ReactElement, { className: "w-3.5 h-3.5" })}</span>
                  {item.label}
                </Link>
              ))}

              <button className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)] transition-all ml-4">
                <MapPin className="w-3 h-3 text-[var(--c-primary)]" /> Port Blair
              </button>
            </nav>
          </div>

          <div className="flex-1 max-w-md relative hidden lg:block mx-10">
             <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/customer/products?search=${searchQuery}`)}
                placeholder="Search for seafood..." 
                className="w-full h-11 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 pl-11 pr-4 text-xs focus:border-[var(--c-primary)] text-[var(--c-text-primary)] transition-all outline-none" 
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--c-text-secondary)]" />
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => router.push('/customer/wishlist')} className="p-3 text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"><Heart className="w-5 h-5" /></button>
            </div>
            <button onClick={() => router.push('/customer/notifications')} className="p-2 md:p-3 text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)] relative">
              <Bell className="w-6 h-6 md:w-5 md:h-5" />
              <span className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--c-bg)]" />
            </button>
            <Link href="/customer/cart" className="p-2 md:px-4 md:py-2.5 bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 rounded-full flex items-center gap-3 relative transition-all">
               <ShoppingCart className="w-6 h-6 md:w-5 md:h-5 text-[var(--c-primary)]" />
               <span className="absolute top-1 right-1 md:relative md:top-0 md:right-0 bg-[var(--c-primary)] md:bg-transparent rounded-full text-[8px] md:text-xs font-black text-[var(--foreground)] md:text-[var(--c-primary)] px-1">
                 {mounted ? items.length : 0}
               </span>
            </Link>
            <button onClick={() => router.push('/customer/profile')} className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center hover:border-[var(--c-primary)] transition-all overflow-hidden relative group">
              {isAuthenticated ? (
                <img 
                  src={(user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined') ? user.avatar : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-[var(--c-text-primary)]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. STICKY BOTTOM NAVIGATION (MOBILE) */}
      <nav 
        className="fixed left-4 right-4 z-[100] h-[48px] bg-[var(--c-card)]/90 backdrop-blur-3xl border border-[var(--foreground)]/10 shadow-2xl lg:hidden"
        style={{ 
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
          bottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <button 
                key={i} 
                onClick={() => router.push(item.href)} 
                className={cn(
                  "flex flex-col items-center justify-center gap-0 px-3 h-full transition-all relative group",
                  isActive ? "text-[var(--c-primary)]" : "text-[var(--c-text-secondary)]"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeGlowMain"
                    className="absolute top-0 w-12 h-[3px] bg-[var(--c-primary)] rounded-b-full shadow-[var(--c-shadow-glow)]"
                    style={{ backgroundColor: 'var(--c-primary)' }}
                  />
                )}
                <div className={cn("transition-transform", isActive && "scale-110")} style={{ color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)', opacity: isActive ? 1 : 0.6 }}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: isActive ? 'var(--c-primary)' : undefined, opacity: isActive ? 1 : 0.6 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MOBILE DRAWER REGISTRY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] z-[600] bg-[var(--c-bg)] border-r border-[var(--foreground)]/5 p-8 flex flex-col shadow-2xl pt-16"
            >
              {/* Close Button - Tactical Position */}
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="absolute top-5 right-5 p-2.5 bg-[var(--c-primary)] text-white rounded-xl shadow-glow-primary active:scale-95 transition-all z-[700]"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center mb-6">
                <Link href="/customer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                   <Logo size="lg" className="!w-[220px] !h-[55px]" />
                </Link>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] mb-4">Quick Links</p>
                {navItems.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <button 
                      key={i} 
                      onClick={() => { router.push(item.href); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "flex items-center gap-4 text-lg font-black uppercase italic transition-all relative overflow-hidden group px-5 py-4",
                        isActive ? "text-white shadow-[var(--c-shadow-glow)]" : "text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
                      )}
                      style={{
                        clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                        backgroundColor: isActive ? 'var(--c-primary)' : 'rgba(255,255,255,0.03)',
                        boxShadow: isActive ? 'inset 0 0 0 1px var(--c-primary)' : 'none',
                        borderLeftWidth: '5px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: 'var(--c-primary)'
                      }}
                    >
                      <span className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-[var(--c-text-secondary)]")}>{item.icon}</span>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto space-y-4 pt-10 border-t border-[var(--foreground)]/5">
                <button 
                  onClick={handleLogout} 
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-5 text-red-500 transition-all group relative overflow-hidden"
                  )}
                  style={{
                    clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderLeftWidth: '5px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: '#EF4444'
                  }}
                >
                   <span className="text-[10px] font-black uppercase italic relative z-10 tracking-[0.2em]">SIGN OUT</span>
                   <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-20 md:pt-24">
        {children}
      </main>

      {/* 13. ENTERPRISE FOOTER - GLOBAL SYNC */}
      <footer className="bg-[var(--c-bg-alt)] border-t border-[var(--foreground)]/5 py-8 md:py-32 px-4 md:px-6 mt-20">
        <div className="container mx-auto">
           <div className="grid grid-cols-2 lg:grid-cols-5 border border-[var(--foreground)]/5">
              {/* BOX 1: BRAND IDENTITY */}
              <div className="p-6 md:p-10 space-y-4 border-b border-r border-[var(--foreground)]/5 lg:col-span-2 lg:border-b-0">
                 <Link href="/customer" className="flex items-center gap-2">
                    <Logo size="lg" className="!w-[340px] !h-[85px]" />
                 </Link>
                 <p className="text-[9px] md:text-base text-[var(--c-text-secondary)] font-medium italic">Your trusted local source for fresh, premium seafood delivered straight to your home.</p>
              </div>

              {/* BOX 2: MARKETPLACE */}
              <div className="p-6 md:p-10 space-y-4 border-b border-[var(--foreground)]/5 lg:border-none">
                 <h4 className="text-[10px] md:text-[12px] font-black text-[var(--c-text-primary)] uppercase tracking-[0.2em]">Collections</h4>
                 <ul className="space-y-2 text-[10px] md:text-base text-[var(--c-text-secondary)] italic">{['Fresh Catch', 'Premium Seafood', 'New Arrivals'].map(item => <li key={item} className="truncate">{item}</li>)}</ul>
              </div>

              {/* BOX 3: GOVERNANCE */}
              <div className="p-6 md:p-10 space-y-4 border-r border-[var(--foreground)]/5 lg:border-none">
                 <h4 className="text-[10px] md:text-[12px] font-black text-[var(--c-text-primary)] uppercase tracking-[0.2em]">About Us</h4>
                 <ul className="space-y-2 text-[10px] md:text-base text-[var(--c-text-secondary)] italic">{['Our Fishermen', 'Our Story', 'Contact Us'].map(item => <li key={item} className="truncate">{item}</li>)}</ul>
              </div>

              {/* BOX 4: CONTACT & SOCIALS */}
              <div className="p-6 md:p-10 space-y-4 lg:border-none">
                 <h4 className="text-[10px] md:text-[12px] font-black text-[var(--c-text-primary)] uppercase tracking-[0.2em]">Connect</h4>
                 <ul className="space-y-2 text-[10px] md:text-base text-[var(--c-text-secondary)] italic mb-4"><li>{settings.contactNumber || "+91 999" }</li><li className="truncate">{settings.email || "dispatch@oceanexotic.com"}</li></ul>
                 <div className="flex gap-4 text-[var(--c-text-secondary)]"><Instagram className="w-4 h-4" /><Youtube className="w-4 h-4" /><MessageCircle className="w-4 h-4" /></div>
              </div>
           </div>
           <div className="p-6 border-t border-[var(--foreground)]/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left bg-black/20">
              <p className="text-[9px] md:text-sm text-[var(--c-text-secondary)] italic uppercase tracking-widest">© 2026 OceanExotic Global. All Rights Reserved.</p>
              <div className="flex gap-6 text-[8px] md:text-xs text-[var(--c-text-secondary)] font-black uppercase tracking-widest">
                 <span className="cursor-pointer hover:text-[var(--c-primary)] transition-colors">How to Order</span>
                 <span className="cursor-pointer hover:text-[var(--c-primary)] transition-colors">Store Locations</span>
                 <span className="cursor-pointer hover:text-[var(--c-primary)] transition-colors">Safe Checkout</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
