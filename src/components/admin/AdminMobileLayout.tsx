"use client";

import React from "react";
import { AdminMobileTopNav, AdminMobileBottomNav } from "./AdminMobileNav";
import { usePathname } from "next/navigation";

export default function AdminMobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dynamic title based on pathname
  const getTitle = () => {
    const segment = pathname.split('/').pop();
    if (!segment || segment === 'admin') return 'Command Center';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="bg-bg-primary min-h-screen text-[var(--foreground)] font-sans selection:bg-primary/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AdminMobileTopNav title={getTitle()} />
      <main className="pt-20 pb-32 px-4 relative z-10">
        {children}
      </main>
      <AdminMobileBottomNav />
    </div>
  );
}
