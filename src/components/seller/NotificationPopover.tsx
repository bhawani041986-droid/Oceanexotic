// @ts-nocheck
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  Clock, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  User,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Fleet Commission",
    description: "Admiral John commissioned 2.5kg of Bluefin Saku.",
    time: "2m ago",
    type: "order",
    icon: <Package className="w-4 h-4" />,
    color: "text-primary",
    unread: true,
    details: {
      id: "ORD-9982",
      customer: "Admiral John",
      product: "Atlantic Bluefin Tuna",
      spec: "Grade A+ Saku",
      quantity: "2.5kg",
      value: "₹12,800",
      location: "Node-4 Port Authority",
      timestamp: "03:45:12 AM"
    }
  },
  {
    id: 2,
    title: "Yield Settlement",
    description: "₹12,800 has been added to your sovereign vault.",
    time: "15m ago",
    type: "finance",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-success",
    unread: true,
    details: {
      id: "ST-8821",
      amount: "₹12,800.00",
      source: "Global Trade Settlement",
      node: "Standard Chartered Hub",
      status: "COMPLETED",
      timestamp: "2026-05-10 03:30 AM"
    }
  },
  {
    id: 3,
    title: "Low Inventory Alert",
    description: "Hokkaido Scallops are below critical levels (12kg).",
    time: "1h ago",
    type: "alert",
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-warning",
    unread: false,
    details: {
      product: "Hokkaido Scallops",
      current: "12kg",
      threshold: "20kg",
      category: "Shellfish",
      status: "CRITICAL"
    }
  },
  {
    id: 4,
    title: "Vessel Dispatched",
    description: "Shipment SHP-8821 is now in transit to Tokyo Port.",
    time: "3h ago",
    type: "shipping",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-primary",
    unread: false,
    details: {
      shipmentId: "SHP-8821",
      orderId: "ORD-9980",
      destination: "Tokyo Port",
      vessel: "Pacific Pearl",
      temp: "-58°C",
      eta: "May 12, 2026"
    }
  }
];

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  return (
    <div className="relative">
      {/* Global Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 relative group active:scale-95 transition-all hover:bg-[var(--foreground)]/10"
      >
        <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--foreground)]" />
        <span className="absolute top-2 right-2 lg:top-2.5 lg:right-2.5 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full shadow-glow-purple" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* High-Integrity Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (selectedNotif) setSelectedNotif(null);
                else setIsOpen(false);
              }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md"
            />

            {/* Notification Layer (Dropdown) */}
            {!selectedNotif && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "fixed lg:absolute top-[70px] lg:top-14 right-4 lg:-right-4 w-[calc(100vw-32px)] lg:w-96 z-[310] bg-bg-secondary/95 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-[24px] lg:rounded-[32px] shadow-premium overflow-hidden flex flex-col",
                  "max-h-[75vh] lg:max-h-[600px]"
                )}
              >
                <div className="p-6 lg:p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="space-y-1">
                    <h3 className="text-sm lg:text-lg font-black text-[var(--foreground)] uppercase tracking-tight">Signal Feed</h3>
                    <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest">Global Marketplace Alerts</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary transition-all"><X className="w-4 h-4 lg:w-5 lg:h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 space-y-3">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <button 
                      key={notif.id}
                      onClick={() => setSelectedNotif(notif)}
                      className={cn(
                        "w-full p-4 lg:p-5 rounded-[20px] lg:rounded-[24px] flex gap-4 transition-all group relative active:scale-[0.98] border",
                        notif.unread ? "bg-[var(--foreground)]/5 border-[var(--foreground)]/10" : "bg-transparent border-transparent hover:bg-white/[0.02]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 lg:w-12 lg:h-12 rounded-[14px] lg:rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/20 group-hover:text-primary transition-all",
                        notif.color
                      )}>
                        {notif.icon}
                      </div>
                      <div className="flex-1 text-left space-y-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] lg:text-xs font-bold text-[var(--foreground)] uppercase tracking-tight truncate">{notif.title}</p>
                          <span className="text-[7px] lg:text-[8px] font-black text-text-secondary uppercase shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[9px] lg:text-[11px] text-text-secondary font-medium leading-relaxed italic opacity-80 line-clamp-2">
                          {notif.description}
                        </p>
                      </div>
                      {notif.unread && <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-purple" />}
                    </button>
                  ))}
                </div>

                <div className="p-4 lg:p-6 border-t border-[var(--foreground)]/5 bg-white/[0.02]">
                  <Button variant="outline" className="w-full h-11 lg:h-12 text-[9px] lg:text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/5 rounded-[16px]">
                    CLEAR ALL SIGNALS
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Detailed Signal Popup Layer */}
            {selectedNotif && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-[80px] lg:top-[100px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-lg z-[320] outline-none max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar"
              >
                <Card className="overflow-hidden border-[var(--foreground)]/10 rounded-[32px] lg:rounded-[40px] bg-bg-secondary/95 backdrop-blur-3xl shadow-glow-purple/20">
                  {/* Layer Header */}
                  <div className="p-8 lg:p-12 border-b border-[var(--foreground)]/5 bg-gradient-to-br from-primary/10 to-transparent relative">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                       {React.cloneElement(selectedNotif.icon as React.ReactElement, { className: "w-48 h-48" })}
                    </div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center shadow-inner",
                        selectedNotif.color
                      )}>
                        {React.cloneElement(selectedNotif.icon as React.ReactElement, { className: "w-8 h-8" })}
                      </div>
                      <button 
                        onClick={() => setSelectedNotif(null)}
                        className="p-3.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-all active:scale-90"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-3">
                         <Badge variant="glass" className="bg-primary/20 text-primary border-primary/20 text-[8px] font-black tracking-widest uppercase">
                            LIVE SIGNAL
                         </Badge>
                         <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-glow-purple" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none italic">{selectedNotif.title}</h3>
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">{selectedNotif.time} • SECURE NODE {selectedNotif.id}</p>
                    </div>
                  </div>

                  {/* Layer Content */}
                  <div className="p-8 lg:p-12 space-y-10">
                    <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 relative group overflow-hidden">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                       <p className="text-sm lg:text-base text-[var(--foreground)]/90 font-medium leading-relaxed italic relative z-10">
                          "{selectedNotif.description}"
                       </p>
                    </div>

                    {/* Context Specific Grid */}
                    <div className="grid grid-cols-2 gap-4">
                       {selectedNotif.type === 'order' && (
                         <>
                           {[
                             { label: "Commission ID", value: selectedNotif.details.id, icon: <Fingerprint className="w-3.5 h-3.5" /> },
                             { label: "Market Value", value: selectedNotif.details.value, icon: <TrendingUp className="w-3.5 h-3.5 text-success" />, primary: true },
                             { label: "Fleet Admiral", value: selectedNotif.details.customer, icon: <User className="w-3.5 h-3.5" /> },
                             { label: "Harvest Spec", value: selectedNotif.details.spec, icon: <Package className="w-3.5 h-3.5" /> },
                           ].map((item, idx) => (
                             <div key={idx} className={cn(
                               "p-5 rounded-[24px] border transition-all space-y-2",
                               item.primary ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/5"
                             )}>
                                <div className="flex items-center gap-2">
                                   <div className="p-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">{item.icon}</div>
                                   <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">{item.label}</p>
                                </div>
                                <p className={cn("text-xs font-black uppercase", item.primary ? "text-primary" : "text-[var(--foreground)]")}>{item.value}</p>
                             </div>
                           ))}
                         </>
                       )}

                       {selectedNotif.type === 'finance' && (
                         <>
                           <div className="col-span-2 p-8 rounded-[28px] bg-gradient-to-br from-success/10 to-transparent border border-success/20 text-center space-y-3 shadow-glow-purple/5">
                              <p className="text-[10px] font-black text-success uppercase tracking-[0.3em]">Vault Settlement</p>
                              <p className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{selectedNotif.details.amount}</p>
                              <div className="flex items-center justify-center gap-2">
                                 <Badge variant="success" className="text-[8px] px-3">ENCRYPTED</Badge>
                                 <Badge variant="glass" className="text-[8px] px-3">VERIFIED HUB</Badge>
                              </div>
                           </div>
                           <div className="p-5 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-1">
                              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Source Node</p>
                              <p className="text-[10px] font-bold text-[var(--foreground)] uppercase">{selectedNotif.details.node}</p>
                           </div>
                           <div className="p-5 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-1">
                              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Temporal Log</p>
                              <p className="text-[10px] font-bold text-[var(--foreground)] uppercase">{selectedNotif.details.timestamp}</p>
                           </div>
                         </>
                       )}
                    </div>

                    {/* Actions Layer */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--foreground)]/5">
                      <Button 
                        onClick={() => setSelectedNotif(null)}
                        variant="outline" 
                        className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest rounded-[20px] border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5"
                      >
                        DISMISS SIGNAL
                      </Button>
                      <Button className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest rounded-[20px] shadow-glow-purple flex items-center justify-center gap-2">
                        ACCESS HUB <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
