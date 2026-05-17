"use client";

import React from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: any[];
  role: string;
}

export default function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      <Sidebar items={navItems} role={role} />
      
      <div className="flex-1 ml-[260px] flex flex-col">
        <header className="h-[76px] px-10 flex items-center justify-between border-b border-white/5 sticky top-0 bg-bg-primary/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">/</span>
            <span className="text-sm font-bold capitalize">{role}</span>
            <span className="text-text-secondary">/</span>
            <span className="text-sm font-bold">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-bg-card border border-[var(--foreground)]/10 rounded-[12px] h-10 px-10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 w-[240px]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-xs">🔍</span>
            </div>
            <button className="relative p-2 hover:bg-[var(--foreground)]/5 rounded-full transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        <main className="p-10 flex-1 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
