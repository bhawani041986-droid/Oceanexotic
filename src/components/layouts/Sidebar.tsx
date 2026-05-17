import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

interface NavItem {
  title: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  role: string;
}

export default function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] fixed inset-y-0 left-0 bg-bg-secondary border-r border-[var(--foreground)]/5 flex flex-col z-[500]">
      <div className="h-[76px] px-6 flex items-center border-b border-[var(--foreground)]/5">
        <div className="flex items-center gap-3">
          <Logo size="md" />
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[2px] text-text-secondary opacity-50">
            {role} Portal
          </span>
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-glow" 
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <span className={cn(
                "w-5 h-5 flex items-center justify-center text-base",
                isActive ? "text-[var(--foreground)]" : "text-text-secondary group-hover:text-primary"
              )}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--foreground)]/5">
        <div className="p-4 rounded-[16px] bg-bg-card border border-[var(--foreground)]/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center text-xs">
              👤
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">Bhawani Shankar</p>
              <p className="text-[10px] text-text-secondary truncate">shankar@oceanexotic.com</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-[8px] text-[10px] font-bold bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors">
            LOGOUT
          </button>
        </div>
      </div>
    </aside>
  );
}
