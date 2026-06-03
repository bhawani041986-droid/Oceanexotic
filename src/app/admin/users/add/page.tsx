"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  Mail, 
  ShieldCheck, 
  Globe, 
  ShieldAlert,
  User,
  Info,
  BadgeCheck,
  Zap,
  Phone,
  MapPin,
  Compass,
  Upload,
  Camera,
  Star,
  Key,
  Eye,
  EyeOff,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminAddUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast("Please populate all core credential parameters.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast("Identity and credentials successfully commissioned.", "success");
        router.push("/admin/users");
      } else {
        toast(data.message || "Failed to commission identity.", "error");
      }
    } catch (err) {
      console.error("Commission failure:", err);
      toast("Commission failure occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="flex items-center gap-6">
           <Link href="/admin/users">
              <button className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-text-secondary hover:text-[var(--foreground)] transition-all">
                 <ArrowLeft className="w-5 h-5" />
              </button>
           </Link>
           <div className="space-y-1">
              <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase italic">Commission Citizen</h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Integrating a New Global Identity Node into the Sovereign Registry</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
           <Button variant="ghost" className="w-full sm:w-auto h-12 px-6 text-[10px] font-black tracking-widest uppercase flex items-center justify-center">
             DISCARD IDENTITY
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="w-full sm:w-auto h-12 px-6 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-3"
           >
             <Save className="w-4 h-4" /> {isSubmitting ? "SYNCING..." : "COMMISSION IDENTITY"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-10">
           {/* Sovereign Credentials */}
           <Card className="p-10 space-y-8 bg-bg-secondary/40 border border-primary/20 shadow-glow-purple">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-6">
                 <div className="flex items-center gap-4">
                    <Key className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Credential Commissioning</h3>
                 </div>
                 <BadgeCheck className="w-5 h-5 text-success opacity-40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Access Identifier (Citizen ID)</label>
                     <div className="relative">
                        <Input readOnly value="AUTO-ASSIGNED BY REGISTRY" className="h-14 pl-12 bg-bg-secondary border-primary/20 font-black text-primary tracking-widest cursor-not-allowed opacity-60" />
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Authentication Handshake (Password)</label>
                     <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="CONSTRUCT SECURE HANDSHAKE..." 
                          className="h-14 pl-12 pr-12 bg-bg-secondary border-primary/20 font-bold" 
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                        />
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-[var(--foreground)] transition-all"
                        >
                           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
               </div>
           </Card>

           {/* Core Identity */}
           <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <User className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Identity Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Full Nomenclature (Full Name)</label>
                     <Input 
                       placeholder="ENTER CITIZEN NAME..." 
                       className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" 
                       value={formData.name}
                       onChange={(e) => handleChange("name", e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Communication Node (Email)</label>
                     <div className="relative">
                        <Input 
                          placeholder="CITIZEN@OCEAN.COM" 
                          className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" 
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                     </div>
                  </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Mobile Uplink (Phone)</label>
                    <div className="relative">
                       <Input placeholder="+91 XXXXX XXXXX" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Sovereign Role</label>
                     <select 
                       value={formData.role} 
                       onChange={(e) => handleChange("role", e.target.value)}
                       className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                     >
                        <option value="CUSTOMER">GLOBAL CITIZEN (CUSTOMER)</option>
                        <option value="SELLER">FLEET MERCHANT (SELLER)</option>
                        <option value="ADMIN">ADMIRAL (ADMIN)</option>
                        <option value="AGENT">SEA SCOUT (AGENT)</option>
                     </select>
                  </div>
              </div>
           </Card>

           {/* Location Registry */}
           <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <MapPin className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Location & Logistics Node</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Primary Settlement (City/Area)</label>
                    <div className="relative">
                       <Input placeholder="e.g. Port Blair" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Trade Zone (District)</label>
                    <Input placeholder="e.g. South Andaman" className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Sovereign Residence (Full Address)</label>
                    <textarea 
                      placeholder="Enter complete shipping coordinates..." 
                      className="w-full h-32 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[24px] p-6 text-sm font-medium text-[var(--foreground)] outline-none focus:border-primary/50 transition-all resize-none"
                    />
                 </div>
              </div>
           </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-10">
           {/* Visual Identity Upload */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <Camera className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Identity Avatar</h4>
              </div>
              <div 
                className="aspect-square rounded-[32px] border-2 border-dashed border-[var(--foreground)]/10 bg-[var(--foreground)]/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative group"
                onClick={() => toast("Initializing biometric asset capture...", "info")}
              >
                 {profileImage ? (
                   <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                     </div>
                     <div className="text-center space-y-1">
                        <p className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">UPLOAD IMAGE</p>
                        <p className="text-[8px] text-text-secondary italic">PNG, JPG up to 5MB</p>
                     </div>
                   </>
                 )}
              </div>
           </Card>

           {/* Reputation Governance */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <BadgeCheck className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Reputation Rank</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'BRONZE', label: 'BRONZE CITIZEN', icon: <Zap className="w-3.5 h-3.5" />, active: true },
                   { id: 'SILVER', label: 'SILVER VOYAGER', icon: <Globe className="w-3.5 h-3.5" />, active: false },
                   { id: 'GOLD', label: 'GOLD MASTER', icon: <Star className="w-3.5 h-3.5" />, active: false },
                   { id: 'PLATINUM', label: 'PLATINUM ADMIRAL', icon: <ShieldCheck className="w-3.5 h-3.5" />, active: false },
                 ].map((rank) => (
                    <button key={rank.id} className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300",
                      rank.active ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary"
                    )}>
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         rank.active ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5"
                       )}>
                          {rank.icon}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{rank.label}</p>
                    </button>
                 ))}
              </div>
           </Card>

           {/* Sovereign Notice */}
           <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 space-y-4 text-center">
              <div className="flex items-center justify-center gap-3 text-primary">
                 <Info className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic text-center">Security Notice</span>
              </div>
              <p className="text-[9px] text-text-secondary font-medium leading-relaxed italic">
                 Commissioning credentials directly grants immediate authorized access to the OceanExotic Global discovery nodes.
              </p>
           </div>
        </div>
      </div>
    </div>
  
  );
}
