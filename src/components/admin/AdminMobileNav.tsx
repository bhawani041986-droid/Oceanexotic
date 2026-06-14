// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Activity, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Store,
  Scale,
  MessageSquare,
  ShieldAlert,
  CreditCard,
  Truck,
  FileText,
  Zap,
  Lock,
  AlertCircle,
  Palette,
  Image as ImageIcon,
  Banknote,
  Sliders,
  Link2,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const SystemNodeIcon = () => (
  <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden">
    {/* Pulsing Core */}
    <div className="absolute w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow-purple z-20" />
    
    {/* Rotating Inner Ring */}
    <svg className="absolute w-6 h-6 animate-spin-slow opacity-60" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" strokeDasharray="60 40" fill="none" className="text-primary" />
    </svg>
    
    {/* Rotating Outer Hexagon */}
    <svg className="absolute w-10 h-10 animate-reverse-spin opacity-30" viewBox="0 0 100 100">
      <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
    </svg>
    
    {/* Scanning Line */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-[2px] animate-scan opacity-40 z-30" />
  </div>
);

export const AdminMobileTopNav = ({ title }: { title: string }) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin/dashboard", color: "#00D1FF" },
    { label: "Customer Accounts", icon: <Users className="w-5 h-5" />, href: "/admin/users", color: "#3B82F6" },
    { label: "Sellers & Shops", icon: <Store className="w-5 h-5" />, href: "/admin/sellers", color: "#F59E0B" },
    { label: "Products Manager", icon: <ShieldCheck className="w-5 h-5" />, href: "/admin/products", color: "#10B981" },
    { label: "Orders Panel", icon: <ShoppingCart className="w-5 h-5" />, href: "/admin/orders", color: "#F97316" },
    { label: "Add-ons & Extras", icon: <Sliders className="w-5 h-5" />, href: "/admin/addons", color: "#F43F5E" },
    { label: "Support Chats", icon: <MessageSquare className="w-5 h-5" />, href: "/admin/support", color: "#A855F7" },
    { label: "Security & Fraud", icon: <ShieldAlert className="w-5 h-5" />, href: "/admin/security", color: "#EF4444" },
    { label: "Payouts Control", icon: <Banknote className="w-5 h-5" />, href: "/admin/withdrawals", color: "#14B8A6" },
    { label: "Delivery Settings", icon: <Truck className="w-5 h-5" />, href: "/admin/logistics", color: "#06B6D4" },
    { label: "Ratings & Reviews", icon: <Scale className="w-5 h-5" />, href: "/admin/moderation", color: "#EAB308" },
    { label: "Reports & Analytics", icon: <Activity className="w-5 h-5" />, href: "/admin/analytics", color: "#6366F1" },
    { label: "Media Library", icon: <ImageIcon className="w-5 h-5" />, href: "/admin/media", color: "#EC4899" },
    { label: "Recipes & Banners", icon: <FileText className="w-5 h-5" />, href: "/admin/cms", color: "#84CC16" },
    { label: "Coupons & Offers", icon: <Zap className="w-5 h-5" />, href: "/admin/coupons", color: "#FACC15" },
    { label: "Push Notifications", icon: <Bell className="w-5 h-5" />, href: "/admin/notifications", color: "#0EA5E9" },
    { label: "Logs & History", icon: <FileText className="w-5 h-5" />, href: "/admin/logs", color: "#64748B" },
    { label: "Staff Roles", icon: <Lock className="w-5 h-5" />, href: "/admin/roles", color: "#475569" },
    { label: "General Settings", icon: <Settings className="w-5 h-5" />, href: "/admin/settings", color: "#94A3B8" },
    { label: "Design & Themes", icon: <Palette className="w-5 h-5" />, href: "/admin/marketplace/theme", color: "#FF00FF" },
    { label: "Ocean Reels Videos", icon: <ImageIcon className="w-5 h-5" />, href: "/admin/videos", color: "#14B8A6" },
    { label: "SEO Internal Links", icon: <Link2 className="w-5 h-5" />, href: "/admin/seo/links", color: "#22D3EE" },
    { label: "SEO Backlinks CRM", icon: <Target className="w-5 h-5" />, href: "/admin/seo/backlinks", color: "#4ADE80" },
    { label: "Emergency Stop", icon: <AlertCircle className="w-5 h-5" />, href: "/admin/emergency", danger: true, color: "#FF0000" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-bg-primary/60 backdrop-blur-2xl border-b border-[var(--foreground)]/5 z-[100] px-2 min-[375px]:px-4 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-1.5 min-[375px]:gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 flex items-center justify-center text-text-primary hover:bg-[var(--foreground)]/5 rounded-xl transition-all active:scale-90"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 min-[375px]:gap-4">
             <Link href="/admin/dashboard" className="active:scale-95 transition-all">
                <Logo size="sm" className="!w-[120px] !h-[30px] min-[375px]:!w-[144px] min-[375px]:!h-[36px]" />
             </Link>
          </div>
        </div>

        <div className="flex items-center gap-0.5 min-[375px]:gap-1">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors active:scale-90"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link href="/admin/notifications" className="w-9 h-9 min-[375px]:w-10 min-[375px]:h-10 flex items-center justify-center text-text-secondary hover:text-text-primary relative active:scale-90">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-bg-primary" />
          </Link>
          <div className="w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center ml-1 min-[375px]:ml-2 overflow-hidden shadow-glow-purple">
             <span className="text-[10px] font-black text-primary">{user?.name?.[0] || 'A'}</span>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-full bg-bg-primary/95 backdrop-blur-xl border-b border-[var(--foreground)]/5 p-4 z-[90] shadow-2xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input 
                  autoFocus
                  placeholder="SEARCH DIRECTORY..."
                  className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-text-primary outline-none focus:border-primary/50"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Side Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-bg-primary border-r border-[var(--foreground)]/10 z-[600] flex flex-col p-6 pt-16"
            >
              {/* Close Button - Tactical Position */}
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="absolute top-5 right-5 p-2.5 bg-primary text-white rounded-xl shadow-glow-purple active:scale-90 transition-all z-[700]"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3">
                  <Logo size="sm" className="!w-[160px] !h-[40px]" />
                  <span className="text-[10px] font-black uppercase italic text-primary tracking-widest hidden">ADMIN NODE</span>
                </div>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden pl-5",
                        isActive 
                          ? "text-white shadow-glow-purple" 
                          : item.danger 
                            ? "text-danger hover:bg-danger/10" 
                            : "text-text-secondary hover:text-[var(--foreground)]"
                      )}
                      style={{
                        clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                        backgroundColor: isActive ? 'var(--primary)' : item.danger ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)',
                        borderWidth: isActive ? '1px' : '0px',
                        borderStyle: 'solid',
                        borderColor: isActive ? (item as any).color : 'transparent'
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
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-secondary border border-[var(--foreground)]/5 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                    {user?.name?.[0] || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-text-primary uppercase truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic">Authority Level 5</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-danger transition-all group relative overflow-hidden pl-8"
                  )}
                  style={{
                    clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                    backgroundColor: 'rgba(239, 68, 68, 0.05)'
                  }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#EF4444]" 
                  />
                  <LogOut className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="relative z-10">TERMINATE ACCESS</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const AdminMobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dash", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin/dashboard", color: "#00D1FF" },
    { label: "Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/admin/orders", color: "#F97316" },
    { label: "Payouts", icon: <Banknote className="w-5 h-5" />, href: "/admin/withdrawals", color: "#14B8A6" },
    { label: "Analytics", icon: <Activity className="w-5 h-5" />, href: "/admin/analytics", color: "#6366F1" },
    { label: "More", icon: <Menu className="w-5 h-5" />, href: "/admin/settings", color: "#94A3B8" },
  ];

  return (
    <nav 
      className="fixed left-4 right-4 h-[72px] bg-bg-card/80 backdrop-blur-3xl border border-[var(--foreground)]/10 rounded-[28px] shadow-2xl z-[100] flex items-center justify-around px-2 lg:hidden"
      style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 transition-all relative group",
              isActive ? "text-primary" : "text-text-secondary"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="activeGlow"
                className="absolute -top-3 w-10 h-1 rounded-full shadow-glow-purple"
                style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
              />
            )}
            <div className={cn(
              "transition-transform duration-300 group-active:scale-90",
              isActive && "scale-110"
            )}>
              <span style={{ color: item.color, opacity: isActive ? 1 : 0.6 }}>
                {item.icon}
              </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1" style={{ color: isActive ? item.color : undefined, opacity: isActive ? 1 : 0.6 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
;
