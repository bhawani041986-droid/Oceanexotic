"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SellerMobileHeader, 
  SellerMobileDock, 
  SellerMobileDrawer 
} from "@/components/seller/MobileNav";
import { 
  LogOut,
  Bell,
  Plus,
  ChevronRight,
  Activity,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Settings,
  MessageSquare,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { SellerGuard } from "@/components/auth/AuthGuards";
import { Button } from "@/components/ui/Button";
import { SELLER_NAV_ITEMS } from "@/constants/navigation";

import { NotificationPopover } from "@/components/seller/NotificationPopover";
import { ThemeProvider } from "@/context/ThemeContext";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isVoucherPage = pathname.includes('/voucher');

  if (!mounted) return null;

  return (
    <SellerGuard>
      <ThemeProvider>
        <div className={cn(
          "flex min-h-screen overflow-x-hidden text-[var(--c-text-primary)]",
          isVoucherPage ? "bg-white" : "bg-[var(--c-bg)]"
        )}>
          
          {/* 1. DESKTOP TACTICAL SIDEBAR - Hidden on Voucher */}
          {!isVoucherPage && (
            <aside className="hidden lg:flex w-[280px] flex-col bg-[var(--c-bg-alt)]/80 backdrop-blur-3xl border-r border-[var(--foreground)]/5 sticky top-0 h-screen z-[500] group/sidebar transition-all duration-500 hover:w-[300px]">
              
              {/* Branding Zone */}
              <div className="px-8 py-10 shrink-0">
                <Link href="/seller/dashboard" className="block relative">
                  <div className="absolute -inset-4 bg-[var(--c-primary)]/5 blur-2xl rounded-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />
                  <Logo size="sm" variant="color" className="relative z-10" />
                  <p className="mt-2 text-[7px] font-black text-[var(--c-primary)] uppercase tracking-[0.5em] opacity-60">Merchant Command</p>
                </Link>
              </div>

              {/* Navigation Registry */}
              <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto scrollbar-hide">
                {SELLER_NAV_ITEMS.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      initial={false}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative group/item overflow-hidden",
                        isActive 
                          ? "text-[var(--c-text-primary)]" 
                          : "text-[var(--c-text-secondary)] opacity-60 hover:opacity-100"
                      )}
                      style={{
                        clipPath: "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                      }}
                    >
                      {/* Active Background & Glow */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavBG"
                          className="absolute inset-0 bg-gradient-to-r from-[var(--c-primary)]/10 to-transparent border-l-4 border-[var(--c-primary)]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      <span 
                        className={cn("relative z-10 transition-transform group-hover/item:scale-110 group-hover/item:rotate-3", isActive ? "text-[var(--c-primary)]" : "")}
                        style={{ color: !isActive ? (item as any).color : undefined }}
                      >
                        {item.icon}
                      </span>
                      
                      <span className="relative z-10 flex-1">{item.label}</span>

                      {isActive && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--c-primary)] shadow-[0_0_8px_var(--c-primary)] relative z-10" 
                        />
                      )}
                      
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-40 transition-opacity relative z-10" />
                    </motion.a>
                  );
                })}
              </nav>

              {/* Session Controls */}
              <div className="p-6 border-t border-[var(--foreground)]/5 shrink-0 space-y-4">
                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--foreground)]/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Network Status</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  </div>
                  <p className="text-[8px] font-bold text-[var(--c-text-primary)] uppercase">Verifed Node Active</p>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-danger/80 hover:text-danger transition-all bg-danger/5 hover:bg-danger/10 border border-danger/10 group"
                  style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)" }}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Terminate</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40" />
                </button>
              </div>
            </aside>
          )}

          {/* 2. MOBILE INTERFACE NODES - Hidden on Voucher */}
          {!isVoucherPage && (
            <>
              <SellerMobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
              <SellerMobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
              <SellerMobileDock />
            </>
          )}

          {/* 3. MAIN OPERATIONAL THEATER */}
          <main className="flex-1 flex flex-col min-h-screen relative">
            
            {/* Desktop Atmospheric Header - Hidden on Voucher */}
            {!isVoucherPage && (
              <header className="hidden lg:flex h-24 bg-[var(--c-bg)]/60 backdrop-blur-xl border-b border-white/5 items-center justify-between px-12 sticky top-0 z-[300]">
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-[var(--c-text-primary)] uppercase italic tracking-tighter leading-none">Merchant Hub</h1>
                  <p className="text-[9px] font-bold text-[var(--c-primary)] uppercase tracking-[0.3em] mt-1">Operational Telemetry: Active</p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4">
                    <NotificationPopover />
                    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-[var(--c-text-secondary)] hover:text-[var(--c-primary)] transition-all cursor-pointer">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="h-10 w-px bg-[var(--foreground)]/10" />

                  <div className="flex items-center gap-5">
                    <div className="text-right hidden xl:block">
                      <p className="text-[10px] font-black text-[var(--c-text-primary)] uppercase tracking-widest">{user?.name || "Premium Merchant"}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#00ff88]" />
                        <span className="text-[8px] font-black text-[#00ff88] uppercase tracking-widest">Verified Hub</span>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--c-primary)] to-[#ff0055] rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
                      <div className="w-12 h-12 rounded-xl bg-[var(--c-bg-alt)] border border-[var(--foreground)]/10 flex items-center justify-center text-sm font-black text-[var(--c-primary)] shadow-2xl relative z-10 overflow-hidden">
                        {user?.name?.[0] || "M"}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push("/seller/products/new")}
                    className="h-12 px-8 bg-[var(--c-primary)] text-[var(--foreground)] text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-purple group hover:scale-[1.02] transition-all"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-500" /> NEW HARVEST
                  </Button>
                </div>
              </header>
            )}

            {/* Dynamic Content Surface */}
            <div className={cn(
              "flex-1 relative",
              isVoucherPage ? "p-0" : "p-4 pt-24 lg:pt-0 lg:p-12"
            )}>
              {/* Background Ambience - Hidden on Voucher */}
              {!isVoucherPage && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[var(--c-primary)]/5 blur-[100px] rounded-full" />
                  <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#ff0055]/5 blur-[80px] rounded-full" />
                </div>
              )}
              
              <div className="relative z-10 h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </ThemeProvider>
    </SellerGuard>
  );
}
