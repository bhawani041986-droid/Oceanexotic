"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  AlertTriangle,
  Trash2,
  Megaphone,
  Signal,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Clock,
  Sliders,
  Edit3,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface NotificationSignal {
  id: string;
  title: string;
  content: string;
  type: string;
  channel: string;
  status: "SENT" | "SCHEDULED" | "FAILED";
  date: string;
}

const INITIAL_NOTIFICATIONS: NotificationSignal[] = [];

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"history" | "broadcast">("history");
  const [notifications, setNotifications] = useState<NotificationSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotification, setEditingNotification] = useState<NotificationSignal | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [channel, setChannel] = useState("GLOBAL");
  const [content, setContent] = useState("");

  const fetchBroadcasts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/system/broadcasts');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.content) {
          const formatted = data.content.map((n: any) => ({
             ...n,
             date: new Date(n.created_at).toLocaleString()
          }));
          setNotifications(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to load signals", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleCancel = () => {
    setTitle("");
    setType("SYSTEM");
    setChannel("GLOBAL");
    setContent("");
    setEditingNotification(null);
    setActiveTab("history");
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast("Title and content are required to broadcast a signal.", "error");
      return;
    }

    try {
      if (editingNotification) {
        const res = await fetch('/api/system/broadcasts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNotification.id, title: title.trim(), content: content.trim(), type, channel })
        });
        if (!res.ok) throw new Error("Update failed");
        toast("Signal successfully updated in platform registry.", "success");
      } else {
        const res = await fetch('/api/system/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), content: content.trim(), type, channel })
        });
        if (!res.ok) throw new Error("Broadcast failed");
        toast("Signal successfully broadcast across all authorized nodes.", "success");
      }
      
      await fetchBroadcasts();
      
      // Clear form
      setTitle("");
      setType("SYSTEM");
      setChannel("GLOBAL");
      setContent("");
      setEditingNotification(null);
      setActiveTab("history");
    } catch (err) {
       toast("Failed to process signal.", "error");
    }
  };

  const handleEdit = (notif: NotificationSignal) => {
    setEditingNotification(notif);
    setTitle(notif.title);
    setType(notif.type);
    setChannel(notif.channel);
    setContent(notif.content);
    setActiveTab("broadcast");
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/system/broadcasts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast("Notification signal purged from registry.", "success");
      fetchBroadcasts();
    } catch (err) {
      toast("Failed to purge signal.", "error");
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "ALL" || n.channel === channelFilter;
    const matchesType = typeFilter === "ALL" || n.type === typeFilter;
    return matchesSearch && matchesChannel && matchesType;
  });

  // Calculate Metrics
  const totalBroadcasts = notifications.length;
  const activeChannels = new Set(notifications.map(n => n.channel)).size;
  const criticalAlerts = notifications.filter(n => n.type === "CRITICAL").length;
  const pendingScheduled = notifications.filter(n => n.status === "SCHEDULED").length;

  const SIGNAL_METRICS = [
    { label: "Total Broadcasts", value: totalBroadcasts.toString(), trend: "up", change: `+${totalBroadcasts}`, icon: <Signal /> },
    { label: "Active Channels", value: activeChannels.toString(), trend: "up", change: "Stable", icon: <Globe /> },
    { label: "Critical Alerts", value: criticalAlerts.toString(), trend: criticalAlerts > 0 ? "up" : "down", change: criticalAlerts > 0 ? "Active" : "None", icon: <AlertTriangle /> },
    { label: "Scheduled Signals", value: pendingScheduled.toString(), trend: "up", change: pendingScheduled > 0 ? "Pending" : "None", icon: <Clock /> },
  ];

  return (
    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in text-[var(--foreground)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center justify-center md:justify-start gap-3">
            <Bell className="w-6 md:w-8 h-6 md:h-8 text-primary" />
            Notification Radar
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
            Governing Global Platform Alerts & Administrative Broadcast Signals
          </p>
        </div>
        
        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl self-center md:self-auto">
          <button
            onClick={() => {
              setActiveTab("history");
              setEditingNotification(null);
            }}
            className={cn(
              "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all italic",
              activeTab === "history"
                ? "bg-primary text-black shadow-glow-purple/20"
                : "text-text-secondary hover:text-[var(--foreground)]"
            )}
          >
            Signal Logs
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={cn(
              "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all italic",
              activeTab === "broadcast"
                ? "bg-primary text-black shadow-glow-purple/20"
                : "text-text-secondary hover:text-[var(--foreground)]"
            )}
          >
            {editingNotification ? "Edit Signal" : "Compose Signal"}
          </button>
        </div>
      </div>

      {activeTab === "broadcast" ? (
        <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Card className="p-[10px] md:p-12 space-y-8 md:space-y-10 relative overflow-hidden rounded-[24px] md:rounded-[48px] shadow-premium bg-bg-secondary/20 border-[var(--foreground)]/5">
              <div className="space-y-4 md:space-y-6 relative z-10">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/10">
                       <Megaphone className="w-5 md:w-6 h-5 md:h-6" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                       <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">
                         {editingNotification ? "Edit Strategic Signal" : "Compose Strategic Signal"}
                       </h3>
                       <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">
                         {editingNotification ? "Authorized Administrative Modification" : "Authorized Administrative Broadcast"}
                       </p>
                    </div>
                 </div>
                 
                 <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Title</label>
                       <Input 
                         placeholder="Enter directive headline..." 
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="h-14 bg-bg-secondary/50 font-bold" 
                       />
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Type</label>
                       <select 
                         value={type} 
                         onChange={(e) => setType(e.target.value)}
                         className="w-full h-14 bg-bg-secondary/50 border border-[var(--foreground)]/5 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                       >
                          <option value="SYSTEM">SYSTEM DIRECTIVE</option>
                          <option value="FINANCE">FINANCE ALERT</option>
                          <option value="CRITICAL">CRITICAL SECURITY</option>
                          <option value="UPDATE">GENERAL UPDATE</option>
                       </select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Target Channel</label>
                       <select 
                         value={channel} 
                         onChange={(e) => setChannel(e.target.value)}
                         className="w-full h-14 bg-bg-secondary/50 border border-[var(--foreground)]/5 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                       >
                          <option value="GLOBAL">GLOBAL</option>
                          <option value="MERCHANTS">MERCHANTS</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                          <option value="ALL">ALL NODES</option>
                       </select>
                    </div>
                    
                    <div className="md:col-span-4 space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Content</label>
                       <textarea 
                         placeholder="Enter detailed signal parameters..." 
                         value={content}
                         onChange={(e) => setContent(e.target.value)}
                         className="w-full h-40 bg-bg-secondary/50 border border-[var(--foreground)]/5 rounded-[24px] p-6 text-sm font-medium text-[var(--foreground)] outline-none focus:border-primary/50 transition-all resize-none"
                       />
                    </div>
                    
                    <div className="md:col-span-4 pt-6 flex justify-end gap-4">
                       <Button type="button" variant="ghost" onClick={handleCancel} className="h-14 px-10 text-[10px] font-black tracking-widest uppercase">
                         CANCEL
                       </Button>
                       <Button type="submit" className="h-14 px-12 text-[10px] font-black tracking-widest uppercase shadow-glow-purple gap-4">
                          <Send className="w-4 h-4" /> {editingNotification ? "UPDATE SIGNAL" : "BROADCAST SIGNAL"}
                       </Button>
                    </div>
                 </form>
              </div>
           </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Telemetry/Impact Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
             {SIGNAL_METRICS.map((metric) => (
               <Card key={metric.label} className="p-[10px] md:p-6 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] hover:border-primary/20 transition-all group shadow-premium">
                 <div className="flex items-center justify-between">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-glow-purple/5">
                     {React.cloneElement(metric.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
                   </div>
                   <div className={cn(
                     "flex items-center gap-0.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic",
                     metric.trend === "up" ? "text-success" : "text-danger"
                   )}>
                     {metric.change}
                   </div>
                 </div>
                 <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{metric.label}</p>
                   <h4 className="text-lg md:text-2xl font-black italic tracking-tighter">{metric.value}</h4>
                 </div>
               </Card>
             ))}
           </div>

           {/* Filters panel */}
           <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-card/20 backdrop-blur-md p-4 border border-[var(--foreground)]/5 rounded-2xl">
             <div className="relative w-full sm:w-80 group">
               <Input 
                 placeholder="SEARCH SIGNALS..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="h-10 pl-10 text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl" 
               />
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
               <div className="relative w-full sm:w-auto">
                 <select 
                   value={channelFilter} 
                   onChange={(e) => setChannelFilter(e.target.value)}
                   className="h-10 w-full sm:w-44 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl pl-8 pr-8 text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                 >
                    <option value="ALL">ALL CHANNELS</option>
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="MERCHANTS">MERCHANTS</option>
                    <option value="LOGISTICS">LOGISTICS</option>
                 </select>
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none" />
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
               </div>
               
               <div className="relative w-full sm:w-auto">
                 <select 
                   value={typeFilter} 
                   onChange={(e) => setTypeFilter(e.target.value)}
                   className="h-10 w-full sm:w-40 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl pl-4 pr-8 text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                 >
                    <option value="ALL">ALL TYPES</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="UPDATE">UPDATE</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
               </div>
             </div>
           </div>

           {/* Signals feed */}
           <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                 <Card className="p-12 text-center text-xs font-black uppercase text-text-secondary italic border border-[var(--foreground)]/5 rounded-[24px]">
                   Loading active radar registry...
                 </Card>
              ) : filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center text-xs font-black uppercase text-text-secondary italic border border-[var(--foreground)]/5 rounded-[24px]">
                  No matching signal logs found in active radar registry.
                </Card>
              ) : (
                filteredNotifications.map((notif) => (
                  <Card key={notif.id} className="p-[10px] md:p-8 hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden rounded-[24px] md:rounded-[40px] shadow-premium bg-bg-secondary/20 border-[var(--foreground)]/5">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                        <div className="flex gap-4 md:gap-6">
                           <div className={cn(
                             "w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-[20px] flex items-center justify-center border transition-all shadow-glow-purple/5 shrink-0",
                             notif.type === 'CRITICAL' ? "bg-danger/10 border-danger/20 text-danger" : 
                             notif.type === 'SYSTEM' ? "bg-primary/10 border-primary/20 text-primary" :
                             notif.type === 'FINANCE' ? "bg-secondary/10 border-secondary/20 text-secondary" :
                             "bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-text-secondary"
                           )}>
                             <Bell className="w-5 md:w-6 h-5 md:h-6" />
                           </div>
                           <div className="space-y-1.5 md:space-y-2 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                 <h4 className="text-sm md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic group-hover:text-primary transition-colors">{notif.title}</h4>
                                 <Badge variant={notif.status === 'SENT' ? 'success' : notif.status === 'SCHEDULED' ? 'warning' : 'danger'} className="text-[7px] md:text-[8px] font-black italic px-2">
                                    {notif.status}
                                 </Badge>
                                 <Badge variant="glass" className="text-[7px] md:text-[8px] font-black italic px-2 uppercase">
                                    {notif.type}
                                 </Badge>
                              </div>
                              <p className="text-[10px] md:text-sm text-text-secondary font-black italic leading-relaxed opacity-60">"{notif.content}"</p>
                              <div className="flex items-center gap-6 pt-2">
                                 <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-primary opacity-40" />
                                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Channel: {notif.channel}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5 text-primary opacity-40" />
                                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {notif.id}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t border-[var(--foreground)]/5 pt-4 md:border-none md:pt-0">
                           <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{notif.date}</span>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => handleEdit(notif)}
                                className="p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-primary/40 hover:text-primary transition-all text-text-secondary"
                              >
                                 <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(notif.id)}
                                className="p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-danger/40 hover:text-danger transition-all"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </Card>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
}
