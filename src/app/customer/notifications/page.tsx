"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Bell, 
  Package, 
  ShieldAlert, 
  Tag, 
  CheckCircle2,
  MoreVertical,
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "ORDER", title: "Harvest Initiated", message: "Your order #ORD-9982 has been commissioned from Swaraj Dweep. Cold-chain protocol is now active.", time: "2m ago", read: false },
  { id: "2", type: "SECURITY", title: "New Authority Link", message: "A new device has linked to your Admiral Registry from a node in Port Blair.", time: "14m ago", read: false },
  { id: "3", type: "PROMO", title: "Midnight Catch Alert", message: "Premium Mud Crab is now available at Phoenix Bay Jetty. 15% discount for Platinum ranks.", time: "2h ago", read: true },
  { id: "4", type: "ORDER", title: "Delivery Docked", message: "Order #ORD-9975 has reached Junglighat Port and is ready for final fulfillment.", time: "5h ago", read: true },
];

export default function NotificationsPage() {
  return (

    <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Notification Radar</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Monitoring {MOCK_NOTIFICATIONS.length} Global Signal Streams</p>
        </div>
        <div className="flex items-center gap-[4px] md:gap-4">
          <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> MARK ALL READ
          </Button>
          <Button variant="outline" className="h-10 md:h-12 w-10 md:w-12 p-0 flex items-center justify-center rounded-lg md:rounded-xl">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-[4px] md:space-y-4">
        {MOCK_NOTIFICATIONS.map((notification) => (
          <Card 
            key={notification.id} 
            className={cn(
              "p-[10px] md:p-6 group flex items-start gap-4 md:gap-6 hover:border-primary/30 transition-all cursor-pointer rounded-[15px] md:rounded-[24px]",
              !notification.read ? "bg-primary/5 border-primary/20 shadow-glow-purple/5" : "bg-bg-secondary/40 border-white/5"
            )}
          >
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] flex items-center justify-center border shrink-0",
              notification.type === "ORDER" ? "bg-success/10 border-success/20 text-success" :
              notification.type === "SECURITY" ? "bg-danger/10 border-danger/20 text-danger" :
              "bg-primary/10 border-primary/20 text-primary"
            )}>
              {notification.type === "ORDER" && <Package className="w-4 h-4 md:w-5 md:h-5" />}
              {notification.type === "SECURITY" && <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />}
              {notification.type === "PROMO" && <Tag className="w-4 h-4 md:w-5 md:h-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <h4 className={cn(
                    "text-xs md:text-sm font-black tracking-tight uppercase italic",
                    !notification.read ? "text-[var(--foreground)]" : "text-text-secondary"
                  )}>
                    {notification.title}
                  </h4>
                  {!notification.read && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-glow-purple animate-pulse" />}
                </div>
                <span className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic">{notification.time}</span>
              </div>
              <p className="text-[10px] md:text-xs font-medium text-text-secondary leading-tight line-clamp-2 italic">
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all hidden md:flex">
              <button className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-primary -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State / All Clear */}
      <div className="pt-10 md:pt-20 text-center max-w-sm mx-auto space-y-[10px] md:space-y-6">
        <div className="p-6 md:p-8 rounded-full bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10 inline-block">
          <Bell className="w-10 md:w-12 h-10 md:h-12 text-primary opacity-40" />
        </div>
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-lg md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Radar Status: Clear</h2>
          <p className="text-[9px] md:text-[10px] text-text-secondary font-black uppercase tracking-widest leading-relaxed italic">
            All global signals have been acknowledged.
          </p>
        </div>
      </div>
    </div>
  
  );
}
