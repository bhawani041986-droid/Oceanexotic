"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { 
  Bell, 
  Package, 
  ShieldAlert, 
  Tag, 
  CheckCircle2,
  MoreVertical,
  Settings,
  ChevronRight,
  ChevronDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Settings State
  const [prefs, setPrefs] = useState({
    push: true,
    email: false,
    sms: true,
    promo: false
  });

  // Fetch notifications from real Supabase DB
  useEffect(() => {
    const fetchNotifications = async () => {
      // Use fallback testing ID if not logged in
      const userId = user?.id || "USR-1001"; 
      
      try {
        const res = await fetch(`/api/customer/notifications?userId=${userId}`);
        const result = await res.json();
        if (result.status === "success") {
          setNotifications(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const userId = user?.id || "USR-1001";
    // Optimistic UI update
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    // DB Update
    try {
      await fetch('/api/customer/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_READ', userId })
      });
    } catch (e) { console.error(e); }
  };

  const handleNotificationClick = async (id: string) => {
    const isAlreadyRead = notifications.find(n => n.id === id)?.read;
    
    // Toggle expand
    setExpandedId(prev => prev === id ? null : id);
    
    // Mark as read in UI
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));

    // DB Update if it wasn't read
    if (!isAlreadyRead) {
      try {
        await fetch('/api/customer/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'MARK_READ', notificationId: id })
        });
      } catch (e) { console.error(e); }
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // UI Update
    setNotifications(notifications.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);

    // DB Update
    try {
      await fetch('/api/customer/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', notificationId: id })
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0 relative">
      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Notification Radar</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">
            Monitoring {notifications.length} Signals • <span className={unreadCount > 0 ? "text-primary" : ""}>{unreadCount} Unread</span>
          </p>
        </div>
        <div className="flex items-center gap-[4px] md:gap-4">
          <Button 
            onClick={markAllRead}
            disabled={unreadCount === 0 || isLoading}
            variant="outline" 
            className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl"
          >
            <CheckCircle2 className={cn("w-3.5 h-3.5 md:w-4 md:h-4", unreadCount > 0 ? "text-primary" : "text-text-secondary opacity-50")} /> 
            MARK ALL READ
          </Button>
          <Button 
            onClick={() => setIsSettingsOpen(true)}
            variant="outline" 
            className="h-10 md:h-12 w-10 md:w-12 p-0 flex items-center justify-center rounded-lg md:rounded-xl"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-[4px] md:space-y-4">
        {isLoading ? (
           <div className="text-center py-20 animate-pulse text-[10px] text-text-secondary tracking-widest uppercase italic">SYNCING WITH REGISTRY...</div>
        ) : notifications.length > 0 ? notifications.map((notification) => (
          <Card 
            key={notification.id} 
            onClick={() => handleNotificationClick(notification.id)}
            className={cn(
              "p-[10px] md:p-6 group flex flex-col hover:border-primary/30 transition-all cursor-pointer rounded-[15px] md:rounded-[24px] overflow-hidden",
              !notification.read ? "bg-primary/5 border-primary/20 shadow-glow-purple/5" : "bg-bg-secondary/40 border-white/5"
            )}
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] flex items-center justify-center border shrink-0 transition-colors",
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
                      "text-xs md:text-sm font-black tracking-tight uppercase italic transition-colors",
                      !notification.read ? "text-[var(--foreground)]" : "text-text-secondary"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.read && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-glow-purple animate-pulse" />}
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic">{notification.time}</span>
                </div>
                <p className={cn(
                  "text-[10px] md:text-xs font-medium text-text-secondary leading-tight italic transition-all",
                  expandedId === notification.id ? "line-clamp-none mt-2 text-[var(--foreground)] opacity-90" : "line-clamp-2"
                )}>
                  {notification.message}
                </p>

                {/* Expanded Actions */}
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedId === notification.id ? "max-h-20 opacity-100 mt-4" : "max-h-0 opacity-0"
                )}>
                  <div className="flex gap-3 pt-2">
                    {notification.type === "ORDER" && (
                      <Button size="sm" variant="primary" className="h-8 text-[9px] px-4 rounded-md">TRACK ORDER</Button>
                    )}
                    {notification.type === "SECURITY" && (
                      <Button size="sm" variant="outline" className="h-8 text-[9px] px-4 rounded-md border-danger/30 text-danger hover:bg-danger/10">SECURE ACCOUNT</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={(e) => deleteNotification(e, notification.id)} className="h-8 text-[9px] px-4 rounded-md">DISMISS</Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 transition-all opacity-50 md:opacity-100">
                {expandedId === notification.id ? (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-text-secondary transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>
          </Card>
        )) : (
          /* Empty State / All Clear */
          <div className="pt-10 md:pt-20 text-center max-w-sm mx-auto space-y-[10px] md:space-y-6">
            <div className="p-6 md:p-8 rounded-full bg-success/5 border border-dashed border-success/20 inline-block animate-pulse">
              <CheckCircle2 className="w-10 md:w-12 h-10 md:h-12 text-success opacity-80" />
            </div>
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-lg md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Radar Status: Clear</h2>
              <p className="text-[9px] md:text-[10px] text-text-secondary font-black uppercase tracking-widest leading-relaxed italic">
                All global signals have been acknowledged.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4">
            <div>
              <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" /> Radar Preferences
              </h3>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest italic mt-1">Configure your incoming signals</p>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-[var(--foreground)]/5 rounded-full transition-colors text-text-secondary hover:text-[var(--foreground)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { id: 'push', label: 'In-App Radar Alerts', desc: 'Real-time dashboard notifications' },
              { id: 'email', label: 'Email Dispatches', desc: 'Order receipts and security logs' },
              { id: 'sms', label: 'SMS Carrier Signals', desc: 'Live fleet delivery tracking' },
              { id: 'promo', label: 'Trade Promotions', desc: 'Discounts and midnight catches' }
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/5 bg-[var(--foreground)]/5">
                <div className="space-y-1 pr-4">
                  <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase italic tracking-tight">{setting.label}</h4>
                  <p className="text-[9px] text-text-secondary uppercase tracking-widest opacity-80">{setting.desc}</p>
                </div>
                <button 
                  onClick={() => setPrefs({...prefs, [setting.id]: !(prefs as any)[setting.id]})}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative flex-shrink-0",
                    (prefs as any)[setting.id] ? "bg-primary shadow-glow-purple/20" : "bg-bg-secondary border border-[var(--foreground)]/10"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all shadow-md",
                    (prefs as any)[setting.id] ? "right-1 bg-black" : "left-1 bg-text-secondary"
                  )} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsSettingsOpen(false)} className="px-8 text-[10px] font-black tracking-widest uppercase italic shadow-glow-purple">
              SAVE PROTOCOLS
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
