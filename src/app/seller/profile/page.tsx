"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Store, 
  ShieldCheck, 
  Image as ImageIcon, 
  Globe, 
  DollarSign, 
  Mail, 
  Phone,
  Save,
  MapPin,
  FileText
} from "lucide-react";

export default function SellerProfilePage() {
  const [profile, setProfile] = React.useState({
    name: "Global Seafoods",
    email: "merchants@globalseafoods.com",
    logo_url: ""
  }
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadData = new FormData(
  );
      uploadData.append("file", file
  );
      const res = await fetch("/api/upload", { method: "POST", body: uploadData }
  );
      const data = await res.json(
  );
      setProfile({ ...profile, logo_url: data.url }
  );
    }
  };

  return (

    <div className="max-w-5xl mx-auto space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-32 md:pb-10 px-4 md:px-0 animate-fade-in">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Merchant Registry</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Your Global Maritime Brand & Business Sovereignty</p>
        </div>
        <Button className="h-10 md:h-12 px-6 md:px-10 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg italic">
          <Save className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMIT ALL CHANGES
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-10">
        {/* Brand Identity Sidebar */}
        <div className="md:col-span-1 space-y-[10px] md:space-y-8">
           <Card className="p-[10px] md:p-6 space-y-4 md:space-y-6 text-center bg-bg-secondary/10 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[40px] shadow-glow-purple/5">
              <div className="relative inline-block mx-auto">
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[30px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-glow-purple/20 group cursor-pointer overflow-hidden"
                 >
                    {profile.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 group-hover:scale-110 transition-transform opacity-40" />}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <p className="text-[7px] font-black text-[var(--foreground)] uppercase tracking-widest italic">UPDATE</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-0.5">
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">{profile.name}</h3>
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Since May 2024</p>
              </div>
              <div className="flex flex-col gap-2">
                 <Badge variant="success" className="bg-success/5 text-success border-success/10 uppercase text-[7px] md:text-[8px] tracking-widest py-1 italic shadow-glow-purple/5">
                    <ShieldCheck className="w-3 h-3 mr-1.5" /> VERIFIED
                 </Badge>
                 <Badge variant="glass" className="bg-primary/5 text-primary border-primary/10 uppercase text-[7px] md:text-[8px] tracking-widest py-1 italic shadow-glow-purple/5">
                    PLATINUM
                 </Badge>
              </div>
           </Card>

           <Card className="p-[10px] md:p-6 space-y-4 bg-bg-secondary/10 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[32px] shadow-glow-purple/5">
              <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-3">
                 <Globe className="w-3.5 h-3.5 text-primary opacity-40" />
                 <h4 className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic opacity-60">Market Pulse</h4>
              </div>
              <div className="flex items-center justify-between px-1">
                 <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Publicity</p>
                 <div className="w-7 h-4 md:w-8 md:h-5 bg-primary rounded-full relative p-0.5 cursor-pointer">
                    <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full translate-x-3 md:translate-x-3.5 shadow-sm" />
                 </div>
              </div>
              <div className="flex items-center justify-between px-1 opacity-20">
                 <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic">Isolation</p>
                 <div className="w-7 h-4 md:w-8 md:h-5 bg-[var(--foreground)]/10 rounded-full relative p-0.5 cursor-pointer">
                    <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-[var(--foreground)]/20 rounded-full" />
                 </div>
              </div>
           </Card>
        </div>

        {/* Form Controls Area */}
        <div className="md:col-span-2 space-y-[10px] md:space-y-10">
           <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 bg-bg-secondary/10 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium">
              <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                 <Store className="w-4 h-4 text-primary opacity-40" />
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Fleet Identity Details</h3>
              </div>
              <div className="space-y-4 md:space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Brand Directive (Name)</label>
                    <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Fleet Biography (Description)</label>
                    <textarea 
                      className="w-full h-20 md:h-28 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg p-3 md:p-4 text-[10px] md:text-xs text-text-secondary font-black italic tracking-widest leading-relaxed focus:border-primary/30 transition-all outline-none opacity-60"
                      defaultValue="Specializing in elite-grade Bluefin Saku and Arctic harvests. Direct maritime sourcing with cold-chain sovereignty."
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Dispatch Node (Email)</label>
                       <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Signal Line (Phone)</label>
                       <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" defaultValue="+1 (800) SEA-FOOD" />
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 bg-bg-secondary/10 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium">
              <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                 <DollarSign className="w-4 h-4 text-primary opacity-40" />
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Settlement Sovereignty</h3>
              </div>
              <div className="space-y-4 md:space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Settlement Coordinate (Bank)</label>
                    <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" defaultValue="Global Maritime Bank" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Account Directive</label>
                       <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" defaultValue="GB 42 4240 8892 0000" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Economic ID (VAT)</label>
                       <Input className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" defaultValue="VAT-998242" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
