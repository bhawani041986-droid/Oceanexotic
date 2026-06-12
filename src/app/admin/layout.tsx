"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldAlert, 
  Users, 
  Store, 
  ShoppingCart, 
  Scale, 
  FileText, 
  Settings, 
  LogOut,
  Search,
  Bell,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Truck,
  Activity,
  Zap,
  Lock,
  AlertCircle,
  Palette,
  Navigation as NavigationIcon,
  Image as ImageIcon,
  Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { AdminGuard } from "@/components/auth/AuthGuards";
import { Logo } from "@/components/ui/Logo";

const ADMIN_NAV = [
  { label: "Dashboard Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin/dashboard", color: "#00D1FF" },
  { label: "Customer Accounts", icon: <Users className="w-5 h-5" />, href: "/admin/users", color: "#3B82F6" },
  { label: "Sellers & Shops", icon: <Store className="w-5 h-5" />, href: "/admin/sellers", color: "#F59E0B" },
  { label: "Products Manager", icon: <ShieldCheck className="w-5 h-5" />, href: "/admin/products", color: "#10B981" },
  { label: "Orders Panel", icon: <ShoppingCart className="w-5 h-5" />, href: "/admin/orders", color: "#F97316" },
  { label: "Add-ons & Extras", icon: <Sliders className="w-5 h-5" />, href: "/admin/addons", color: "#F43F5E" },
  { label: "Support Chats", icon: <MessageSquare className="w-5 h-5" />, href: "/admin/support", color: "#A855F7" },
  { label: "Security & Fraud", icon: <ShieldAlert className="w-5 h-5" />, href: "/admin/security", color: "#EF4444" },
  { label: "Payouts Control", icon: <CreditCard className="w-5 h-5" />, href: "/admin/revenue", color: "#14B8A6" },
  { label: "Delivery Settings", icon: <Truck className="w-5 h-5" />, href: "/admin/logistics", color: "#06B6D4" },
  { label: "Delivery Drivers & Fleet", icon: <NavigationIcon className="w-5 h-5" />, href: "/admin/fleet", color: "#8B5CF6" },
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
  { label: "Emergency Stop", icon: <AlertCircle className="w-5 h-5" />, href: "/admin/emergency", danger: true, color: "#FF0000" },
];

import { useMediaQuery } from "@/hooks/use-media-query";
import AdminMobileLayout from "@/components/admin/AdminMobileLayout";
import { ThemeProvider } from "@/context/ThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) return null;

  if (isMobile) {
    return (
      <AdminGuard>
        <ThemeProvider>
          <AdminMobileLayout>{children}</AdminMobileLayout>
        </ThemeProvider>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <ThemeProvider>
        <div className="flex min-h-screen bg-bg-primary text-[var(--foreground)]">
          {/* Admin Sidebar - Simple English Refactor */}
          <aside className="hidden lg:flex w-96 flex-col bg-bg-secondary border-r border-[var(--foreground)]/5 sticky top-0 h-screen z-[500]">
            <div className="px-8 pt-4 pb-8">
              <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                <Logo size="lg" className="!w-[340px] !h-[85px]" />
              </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 pt-4 overflow-y-auto no-scrollbar pb-10">
              {ADMIN_NAV.map((item: any) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden pl-6",
                      isActive 
                        ? "text-white shadow-glow-purple" 
                        : item.danger
                          ? "text-danger hover:bg-danger/10"
                          : "text-text-secondary hover:text-[var(--foreground)]"
                    )}
                    style={{
                      clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                      backgroundColor: isActive ? 'var(--primary)' : item.danger ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)',
                      boxShadow: isActive ? `inset 0 0 0 1px ${item.color}` : 'none'
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[5px]" 
                      style={{ backgroundColor: item.color || 'transparent' }} 
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

            <div className="p-6 border-t border-[var(--foreground)]/5 bg-bg-secondary/80 backdrop-blur-md">
              <button 
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-danger transition-all group relative overflow-hidden pl-8"
                )}
                style={{
                  clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  backgroundColor: 'rgba(239, 68, 68, 0.05)'
                }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#EF4444]" 
                />
                <LogOut className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110" />
                <span className="relative z-10">TERMINATE ACCESS</span>
              </button>
            </div>
          </aside>

          {/* Admin Main View */}
          <main className="flex-1 flex flex-col min-h-screen">
            <header className="h-20 bg-bg-primary/80 backdrop-blur-md border-b border-[var(--foreground)]/5 flex items-center justify-between px-10 sticky top-0 z-40">
              <div className="flex items-center gap-8 flex-1">
                <Logo size="lg" />
                <div className="relative w-full max-w-md group">
                  <input 
                    type="text" 
                    placeholder="Search users, products, orders..." 
                    className="w-full h-11 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-[12px] pl-12 pr-4 text-xs text-[var(--foreground)] focus:border-primary/50 transition-all outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center gap-8 ml-10">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                     <div className="w-8 h-8 rounded-full border-2 border-bg-primary bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">A</div>
                     <div className="w-8 h-8 rounded-full border-2 border-bg-primary bg-[var(--foreground)]/5 flex items-center justify-center text-[10px] font-black">B</div>
                     <div className="w-8 h-8 rounded-full border-2 border-bg-primary bg-[var(--foreground)]/5 flex items-center justify-center text-[10px] font-black">C</div>
                  </div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">3 Admins Active</p>
                </div>
                <div className="h-6 w-px bg-[var(--foreground)]/10" />
                <Link href="/admin/notifications" className="relative group p-3 rounded-full hover:bg-[var(--foreground)]/5 transition-all">
                  <Bell className="w-5 h-5 text-[var(--foreground)]" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger border-2 border-bg-primary rounded-full" />
                </Link>
                <Link href="/admin/profile" className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary hover:bg-primary/20 transition-all cursor-pointer overflow-hidden">
                  {user?.avatar ? (
                     <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                     user?.name?.[0] || 'A'
                  )}
                </Link>
              </div>
            </header>

            <div className="flex-1 p-10 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.03),transparent_50%)]">
              {children}
            </div>
          </main>
        </div>
      </ThemeProvider>
    </AdminGuard>
  );
}
