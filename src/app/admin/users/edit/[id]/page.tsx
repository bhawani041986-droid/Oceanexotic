"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  RotateCcw,
  Edit3,
  BadgeCheck,
  Zap,
  Globe,
  Clock,
  History,
  AlertCircle,
  MapPin,
  Compass,
  Upload,
  Image as ImageIcon,
  Camera,
  Key,
  Eye,
  EyeOff,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminEditUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast("Uploading biometric asset...", "info");
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        const data = await res.json();
        if (data.url) {
          setProfileImage(data.url);
          setFormData(prev => ({ ...prev, avatar_url: data.url }));
          toast("Biometric asset captured. Commit to sync.", "success");
        } else {
          toast("Failed to upload image.", "error");
        }
      } catch (err) {
        toast("Upload error occurred.", "error");
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      if (!params?.id) return;
      try {
        const res = await fetch(`/api/admin/get_user?id=${params.id}`);
        const data = await res.json();
        if (data && !data.error) {
          setUser(data);
          setProfileImage(data.avatar_url || null);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
            status: data.status || "",
            password: "",
            avatar_url: data.avatar_url || "",
            rank: data.rank || "BRONZE"
          });
        }
      } catch (err) {
        console.error("Registry Fetch Failure:", err);
        toast("Failed to load identity from registry.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [params?.id]);

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    role: "",
    status: "",
    password: "",
    avatar_url: "",
    rank: "BRONZE"
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast("Identity parameters incomplete.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          ...formData
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        toast("Identity profile and credentials successfully synchronized.", "success");
        router.push("/admin/users");
      } else {
        throw new Error(data.error || data.message || `Handshake failed. Payload: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      console.error("Registry Sync Failure:", err);
      toast(err.message || "Handshake failed. Registry busy.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Synchronizing with Global Registry...</p>
       </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-danger mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Identity Node Not Found in Registry</p>
          <Link href="/admin/users">
             <Button variant="outline" className="text-[9px]">RETURN TO BASE</Button>
          </Link>
       </div>
    </div>
  );

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
              <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase italic flex items-center gap-4">
                 <Edit3 className="w-8 h-8 text-primary" /> Edit Citizen <span className="text-primary/60">{params?.id || "USR-001"}</span>
              </h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Modifying Sovereign Identity Parameters within the Global Registry</p>
           </div>
        </div>
        <div className="flex gap-4">
           <Button variant="ghost" className="h-12 px-8 text-[10px] font-black tracking-widest uppercase flex items-center gap-3">
              <RotateCcw className="w-4 h-4" /> REVERT CHANGES
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3"
           >
             <Save className="w-4 h-4" /> {isSubmitting ? "SYNCING..." : "COMMIT MODIFICATIONS"}
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
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Sovereign Credential Ledger</h3>
                 </div>
                 <BadgeCheck className="w-5 h-5 text-success animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Access Identifier (Citizen ID)</label>
                    <div className="relative">
                       <Input value={user.id} readOnly className="h-14 pl-12 bg-bg-secondary border-primary/20 font-black text-primary tracking-widest opacity-60" />
                       <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Authentication Handshake (Password)</label>
                    <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Leave blank to keep unchanged"
                          className="h-14 pl-12 pr-12 bg-bg-secondary border-primary/20 font-black tracking-widest text-primary placeholder:opacity-50 placeholder:italic placeholder:font-medium placeholder:tracking-normal" 
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
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Citizen Nomenclature</label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Communication Node (Email)</label>
                    <div className="relative">
                       <Input 
                         value={formData.email} 
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" 
                       />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Mobile Uplink (Phone)</label>
                    <div className="relative">
                       <Input defaultValue="+91 98765 43210" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Sovereign Role</label>
                    <select 
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full h-14 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                    >
                       <option value="CUSTOMER">GLOBAL CITIZEN (CUSTOMER)</option>
                       <option value="SELLER">FLEET MERCHANT (SELLER)</option>
                       <option value="AGENT">DELIVERY AGENT (LOGISTICS)</option>
                       <option value="ADMIN">ADMIRAL (ADMIN)</option>
                    </select>
                 </div>
              </div>
           </Card>

           {/* Maritime Location Registry */}
           <Card className="p-10 space-y-8 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <MapPin className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Location & Logistics Node</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Primary Settlement (City/Area)</label>
                    <div className="relative">
                       <Input defaultValue="Port Blair" className="h-14 pl-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                       <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Trade Zone (District)</label>
                    <Input defaultValue="South Andaman" className="h-14 bg-bg-secondary border-[var(--foreground)]/10 font-bold" />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Sovereign Residence (Full Address)</label>
                    <textarea 
                      defaultValue="Plot 42, Marine Drive Sector 4, Port Blair, Andaman and Nicobar Islands, PIN: 744101"
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
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Camera className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Identity Avatar</h4>
                 </div>
                 <button className="text-[8px] font-black text-danger uppercase opacity-40 hover:opacity-100 transition-opacity">PURGE</button>
              </div>
              <div 
                className="aspect-square rounded-[32px] border-2 border-dashed border-[var(--foreground)]/10 bg-[var(--foreground)]/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/png, image/jpeg" 
                   onChange={handleImageUpload} 
                 />
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

           {/* Governance Status */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <BadgeCheck className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Governance Status</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'ACTIVE', label: 'VERIFIED CITIZEN', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                   { id: 'PENDING', label: 'PENDING AUDIT', icon: <Clock className="w-3.5 h-3.5" /> },
                   { id: 'INACTIVE', label: 'SUSPENDED ACCESS', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                 ].map((status) => {
                    const isActive = formData.status === status.id;
                    return (
                       <button 
                         key={status.id} 
                         type="button"
                         onClick={() => setFormData({ ...formData, status: status.id })}
                         className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300",
                            isActive ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary"
                         )}
                       >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            isActive ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5"
                          )}>
                             {status.icon}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest">{status.label}</p>
                       </button>
                    );
                 })}
              </div>
           </Card>

           {/* Reputation Rank */}
           <Card className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5">
              <div className="flex items-center gap-3">
                 <Star className="w-4 h-4 text-primary" />
                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Reputation Rank</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'PLATINUM', label: 'PLATINUM ADMIRAL', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                   { id: 'GOLD', label: 'GOLD MASTER', icon: <Star className="w-3.5 h-3.5" /> },
                   { id: 'SILVER', label: 'SILVER VOYAGER', icon: <Globe className="w-3.5 h-3.5" /> },
                   { id: 'BRONZE', label: 'BRONZE CITIZEN', icon: <Zap className="w-3.5 h-3.5" /> },
                 ].map((rank) => {
                    const isActive = formData.rank === rank.id;
                    return (
                      <button 
                        key={rank.id} 
                        type="button"
                        onClick={() => setFormData({ ...formData, rank: rank.id })}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300 text-left",
                          isActive ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary"
                        )}
                      >
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center",
                           isActive ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5"
                         )}>
                            {rank.icon}
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest">{rank.label}</p>
                      </button>
                    );
                 })}
              </div>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
