"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
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
  Fingerprint,
  X,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

const ACTIVITY_LOGS = [
  { id: "ACT-001", action: "Authorized Settlement Reversal", target: "#ORD-9982", time: "14m ago" },
  { id: "ACT-002", action: "Commissioned New Merchant Node", target: "Global Seafoods", time: "2h ago" },
  { id: "ACT-003", action: "Updated Global Trade Rules", target: "North Atlantic", time: "5h ago" },
];

export default function AdminProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: ""
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [showStaticPassword, setShowStaticPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "Admiral Prime",
        email: user.email || "prime@oceanexotic.gov",
        avatar_url: user.avatar || ""
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast("Uploading biometric signature...", "info");
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        const data = await res.json();
        setProfile({ ...profile, avatar_url: data.url });
        toast("Biometric upload complete. Please commit updates.", "success");
      } catch (err) {
        toast("Failed to process biometric signature.", "error");
      }
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile.name || !profile.email) {
      toast("Identity parameters cannot be empty.", "error");
      return;
    }
    if (!user?.id) return;

    setIsSubmittingProfile(true);
    try {
      const res = await fetch("/api/admin/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: profile.name,
          email: profile.email
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast(data.message, "success");
        updateUser({ name: profile.name, email: profile.email, avatar: profile.avatar_url });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast(err.message || "Failed to synchronize profile.", "error");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast("Both password fields must be populated.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Cryptographic mismatch: Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Directive key must be at least 8 characters long.", "error");
      return;
    }
    if (!user?.id) {
      toast("Active identity token not found.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/profile/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast(data.message, "success");
        setIsPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast(err.message || "Failed to rotate authority key.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10 animate-fade-in relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase italic shadow-glow-purple/5">Authority Node</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Governing Your Personal Administrative Identity & Clearances</p>
        </div>
        <Button onClick={handleProfileUpdate} disabled={isSubmittingProfile} className="h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
          {isSubmittingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          {isSubmittingProfile ? "COMMITTING..." : "COMMIT UPDATES"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Node Identity Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <Card className="p-10 space-y-8 text-center bg-bg-secondary/40 relative overflow-hidden group shadow-premium border-primary/10">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldCheck className="w-24 h-24 text-primary" />
              </div>
              <div className="relative inline-block mx-auto">
                 <div 
                   className="w-32 h-32 rounded-[30px] bg-[var(--foreground)]/5 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple relative z-10 overflow-hidden cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}
                 >
                    {profile.avatar_url ? <img src={profile.avatar_url} className={`w-full h-full object-${imageFit}`} /> : <User className="w-12 h-12" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                       <Fingerprint className="w-8 h-8 text-[var(--foreground)]" />
                    </div>
                 </div>
                 {profile.avatar_url && (
                    <button 
                       onClick={(e) => { e.stopPropagation(); setImageFit(prev => prev === "cover" ? "contain" : "cover"); }}
                       className="absolute -top-2 -right-2 bg-bg-primary border border-primary/20 text-text-secondary hover:text-primary text-[8px] font-black uppercase px-2 py-1 rounded-full z-30 transition-all shadow-glow-purple"
                    >
                       FIT: {imageFit}
                    </button>
                 )}
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-success border-4 border-bg-primary flex items-center justify-center text-[var(--foreground)] shadow-lg z-20 pointer-events-none">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
              </div>
              <div className="space-y-2 relative z-10">
                 <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase italic">{profile.name}</h3>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">{user?.role || "ADMIN"} Authority Hub</p>
              </div>
              <div className="pt-6 border-t border-[var(--foreground)]/5 flex flex-col gap-4 relative z-10">
                 <Badge variant="default" className="h-9 text-[9px] font-black tracking-widest uppercase bg-primary/10 text-primary border-primary/20 italic">
                    CLEARANCE: SYSTEM ADMIN
                 </Badge>
                 <Badge variant="glass" className="h-9 text-[9px] font-black tracking-widest uppercase bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 italic">
                    USER ID: {user?.id || "N/A"}
                 </Badge>
              </div>
           </Card>

           <Card className="p-8 space-y-6 bg-bg-secondary/20 shadow-premium">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-4">
                 <Activity className="w-4 h-4 text-primary" />
                 <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Node Health</h4>
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
           <Card className="p-10 space-y-10 shadow-premium bg-bg-secondary/20">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Terminal className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Identity Directives</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic">Authority Name</label>
                     <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic">Signal Hub (Email)</label>
                     <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                  </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic">Access Directive (Password)</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <div className="relative flex-1">
                          <Input 
                             type={showStaticPassword ? "text" : "password"} 
                             value={showStaticPassword ? "Encrypted Directive Key" : "••••••••••••••••••••••••"} 
                             readOnly 
                             className="w-full h-14 pr-12 bg-bg-secondary border-[var(--foreground)]/10 opacity-60 font-black tracking-[0.2em] focus-visible:ring-0" 
                          />
                          <button 
                             onClick={() => setShowStaticPassword(!showStaticPassword)}
                             className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-[var(--foreground)] transition-all"
                          >
                             {showStaticPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                       </div>
                       <Button 
                          onClick={() => setIsPasswordModalOpen(true)}
                          variant="outline" 
                          className="h-14 px-8 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-black italic shrink-0"
                        >
                          ROTATE KEY
                        </Button>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-8 shadow-premium bg-bg-secondary/20">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-6">
                 <div className="flex items-center gap-4">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Authority Log</h3>
                 </div>
                 <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[9px] tracking-widest italic">LAST 24 HOURS</Badge>
              </div>
              <div className="space-y-6">
                 {ACTIVITY_LOGS.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 group hover:border-primary/20 transition-all gap-4">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)] tracking-tight uppercase italic">{log.action}</p>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Target: {log.target}</p>
                       </div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{log.time}</p>
                    </div>
                 ))}
              </div>
              <button className="w-full text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] hover:text-[var(--foreground)] transition-all flex items-center justify-center gap-2 italic">
                 VIEW FULL AUTHORITY LEDGER <ChevronRight className="w-4 h-4" />
              </button>
           </Card>

           {/* 2FA Status Strip */}
           <Card className="p-8 bg-success/5 border border-success/20 flex flex-col sm:flex-row sm:items-center justify-between group gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-[16px] bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                    <Fingerprint className="w-6 h-6" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Multi-Factor Sovereignty Active</h4>
                    <p className="text-[9px] text-text-secondary font-medium italic">Your node is protected via global biometric handshakes.</p>
                 </div>
              </div>
              <Badge variant="success" className="h-8 px-4 text-[8px] font-black tracking-widest uppercase shrink-0 italic">ENFORCED</Badge>
           </Card>
        </div>
      </div>

      {/* Password Rotation Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <Card className="w-full max-w-md p-8 bg-bg-primary border-[var(--foreground)]/10 shadow-premium relative space-y-8">
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-[var(--foreground)] rounded-full hover:bg-[var(--foreground)]/5 transition-all"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-2 text-center">
                 <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-glow-purple">
                   <Key className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Rotate Authority Key</h3>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Construct a new cryptographic handshake</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic">New Directive Key</label>
                    <div className="relative">
                       <Input 
                         type={showPasswords ? "text" : "password"} 
                         value={newPassword} 
                         onChange={(e) => setNewPassword(e.target.value)}
                         placeholder="Min. 8 Cryptographic Symbols"
                         className="h-14 pl-12 pr-12 bg-bg-secondary border-[var(--foreground)]/10 font-black tracking-widest placeholder:font-medium placeholder:tracking-normal placeholder:opacity-40" 
                       />
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                       <button 
                         onClick={() => setShowPasswords(!showPasswords)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-[var(--foreground)] transition-all"
                       >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic">Verify Directive Key</label>
                    <div className="relative">
                       <Input 
                         type={showPasswords ? "text" : "password"} 
                         value={confirmPassword} 
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         placeholder="Re-enter Cryptographic Sequence"
                         className="h-14 pl-12 pr-12 bg-bg-secondary border-[var(--foreground)]/10 font-black tracking-widest placeholder:font-medium placeholder:tracking-normal placeholder:opacity-40" 
                       />
                       <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                 <Button 
                   onClick={handlePasswordUpdate} 
                   disabled={isSubmitting}
                   variant="primary" 
                   className="h-14 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 italic w-full"
                 >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    {isSubmitting ? "ENCRYPTING..." : "COMMIT KEY ROTATION"}
                 </Button>
                 <Button 
                   onClick={() => setIsPasswordModalOpen(false)} 
                   variant="ghost" 
                   className="h-12 text-[10px] font-black tracking-widest uppercase italic"
                 >
                   ABORT ROTATION
                 </Button>
              </div>
           </Card>
        </div>
      )}

    </div>
  );
}
