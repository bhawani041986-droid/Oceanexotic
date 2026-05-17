"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Palette, 
  Moon, 
  Sun, 
  Zap, 
  Droplets, 
  Sparkles, 
  Layout, 
  Monitor,
  Check,
  ChevronRight,
  Maximize2,
  Wind,
  Save,
  ShieldCheck,
  RefreshCw,
  Fingerprint
} from "lucide-react";
import { useTheme, ThemeType } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const THEMES: { id: ThemeType; name: string; description: string; colors: string[]; style: string; accent: string; gradient: string }[] = [
  { 
    id: "theme-ocean-neon", 
    name: "Ocean Neon", 
    description: "Cyberpunk maritime node with electric violet flows.", 
    colors: ["#7C3AED", "#3B82F6", "#06B6D4"],
    style: "bg-[#0B1120]",
    accent: "bg-primary shadow-glow-purple",
    gradient: "from-[#7C3AED] via-[#3B82F6] to-[#06B6D4]"
  },
  { 
    id: "theme-midnight-executive", 
    name: "Midnight", 
    description: "Elite dark-matter interface for deep-sea logistics.", 
    colors: ["#6366F1", "#4F46E5", "#1E1B4B"],
    style: "bg-[#020617]",
    accent: "bg-indigo-500 shadow-glow-purple",
    gradient: "from-[#6366F1] to-[#1E1B4B]"
  },
  { 
    id: "theme-aqua-glass", 
    name: "Aqua Glass", 
    description: "Crystalline aquatic depth with refractive surfaces.", 
    colors: ["#0EA5E9", "#2DD4BF", "#F0FDFA"],
    style: "bg-[#082F49]",
    accent: "bg-cyan-400 shadow-glow-blue",
    gradient: "from-[#0EA5E9] to-[#2DD4BF]"
  },
  { 
    id: "theme-royal-purple", 
    name: "Royal Purple", 
    description: "Imperial velvet tones with gilded highlights.", 
    colors: ["#581C87", "#7C3AED", "#FDE047"],
    style: "bg-[#2E1065]",
    accent: "bg-purple-500 shadow-glow-purple",
    gradient: "from-[#581C87] to-[#7C3AED]"
  },
  { 
    id: "theme-carbon-minimal", 
    name: "Carbon", 
    description: "Hyper-clean industrial monolith aesthetic.", 
    colors: ["#0F172A", "#334155", "#F8FAFC"],
    style: "bg-[#0F172A]",
    accent: "bg-slate-500",
    gradient: "from-[#0F172A] to-[#334155]"
  },
  { 
    id: "theme-sunset-energy", 
    name: "Sunset", 
    description: "Volcanic energy dispatch for high-throughput hubs.", 
    colors: ["#F97316", "#DC2626", "#FACC15"],
    style: "bg-[#431407]",
    accent: "bg-orange-500 shadow-glow-orange",
    gradient: "from-[#F97316] to-[#DC2626]"
  },
  { 
    id: "theme-light-sovereign", 
    name: "Sovereign", 
    description: "High-precision light mode with soft elevation.", 
    colors: ["#7C3AED", "#2563EB", "#F8FAFC"],
    style: "bg-white",
    accent: "bg-primary shadow-lg",
    gradient: "from-[#7C3AED] to-[#2563EB]"
  },
  { 
    id: "theme-alibaba-orange", 
    name: "Alibaba", 
    description: "Wholesale maritime node with high-authority orange.", 
    colors: ["#FF6600", "#064495", "#0B1120"],
    style: "bg-[#0B1120]",
    accent: "bg-[#FF6600] shadow-glow-orange",
    gradient: "from-[#FF6600] to-[#064495]"
  },
  { 
    id: "theme-amazon-global", 
    name: "Amazon", 
    description: "Prime logistics infrastructure with amber highlights.", 
    colors: ["#FF9900", "#232F3E", "#131921"],
    style: "bg-[#131921]",
    accent: "bg-[#FF9900] shadow-glow-orange",
    gradient: "from-[#FF9900] to-[#232F3E]"
  },
  { 
    id: "theme-swiggy-vibrant", 
    name: "Swiggy", 
    description: "High-velocity culinary dispatch aesthetics.", 
    colors: ["#FC8019", "#F8FAFC", "#282C3F"],
    style: "bg-white",
    accent: "bg-[#FC8019] shadow-md",
    gradient: "from-[#FC8019] to-[#FDA054]"
  },
  { 
    id: "theme-zomato-passion", 
    name: "Zomato", 
    description: "Gourmet discovery engine with passionate red flows.", 
    colors: ["#E23744", "#F8FAFC", "#1C1C1C"],
    style: "bg-white",
    accent: "bg-[#E23744] shadow-md",
    gradient: "from-[#E23744] to-[#EF4F5F]"
  },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme, font, setFont, blurIntensity, setBlurIntensity, glowIntensity, setGlowIntensity } = useTheme(
  );
  const { setSettings, pushSettings } = useSettingsStore(
  );
  const { toast } = useToast(
  );
  const [isSaving, setIsSaving] = useState(false
  );
  const [saveSuccess, setSaveSuccess] = useState(false
  );

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme
  );
    setSettings({ theme: newTheme }
  );
  };

  const handleSave = async () => {
    setIsSaving(true
  );
    try {
      const success = await pushSettings(
  );
      if (success) {
        setSaveSuccess(true
  );
        toast("Theme configuration persisted to sovereign vault.", "success"
  );
        setTimeout(() => setSaveSuccess(false), 3000
  );
      } else {
        toast("Registry synchronization failed.", "error"
  );
      }
    } catch (err) {
      toast("Connection failure during synchronization.", "error"
  );
    } finally {
      setIsSaving(false
  );
    }
  };

  return (

    <div className="space-y-[10px] md:space-y-12 animate-fade-in pb-32 lg:pb-0">
      
      {/* Ultra Modern Header Section */}
      <div className="relative overflow-hidden rounded-[20px] md:rounded-[40px] p-[10px] md:p-16 border border-[var(--foreground)]/5 bg-gradient-to-br from-bg-secondary/80 to-transparent">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-[10px] md:gap-10">
          <div className="space-y-[4px] md:space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
               <Badge variant="glass" className="px-[6px] py-[2px] md:px-4 md:py-1 text-[7px] md:text-[8px] tracking-[0.3em] font-black bg-primary/20 text-primary border-primary/30">
                  SYSTEM DIRECTIVE
               </Badge>
               <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary animate-pulse shadow-glow-purple" />
            </div>
            <h2 className="text-2xl md:text-6xl font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-none">
               Skin <span className="text-primary underline decoration-primary/20 underline-offset-8">Studio</span>
            </h2>
            <p className="text-[8px] md:text-xs font-black text-text-secondary uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto lg:mx-0 opacity-60">
               Reconfigure your marketplace node's visual telemetry and sensory outputs.
            </p>
          </div>

          <div className="flex flex-col items-center gap-[4px] md:gap-4">
             <div className="flex -space-x-2 md:-space-x-4">
                {THEMES.map(t => (
                  <div key={t.id} className={cn("w-6 h-6 md:w-12 md:h-12 rounded-full border border-bg-primary shadow-xl overflow-hidden", t.style)}>
                     <div className={cn("w-full h-full opacity-50", t.style)} />
                  </div>
                ))}
             </div>
             <p className="text-[6px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest">6 SENSORY MODULES LOADED</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] md:gap-12">
        
        {/* Theme selection logic remains same but with refined cards */}
        <div className="lg:col-span-2 space-y-[10px] md:space-y-10">
           {/* Sensory Modules - 3x2 Grid */}
           <div className="flex items-center justify-between px-1">
              <div className="space-y-[2px] md:space-y-1">
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Layout className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Sensory Modules
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Select a hyper-premium app identity.</p>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {THEMES.map((t, i) => {
                const isActive = theme === t.id;
                return (

                   <motion.button 
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleThemeChange(t.id)}
                    className={cn(
                      "group relative h-28 md:h-44 transition-all active:scale-[0.95]",
                      isActive ? "z-20" : "z-10"
                    )}
                  >
                    <div 
                      className={cn(
                        "absolute inset-0 transition-all duration-500",
                        isActive ? "opacity-100 scale-105" : "opacity-80 group-hover:opacity-100 group-hover:scale-102"
                      )}
                      style={{ 
                        clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)',
                        background: isActive ? `var(--c-primary)` : 'rgba(255,255,255,0.05)',
                        padding: '2px'
                      }}
                    >
                      <div className="w-full h-full relative overflow-hidden bg-bg-secondary" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                         <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br", t.gradient)} />
                         
                         <motion.div 
                           animate={{ y: ["-100%", "200%"] }}
                           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                           className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 pointer-events-none"
                         />

                         <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3 md:gap-5">
                            <motion.div 
                              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 3, repeat: Infinity }}
                              className={cn(
                                "w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-all duration-500",
                                isActive ? t.accent : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10"
                              )}
                            >
                               <Sparkles className={cn(
                                 "w-5 h-5 md:w-8 md:h-8",
                                 isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/40 group-hover:text-primary"
                               )} />
                            </motion.div>
                            
                            <h4 className={cn(
                              "text-[9px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors duration-500",
                              isActive ? "text-[var(--foreground)]" : "text-text-secondary group-hover:text-[var(--foreground)]"
                            )}>
                              {t.name}
                            </h4>
                         </div>
                      </div>
                    </div>

                    {isActive && (
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         className="absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-primary flex items-center justify-center z-30 shadow-glow-purple"
                         style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 70%, 70% 100%, 0% 100%, 0% 30%)' }}
                       >
                          <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-[var(--foreground)]" />
                       </motion.div>
                    )}
                  </motion.button>
                
  );
              })}
           </div>

           {/* Typography Engine - Dropdown Style */}
           <div className="pt-10 space-y-8">
              <div className="flex items-center justify-between px-1">
                 <div className="space-y-[2px] md:space-y-1">
                    <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                       <Palette className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Typography Engine
                    </h3>
                    <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Select a high-density typeface for global trade.</p>
                 </div>
              </div>

              <div className="relative group/select max-w-2xl">
                 <div className="absolute inset-0 bg-primary/5 blur-xl group-hover/select:bg-primary/10 transition-colors" />
                 <div className="relative overflow-hidden bg-bg-secondary/40 border border-[var(--foreground)]/5 rounded-[24px] md:rounded-[32px] p-2">
                    <select 
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                      className="w-full bg-transparent text-[var(--foreground)] font-black uppercase tracking-widest text-[10px] md:text-sm py-4 md:py-6 px-6 md:px-10 outline-none appearance-none cursor-pointer relative z-10"
                    >
                       {[
                         { id: "font-inter", name: "Inter Sans — Universal Neutral" },
                         { id: "font-plus-jakarta", name: "Jakarta Sans — Modern Vibrant" },
                         { id: "font-outfit", name: "Outfit Premium — Geometric Luxury" },
                         { id: "font-space-grotesk", name: "Space Grotesk — Cyber Industrial" },
                         { id: "font-kanit", name: "Kanit Display — High Density" },
                         { id: "font-cinzel", name: "Cinzel Heritage — Imperial Serif" },
                       ].map(f => (
                         <option key={f.id} value={f.id} className="bg-[#0B1120] text-[var(--foreground)] py-4">{f.name}</option>
                       ))}
                    </select>
                    <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                       <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-primary rotate-90" />
                    </div>
                 </div>
                 
                 {/* Live Sample Box */}
                 <div className="mt-4 px-6 py-4 bg-[var(--foreground)]/5 rounded-[20px] border border-[var(--foreground)]/5 flex items-center justify-between">
                    <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">Active Sample</p>
                    <h5 className={cn("text-xl md:text-3xl font-black text-[var(--foreground)] italic tracking-tight", font)}>
                       OceanExotic Global Registry 123
                    </h5>
                 </div>
              </div>
           </div>
        </div>

        {/* Sensory Controls & Persistent Save */}
        <div className="space-y-[10px] md:space-y-8">
           <Card className="p-[10px] md:p-10 space-y-[15px] md:space-y-10 rounded-[20px] md:rounded-[40px] border-[var(--foreground)]/5 bg-bg-secondary/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <div className="space-y-[4px] md:space-y-1 relative z-10">
                 <h3 className="text-[10px] md:text-base font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Fingerprint className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Bio-Telemetry
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">Adjust interface rendering intensity.</p>
              </div>

              {/* Intensity Controls */}
              <div className="space-y-[15px] md:space-y-10 relative z-10">
                 <div className="space-y-[6px] md:space-y-5">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                          <Droplets className="w-3 h-3 md:w-4 md:h-4 text-primary" /> Glass Depth
                       </p>
                       <span className="text-[8px] md:text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{blurIntensity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="150" 
                      value={blurIntensity} 
                      onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-full appearance-none cursor-pointer accent-primary" 
                    />
                 </div>

                 <div className="space-y-[6px] md:space-y-5">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" /> Glow Energy
                       </p>
                       <span className="text-[8px] md:text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{glowIntensity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="200" 
                      value={glowIntensity} 
                      onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-full appearance-none cursor-pointer accent-primary" 
                    />
                 </div>
              </div>

              {/* Ultra Modern Action Buttons */}
              <div className="space-y-[8px] md:space-y-4 pt-2 md:pt-4 relative z-10">
                 <Button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className={cn(
                     "w-full h-12 md:h-16 text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase rounded-[12px] md:rounded-[24px] shadow-glow-purple transition-all flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden",
                     saveSuccess ? "bg-success shadow-glow-success" : "bg-primary"
                   )}
                 >
                   <AnimatePresence mode="wait">
                     {isSaving ? (
                       <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                       </motion.div>
                     ) : saveSuccess ? (
                       <motion.div key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 md:gap-3">
                         <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> SYNCED
                       </motion.div>
                     ) : (
                       <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 md:gap-3">
                         <Save className="w-4 h-4 md:w-5 md:h-5" /> PERSIST SETTINGS
                       </motion.div>
                     ) }
                   </AnimatePresence>
                 </Button>

                 <Button 
                    variant="outline" 
                    onClick={() => {
                       handleThemeChange("theme-ocean-neon"
  );
                       setFont("font-inter"
  );
                       setBlurIntensity(100
  );
                       setGlowIntensity(100
  );
                       toast("Interface Baselines Restored.", "info"
  );
                    }}
                    className="w-full h-10 md:h-14 text-[7px] md:text-[9px] font-black tracking-widest uppercase rounded-[10px] md:rounded-[20px] border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 opacity-60"
                 >
                    RESTORE DEFAULTS
                 </Button>
              </div>
           </Card>

           {/* Security / Verification Badge Card */}
           <Card className="p-[10px] md:p-8 space-y-[8px] md:space-y-6 rounded-[20px] md:rounded-[36px] bg-gradient-to-br from-success/10 to-transparent border border-success/20">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-success/20 flex items-center justify-center text-success border border-success/30">
                    <ShieldCheck className="w-4 h-4 md:w-6 md:h-6" />
                 </div>
                 <div className="space-y-[1px] md:space-y-0.5">
                    <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Sovereign Vault</p>
                    <p className="text-[6px] md:text-[8px] font-black text-success uppercase tracking-widest">Biometric Encrypted</p>
                 </div>
              </div>
              <p className="text-[8px] md:text-[11px] text-[var(--foreground)]/70 font-medium leading-relaxed italic opacity-60">
                 Your visual preferences are securely hashed and synchronized across all authorized nodes.
              </p>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
