"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Key, 
  History, 
  Globe, 
  Terminal,
  Activity,
  Save,
  ChevronRight,
  Fingerprint
} from "lucide-react";

const ACTIVITY_LOGS = [
  { id: "ACT-001", action: "Authorized Settlement Reversal", target: "#ORD-9982", time: "14m ago" },
  { id: "ACT-002", action: "Commissioned New Merchant Node", target: "Global Seafoods", time: "2h ago" },
  { id: "ACT-003", action: "Updated Global Trade Rules", target: "North Atlantic", time: "5h ago" },
];

export default function AdminProfilePage() {
  const [profile, setProfile] = React.useState({
    name: "Admiral Prime",
    email: "prime@OceanExotic Global.gov",
    avatar_url: ""
  }
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProfile({ ...profile, avatar_url: data.url }
  );
    }
  };

  return (

    <div className="max-w-5xl mx-auto space-y-12 py-10 animate-fade-in">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Authority Node</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Governing Your Personal Administrative Identity & Clearances</p>
        </div>
        <Button className="h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
          <Save className="w-4 h-4" /> COMMIT UPDATES
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Node Identity Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <Card className="p-10 space-y-8 text-center bg-bg-secondary/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldCheck className="w-24 h-24 text-primary" />
              </div>
              <div className="relative inline-block mx-auto cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-32 h-32 rounded-[30px] bg-[var(--foreground)]/5 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple relative z-10 overflow-hidden">
                    {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-12 h-12" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                       <Fingerprint className="w-8 h-8 text-[var(--foreground)]" />
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-success border-4 border-bg-primary flex items-center justify-center text-[var(--foreground)] shadow-lg z-20">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
              </div>
              <div className="space-y-2 relative z-10">
                 <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">{profile.name}</h3>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Master Authority Hub • Sector-1</p>
              </div>
              <div className="pt-6 border-t border-[var(--foreground)]/5 flex flex-col gap-4 relative z-10">
                 <Badge variant="default" className="h-9 text-[9px] font-black tracking-widest uppercase bg-primary/10 text-primary border-primary/20">
                    CLEARANCE: LEVEL-9 (SUPREME)
                 </Badge>
                 <Badge variant="glass" className="h-9 text-[9px] font-black tracking-widest uppercase bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5">
                    COMMISSIONED: MAY 2024
                 </Badge>
              </div>
           </Card>

           <Card className="p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-4">
                 <Activity className="w-4 h-4 text-primary" />
                 <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Node Health</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                    <span>Uptime Density</span>
                    <span className="text-success">99.9%</span>
                 </div>
                 <div className="h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '99%' }} />
                 </div>
              </div>
           </Card>
        </div>

        {/* Governance Controls Area */}
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Terminal className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Identity Directives</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Authority Name</label>
                     <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="h-14 bg-bg-secondary border-[var(--foreground)]/5" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Hub (Email)</label>
                     <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="h-14 bg-bg-secondary border-[var(--foreground)]/5" />
                  </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Access Directive (Password)</label>
                    <div className="flex gap-4">
                       <Input type="password" value="••••••••••••" readOnly className="h-14 bg-bg-secondary border-[var(--foreground)]/5 opacity-60" />
                       <Button variant="outline" className="h-14 px-8 text-[9px] font-black uppercase">ROTATE KEY</Button>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-6">
                 <div className="flex items-center gap-4">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Authority Log</h3>
                 </div>
                 <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[9px] tracking-widest">LAST 24 HOURS</Badge>
              </div>
              <div className="space-y-6">
                 {ACTIVITY_LOGS.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 group hover:border-primary/20 transition-all">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)] tracking-tight uppercase">{log.action}</p>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Target: {log.target}</p>
                       </div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">{log.time}</p>
                    </div>
                 ))}
              </div>
              <button className="w-full text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] hover:text-[var(--foreground)] transition-all flex items-center justify-center gap-2">
                 VIEW FULL AUTHORITY LEDGER <ChevronRight className="w-4 h-4" />
              </button>
           </Card>

           {/* 2FA Status Strip */}
           <Card className="p-8 bg-success/5 border border-success/20 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-[16px] bg-success/10 border border-success/20 flex items-center justify-center text-success">
                    <Fingerprint className="w-6 h-6" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">Multi-Factor Sovereignty Active</h4>
                    <p className="text-[9px] text-text-secondary font-medium italic">Your node is protected via global biometric handshakes.</p>
                 </div>
              </div>
              <Badge variant="success" className="h-8 px-4 text-[8px] font-black tracking-widest uppercase">ENFORCED</Badge>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
