"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Bell, 
  MapPin, 
  ChevronDown, 
  Menu,
  X,
  Sun,
  Moon,
  Home as HomeIcon,
  Receipt,
  LogOut,
  Instagram,
  Youtube,
  MessageCircle
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";

const CATEGORIES = [
  { name: "Fresh Fish", image: "🐟", color: "from-blue-600/20 to-indigo-600/20", slug: "fish" },
  { name: "Prawns", image: "🦐", color: "from-pink-600/20 to-rose-600/20", slug: "prawns" },
  { name: "Crab", image: "🦀", color: "from-red-600/20 to-orange-600/20", slug: "crab" },
  { name: "Lobster", image: "🦞", color: "from-amber-600/20 to-orange-600/20", slug: "lobster" },
  { name: "Salmon", image: "🍣", color: "from-orange-400/20 to-red-400/20", slug: "salmon" },
  { name: "Bluefin Tuna", image: "🐋", color: "from-blue-800/20 to-indigo-900/20", slug: "tuna" },
  { name: "Frozen", image: "❄️", color: "from-cyan-600/20 to-blue-600/20", slug: "frozen" },
  { name: "Collections", image: "💎", color: "from-purple-600/20 to-indigo-600/20", slug: "premium" },
];

export default function HomeClientWrapper({ children }: { children: React.ReactNode }) {
  const cart = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [footerAccordion, setFooterAccordion] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { label: "Home", href: "/", icon: <HomeIcon className="w-5 h-5" /> },
    { label: "Categories", href: "/customer/products", icon: <Menu className="w-5 h-5" /> },
    { label: "Search", onClick: () => setIsSearchActive(true), icon: <Search className="w-5 h-5" /> },
    { label: "Orders", href: "/customer/orders", icon: <Receipt className="w-5 h-5" /> },
    { label: "Profile", href: "/customer/profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className={cn(
      "bg-bg-primary min-h-screen text-white font-inter selection:bg-primary/30 pb-[92px] lg:pb-0 overflow-x-hidden transition-colors duration-500",
      !isDarkMode && "bg-slate-50 text-slate-900"
    )}>
      
      {/* NAVBAR */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b",
        scrolled ? "h-16 md:h-20 bg-bg-primary/80 backdrop-blur-2xl border-white/5" : "h-16 md:h-24 bg-transparent border-transparent"
      )}>
        <div className="container mx-auto px-4 md:px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 lg:hidden text-[var(--foreground)]">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size="lg" />
            </Link>

            <nav className="hidden lg:flex items-center gap-8 ml-6">
              <div className="relative">
                <button 
                  onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] hover:text-primary transition-colors h-24"
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
                      className="absolute top-[80%] left-0 w-[600px] p-8 bg-bg-card/95 backdrop-blur-3xl border border-[var(--foreground)]/5 rounded-[32px] shadow-2xl z-[200] grid grid-cols-2 gap-6"
                    >
                      {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={`/customer/products?category=${cat.slug}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--foreground)]/5 transition-all group">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br", cat.color)}>{cat.image}</div>
                          <div><p className="text-sm font-black text-[var(--foreground)] uppercase italic group-hover:text-primary">{cat.name}</p></div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-[var(--foreground)] transition-all">
                <MapPin className="w-3 h-3 text-primary" /> Port Blair
              </button>
            </nav>
          </div>

          <div className="flex-1 max-w-md relative hidden lg:block mx-10">
             <input type="text" placeholder="Search harvests..." className="w-full h-11 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-full pl-11 pr-4 text-xs focus:border-primary transition-all outline-none" />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 text-text-secondary hover:text-[var(--foreground)] transition-colors">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button className="p-3 text-text-secondary hover:text-[var(--foreground)]"><Heart className="w-5 h-5" /></button>
            </div>
            <Link href="/customer/cart" className="p-2 md:px-4 md:py-2.5 md:bg-primary/10 md:border md:border-primary/20 md:rounded-full flex items-center gap-3 relative">
               <ShoppingBag className="w-6 h-6 md:w-5 md:h-5 text-text-secondary md:text-primary" />
               <span className="absolute top-1 right-1 md:relative md:top-0 md:right-0 bg-primary md:bg-transparent rounded-full text-[8px] md:text-xs font-black md:text-primary px-1">{cart.items.length}</span>
            </Link>
            <button onClick={() => router.push('/customer/profile')} className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center hover:border-primary transition-all overflow-hidden">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-4 left-4 right-4 z-[100] h-[72px] bg-bg-card/90 backdrop-blur-3xl border border-[var(--foreground)]/10 rounded-[24px] shadow-2xl lg:hidden">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item, i) => (
            <button key={i} onClick={item.onClick || (() => router.push(item.href || '#'))} className={cn("flex flex-col items-center gap-1 px-3 py-2 transition-all", pathname === item.href ? "text-primary scale-110" : "text-text-secondary opacity-60")}>
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] z-[160] bg-bg-primary border-r border-white/5 p-8 flex flex-col gap-10 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between">
                <Logo size="md" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6 text-text-secondary" /></button>
              </div>
              <div className="flex flex-col gap-6">
                {navItems.map((item, i) => (
                  <button key={i} onClick={() => { item.onClick ? item.onClick() : router.push(item.href!); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 text-lg font-black uppercase italic text-[var(--foreground)]/60 hover:text-primary transition-colors">
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-bg-primary/98 backdrop-blur-3xl p-10">
            <div className="container mx-auto">
              <button onClick={() => setIsSearchActive(false)}><X className="w-12 h-12 text-white" /></button>
              <div className="flex-1 relative mt-20">
                <input autoFocus placeholder="Search harvests..." className="w-full h-24 bg-transparent border-b-2 border-primary text-4xl md:text-6xl font-black italic outline-none text-white tracking-tight" />
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 text-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      {children}

      {/* FOOTER */}
      <footer className="bg-bg-secondary border-t border-[var(--foreground)]/5 py-24 px-6">
        <div className="container mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-20">
              <div className="md:col-span-2 space-y-10">
                 <Logo size="lg" />
                 <p className="text-lg text-text-secondary font-medium italic max-w-sm">The global standard for modern maritime commerce. Direct-from-source harvests with absolute transparency.</p>
                 <div className="flex gap-6"><Instagram className="w-6 h-6 text-text-secondary" /><Youtube className="w-6 h-6 text-text-secondary" /><MessageCircle className="w-6 h-6 text-text-secondary" /></div>
              </div>
              {[ { title: "Marketplace", items: ["Premium Saku", "Wild Shellfish", "Fresh Arrivals"] }, { title: "Governance", items: ["Fleet Registry", "Authority Node", "Audit Logs"] }, { title: "Legal", items: ["Privacy Policy", "Terms of Trade", "Settlement Rules"] } ].map((sec) => (
                <div key={sec.title} className="space-y-8">
                   <h4 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.4em]">{sec.title}</h4>
                   <ul className="space-y-4 text-base text-text-secondary italic">{sec.items.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
           </div>
           <div className="mt-24 pt-12 border-t border-[var(--foreground)]/5 text-center text-sm text-text-secondary italic">© 2026 OceanExotic Global. Sovereignty maintained via Global Maritime Registry Node.</div>
        </div>
      </footer>

    </div>
  );
}
