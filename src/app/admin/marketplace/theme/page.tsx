"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  useSettingsStore, 
  DEFAULT_AMAZON_HERO_CARDS, 
  AmazonHeroCardConfig,
  DEFAULT_SWIGGY_BANNERS,
  DEFAULT_ZOMATO_HERO,
  DEFAULT_COMPACT_STRIP,
  SwiggyBannerSlide,
  ZomatoHeroConfig,
  CompactStripConfig
} from "@/store/settingsStore";
import { CUSTOMER_THEMES, CustomerTheme } from "@/config/customerThemes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Palette, 
  Check, 
  Image as ImageIcon, 
  Upload, 
  Zap, 
  ShieldCheck, 
  Globe,
  Layout,
  Sparkles,
  RefreshCcw,
  Smartphone,
  Save,
  Apple,
  Megaphone,
  Box,
  Droplets,
  ChevronRight,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";
interface ImageUploaderBoxProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: "square" | "banner";
}

function ImageUploaderBox({ label, value, onChange, aspect = "square" }: ImageUploaderBoxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/system/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.status === "success" && data.url) {
        onChange(data.url);
      } else {
        alert(data.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[8.5px] font-bold text-slate-400 uppercase block">{label}</label>
      <div className="flex items-center gap-2">
        {value ? (
          <div className={`relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0 ${aspect === 'banner' ? 'w-16 h-10' : 'w-10 h-10'}`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : null}
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase hover:bg-emerald-500/30 transition-all flex items-center gap-1 flex-shrink-0"
        >
          {isUploading ? "Uploading..." : "📤 Upload File"}
        </button>

        <input
          type="text"
          placeholder="https://... or uploaded URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono"
        />
      </div>
    </div>
  );
}

export default function MarketplaceThemeControl() {
  const { customerTheme, heroStyle, amazonHeroCards, swiggyBanners, zomatoHeroConfig, compactStripConfig, logoTextColor, logoPrimaryColor, logoSecondaryColor, atmosphericGlow, heroOverlayOpacity, customerAssets, setSettings, pushSettings, fetchSettings } = useSettingsStore();
  const { toast } = useToast();
  const [selectedThemeId, setSelectedThemeId] = useState(customerTheme);
  const [tempAssets, setTempAssets] = useState(customerAssets);
  const [tempGlow, setTempGlow] = useState(atmosphericGlow);
  const [tempHeroOpacity, setTempHeroOpacity] = useState(heroOverlayOpacity ?? 80);
  const [tempHeroStyle, setTempHeroStyle] = useState(heroStyle || "AMAZON_CARD_GRID");
  const [tempAmazonCards, setTempAmazonCards] = useState<AmazonHeroCardConfig[]>(amazonHeroCards || DEFAULT_AMAZON_HERO_CARDS);
  const [tempSwiggyBanners, setTempSwiggyBanners] = useState<SwiggyBannerSlide[]>(swiggyBanners || DEFAULT_SWIGGY_BANNERS);
  const [tempZomatoHero, setTempZomatoHero] = useState<ZomatoHeroConfig>(zomatoHeroConfig || DEFAULT_ZOMATO_HERO);
  const [tempCompactStrip, setTempCompactStrip] = useState<CompactStripConfig>(compactStripConfig || DEFAULT_COMPACT_STRIP);
  const [tempLogoTextColor, setTempLogoTextColor] = useState(logoTextColor || "#00D1FF");
  const [tempLogoPrimaryColor, setTempLogoPrimaryColor] = useState(logoPrimaryColor || "#00D1FF");
  const [tempLogoSecondaryColor, setTempLogoSecondaryColor] = useState(logoSecondaryColor || "#F0ABFC");
  const [isCommitting, setIsCommitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStation, setActiveStation] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync with store when hydrated or updated
  useEffect(() => {
    setTempAssets(customerAssets);
    setSelectedThemeId(customerTheme);
    setTempGlow(atmosphericGlow);
    setTempHeroOpacity(heroOverlayOpacity ?? 80);
    setTempHeroStyle(heroStyle || "AMAZON_CARD_GRID");
    if (amazonHeroCards && amazonHeroCards.length > 0) setTempAmazonCards(amazonHeroCards);
    if (swiggyBanners && swiggyBanners.length > 0) setTempSwiggyBanners(swiggyBanners);
    if (zomatoHeroConfig) setTempZomatoHero(zomatoHeroConfig);
    if (compactStripConfig) setTempCompactStrip(compactStripConfig);
    setTempLogoTextColor(logoTextColor || "#00D1FF");
    setTempLogoPrimaryColor(logoPrimaryColor || "#00D1FF");
    setTempLogoSecondaryColor(logoSecondaryColor || "#F0ABFC");
  }, [customerAssets, customerTheme, atmosphericGlow, heroOverlayOpacity, heroStyle, amazonHeroCards, swiggyBanners, zomatoHeroConfig, compactStripConfig, logoTextColor, logoPrimaryColor, logoSecondaryColor]);

  const isDirty = selectedThemeId !== customerTheme || 
                  tempGlow !== atmosphericGlow || 
                  tempHeroOpacity !== (heroOverlayOpacity ?? 80) ||
                  tempHeroStyle !== heroStyle ||
                  JSON.stringify(tempAmazonCards) !== JSON.stringify(amazonHeroCards || DEFAULT_AMAZON_HERO_CARDS) ||
                  JSON.stringify(tempSwiggyBanners) !== JSON.stringify(swiggyBanners || DEFAULT_SWIGGY_BANNERS) ||
                  JSON.stringify(tempZomatoHero) !== JSON.stringify(zomatoHeroConfig || DEFAULT_ZOMATO_HERO) ||
                  JSON.stringify(tempCompactStrip) !== JSON.stringify(compactStripConfig || DEFAULT_COMPACT_STRIP) ||
                  tempLogoTextColor !== logoTextColor ||
                  tempLogoPrimaryColor !== logoPrimaryColor ||
                  tempLogoSecondaryColor !== logoSecondaryColor ||
                  JSON.stringify(tempAssets) !== JSON.stringify(customerAssets);
                  tempLogoTextColor !== logoTextColor ||
                  tempLogoPrimaryColor !== logoPrimaryColor ||
                  tempLogoSecondaryColor !== logoSecondaryColor ||
                  JSON.stringify(tempAssets) !== JSON.stringify(customerAssets);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
    toast(`Selected ${CUSTOMER_THEMES.find(t => t.id === themeId)?.name} for the PUBLIC STOREFRONT. Click SYNCHRONIZE to publish.`, "info");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeStation) {
      toast(`Uploading ${activeStation.toUpperCase()} to secure CDN storage...`, "info");
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/system/upload", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        if (data.status === "success" && data.url) {
          setTempAssets(prev => ({
            ...prev,
            [activeStation]: data.url
          }));
          toast(`${activeStation.toUpperCase()} uploaded successfully and staged.`, "success");
        } else {
          toast(data.message || "Failed to upload asset.", "error");
        }
      } catch (err) {
        console.error("Asset upload error:", err);
        toast("An error occurred during file upload.", "error");
      }
    }
  };

  const triggerUpload = (stationId: string) => {
    setActiveStation(stationId
  );
    setTimeout(() => {
      fileInputRef.current?.click(
  );
    }, 10
  );
  };

  const handleCommit = async () => {
    setIsCommitting(true);
    setSettings({
      customerTheme: selectedThemeId,
      customerAssets: tempAssets,
      atmosphericGlow: tempGlow,
      heroOverlayOpacity: tempHeroOpacity,
      heroStyle: tempHeroStyle,
      amazonHeroCards: tempAmazonCards,
      swiggyBanners: tempSwiggyBanners,
      zomatoHeroConfig: tempZomatoHero,
      compactStripConfig: tempCompactStrip,
      logoTextColor: tempLogoTextColor,
      logoPrimaryColor: tempLogoPrimaryColor,
      logoSecondaryColor: tempLogoSecondaryColor
    });
    const success = await pushSettings();
    setIsCommitting(false);
    if (success) {
      toast("Marketplace protocols synchronized to System Registry.", "success"
  );
    } else {
      toast("Database synchronization failed.", "error"
  );
    }
  };

  const uploadStations = [
    { id: 'logo', title: 'Master Logo', desc: 'PNG', icon: <ImageIcon className="w-5 h-5 text-primary" />, aspect: 'aspect-[3/1]', preview: tempAssets.logo },
    { id: 'hero', title: 'Hero Slide 1', desc: 'Desktop (16:9)', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: tempAssets.hero },
    { id: 'mobileHero', title: 'Mobile Hero', desc: 'Portrait (4:5 or 9:16)', icon: <Smartphone className="w-5 h-5 text-warning" />, aspect: 'aspect-[4/5] w-32 mx-auto', preview: (tempAssets as any).mobileHero || null },
    { id: 'hero2', title: 'Hero Slide 2', desc: 'Optional', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: (tempAssets as any).hero2 || null },
    { id: 'hero3', title: 'Hero Slide 3', desc: 'Optional', icon: <Zap className="w-5 h-5 text-warning" />, aspect: 'aspect-video', preview: (tempAssets as any).hero3 || null },
    { id: 'favicon', title: 'System Favicon', desc: '32x32', icon: <Globe className="w-5 h-5 text-blue-500" />, aspect: 'aspect-square w-16 mx-auto', preview: tempAssets.favicon },
    { id: 'appleIcon', title: 'Apple Icon', desc: '180x180', icon: <Apple className="w-5 h-5 text-[var(--foreground)]" />, aspect: 'aspect-square w-24 mx-auto', preview: (tempAssets as any).appleIcon || null },
    { id: 'promo', title: 'Promo #1', desc: 'Campaign', icon: <Megaphone className="w-5 h-5 text-success" />, aspect: 'aspect-[16/9]', preview: tempAssets.promo },
    { id: 'mobile', title: 'Mobile Splash', desc: 'Launch', icon: <Smartphone className="w-5 h-5 text-purple-500" />, aspect: 'aspect-[9/16] w-24 mx-auto', preview: tempAssets.mobile },
    { id: 'customerAppIcon', title: 'Customer App Icon', desc: '1024x1024 PNG', icon: <Smartphone className="w-5 h-5 text-blue-400" />, aspect: 'aspect-square w-24 mx-auto', preview: tempAssets.customerAppIcon || null },
    { id: 'agentAppIcon', title: 'Agent App Icon', desc: '1024x1024 PNG', icon: <Smartphone className="w-5 h-5 text-indigo-400" />, aspect: 'aspect-square w-24 mx-auto', preview: tempAssets.agentAppIcon || null },
    { id: 'sellerAppIcon', title: 'Seller App Icon', desc: '1024x1024 PNG', icon: <Smartphone className="w-5 h-5 text-green-400" />, aspect: 'aspect-square w-24 mx-auto', preview: tempAssets.sellerAppIcon || null },
    { id: 'adminAppIcon', title: 'Admin App Icon', desc: '1024x1024 PNG', icon: <Smartphone className="w-5 h-5 text-red-400" />, aspect: 'aspect-square w-24 mx-auto', preview: tempAssets.adminAppIcon || null }
  ];

  return (

    <div className="space-y-[10px] md:space-y-12 animate-fade-in pb-32 pt-4 md:pt-10 px-4 md:px-0">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      
      {/* HIGH-FIDELITY HEADER: Matches Settings Style Exactly */}
      <div className="relative overflow-hidden rounded-[20px] md:rounded-[40px] p-[10px] md:p-12 border border-[var(--foreground)]/5 bg-gradient-to-br from-bg-secondary/80 to-transparent">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Badge variant="glass" className="px-4 py-1 text-[8px] tracking-[0.3em] font-black bg-primary/20 text-primary border-primary/30">
                  MARKETPLACE GOVERNANCE
               </Badge>
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow-purple" />
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-none">
               Visual <span className="text-primary underline decoration-primary/20 underline-offset-8">Systemty</span>
            </h1>
            <div className="space-y-1">
               <p className="text-[8px] md:text-xs font-black text-text-secondary uppercase tracking-[0.3em] opacity-80 italic">Global Aesthetic Registry Active | Operational Status: Prime</p>
               <p className="text-[10px] md:text-sm font-black text-warning uppercase tracking-widest bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg inline-block">⚠️ THESE SETTINGS CONTROL THE PUBLIC STOREFRONT</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button 
              onClick={handleCommit}
              disabled={isCommitting || !isDirty}
              className="h-12 md:h-16 px-8 md:px-12 rounded-xl md:rounded-[24px] bg-primary text-[var(--foreground)] shadow-glow-purple text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 italic"
             >
               {isCommitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> COMMIT REGISTRY</>}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[10px] md:gap-12">
        
        {/* LEFT: Octagonal Theme Selection */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-1">
              <div className="space-y-[2px] md:space-y-1">
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2 md:gap-3">
                    <Palette className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" /> Storefront Aesthetic Protocol
                 </h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Select a high-fidelity theme for your public marketplace. (Admin settings are located in the main settings tab).</p>
              </div>
              <Badge variant="glass" className="text-[8px] md:text-[9px] font-black">{CUSTOMER_THEMES.length} Themes</Badge>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
             {CUSTOMER_THEMES.map((theme, i) => {
               const isActive = selectedThemeId === theme.id;
               return (

                 <motion.button
                   key={theme.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => handleThemeSelect(theme.id)}
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
                       background: isActive ? `var(--foreground)` : 'rgba(255,255,255,0.05)',
                       padding: '2px'
                     }}
                   >
                     <div className="w-full h-full relative overflow-hidden bg-bg-secondary" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                        <div 
                           className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                           style={{ backgroundColor: theme.colors.primary }} 
                        />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-2 md:gap-4 text-center">
                           <div 
                             className={cn(
                               "w-8 h-8 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-500",
                               isActive ? "shadow-glow-purple" : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10"
                             )}
                             style={{ 
                               backgroundColor: isActive ? theme.colors.primary : 'transparent',
                               borderRadius: theme.visuals.radiusBtn 
                             }}
                           >
                              <Sparkles className={cn("w-4 h-4 md:w-7 md:h-7", isActive ? "text-[var(--foreground)]" : "text-primary")} />
                           </div>
                           <h4 className={cn("text-[8px] md:text-[10px] font-black uppercase tracking-widest", isActive ? "text-[var(--foreground)]" : "text-text-secondary")}>{theme.name}</h4>
                        </div>
                     </div>
                   </div>
                   {isActive && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-6 h-6 bg-primary flex items-center justify-center z-30 shadow-glow-purple" style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 70%, 70% 100%, 0% 100%, 0% 30%)' }}>
                         <Check className="w-3.5 h-3.5 text-[var(--foreground)]" />
                      </motion.div>
                   )}
                 </motion.button>
               
  );
             })}
           </div>

         {/* 🚀 ADMIN HERO LAYOUT THEME SWITCHER PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Layout className="w-5 h-5 text-primary" /> Storefront Hero Layout Switcher Mode
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Select and switch the active hero section layout displayed to customers on Web and Mobile App.
                  </p>
               </div>
               <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[9px] font-black uppercase tracking-wider">
                  Active Mode: {tempHeroStyle}
               </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  {
                     id: "AMAZON_CARD_GRID",
                     title: "🛒 Amazon Multi-Card Grid",
                     desc: "Horizontal snap carousel of themed cards with 2x2 product grids, thumbnails, & prices.",
                     badge: "Recommended",
                     color: "border-teal-500 bg-teal-950/40 text-teal-300"
                  },
                  {
                     id: "SWIGGY_DYNAMIC_BANNER",
                     title: "⚡ Swiggy Animated Banners",
                     desc: "Full-bleed animated banner slides with CTA buttons, wave dividers, & fish pagination.",
                     badge: "Dynamic",
                     color: "border-blue-500 bg-blue-950/40 text-blue-300"
                  },
                  {
                     id: "ZOMATO_HIGH_IMPACT",
                     title: "🌟 Zomato High-Impact Hero",
                     desc: "Atmospheric video/photo backdrop with embedded search bar overlay & trust badges.",
                     badge: "High Impact",
                     color: "border-purple-500 bg-purple-950/40 text-purple-300"
                  },
                  {
                     id: "COMPACT_MINIMAL_STRIP",
                     title: "🏷️ Compact Minimal Strip",
                     desc: "Sleek compact banner strip for high-density product browsing.",
                     badge: "Compact",
                     color: "border-amber-500 bg-amber-950/40 text-amber-300"
                  }
               ].map((mode) => {
                  const isActive = tempHeroStyle === mode.id;
                  return (
                     <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                           setTempHeroStyle(mode.id as any);
                           toast(`Selected ${mode.title} layout! Click SYNCHRONIZE to publish live.`, "info");
                        }}
                        className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                           isActive 
                              ? "border-primary bg-primary/20 shadow-xl scale-[1.02]" 
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950"
                        }`}
                     >
                        {isActive && (
                           <div className="absolute -top-2 -right-2 bg-primary text-slate-950 p-1 rounded-full shadow-lg">
                              <Check className="w-4 h-4 font-black" />
                           </div>
                        )}
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wider text-white">{mode.title}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${mode.color}`}>
                                 {mode.badge}
                              </span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                              {mode.desc}
                           </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-bold">
                           <span className={isActive ? "text-primary" : "text-slate-500"}>
                              {isActive ? "✓ SELECTED LAYOUT" : "SELECT MODE"}
                           </span>
                           <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-slate-600"}`} />
                        </div>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* 🛒 ADMIN AMAZON HERO CARDS CUSTOMIZER & MANAGER PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Layers className="w-5 h-5 text-emerald-400" /> Amazon Hero Card Customizer & 2x2 Grid Manager
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Add, customize titles, change theme colors, and configure 2x2 product grids for all Amazon Hero Cards.
                  </p>
               </div>
               <button
                  type="button"
                  onClick={() => {
                     const newId = `card-${Date.now()}`;
                     const newCard: AmazonHeroCardConfig = {
                        id: newId,
                        title: "Custom Seafood Collection",
                        badge: "Special Deal",
                        themeColor: "#0d5c3a",
                        accentColor: "#10B981",
                        active: true,
                        items: [
                           { name: "Surmai Steaks", price: "₹1,899", oldPrice: "₹2,299", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Surmai" },
                           { name: "King Jumbo Prawns", price: "₹6,989", oldPrice: "₹7,999", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
                           { name: "Seawater Crabs", price: "₹2,799", oldPrice: "₹3,499", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
                           { name: "Red Snapper Fillet", price: "₹798", oldPrice: "₹999", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Snapper" },
                        ]
                     };
                     setTempAmazonCards([...tempAmazonCards, newCard]);
                     toast("Created new Amazon Hero Card!", "success");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
               >
                  <span>+</span> Add New Hero Card
               </button>
            </div>

            {/* List of Configured Amazon Hero Cards */}
            <div className="space-y-6">
               {(tempAmazonCards && tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS).map((card, index) => {
                  return (
                     <div 
                        key={card.id || index}
                        className="rounded-2xl border border-emerald-500/40 bg-slate-950 p-5 shadow-xl space-y-4"
                     >
                        {/* Card Header & Controls */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                           <div className="flex items-center gap-3">
                              <div 
                                 className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                                 style={{ backgroundColor: card.themeColor || "#0d5c3a" }}
                              />
                              <span className="text-sm font-black text-white uppercase tracking-wider">
                                 Hero Card #{index + 1}: {card.title}
                              </span>
                           </div>
                           <div className="flex items-center gap-3">
                              <button
                                 type="button"
                                 onClick={() => {
                                    const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                    const updated = currentCards.map(c => c.id === card.id ? { ...c, active: !c.active } : c);
                                    setTempAmazonCards(updated);
                                 }}
                                 className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition-all ${
                                    card.active !== false
                                       ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                       : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                 }`}
                              >
                                 {card.active !== false ? "✓ ACTIVE ON APP" : "✕ DISABLED"}
                              </button>
                              
                              {tempAmazonCards.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => {
                                       setTempAmazonCards(tempAmazonCards.filter(c => c.id !== card.id));
                                       toast("Removed hero card.", "info");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold hover:bg-rose-500/20"
                                 >
                                    Delete Card
                                 </button>
                              )}
                           </div>
                        </div>

                        {/* Card Basic Settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                                 Card Header Title
                              </label>
                              <input
                                 type="text"
                                 value={card.title}
                                 onChange={(e) => {
                                    const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                    const updated = currentCards.map(c => c.id === card.id ? { ...c, title: e.target.value } : c);
                                    setTempAmazonCards(updated);
                                 }}
                                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                              />
                           </div>
                           <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                                 Badge Tag Text
                              </label>
                              <input
                                 type="text"
                                 value={card.badge}
                                 onChange={(e) => {
                                    const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                    const updated = currentCards.map(c => c.id === card.id ? { ...c, badge: e.target.value } : c);
                                    setTempAmazonCards(updated);
                                 }}
                                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                              />
                           </div>
                        </div>

                        {/* Card Theme Color Selector */}
                        <div>
                           <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1.5">
                              Card Background Theme Color
                           </label>
                           <div className="flex flex-wrap items-center gap-2">
                              {[
                                 { label: "Amazon Green", color: "#0d5c3a", accent: "#10B981" },
                                 { label: "Ocean Blue", color: "#034873", accent: "#38BDF8" },
                                 { label: "Crimson Red", color: "#7c1d1d", accent: "#F43F5E" },
                                 { label: "Royal Violet", color: "#581c87", accent: "#C084FC" },
                                 { label: "Sunset Amber", color: "#78350f", accent: "#F59E0B" },
                              ].map((preset) => (
                                 <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                       const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                       const updated = currentCards.map(c => c.id === card.id ? { ...c, themeColor: preset.color, accentColor: preset.accent } : c);
                                       setTempAmazonCards(updated);
                                    }}
                                    style={{ backgroundColor: preset.color }}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-black text-white transition-all ${
                                       card.themeColor === preset.color ? "border-white shadow-lg ring-2 ring-emerald-400 scale-105" : "border-transparent opacity-70"
                                    }`}
                                 >
                                    {preset.label}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* 2x2 Product Grid Editor (4 Items per Card) */}
                        <div className="space-y-3 pt-3 border-t border-slate-800">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                                 🛍️ 2x2 Product Grid Items Editor (4 Products)
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                 Directly edit item names, offer prices, original MRP prices, and images
                              </span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(card.items || []).slice(0, 4).map((item, itemIdx) => (
                                 <div key={itemIdx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                       <span className="text-[10px] font-extrabold text-emerald-400 uppercase">
                                          Grid Position #{itemIdx + 1}
                                       </span>
                                    </div>
                                    <div>
                                       <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Product Name</label>
                                       <input
                                          type="text"
                                          placeholder="Product Name"
                                          value={item.name}
                                          onChange={(e) => {
                                             const newItems = [...card.items];
                                             newItems[itemIdx] = { ...newItems[itemIdx], name: e.target.value };
                                             const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                             const updated = currentCards.map(c => c.id === card.id ? { ...c, items: newItems } : c);
                                             setTempAmazonCards(updated);
                                          }}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                       />
                                    </div>
                                    <div className="flex gap-2">
                                       <div className="w-1/2">
                                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Offer Price</label>
                                          <input
                                             type="text"
                                             placeholder="₹1,899"
                                             value={item.price}
                                             onChange={(e) => {
                                                const newItems = [...card.items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], price: e.target.value };
                                                const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                                const updated = currentCards.map(c => c.id === card.id ? { ...c, items: newItems } : c);
                                                setTempAmazonCards(updated);
                                             }}
                                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                                          />
                                       </div>
                                       <div className="w-1/2">
                                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">MRP Strike-Through</label>
                                          <input
                                             type="text"
                                             placeholder="₹2,299"
                                             value={item.oldPrice || ""}
                                             onChange={(e) => {
                                                const newItems = [...card.items];
                                                newItems[itemIdx] = { ...newItems[itemIdx], oldPrice: e.target.value };
                                                const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                                const updated = currentCards.map(c => c.id === card.id ? { ...c, items: newItems } : c);
                                                setTempAmazonCards(updated);
                                             }}
                                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 line-through font-bold"
                                          />
                                       </div>
                                    </div>
                                    <ImageUploaderBox
                                       label="Product Image File / URL"
                                       value={item.image}
                                       onChange={(url) => {
                                          const newItems = [...card.items];
                                          newItems[itemIdx] = { ...newItems[itemIdx], image: url };
                                          const currentCards = tempAmazonCards.length > 0 ? tempAmazonCards : DEFAULT_AMAZON_HERO_CARDS;
                                          const updated = currentCards.map(c => c.id === card.id ? { ...c, items: newItems } : c);
                                          setTempAmazonCards(updated);
                                       }}
                                       aspect="square"
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  );
               })}

               {/* Add New Hero Card Bottom Action */}
               <button
                  type="button"
                  onClick={() => {
                     const newId = `card-${Date.now()}`;
                     const newCard: AmazonHeroCardConfig = {
                        id: newId,
                        title: "Custom Seafood Collection",
                        badge: "Special Deal",
                        themeColor: "#0d5c3a",
                        accentColor: "#10B981",
                        active: true,
                        items: [
                           { name: "Surmai Steaks", price: "₹1,899", oldPrice: "₹2,299", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80", query: "Surmai" },
                           { name: "King Jumbo Prawns", price: "₹6,989", oldPrice: "₹7,999", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80", query: "Prawn" },
                           { name: "Seawater Crabs", price: "₹2,799", oldPrice: "₹3,499", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80", query: "Crab" },
                           { name: "Red Snapper Fillet", price: "₹798", oldPrice: "₹999", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80", query: "Snapper" },
                        ]
                     };
                     setTempAmazonCards([...tempAmazonCards, newCard]);
                     toast("Created new Amazon Hero Card!", "success");
                  }}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
               >
                  <span>+</span> Add Another Amazon Hero Card
               </button>
            </div>
         </div>

         {/* ⚡ MODE 2: SWIGGY ANIMATED BANNERS CUSTOMIZER PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Zap className="w-5 h-5 text-blue-400" /> Swiggy Animated Banners Slide Customizer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Manage full-bleed banner slides, CTA button texts, target links, & background images for Swiggy Mode.
                  </p>
               </div>
               <button
                  type="button"
                  onClick={() => {
                     const newSlide: SwiggyBannerSlide = {
                        id: `swiggy-${Date.now()}`,
                        title: "NEW SEAFOOD ARRIVAL",
                        subtitle: "Direct fresh catch delivered in under 90 minutes.",
                        ctaText: "EXPLORE NOW",
                        ctaLink: "/products",
                        imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80",
                        badge: "Port Blair Dock"
                     };
                     setTempSwiggyBanners([...tempSwiggyBanners, newSlide]);
                     toast("Added new Swiggy Banner Slide!", "success");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
               >
                  <span>+</span> Add Swiggy Banner Slide
               </button>
            </div>

            <div className="space-y-4">
               {(tempSwiggyBanners && tempSwiggyBanners.length > 0 ? tempSwiggyBanners : DEFAULT_SWIGGY_BANNERS).map((slide, sIdx) => (
                  <div key={slide.id || sIdx} className="bg-slate-950 border border-blue-500/30 rounded-2xl p-4 space-y-3">
                     <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                           Swiggy Slide #{sIdx + 1}: {slide.title}
                        </span>
                        {tempSwiggyBanners.length > 1 && (
                           <button
                              type="button"
                              onClick={() => {
                                 setTempSwiggyBanners(tempSwiggyBanners.filter(s => s.id !== slide.id));
                                 toast("Removed slide.", "info");
                              }}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
                           >
                              Delete Slide
                           </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Slide Main Title</label>
                           <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                 const updated = tempSwiggyBanners.map(s => s.id === slide.id ? { ...s, title: e.target.value } : s);
                                 setTempSwiggyBanners(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                           />
                        </div>
                        <div>
                           <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Sector Badge</label>
                           <input
                              type="text"
                              value={slide.badge}
                              onChange={(e) => {
                                 const updated = tempSwiggyBanners.map(s => s.id === slide.id ? { ...s, badge: e.target.value } : s);
                                 setTempSwiggyBanners(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                           />
                        </div>
                        <div>
                           <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">CTA Button Text</label>
                           <input
                              type="text"
                              value={slide.ctaText}
                              onChange={(e) => {
                                 const updated = tempSwiggyBanners.map(s => s.id === slide.id ? { ...s, ctaText: e.target.value } : s);
                                 setTempSwiggyBanners(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-bold"
                           />
                        </div>
                        <div>
                           <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">CTA Target Link</label>
                           <input
                              type="text"
                              value={slide.ctaLink}
                              onChange={(e) => {
                                 const updated = tempSwiggyBanners.map(s => s.id === slide.id ? { ...s, ctaLink: e.target.value } : s);
                                 setTempSwiggyBanners(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                           />
                        </div>
                        <div className="sm:col-span-2">
                           <ImageUploaderBox
                              label="Banner Image File / URL"
                              value={slide.imageUrl}
                              onChange={(url) => {
                                 const updated = tempSwiggyBanners.map(s => s.id === slide.id ? { ...s, imageUrl: url } : s);
                                 setTempSwiggyBanners(updated);
                              }}
                              aspect="banner"
                           />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 🌟 MODE 3: ZOMATO HIGH-IMPACT HERO CUSTOMIZER PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-purple-400" /> Zomato High-Impact Hero Customizer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Configure atmospheric backdrop photo/video, title lines, opacity slider, & trust telemetry badges.
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                        Hero Main Title Line 1
                     </label>
                     <input
                        type="text"
                        value={tempZomatoHero.titleLine1}
                        onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, titleLine1: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                     />
                  </div>
                  <div>
                     <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                        Hero Main Title Line 2 (Accent Color)
                     </label>
                     <input
                        type="text"
                        value={tempZomatoHero.titleLine2}
                        onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, titleLine2: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-purple-400 font-bold"
                     />
                  </div>
                  <div className="sm:col-span-2">
                     <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                        Subtitle Description
                     </label>
                     <input
                        type="text"
                        value={tempZomatoHero.subtitle}
                        onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, subtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                     />
                  </div>
                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-800">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                           🖼️ Rotating Hero Backdrop Slides Manager ({ (tempZomatoHero.backdrops || [tempZomatoHero.backdropUrl]).length } Slides)
                        </span>
                        <button
                           type="button"
                           onClick={() => {
                              const current = tempZomatoHero.backdrops || [tempZomatoHero.backdropUrl];
                              setTempZomatoHero({
                                 ...tempZomatoHero,
                                 backdrops: [...current, "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&q=80"]
                              });
                              toast("Added new Backdrop Slide!", "success");
                           }}
                           className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase hover:bg-purple-500/30"
                        >
                           + Add Backdrop Slide
                        </button>
                     </div>

                     <div className="space-y-2">
                        {(tempZomatoHero.backdrops || [tempZomatoHero.backdropUrl]).map((bgUrl, bgIdx) => (
                           <div key={bgIdx} className="bg-slate-950 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                              <span className="text-[10px] font-black text-purple-400">Slide #{bgIdx + 1}</span>
                              <div className="flex-1">
                                 <ImageUploaderBox
                                    label={`Hero Backdrop Image Slide #${bgIdx + 1}`}
                                    value={bgUrl}
                                    onChange={(url) => {
                                       const current = [...(tempZomatoHero.backdrops || [tempZomatoHero.backdropUrl])];
                                       current[bgIdx] = url;
                                       setTempZomatoHero({
                                          ...tempZomatoHero,
                                          backdropUrl: current[0],
                                          backdrops: current
                                       });
                                    }}
                                    aspect="banner"
                                 />
                              </div>
                              {(tempZomatoHero.backdrops || []).length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => {
                                       const current = (tempZomatoHero.backdrops || []).filter((_, i) => i !== bgIdx);
                                       setTempZomatoHero({
                                          ...tempZomatoHero,
                                          backdropUrl: current[0] || tempZomatoHero.backdropUrl,
                                          backdrops: current
                                       });
                                       toast("Removed backdrop slide.", "info");
                                    }}
                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
                                 >
                                    Delete
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Trust Badges Config */}
               <div className="pt-3 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-black uppercase text-purple-400 tracking-wider block">
                     🛡️ 3 Trust Telemetry Badges
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Trust Badge #1</label>
                        <input
                           type="text"
                           value={tempZomatoHero.trustBadge1}
                           onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, trustBadge1: e.target.value })}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                     </div>
                     <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Trust Badge #2</label>
                        <input
                           type="text"
                           value={tempZomatoHero.trustBadge2}
                           onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, trustBadge2: e.target.value })}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                     </div>
                     <div>
                        <label className="text-[8.5px] font-bold text-slate-400 uppercase block mb-0.5">Trust Badge #3</label>
                        <input
                           type="text"
                           value={tempZomatoHero.trustBadge3}
                           onChange={(e) => setTempZomatoHero({ ...tempZomatoHero, trustBadge3: e.target.value })}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 🏷️ MODE 4: COMPACT MINIMAL STRIP CUSTOMIZER PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Layout className="w-5 h-5 text-amber-400" /> Compact Minimal Strip Customizer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Configure announcement marquee ticker text & colors for high-density product browsing mode.
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                     Announcement Marquee Ticker Text
                  </label>
                  <input
                     type="text"
                     value={tempCompactStrip.tickerText}
                     onChange={(e) => setTempCompactStrip({ ...tempCompactStrip, tickerText: e.target.value })}
                     className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                  />
               </div>
            </div>
         </div>

         {/* 🚀 ADMIN LOGO BRAND COLOR & NEON GLOW CONTROL PANEL */}
         <div className="space-y-6 bg-slate-900/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                     <Palette className="w-5 h-5 text-primary" /> Logo Brand Color & Neon Glow Control
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                     Customize the OCEANEXOTIC main text logo color, emblem accent, and neon stroke glow live across Web & Mobile.
                  </p>
               </div>
               <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-wider">
                  Real-time Theme Engine
               </Badge>
            </div>

            {/* Live Interactive Logo Preview Box */}
            <div className="p-6 rounded-2xl bg-[#020617] border border-slate-800 flex flex-col items-center justify-center space-y-3 relative overflow-hidden shadow-inner">
               <div className="absolute top-3 left-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Live Interactive Storefront Preview
               </div>
               <div className="py-4">
                  <Logo 
                     size="lg" 
                     textColor={tempLogoTextColor} 
                     primaryColor={tempLogoPrimaryColor} 
                     secondaryColor={tempLogoSecondaryColor} 
                  />
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                  <span>Text: <strong style={{ color: tempLogoTextColor }}>{tempLogoTextColor}</strong></span>
                  <span>Primary: <strong style={{ color: tempLogoPrimaryColor }}>{tempLogoPrimaryColor}</strong></span>
                  <span>Glow: <strong style={{ color: tempLogoSecondaryColor }}>{tempLogoSecondaryColor}</strong></span>
               </div>
            </div>

            {/* Quick Vibrant Color Presets */}
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Quick Vibrant Color Presets
               </label>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                     { name: "⚡ Electric Cyan", text: "#00D1FF", primary: "#00D1FF", secondary: "#F0ABFC" },
                     { name: "🔥 Neon Coral", text: "#FF385C", primary: "#FF385C", secondary: "#F59E0B" },
                     { name: "💎 White Pearl", text: "#FFFFFF", primary: "#00D1FF", secondary: "#A855F7" },
                     { name: "🟢 Emerald Wave", text: "#10B981", primary: "#10B981", secondary: "#06B6D4" },
                     { name: "🟣 Deep Violet", text: "#A855F7", primary: "#A855F7", secondary: "#F43F5E" },
                     { name: "🟡 Golden Amber", text: "#F59E0B", primary: "#F59E0B", secondary: "#10B981" }
                  ].map((preset) => (
                     <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                           setTempLogoTextColor(preset.text);
                           setTempLogoPrimaryColor(preset.primary);
                           setTempLogoSecondaryColor(preset.secondary);
                           toast(`Applied ${preset.name} logo preset! Click SYNCHRONIZE to publish live.`, "info");
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                           tempLogoTextColor === preset.text 
                              ? "border-primary bg-primary/20 shadow-lg" 
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                        }`}
                     >
                        <span className="text-[10px] font-black uppercase text-white tracking-wider">{preset.name}</span>
                        <div className="flex items-center gap-1">
                           <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.text }} />
                           <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow" style={{ backgroundColor: preset.secondary }} />
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Custom Hex Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                     Main Text Color (OCEANEXOTIC)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                     <input 
                        type="color" 
                        value={tempLogoTextColor} 
                        onChange={(e) => setTempLogoTextColor(e.target.value)} 
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                     />
                     <input 
                        type="text" 
                        value={tempLogoTextColor} 
                        onChange={(e) => setTempLogoTextColor(e.target.value)} 
                        className="bg-transparent text-xs font-mono font-bold text-white uppercase outline-none w-full"
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                     Primary Emblem Color (Fish Icon)
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                     <input 
                        type="color" 
                        value={tempLogoPrimaryColor} 
                        onChange={(e) => setTempLogoPrimaryColor(e.target.value)} 
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                     />
                     <input 
                        type="text" 
                        value={tempLogoPrimaryColor} 
                        onChange={(e) => setTempLogoPrimaryColor(e.target.value)} 
                        className="bg-transparent text-xs font-mono font-bold text-white uppercase outline-none w-full"
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                     Secondary Neon Stroke & Eye Glow
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                     <input 
                        type="color" 
                        value={tempLogoSecondaryColor} 
                        onChange={(e) => setTempLogoSecondaryColor(e.target.value)} 
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                     />
                     <input 
                        type="text" 
                        value={tempLogoSecondaryColor} 
                        onChange={(e) => setTempLogoSecondaryColor(e.target.value)} 
                        className="bg-transparent text-xs font-mono font-bold text-white uppercase outline-none w-full"
                     />
                  </div>
               </div>
            </div>
         </div>
        </div>

        {/* SIDEBAR: Registry Status */}
        <div className="lg:col-span-4 space-y-8">
           <div 
             className="relative p-[2px] overflow-hidden group"
             style={{ clipPath: 'polygon(8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%, 0% 8%)' }}
           >
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
              <div className="bg-bg-secondary p-8 space-y-8 relative z-10" style={{ clipPath: 'polygon(8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%, 0% 8%)' }}>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Live Telemetry</h3>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Registry Validation</p>
                 </div>

                 <div className="space-y-4">
                    {[
                      { label: "Active Protocol", value: CUSTOMER_THEMES.find(t => t.id === customerTheme)?.name },
                      { label: "Staged Selection", value: CUSTOMER_THEMES.find(t => t.id === selectedThemeId)?.name },
                      { label: "Atmosphere Intensity", value: `${tempGlow}%` }
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                         <span className="text-[9px] font-black text-text-secondary uppercase opacity-40 italic">{stat.label}</span>
                         <span className="text-xs font-black text-primary uppercase italic tracking-widest">{stat.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Atmosphere Glow</h4>
                      <Badge variant="glass" className="text-[9px] font-black border-primary/20 text-primary">{tempGlow}%</Badge>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={tempGlow} 
                      onChange={(e) => setTempGlow(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                 </div>

                 <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Hero Overlay</h4>
                        <span className="text-[8px] opacity-40 uppercase tracking-widest">0% = Fully Clear Image</span>
                      </div>
                      <Badge variant="glass" className="text-[9px] font-black border-primary/20 text-primary">{tempHeroOpacity}%</Badge>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={tempHeroOpacity} 
                      onChange={(e) => setTempHeroOpacity(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                 </div>

                 <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Hero Badge</h4>
                        <input 
                          type="color" 
                          value={(tempAssets as any).heroBadgeColor || "#3b82f6"} 
                          onChange={(e) => setTempAssets(prev => ({ ...prev, heroBadgeColor: e.target.value }))}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                          title="Badge Color"
                        />
                      </div>
                      <input 
                        type="text" 
                        value={(tempAssets as any).heroBadge || ""}
                        onChange={(e) => setTempAssets(prev => ({ ...prev, heroBadge: e.target.value }))}
                        className="w-full bg-black/40 border border-[var(--foreground)]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--foreground)] placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="e.g. Premium Seafood Market"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-2 w-1/2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Title Part 1</h4>
                          <input 
                            type="color" 
                            value={(tempAssets as any).heroTitle1Color || "#ffffff"} 
                            onChange={(e) => setTempAssets(prev => ({ ...prev, heroTitle1Color: e.target.value }))}
                            className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                            title="Text Color"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={(tempAssets as any).heroTitle1 || ""}
                          onChange={(e) => setTempAssets(prev => ({ ...prev, heroTitle1: e.target.value }))}
                          className="w-full bg-black/40 border border-[var(--foreground)]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--foreground)] placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
                          placeholder="e.g. Seafood"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-1/2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest italic">Title Part 2</h4>
                          <input 
                            type="color" 
                            value={(tempAssets as any).heroTitle2Color || "#3b82f6"} 
                            onChange={(e) => setTempAssets(prev => ({ ...prev, heroTitle2Color: e.target.value }))}
                            className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                            title="Accent Color"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={(tempAssets as any).heroTitle2 || ""}
                          onChange={(e) => setTempAssets(prev => ({ ...prev, heroTitle2: e.target.value }))}
                          className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-[10px] font-bold text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                          placeholder="e.g. Redefined."
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Hero Subtitle</h4>
                        <input 
                          type="color" 
                          value={(tempAssets as any).heroSubtitleColor || "#ffffff"} 
                          onChange={(e) => setTempAssets(prev => ({ ...prev, heroSubtitleColor: e.target.value }))}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                          title="Text Color"
                        />
                      </div>
                      <textarea 
                        value={(tempAssets as any).heroSubtitle || ""}
                        onChange={(e) => setTempAssets(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        className="w-full bg-black/40 border border-[var(--foreground)]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--foreground)] placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors resize-none h-16"
                        placeholder="e.g. Delivered Fresh in Under 90 Minutes."
                      />
                    </div>
                 </div>

                 <Button 
                   onClick={handleCommit}
                   disabled={isCommitting || !isDirty}
                   className="w-full h-16 rounded-[20px] bg-primary text-[var(--foreground)] shadow-glow-purple text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 italic"
                 >
                    {isCommitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> SYNCHRONIZE REGISTRY</>}
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* ASSET REGISTRY: Octagonal Cards */}
      <div className="pt-12 space-y-10">
        <div className="flex items-center justify-between px-1 border-b border-[var(--foreground)]/5 pb-6">
           <h3 className="text-2xl md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-4">
              <Layout className="w-7 h-7 md:w-8 md:h-8 text-primary" /> Visual Infrastructure
           </h3>
           <Badge variant="glass" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20">MASTER NODES</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
           {uploadStations.map((station) => (
             <div 
               key={station.id}
               className="group relative p-[2px] transition-all hover:scale-[1.02]"
               style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}
             >
                <div className="absolute inset-0 bg-[var(--foreground)]/5 group-hover:bg-primary/20 transition-colors" />
                <div className="bg-bg-secondary p-8 space-y-6 relative z-10 h-full flex flex-col" style={{ clipPath: 'polygon(12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%, 0% 12%)' }}>
                   <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center text-primary shadow-inner">{station.icon}</div>
                      <div>
                         <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter">{station.title}</h4>
                         <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 italic">{station.desc}</p>
                      </div>
                   </div>
                   
                   <div 
                     onClick={() => triggerUpload(station.id)}
                     className={cn("bg-black/40 rounded-3xl border border-dashed border-[var(--foreground)]/10 flex items-center justify-center group cursor-pointer hover:border-primary transition-all overflow-hidden relative", station.aspect)}
                   >
                      {station.id === 'logo' ? (
                        <div className="w-full h-full flex items-center justify-center p-8 bg-bg-secondary group-hover:scale-105 transition-transform duration-700">
                          <Logo size="xl" />
                        </div>
                      ) : station.preview ? (
                         <img src={station.preview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                      ) : (
                         <div className="text-center space-y-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 mx-auto" />
                            <p className="text-[9px] font-black uppercase tracking-tighter">Upload Registry</p>
                         </div>
                      )}
                      {(station.preview || station.id === 'logo') && (
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                            <Button variant="outline" className="h-11 px-8 text-[10px] font-black uppercase tracking-widest glass border-[var(--foreground)]/20 italic">
                               {station.id === 'logo' ? 'CONFIGURE MASTER' : 'REPLACE NODE'}
                            </Button>
                         </div>
                      )}
                   </div>

                   <div className="mt-auto pt-6 flex items-center justify-between border-t border-[var(--foreground)]/5">
                       <Badge className={cn(
                         "text-[9px] font-black px-4 py-1.5 rounded-full border-0",
                         !station.preview ? "bg-slate-500/10 text-slate-500" : "bg-success/10 text-success"
                       )}>
                          {!station.preview ? 'NODE EMPTY' : 'SYNCHRONIZED'}
                       </Badge>
                       <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2 italic">
                          Registry Info <ChevronRight className="w-3 h-3" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  
  );
}
