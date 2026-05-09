"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: string; // Placeholder for icons
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: "seller" | "admin";
}

export default function DashboardLayout({
  children,
  navItems,
  role,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background-page flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-background-section border-r border-white/5 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6">
            <div className={cn(
              "font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent transition-all",
              isSidebarOpen ? "text-xl" : "text-sm opacity-0"
            )}>
              OceanFresh
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center h-12 px-3 rounded-[12px] transition-all group",
                    isActive
                      ? "bg-primary-purple/10 text-primary-purple"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-md border border-current opacity-50",
                    isActive && "opacity-100"
                  )}>
                    {/* Icon Placeholder */}
                    <span className="text-[10px]">{item.title[0]}</span>
                  </div>
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{item.title}</span>
                  )}
                  {isActive && isSidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-purple shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Area */}
          <div className="p-4 border-t border-white/5">
            <div className={cn(
              "flex items-center h-12 rounded-[12px] bg-white/5 transition-all",
              isSidebarOpen ? "px-3" : "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-xs font-bold shrink-0">
                JD
              </div>
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-xs font-bold truncate">John Dealer</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{role}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "pl-64" : "pl-20"
      )}>
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-background-page/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {/* Sidebar Toggle Icon Placeholder */}
            <div className="w-5 h-1 bg-white/50 mb-1" />
            <div className="w-5 h-1 bg-white/50 mb-1" />
            <div className="w-5 h-1 bg-white/50" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search dashboard..."
                className="w-64 h-10 bg-white/5 border border-white/10 rounded-[10px] px-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-purple transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</div>
            </div>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-lg">
              🔔
            </button>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
