"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Navigation as NavigationIcon, 
  History, 
  User, 
  LogOut,
  Bell,
  Zap,
  Menu,
  X,
  Anchor,
  Compass,
  Palette,
  Moon,
  Sun,
  Eye,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

// --- TACTICAL MOOD DEFINITIONS ---
type TacticalMood = "SENTINEL" | "MIDNIGHT" | "DAYLIGHT";

interface MoodConfig {
  primary: string;
  glow: string;
  bg: string;
  cardBg: string;
  text: string;
  border: string;
  label: string;
  icon: React.ReactNode;
}

const MOODS: Record<TacticalMood, MoodConfig> = {
  SENTINEL: { 
    primary: "#00D1FF", 
    glow: "rgba(0, 209, 255, 0.5)", 
    bg: "#020617", 
    cardBg: "rgba(15, 23, 42, 0.95)",
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.05)",
    label: "Neon Sentinel",
    icon: <Zap className="w-4 h-4" />
  },
  MIDNIGHT: { 
    primary: "#EF4444", 
    glow: "rgba(239, 68, 68, 0.5)", 
    bg: "#0f0101", 
    cardBg: "rgba(24, 0, 0, 0.95)",
    text: "#FFFFFF",
    border: "rgba(239, 68, 68, 0.1)",
    label: "Midnight Stealth",
    icon: <Moon className="w-4 h-4" />
  },
  DAYLIGHT: { 
    primary: "#F97316", // Orange
    glow: "rgba(249, 115, 22, 0.1)", // Minimal glow
    bg: "#FFFFFF", // White
    cardBg: "#F8FAFC", // Light Grey
    text: "#000000", // Black
    border: "#E2E8F0",
    label: "Daylight Command",
    icon: <Sun className="w-4 h-4" />
  }
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: authLogout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<TacticalMood>("SENTINEL");
  const [isHydrated, setIsHydrated] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNav = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const logout = () => {
    authLogout();
    router.push("/login");
  };

  // --- SOVEREIGN MOOD SYNC ---
  useEffect(() => {
    const fetchMood = async () => {
      try {
        const res = await fetch('/api/agent/settings');
        const data = await res.json();
        if (data.current_mood) setCurrentMood(data.current_mood);
        setIsHydrated(true);
      } catch (err) { setIsHydrated(true); }
    };
    fetchMood();
  }, []);

  const changeMood = async (m: TacticalMood) => {
    setCurrentMood(m);
    try {
      await fetch('/api/agent/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: m })
      });
    } catch (err) {}
  };

  // Apply mood variables to root
  useEffect(() => {
    if (!isHydrated) return;
    const root = document.documentElement;
    const mood = MOODS[currentMood];
    root.style.setProperty("--agent-primary", mood.primary);
    root.style.setProperty("--agent-glow", mood.glow);
    root.style.setProperty("--agent-bg", mood.bg);
    root.style.setProperty("--agent-card-bg", mood.cardBg);
    root.style.setProperty("--agent-text", mood.text);
    root.style.setProperty("--agent-border", mood.border);
  }, [currentMood, isHydrated]);

  const AGENT_NAV_ITEMS = [
    { label: "Missions", icon: <LayoutDashboard className="w-5 h-5" />, href: "/agent/dashboard", color: "#00D1FF" },
    { label: "Live Trace", icon: <NavigationIcon className="w-5 h-5" />, href: "/agent/tracking", color: "#10B981" },
    { label: "History", icon: <History className="w-5 h-5" />, href: "/agent/history", color: "#FACC15" },
    { label: "Comms", icon: <Monitor className="w-5 h-5" />, href: "/agent/support", color: "#8b5cf6" },
    { label: "Profile", icon: <User className="w-5 h-5" />, href: "/agent/profile", color: "#EC4899" },
  ];

  const mood = MOODS[currentMood];

  if (!isHydrated) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Zap className="w-8 h-8 text-cyan-400 animate-pulse" /></div>;

  return (
    <div className="flex min-h-screen transition-colors duration-700 overflow-x-hidden md:pl-20 lg:pl-96" style={{ backgroundColor: mood.bg, color: mood.text }}>
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-20 lg:w-96 bg-bg-secondary/10 backdrop-blur-3xl border-r h-screen fixed left-0 top-0 z-[500] transition-all duration-500" style={{ borderColor: mood.border, backgroundColor: currentMood === 'DAYLIGHT' ? '#F1F5F9' : 'rgba(15, 23, 42, 0.8)' }}>
        <div className="px-6 lg:px-8 pt-4 pb-6 lg:pb-8 flex items-center justify-center lg:justify-start gap-3">
          <Link href="/agent/dashboard" className="flex items-center gap-2 group">
            <Logo size="lg" className="!w-[340px] !h-[85px]" />
          </Link>
        </div>

        {/* Operator Profile Widget - Desktop Sidebar */}
        <div className="px-6 py-4 mx-4 rounded-2xl border flex items-center gap-3 bg-black/10 backdrop-blur-md" style={{ borderColor: mood.border }}>
          <Link href="/agent/profile" className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center transition-all hover:scale-105 shrink-0" style={{ borderColor: mood.primary }}>
            <img 
              src={(user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined') ? user.avatar : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] font-black uppercase tracking-wider" style={{ color: mood.primary }}>Agent Active</p>
            </div>
            <p className="text-[10px] font-bold truncate uppercase tracking-wide mt-0.5" style={{ color: mood.text }}>{user?.name || "Abijeet"}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 pt-6">
          {AGENT_NAV_ITEMS.map((item: any) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.href)}
                className={cn(
                  "w-full flex items-center justify-center lg:justify-start gap-2.5 px-4 py-2 transition-all group relative overflow-hidden",
                  isActive ? "text-white shadow-glow-purple" : "hover:bg-black/5"
                )}
                style={{
                  clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  backgroundColor: isActive ? mood.primary : 'rgba(255,255,255,0.03)',
                  boxShadow: isActive ? `inset 0 0 0 1px ${item.color}` : 'none',
                  borderLeftWidth: '5px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: item.color || 'transparent'
                }}
              >
                <span 
                  className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "")}
                  style={{ color: !isActive ? item.color : undefined }}
                >
                  {item.icon}
                </span>
                <span className="hidden lg:block text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>

        {/* TACTICAL MOOD SWITCHER - DESKTOP */}
        <div className="px-4 py-6 border-t space-y-4" style={{ borderColor: mood.border }}>
           <p className="hidden lg:block text-[8px] font-black uppercase tracking-[0.2em] px-2 opacity-60">Tactical Mood</p>
           <div className="flex flex-col lg:flex-row gap-2">
              {(Object.keys(MOODS) as TacticalMood[]).map((m) => (
                 <button
                    key={m}
                    onClick={() => changeMood(m)}
                    className={cn(
                       "w-10 h-10 lg:w-full lg:h-10 rounded-xl flex items-center justify-center transition-all border",
                       currentMood === m ? "border-black/10 bg-black/5" : "border-transparent hover:bg-black/5"
                    )}
                    title={MOODS[m].label}
                 >
                    <span style={{ color: currentMood === m ? MOODS[m].primary : mood.text + '66' }}>{MOODS[m].icon}</span>
                    <span className="hidden lg:block text-[8px] font-black uppercase ml-2" style={{ color: mood.text }}>{m}</span>
                 </button>
              ))}
           </div>
        </div>

        <div className="p-6 border-t" style={{ borderColor: mood.border }}>
          <button 
            onClick={logout}
            className={cn(
              "w-full flex items-center justify-center lg:justify-start gap-2.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-danger transition-all group relative overflow-hidden"
            )}
            style={{
              clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderLeftWidth: '5px',
              borderLeftStyle: 'solid',
              borderLeftColor: '#EF4444'
            }}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="hidden lg:block relative z-10">TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay/Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[1000] flex">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu} />
           <aside className="relative w-72 h-full border-r shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col transition-all duration-500 pt-16" style={{ backgroundColor: mood.bg, borderColor: mood.border }}>
              {/* Close Button - Tactical Position */}
              <button 
                onClick={toggleMobileMenu} 
                className="absolute top-5 right-5 p-2.5 text-white rounded-xl active:scale-90 transition-all z-[1100]" 
                style={{ backgroundColor: mood.primary, boxShadow: `0 0 15px ${mood.glow}` }}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6 border-b flex items-center mb-0" style={{ borderColor: mood.border }}>
                 <Link href="/agent/dashboard" onClick={toggleMobileMenu} className="flex items-center gap-2">
                    <Logo size="lg" className="!w-[180px] !h-[45px]" />
                 </Link>
              </div>

              <nav className="flex-1 p-4 space-y-2 pt-8">
                 {AGENT_NAV_ITEMS.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                       <button
                          key={item.label}
                          onClick={() => handleNav(item.href)}
                          className={cn(
                             "w-full flex items-center gap-2.5 px-4 py-2 transition-all group relative overflow-hidden",
                             isActive ? "text-white shadow-glow-purple" : "hover:bg-black/5"
                          )}
                           style={{
                              clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                              backgroundColor: isActive ? mood.primary : 'rgba(255,255,255,0.03)',
                              boxShadow: isActive ? `inset 0 0 0 1px ${item.color}` : 'none',
                              borderLeft: `5px solid ${item.color || 'transparent'}`
                           }}
                       >
                          <span 
                            className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "")}
                            style={{ color: !isActive ? item.color : undefined }}
                          >
                            {item.icon}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                       </button>
                    );
                 })}
              </nav>

              {/* TACTICAL MOOD SWITCHER - MOBILE */}
              <div className="p-6 border-t space-y-4" style={{ borderColor: mood.border }}>
                 <div className="flex items-center gap-3 mb-2"><Palette className="w-4 h-4 opacity-40" style={{ color: mood.text }} /><p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: mood.text }}>Tactical Environment</p></div>
                 <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(MOODS) as TacticalMood[]).map((m) => (
                       <button
                          key={m}
                          onClick={() => changeMood(m)}
                          className={cn(
                             "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                             currentMood === m ? "bg-black/5 border-black/10" : "border-transparent bg-transparent"
                          )}
                       >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: currentMood === m ? mood.primary + "30" : "transparent", color: currentMood === m ? mood.primary : mood.text + "66" }}>{MOODS[m].icon}</div>
                          <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: mood.text }}>{m}</span>
                       </button>
                    ))}
                 </div>
              </div>

               <div className="p-6 border-t space-y-4" style={{ borderColor: mood.border }}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl transition-all" style={{ backgroundColor: mood.text + '05', border: `1px solid ${mood.border}` }}>
                     <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center" style={{ borderColor: mood.primary }}>
                        <img 
                          src={(user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined') ? user.avatar : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-bold uppercase tracking-widest leading-none" style={{ color: mood.primary }}>Agent Active</p>
                        <p className="text-[10px] font-bold uppercase italic" style={{ color: mood.text }}>{user?.name || "Abijeet"}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl transition-all" style={{ backgroundColor: mood.text + '05', border: `1px solid ${mood.border}` }}>
                     <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: mood.primary + '20', color: mood.primary }}><Compass className="w-5 h-5 animate-spin-slow" /></div>
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-bold uppercase tracking-widest leading-none" style={{ color: mood.primary }}>Sector</p>
                        <p className="text-[10px] font-bold uppercase italic" style={{ color: mood.text }}>Andaman-S07</p>
                     </div>
                  </div>
                 <button 
                    onClick={logout}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-danger transition-all group relative overflow-hidden"
                    )}
                    style={{
                      clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderLeftWidth: '5px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: '#EF4444'
                    }}
                  >
                    <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="relative z-10">TERMINATE SESSION</span>
                  </button>
              </div>
           </aside>
        </div>
      )}

      {/* Mobile Bottom Dock */}
      <nav 
        className="md:hidden fixed bottom-4 left-4 right-4 h-[54px] backdrop-blur-xl border flex items-center justify-around px-6 z-[500] transition-all duration-500" 
        style={{ 
          backgroundColor: mood.bg + "E6", 
          borderColor: mood.border,
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}
      >
        {AGENT_NAV_ITEMS.map((item: any) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0 h-full transition-all relative group px-2",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeGlowAgentDock"
                  className="absolute top-0 w-12 h-[3px] rounded-b-full shadow-glow-purple"
                  style={{ backgroundColor: item.color, boxShadow: `0 2px 10px ${item.color}` }}
                />
              )}
              <div className={cn(
                "transition-transform duration-300 group-active:scale-90",
                isActive && "scale-110"
              )}>
                <span style={{ color: item.color, opacity: isActive ? 1 : 0.6 }}>
                  {item.icon}
                </span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-0" style={{ color: isActive ? item.color : undefined, opacity: isActive ? 1 : 0.6 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 backdrop-blur-md border-b flex items-center justify-between px-6 sticky top-0 z-[400] transition-all duration-500" style={{ backgroundColor: mood.bg + "CC", borderColor: mood.border }}>
           <div className="flex items-center gap-4">
              <button onClick={toggleMobileMenu} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: mood.text + '10', color: mood.text }}><Menu className="w-6 h-6" /></button>
              <Link href="/agent/dashboard" className="flex items-center gap-2">
                 <Logo size="lg" />
              </Link>
           </div>
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full border flex items-center justify-center relative transition-colors" style={{ backgroundColor: mood.text + '10', borderColor: mood.border }}>
                 <Bell className="w-5 h-5 opacity-60" style={{ color: mood.text }} />
                 <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2" style={{ backgroundColor: mood.primary, borderColor: mood.bg }} />
              </button>
              <Link href="/agent/profile" className="w-10 h-10 rounded-full border overflow-hidden flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ borderColor: mood.border }}>
                 <img 
                   src={(user?.avatar && user.avatar !== 'null' && user.avatar !== 'undefined') ? user.avatar : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} 
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
              </Link>
           </div>
        </header>

        <div className="animate-fade-in" style={{"--agent-primary": mood.primary, "--agent-glow": mood.glow, "--agent-text": mood.text, "--agent-card-bg": mood.cardBg, "--agent-border": mood.border} as any}>
          {children}
        </div>
      </main>

    </div>
  );
}
