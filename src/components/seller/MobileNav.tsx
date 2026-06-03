"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  User, 
  Bell, 
  Menu,
  X,
  Plus,
  Palette,
  Sparkles,
  Zap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { SELLER_NAV_ITEMS } from "@/constants/navigation";
import { Logo } from "@/components/ui/Logo";
import { NotificationPopover } from "./NotificationPopover";

const ThemeAnimatedIcon = () => (
  <div className="relative w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 flex items-center justify-center group cursor-pointer">
    <motion.div 
      animate={{ 
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className="absolute inset-0 border border-primary/20 rounded-xl bg-primary/5"
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="absolute inset-2 bg-primary/10 rounded-full blur-md"
    />
    <div className="relative z-10 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        <motion.path 
          d="M12 3L14.5 9L21 11.5L14.5 14L12 20L9.5 14L3 11.5L9.5 9L12 3Z" 
          fill="currentColor"
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [0.9, 1, 0.9]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="opacity-40"
        />
      </svg>
    </div>
  </div>
);

export function SellerMobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const pageTitle = React.useMemo(() => {
    if (pathname.includes("dashboard")) return "Command Center";
    if (pathname.includes("products")) return "Harvest Registry";
    if (pathname.includes("orders")) return "Fleet Orders";
    if (pathname.includes("earnings")) return "Market Yields";
    if (pathname.includes("appearance")) return "Skin Studio";
    if (pathname.includes("settings")) return "Directives";
    if (pathname.includes("chat")) return "Signals";
    return "OceanExotic Global";
  }, [pathname]);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-[300] h-16 glass border-b border-b-[var(--foreground)]/5 px-2 min-[375px]:px-4 flex items-center justify-between">
      <div className="flex items-center gap-1.5 min-[375px]:gap-3">
        <button 
          onClick={onMenuClick}
          className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 flex items-center justify-center text-text-secondary active:scale-90 transition-transform hover:bg-[var(--foreground)]/5 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Logo size="sm" className="!w-[120px] !h-[30px] min-[375px]:!w-[144px] min-[375px]:!h-[36px]" />
        </div>
      </div>

      <div className="flex items-center gap-1 min-[375px]:gap-2">
        <Link href="/seller/settings/appearance">
           <ThemeAnimatedIcon />
        </Link>
        <NotificationPopover />
        <Link href="/seller/profile">
          <div className="w-7 h-7 min-[375px]:w-9 min-[375px]:h-9 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-[10px] font-black text-[var(--foreground)] overflow-hidden active:scale-90 transition-all">
             {user?.name?.[0] || "M"}
          </div>
        </Link>
      </div>
    </header>
  );
}

export function SellerMobileDock() {
  const pathname = usePathname();

  const dockItems = [
    { label: "Dash", icon: <LayoutDashboard className="w-5 h-5" />, href: "/seller/dashboard", color: "#00D1FF" },
    { label: "Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/seller/orders", color: "#F97316" },
    { 
      label: "Add", 
      icon: (
        <div className="relative">
           <Plus className="w-6 h-6" />
           <motion.div 
             animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute inset-0 bg-[var(--foreground)]/40 rounded-full blur-sm"
           />
        </div>
      ), 
      href: "/seller/products/new", 
      isAction: true,
      color: "#FFFFFF"
    },
    { label: "Inventory", icon: <Package className="w-5 h-5" />, href: "/seller/products", color: "#FACC15" },
    { label: "Yields", icon: <BarChart3 className="w-5 h-5" />, href: "/seller/earnings", color: "#84CC16" },
  ];

  return (
    <nav 
      className="lg:hidden fixed left-4 right-4 z-[100] h-[48px] bg-[var(--c-card)]/90 backdrop-blur-3xl border border-[var(--foreground)]/10 shadow-premium flex items-center justify-around px-2"
      style={{ 
        clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
        bottom: 'max(1.5rem, env(safe-area-inset-bottom))'
      }}
    >
      {dockItems.map((item) => {
        const isActive = pathname === item.href;
        
        if (item.isAction) {
          return (
            <Link key={item.label} href={item.href}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-glow-purple active:scale-90 transition-all relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                 {item.icon}
              </div>
            </Link>
          );
        }

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0 px-4 h-full transition-all duration-300 relative",
              isActive ? "text-primary" : "text-text-secondary"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="activeDock"
                className="absolute top-0 w-10 h-[3px] rounded-b-full shadow-glow-purple"
                style={{ backgroundColor: item.color, boxShadow: `0 2px 10px ${item.color}` }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn("transition-transform duration-300", isActive && "scale-110 -translate-y-0.5")}>
              <span style={{ color: item.color, opacity: isActive ? 1 : 0.6 }}>
                {item.icon}
              </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: isActive ? item.color : undefined, opacity: isActive ? 1 : 0.6 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SellerMobileDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] z-[600] bg-bg-primary border-r border-white/5 p-8 pt-16 flex flex-col lg:hidden shadow-2xl"
          >
            {/* Close Button - Tactical Position */}
            <button 
              onClick={onClose} 
              className="absolute top-5 right-5 p-2.5 bg-primary text-white rounded-xl shadow-glow-purple active:scale-90 transition-all z-[700]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center mb-6">
              <Link href="/seller/dashboard" onClick={onClose} className="flex items-center gap-2">
                <Logo size="lg" className="!w-[220px] !h-[55px]" />
              </Link>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-2">
              {SELLER_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden pl-6",
                      isActive ? "text-white shadow-glow-purple" : "text-text-secondary hover:text-[var(--foreground)]"
                    )}
                    style={{
                      clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                      backgroundColor: isActive ? 'var(--primary)' : (item as any).danger ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)',
                      boxShadow: isActive ? `inset 0 0 0 1px ${(item as any).color}` : 'none'
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[5px]" 
                      style={{ backgroundColor: (item as any).color || 'transparent' }} 
                    />
                    <span 
                      className={cn("relative z-10 transition-transform group-hover:scale-110", isActive ? "text-white" : "")}
                      style={{ color: !isActive ? (item as any).color : undefined }}
                    >
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-[var(--foreground)]/5">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between px-6 py-5 text-red-500 transition-all group relative overflow-hidden pl-8"
                style={{
                  clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  backgroundColor: 'rgba(239, 68, 68, 0.05)'
                }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#EF4444]" 
                />
                <span className="text-[10px] font-black uppercase italic relative z-10 tracking-[0.2em]">TERMINATE LINK</span>
                <LogOut className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
