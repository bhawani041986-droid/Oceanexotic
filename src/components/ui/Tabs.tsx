"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  className,
  contentClassName,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0].id);

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex bg-[var(--foreground)]/5 p-1 rounded-[16px] border border-[var(--foreground)]/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors rounded-[12px]",
              activeTab === tab.id ? "text-[var(--foreground)]" : "text-text-secondary hover:text-[var(--foreground)]"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary shadow-glow-purple rounded-[12px]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={cn("animate-fade-in", contentClassName)}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
