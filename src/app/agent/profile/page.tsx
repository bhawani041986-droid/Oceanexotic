"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  User, 
  ShieldCheck, 
  Truck, 
  Anchor, 
  Star, 
  Award,
  Settings,
  Bell,
  Clock,
  Loader2,
  Zap,
  Camera
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function AgentProfilePage() {
  const { toast } = useToast(
  );
  const avatarRef = React.useRef<HTMLInputElement>(null
  );
  const [isHydrating, setIsHydrating] = useState(true
  );
  const [profile, setProfile] = useState<any>(null
  );
  const [mood, setMood] = useState<string>("Sentinel"
  );
  const userId = 7; // Aligned with MySQL Integer Identity (Agent BHAWANI)

  const fetchAgentRegistry = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`/api/user/profile?id=${userId}`),
        fetch(`/api/agent/settings`)
      ]
  );
      const pData = await pRes.json(
  );
      const sData = await sRes.json(
  );
      
      setProfile(pData
  );
      if (sData.mood) setMood(sData.mood
  );
    } catch (err) {
      toast("Agent Registry Sync Failure", "error"
  );
    } finally {
      setIsHydrating(false
  );
    }
  };

  useEffect(() => {
    fetchAgentRegistry(
  );
  }, []
  );

  const toggleTacticalMood = async () => {
    const moods = ["Sentinel", "Midnight", "Daylight"];
    const nextMood = moods[(moods.indexOf(mood) + 1) % moods.length];
    try {
      const res = await fetch('/api/agent/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: nextMood })
      }
  );
      if (res.ok) {
        setMood(nextMood
  );
        toast(`Tactical Mood: ${nextMood.toUpperCase()}`, "success"
  );
        window.location.reload(
  ); // Refresh to apply global theme sync
      }
    } catch (err) {
      toast("Mood Sync Failure", "error"
  );
    }
  };

  if (isHydrating) return (

    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-[var(--agent-primary)] animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--agent-primary)] italic">Connecting to Tactical Registry...</p>
    </div>
  
  );

  return (

    <div className="min-h-screen p-6 md:p-10 space-y-10 pb-32 animate-fade-in" style={{ color: 'var(--agent-text)' }}>
      
      {/* Header - Profile Identity */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <div className="w-32 h-32 rounded-[40px] bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary relative overflow-hidden" style={{ borderColor: 'var(--agent-border)', backgroundColor: 'var(--agent-card-bg)' }}>
               {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-16 h-16" style={{ color: 'var(--agent-primary)' }} />}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Camera className="w-8 h-8 text-[var(--foreground)]" />
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-success border-4 border-bg-primary flex items-center justify-center text-white shadow-glow-green" style={{ borderColor: 'var(--agent-bg)' }}>
               <ShieldCheck className="w-5 h-5" />
            </div>
            <input 
              type="file" 
              ref={avatarRef} 
              className="hidden" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const uploadData = new FormData(
  );
                  uploadData.append("file", file
  );
                  toast("Syncing Identity Asset...", "info"
  );
                  const res = await fetch("/api/upload", { method: "POST", body: uploadData }
  );
                  const data = await res.json(
  );
                  
                  // Commit to Registry
                  await fetch("/api/user/profile", {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...profile, avatar_url: data.url })
                  }
  );
                  
                  setProfile({ ...profile, avatar_url: data.url }
  );
                  toast("Identity Node Synchronized.", "success"
  );
                }
              }} 
            />
          </div>
          
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">{profile?.name}</h1>
              <Badge className="text-[10px] font-black uppercase tracking-widest px-4 py-1 text-[var(--foreground)]" style={{ backgroundColor: 'var(--agent-primary)' }}>
                {profile?.grade || "ELITE AGENT"}
              </Badge>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 opacity-60">
              <Anchor className="w-3 h-3" style={{ color: 'var(--agent-primary)' }} /> STATIONED AT: PORT BLAIR HUB • SECTOR 4
            </p>
          </div>
        </div>

        <div className="flex gap-4">
           <Button 
            onClick={toggleTacticalMood}
            className="h-14 px-8 text-[10px] font-black uppercase tracking-widest gap-3 rounded-[20px] text-[var(--foreground)]"
            style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}
           >
              <Zap className="w-4 h-4" /> MOOD: {mood.toUpperCase()}
           </Button>
           <Button className="h-14 px-8 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 text-[10px] font-black uppercase tracking-widest gap-3 rounded-[20px]" style={{ borderColor: 'var(--agent-border)' }}>
              <Settings className="w-4 h-4" /> SETTINGS
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - STATS & ASSOCIATION */}
        <div className="xl:col-span-4 space-y-8">
           <Card className="p-8 space-y-8 rounded-[32px]" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Fleet Reputation</p>
                    <div className="flex items-center gap-1" style={{ color: 'var(--agent-primary)' }}>
                       <Star className="w-3 h-3 fill-current" />
                       <span className="text-sm font-black italic">4.98</span>
                    </div>
                 </div>
                 <div className="h-2 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] shadow-glow-purple" style={{ backgroundColor: 'var(--agent-primary)' }} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 rounded-[24px] bg-black/20 border border-[var(--foreground)]/5 space-y-1" style={{ borderColor: 'var(--agent-border)' }}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Total Yields</p>
                    <p className="text-2xl font-black italic">{profile?.loyalty_points || 2450}</p>
                 </div>
                 <div className="p-6 rounded-[24px] bg-black/20 border border-[var(--foreground)]/5 space-y-1" style={{ borderColor: 'var(--agent-border)' }}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                    <p className="text-2xl font-black text-success italic">100%</p>
                 </div>
              </div>
           </Card>

           <Card className="p-8 space-y-6 rounded-[32px]" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center gap-4">
                 <Award className="w-6 h-6" style={{ color: 'var(--agent-primary)' }} />
                 <h3 className="text-sm font-black uppercase tracking-widest">Association Hub</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20">
                    <span className="text-[10px] font-bold uppercase opacity-60">Citizen ID</span>
                    <span className="text-[10px] font-black uppercase">{profile?.id}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20">
                    <span className="text-[10px] font-bold uppercase opacity-60">Access Node</span>
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">SOVEREIGN AGENT</span>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN - RECENT ACTIVITY */}
        <div className="xl:col-span-8 space-y-8">
           <div className="space-y-6">
              <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                 <Clock className="w-5 h-5" style={{ color: 'var(--agent-primary)' }} /> Mission Registry
              </h2>
              <Card className="rounded-[32px] overflow-hidden" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
                 <div className="p-2">
                    {[
                      { id: "ORD-9950", date: "Yesterday", status: "DELIVERED", payout: "₹450", client: "Arctic Fresh" },
                      { id: "ORD-9942", date: "2 days ago", status: "DELIVERED", payout: "₹380", client: "Captain Morgan" },
                    ].map((job, i) => (
                      <div key={i} className="flex items-center justify-between p-6 hover:bg-[var(--foreground)]/5 transition-all rounded-[24px]">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center shrink-0" style={{ color: 'var(--agent-primary)' }}>
                               <Truck className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-black uppercase italic">{job.id}</p>
                               <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{job.client} • {job.date}</p>
                            </div>
                         </div>
                         <div className="text-right space-y-2">
                            <Badge variant="glass" className="text-[8px] font-black uppercase tracking-widest px-3">COMPLETED</Badge>
                            <p className="text-xs font-black font-mono leading-none">{job.payout}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="p-6 bg-black/10 text-center">
                    <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">VIEW FULL ARCHIVE</Button>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  
  );
}
