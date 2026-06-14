"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Heart, 
  Star,
  ArrowRight,
  X,
  Camera,
  Edit3,
  Plus,
  Trash2,
  Zap,
  Truck,
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
  Smartphone,
  Wallet,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/store/authStore";

export default function CustomerProfilePage() {
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isHydrating, setIsHydrating] = React.useState(true);
  const { user, isHydrated, isAuthenticated, updateUser } = useAuthStore();
  const userId = user?.id || 1;
  const router = useRouter();

  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"address" | "card" | "profile">("address");
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: displayName,
          email: userProfile?.email || user?.email,
          avatar_url: data.url
        })
      });
      if (updateRes.ok) {
        toast("Profile picture synchronized", "success");
        fetchRegistry();
        if (isModalOpen && modalType === "profile") {
          setFormData((prev: any) => ({ ...prev, avatar_url: data.url }));
        }
      } else {
        throw new Error("Profile sync failed");
      }
    } catch (err) {
      toast("Avatar upload failed", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  const displayName = userProfile?.name || user?.name || "System Citizen";
  const displayGrade = userProfile?.grade || "Customer";
  const loyaltyPoints = Number(userProfile?.loyalty_points) || 0;

  const fetchRegistry = async () => {
    if (!user?.id) return;
    setIsHydrating(true);
    try {
      const [pRes, aRes, payRes] = await Promise.all([
        fetch(`/api/user/profile?id=${user.id}`),
        fetch(`/api/user/addresses?userId=${user.id}`),
        fetch(`/api/user/payments?userId=${user.id}`)
      ]);
      
      const pData = await pRes.json();
      let aData = await aRes.json();
      let payData = await payRes.json();

      if (!aData || aData.length === 0) {
        aData = [
          { id: 1, type: "HOTEL", hotel_name: "Taj Exotica Resort", room_no: "VILLA-402", address: "Radhanagar Beach, Havelock Island", jetty: "Havelock No.1", phone: "+91 999 888 7777", is_default: true },
          { id: 2, type: "HOME", hotel_name: "Sea Shell Residence", room_no: "Apt 12", address: "Phoenix Bay, Port Blair", jetty: "Port Blair Phoenix", phone: "+91 999 000 1111", is_default: false }
        ];
      }

      if (!payData || payData.length === 0) {
        payData = [
          { id: 1, type: "UPI", card_type: "Google Pay", upi_id: "sovereign.admiral@okaxis", is_default: true, card_holder: pData?.name },
          { id: 2, type: "UPI", card_type: "PhonePe", upi_id: "admiral.sovereign@ybl", is_default: false, card_holder: pData?.name },
          { id: 3, type: "CARD", card_type: "VISA", last4: "9021", expiry: "12/28", card_holder: pData?.name, is_default: false }
        ];
      }

      setUserProfile(pData);
      setAddresses(aData);
      setPayments(payData);
      if (pData) {
        updateUser({
          name: pData.name,
          avatar: pData.avatar_url
        });
      }
    } catch (err) {
      toast("Registry Sync Failure", "error");
    } finally {
      setIsHydrating(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && isHydrated) {
      if (!isAuthenticated) {
        toast("Session handshake required", "error");
        router.push("/login");
      } else if (user?.id) {
        fetchRegistry();
      }
    }
  }, [mounted, isHydrated, isAuthenticated, user?.id]);

  const handleOpenModal = (type: "address" | "card" | "profile", item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === "profile") {
      setFormData({ name: userProfile.name, email: userProfile.email, avatar_url: userProfile.avatar_url });
    } else if (type === "address") {
      setFormData(item ? { ...item } : { user_id: userId, type: "HOME", hotel_name: "", room_no: "", jetty: "", address: "", phone: "", is_default: false });
    } else {
      setFormData(item ? { ...item } : { user_id: userId, type: "UPI", card_holder: userProfile.name, card_type: "Google Pay", upi_id: "", last4: "", expiry: "", is_default: false });
    }
    setIsModalOpen(true);
  };

  const handleSaveProtocol = async () => {
    setIsSaving(true);
    try {
      let endpoint = modalType === 'profile' ? '/api/user/profile' : (modalType === 'address' ? '/api/user/addresses' : '/api/user/payments');
      const res = await fetch(endpoint, {
        method: modalType === 'profile' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast("Profile Updated", "success");
        fetchRegistry();
        setIsModalOpen(false);
      }
    } catch (err) {
      toast("Sync Failure", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProtocol = async (type: "address" | "card", id: number) => {
    try {
      const endpoint = type === 'address' ? '/api/user/addresses' : '/api/user/payments';
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast("Removed successfully", "success");
        fetchRegistry();
      }
    } catch (err) {
      toast("Failed to remove", "error");
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      toast("Enter a location to search.", "error");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Andaman")}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const topResult = data[0];
        setFormData((prev: any) => ({ ...prev, address: topResult.display_name, locality: "Live Node" }));
        toast("Location Found & Synced", "success");
      } else {
        toast("Location not found.", "error");
      }
    } catch (err) {
      toast("Search query failed.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  if (!mounted || isHydrating) {
    return (
      <MainLayout>
        <div className="bg-[#0B1120] min-h-screen flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse italic">Connecting...</p>
        </div>
      </MainLayout>
    );
  }

  const menuItems = [
    { id: "overview", label: "Profile Overview", icon: <User className="w-4 h-4" />, color: "#00D1FF" },
    { id: "addresses", label: "Saved Addresses", icon: <MapPin className="w-4 h-4" />, color: "#10B981" },
    { id: "payments", label: "Payment Methods", icon: <CreditCard className="w-4 h-4" />, color: "#FACC15" },
    { id: "security", label: "Account Security", icon: <ShieldCheck className="w-4 h-4" />, color: "#A855F7" },
    { id: "notifications", label: "Notification Preferences", icon: <Bell className="w-4 h-4" />, color: "#F97316" },
  ];


  return (
    <MainLayout>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
      <div className="px-4 md:px-10 pb-20">
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
               <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-bg-card border border-[var(--foreground)]/10 rounded-[32px] md:rounded-[40px] p-5 md:p-10 shadow-2xl space-y-4 md:space-y-8 overflow-hidden text-[var(--foreground)]">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-500" />
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl md:text-2xl font-black uppercase italic leading-tight">{modalType === 'profile' ? 'Profile Details' : (editingItem ? 'Update Details' : `Add ${modalType}`)}</h3>
                     <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-[var(--foreground)]/5 rounded-xl hover:bg-[var(--foreground)]/10 transition-colors"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                     {modalType === "profile" && (
                        <>
                           <div className="flex flex-col items-center justify-center space-y-3 pb-4">
                              <div 
                                 onClick={() => fileInputRef.current?.click()}
                                 className="relative w-24 h-24 rounded-full border-4 border-primary/25 p-1 cursor-pointer overflow-hidden group/modal-avatar shadow-glow-purple/20 shadow-lg"
                              >
                                 <img src={formData.avatar_url || userProfile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} className="w-full h-full rounded-full object-cover group-hover/modal-avatar:scale-110 transition-transform duration-300" alt="Avatar" />
                                 <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/modal-avatar:opacity-100 flex items-center justify-center transition-all duration-200">
                                    {isUploadingAvatar ? (
                                       <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                       <Camera className="w-6 h-6 text-white scale-75 group-hover/modal-avatar:scale-100 transition-transform" />
                                    )}
                                 </div>
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary italic cursor-pointer hover:underline animate-pulse" onClick={() => fileInputRef.current?.click()}>
                                 {isUploadingAvatar ? "UPLOADING AVATAR..." : "SYNCHRONIZE AVATAR"}
                              </span>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">CITIZEN NAME</label>
                              <Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">COMMUNICATION NODE</label>
                              <Input value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                           </div>
                        </>
                     )}

                     {modalType === "address" && (
                        <>
                           <div className="grid grid-cols-2 gap-3 md:gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">ADDRESS TYPE</label>
                                 <select value={formData.type || "HOME"} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full h-12 md:h-14 bg-[#1A1F2C] border border-[var(--foreground)]/5 rounded-xl md:rounded-2xl px-4 text-[var(--foreground)] italic appearance-none">
                                    <option value="HOME" className="bg-[#1A1F2C]">HOME</option>
                                    <option value="HOTEL" className="bg-[#1A1F2C]">HOTEL / RESORT</option>
                                    <option value="WORK" className="bg-[#1A1F2C]">OFFICE</option>
                                 </select>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">DELIVERY JETTY</label>
                                 <select value={formData.jetty || ""} onChange={(e) => setFormData({...formData, jetty: e.target.value})} className="w-full h-12 md:h-14 bg-[#1A1F2C] border border-[var(--foreground)]/5 rounded-xl md:rounded-2xl px-4 text-[var(--foreground)] italic appearance-none">
                                    <option value="" className="bg-[#1A1F2C]">SELECT JETTY</option>
                                    <option value="Havelock No.1" className="bg-[#1A1F2C]">HAVELOCK NO.1</option>
                                    <option value="Port Blair Phoenix" className="bg-[#1A1F2C]">PORT BLAIR PHOENIX</option>
                                    <option value="Neil Island Jetty" className="bg-[#1A1F2C]">NEIL ISLAND JETTY</option>
                                 </select>
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">ESTABLISHMENT NAME</label>
                              <Input value={formData.hotel_name || ""} onChange={(e) => setFormData({...formData, hotel_name: e.target.value})} placeholder="e.g. Taj Exotica" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                           </div>
                           <div className="grid grid-cols-2 gap-3 md:gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">ROOM / HOUSE NO.</label>
                                 <Input value={formData.room_no || ""} onChange={(e) => setFormData({...formData, room_no: e.target.value})} placeholder="e.g. 302" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">CONTACT PHONE</label>
                                 <Input value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Emergency Comms" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">PRIMARY MARITIME COORDINATES</label>
                                 <button onClick={() => {
                                    setFormData({ ...formData, address: "Connecting to Satellite...", locality: "Locating" });
                                    if ("geolocation" in navigator) {
                                      navigator.geolocation.getCurrentPosition(async (position) => {
                                        try {
                                          const { latitude, longitude } = position.coords;
                                          
                                          // Enforce Andaman & Nicobar Bounding Box
                                          const isAndaman = latitude >= 6.0 && latitude <= 14.0 && longitude >= 92.0 && longitude <= 94.0;
                                          if (!isAndaman) {
                                            setFormData((prev: any) => ({ ...prev, address: "" }));
                                            toast("Satellite deviation detected. Location falls outside the Andaman Maritime Zone. Please search manually.", "error");
                                            return;
                                          }

                                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                          const data = await res.json();
                                          if (data && data.display_name) {
                                            // The formData update must merge cleanly
                                            setFormData((prev: any) => ({ ...prev, address: data.display_name, locality: data.address?.city || data.address?.town || data.address?.suburb || "Live Node" }));
                                            toast("Coordinates Locked & Synced.", "success");
                                          } else {
                                            throw new Error("Geocoding failed");
                                          }
                                        } catch (err) {
                                          setFormData((prev: any) => ({ ...prev, address: "Failed to reverse geocode coordinates." }));
                                          toast("Satellite Sync Failed", "error");
                                        }
                                      }, (error) => {
                                        setFormData((prev: any) => ({ ...prev, address: "Location access denied or unavailable." }));
                                        toast("Location Access Denied.", "error");
                                      });
                                    } else {
                                      setFormData((prev: any) => ({ ...prev, address: "Geolocation not supported by browser." }));
                                      toast("System Incompatible.", "error");
                                    }
                                 }} className="text-[8px] font-black uppercase text-primary flex items-center gap-1 hover:brightness-125 transition-all">
                                    <Zap className="w-3 h-3" /> SYNC WITH SATELLITE
                                 </button>
                              </div>
                              <div className="relative w-full h-32 md:h-40 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl overflow-hidden group">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&q=80')] opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700 bg-cover bg-center" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse border border-primary/40">
                                       <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                 </div>
                                 <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/5 text-[7px] font-black text-white uppercase italic">Active Satellite Link</div>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Location (e.g. Diglipur)" className="flex-1 h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                                <Button onClick={handleManualSearch} disabled={isSearching} className="h-12 md:h-14 px-6 rounded-xl md:rounded-2xl text-[10px] font-black uppercase shadow-glow-purple">
                                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                              </div>
                              <Input value={formData.address || ""} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Full Street / Area" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                           </div>
                        </>
                     )}

                     {modalType === "card" && (
                        <>
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2 md:gap-4">
                                 <button onClick={() => setFormData({...formData, type: 'UPI'})} className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex flex-col items-center gap-1.5 md:gap-2", formData.type === 'UPI' ? "bg-primary/20 border-primary shadow-glow-purple/20" : "bg-white/5 border-white/5")}>
                                    <Smartphone className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase italic">UPI PROTOCOL</span>
                                 </button>
                                 <button onClick={() => setFormData({...formData, type: 'CARD'})} className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex flex-col items-center gap-1.5 md:gap-2", formData.type === 'CARD' ? "bg-primary/20 border-primary shadow-glow-purple/20" : "bg-white/5 border-white/5")}>
                                    <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase italic">CARD SIGNATURE</span>
                                 </button>
                              </div>

                              {formData.type === 'UPI' ? (
                                 <div className="space-y-3 md:space-y-4">
                                    <div className="space-y-1.5">
                                       <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">UPI BRAND</label>
                                       <select value={formData.card_type || "Google Pay"} onChange={(e) => setFormData({...formData, card_type: e.target.value})} className="w-full h-12 md:h-14 bg-[#1A1F2C] border border-[var(--foreground)]/5 rounded-xl md:rounded-2xl px-4 text-[var(--foreground)] italic appearance-none">
                                          <option value="Google Pay" className="bg-[#1A1F2C]">GOOGLE PAY</option>
                                          <option value="PhonePe" className="bg-[#1A1F2C]">PHONEPE</option>
                                          <option value="Paytm" className="bg-[#1A1F2C]">PAYTM</option>
                                       </select>
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">UPI VPA (ID)</label>
                                       <Input value={formData.upi_id || ""} onChange={(e) => setFormData({...formData, upi_id: e.target.value})} placeholder="e.g. user@okaxis" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                                    </div>
                                 </div>
                              ) : (
                                 <div className="space-y-3 md:space-y-4">
                                    <div className="space-y-1.5">
                                       <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">SIGNATURE NAME</label>
                                       <Input value={formData.card_holder || ""} onChange={(e) => setFormData({...formData, card_holder: e.target.value})} className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                       <div className="space-y-1.5">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">LAST 4 DIGITS</label>
                                          <Input maxLength={4} value={formData.last4 || ""} onChange={(e) => setFormData({...formData, last4: e.target.value})} className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                                       </div>
                                       <div className="space-y-1.5">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary italic">EXPIRY DATE</label>
                                          <Input value={formData.expiry || ""} onChange={(e) => setFormData({...formData, expiry: e.target.value})} placeholder="MM/YY" className="h-12 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl md:rounded-2xl italic" />
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </>
                     )}
                  </div>

                  <div className="flex gap-3 md:gap-4 pt-2">
                     <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl border-[var(--foreground)]/10 text-[9px] font-black uppercase italic">ABORT</Button>
                     <Button onClick={handleSaveProtocol} disabled={isSaving} className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl shadow-glow-purple text-[9px] font-black uppercase gap-2 italic">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "SYNCING..." : "AUTHORIZE"}
                     </Button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[10px] md:gap-10">
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
             <Card className="p-[10px] md:p-8 bg-[#0B1120]/80 border-[var(--foreground)]/10 rounded-[24px] md:rounded-[40px] text-center space-y-[4px] md:space-y-6 relative overflow-hidden group shadow-2xl">
                <div 
                   onClick={() => fileInputRef.current?.click()} 
                   className="relative mx-auto w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20 p-1 hover:border-primary transition-all cursor-pointer overflow-hidden group/avatar shadow-lg shadow-primary/10"
                >
                   <img src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} className="w-full h-full rounded-full object-cover shadow-2xl group-hover/avatar:scale-110 transition-transform duration-300" alt="Profile" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200 rounded-full">
                      {isUploadingAvatar ? (
                         <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                         <Camera className="w-6 h-6 text-white scale-75 group-hover/avatar:scale-100 transition-transform" />
                      )}
                   </div>
                </div>
                <div className="space-y-0.5 md:space-y-1">
                   <h3 className="text-xl md:text-2xl font-black uppercase italic text-primary drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                      {displayName}
                   </h3>
                   <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest italic">{displayGrade}</p>
                </div>
                <Button onClick={() => handleOpenModal("profile")} variant="ghost" className="w-full h-8 md:h-10 text-[8px] md:text-[9px] font-black uppercase text-primary gap-2 italic">EDIT PROFILE <Edit3 className="w-3 h-3" /></Button>
             </Card>

             <nav className="space-y-[4px] md:space-y-2">
                {menuItems.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-3 transition-all group relative overflow-hidden",
                      activeTab === item.id ? "text-white" : "hover:bg-white/5"
                    )}
                    style={{
                      clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                      backgroundColor: activeTab === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      boxShadow: activeTab === item.id ? `inset 0 0 0 1px ${item.color}` : 'none',
                      borderLeftWidth: '5px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: item.color
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                       <span className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-white" : "")} style={{ color: activeTab !== item.id ? item.color : undefined }}>{item.icon}</span>
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">{item.label}</span>
                    </div>
                    <ChevronRight className={cn("w-3 h-3 md:w-4 h-4 transition-transform", activeTab === item.id && "translate-x-1")} />
                  </button>
                ))}
             </nav>
          </aside>

          <section className="lg:col-span-9 space-y-[10px] md:space-y-10">
             <div className="lg:hidden px-2">
                <Card className="p-[10px] bg-[#0B1120]/80 border-[var(--foreground)]/10 rounded-[24px] flex items-center gap-4 relative overflow-hidden group shadow-xl">
                   <div 
                      onClick={() => fileInputRef.current?.click()} 
                      className="relative w-16 h-16 rounded-full border-2 border-primary/20 p-1 hover:border-primary transition-all cursor-pointer overflow-hidden group/avatar shadow-md shadow-primary/10"
                   >
                      <img src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80"} className="w-full h-full rounded-full object-cover shadow-xl group-hover/avatar:scale-110 transition-transform duration-300" alt="Profile" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200 rounded-full">
                         {isUploadingAvatar ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                         ) : (
                            <Camera className="w-4 h-4 text-white scale-75 group-hover/avatar:scale-100 transition-transform" />
                         )}
                      </div>
                   </div>
                    <div className="flex-1 space-y-0.5">
                       <h3 className="text-lg font-black uppercase italic text-primary leading-tight">{displayName}</h3>
                       <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">{displayGrade}</p>
                    </div>
                   <Button onClick={() => handleOpenModal("profile")} variant="ghost" className="p-2 h-auto text-primary hover:bg-primary/5 rounded-xl"><Edit3 className="w-4 h-4" /></Button>
                </Card>
             </div>

             <div className="md:hidden relative overflow-hidden bg-[var(--foreground)]/5 rounded-2xl border border-[var(--foreground)]/10 p-[1px] shadow-glow-purple/5">
                <div className="flex items-center gap-0">
                   {menuItems.map((item, idx) => {
                     const isActive = activeTab === item.id;
                     const shortLabels: Record<string, string> = { overview: "Profile", addresses: "Address", payments: "Payment", security: "Security", notifications: "Alerts" };
                     return (
                       <button 
                         key={item.id} 
                         onClick={() => setActiveTab(item.id)} 
                         className={cn(
                           "flex flex-col items-center justify-center flex-1 h-[72px] transition-all gap-1.5 relative group",
                           isActive ? "text-white" : "text-text-secondary opacity-60"
                         )}
                         style={{
                           clipPath: "polygon(18% 0, 100% 0, 82% 100%, 0 100%)",
                           marginLeft: idx === 0 ? "0" : "-6%",
                           backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                           boxShadow: isActive ? `inset 0 0 0 1px ${item.color}` : 'none',
                           borderLeftWidth: isActive ? '5px' : '0px',
                           borderLeftStyle: 'solid',
                           borderLeftColor: isActive ? item.color : 'transparent'
                         }}
                       >
                         <span className={cn("scale-[0.85] transition-transform", isActive ? "text-white" : "")} style={{ color: !isActive ? item.color : undefined }}>{item.icon}</span>
                         <span className="text-[9px] font-black uppercase tracking-tighter italic leading-none">{shortLabels[item.id]}</span>
                       </button>
                     );
                   })}
                 </div>
             </div>

             {activeTab === "overview" && (
                <div className="space-y-[10px] md:space-y-10 animate-fade-in">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-6">
                      <Card className="p-[10px] md:p-10 bg-bg-card/40 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] space-y-[4px] md:space-y-6 md:col-span-2 relative overflow-hidden group">
                         <div className="flex items-center justify-between">
                            <h4 className="text-sm md:text-xl font-black uppercase italic text-[var(--foreground)] shadow-glow-purple/5">Loyalty Points</h4>
                            <Star className="w-4 h-4 md:w-6 md:h-6 text-warning fill-warning opacity-40" />
                         </div>
                          <div className="space-y-[4px] md:space-y-4">
                             <div className="h-3 md:h-4 bg-[var(--foreground)]/5 rounded-full overflow-hidden p-[1px]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (loyaltyPoints / 3000) * 100)}%` }} className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-glow-purple rounded-full" /></div>
                             <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] italic text-[var(--foreground)]/40"><span>{loyaltyPoints} PTS</span><span className="text-text-secondary">{Math.max(0, 3000 - loyaltyPoints)} PTS TO PLATINUM</span></div>
                          </div>
                      </Card>
                      <Card className="p-[10px] md:p-10 bg-bg-card/40 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] flex flex-col items-center justify-center text-center space-y-[4px] md:space-y-4">
                         <div className="w-10 h-10 md:w-16 md:h-16 bg-green-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-green-500 shadow-glow-purple/5"><ShieldCheck className="w-5 h-5 md:w-8 md:h-8" /></div>
                         <p className="text-xs md:text-xl font-black uppercase italic text-[var(--foreground)] shadow-glow-purple/5 leading-tight">Account Secure</p>
                      </Card>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="p-8 bg-bg-card/40 border-[var(--foreground)]/5 rounded-[40px] space-y-6 group text-[var(--foreground)]">
                         <h4 className="text-xl font-black uppercase italic shadow-glow-purple/5">Default Address</h4>
                          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 shadow-glow-purple/5"><MapPin className="w-5 h-5 text-primary mt-1" /><p className="text-xs text-[var(--foreground)]/60 italic">{Array.isArray(addresses) ? (addresses.find(a => a.is_default)?.address || "No primary address set") : "Initializing..."}</p></div>
                      </Card>
                   </div>
                </div>
             )}

             {activeTab === "addresses" && (
                <div className="space-y-[4px] md:space-y-6 animate-fade-in">
                   <div className="flex items-center justify-between px-2">
                      <h4 className="text-sm md:text-xl font-black uppercase italic text-[var(--foreground)] shadow-glow-purple/5">Address Vault</h4>
                      <Button onClick={() => handleOpenModal("address")} variant="outline" className="h-8 md:h-10 border-primary/20 text-primary rounded-full text-[8px] md:text-[9px] font-black uppercase gap-2 italic shadow-glow-purple/5">+ ADD PROTOCOL</Button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-[4px] md:gap-6">
                      {Array.isArray(addresses) && addresses.map((addr) => (
                         <Card key={addr.id} className={cn("p-[10px] md:p-8 rounded-[20px] md:rounded-[32px] border-white/5 bg-white/5 flex items-start gap-4 md:gap-6 group hover:border-primary/20 transition-all", addr.is_default && "border-primary/20 bg-primary/5 shadow-glow-purple/5")}>
                            <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-glow-purple/5", addr.is_default ? "bg-primary text-white shadow-glow-purple" : "bg-white/5 text-text-secondary")}><MapPin className="w-5 h-5 md:w-6 md:h-6" /></div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center gap-2"><h5 className="text-xs md:text-lg font-black text-white uppercase italic">{addr.type}</h5>{addr.is_default && <Badge className="bg-success/10 text-success border-success/20 text-[7px] md:text-[8px] font-black italic shadow-glow-purple/5">PRIMARY</Badge>}</div>
                               <div className="space-y-1">
                                  {addr.hotel_name && <p className="text-xs font-black text-[var(--foreground)] uppercase italic">{addr.hotel_name} {addr.room_no && `• RM ${addr.room_no}`}</p>}
                                  <p className="text-[10px] md:text-sm text-text-secondary italic leading-tight">{addr.address}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">{addr.jetty && <p className="text-[8px] font-black text-primary uppercase tracking-widest italic">HUB JETTY: {addr.jetty}</p>}{addr.phone && <p className="text-[8px] font-black text-warning uppercase tracking-widest italic">COMMS: {addr.phone}</p>}</div>
                               </div>
                            </div>
                            <button onClick={() => handleDeleteProtocol("address", addr.id)} className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-danger hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                         </Card>
                      ))}
                   </div>
                </div>
             )}

             {activeTab === "payments" && (
                <div className="space-y-6 animate-fade-in">
                   <div className="flex items-center justify-between px-2">
                      <h4 className="text-xl font-black uppercase italic text-[var(--foreground)] shadow-glow-purple/5">Payment Methods</h4>
                      <Button onClick={() => handleOpenModal("card")} variant="outline" className="h-10 border-primary/20 text-primary rounded-full text-[9px] font-black uppercase gap-2 italic shadow-glow-purple/5">+ ADD PAYMENT</Button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.isArray(payments) && payments.map((card) => (
                         <Card key={card.id} className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-[32px] space-y-8 relative overflow-hidden group text-[var(--foreground)] shadow-glow-purple/5">
                            <div className="flex justify-between items-start">
                               {card.type === 'UPI' ? <Smartphone className="w-10 h-10 text-primary" /> : <CreditCard className="w-10 h-10 text-primary" />}
                               <p className="text-xl font-black italic text-[var(--foreground)]/40 uppercase">{card.card_type}</p>
                            </div>
                            <div className="space-y-4">
                               {card.type === 'UPI' ? (
                                  <p className="text-xl font-black tracking-wider text-[var(--foreground)] truncate">{card.upi_id}</p>
                               ) : (
                                  <p className="text-2xl font-black tracking-[0.2em] text-[var(--foreground)]">•••• •••• •••• {card.last4}</p>
                               )}
                               <div className="flex justify-between items-end pt-4 border-t border-[var(--foreground)]/5">
                                  <div><p className="text-[8px] font-black text-text-secondary uppercase">IDENTIFIER</p><p className="text-xs font-black uppercase italic">{card.card_holder}</p></div>
                                  {card.expiry && <p className="text-xs font-black uppercase italic">{card.expiry}</p>}
                                </div>
                            </div>
                            <button onClick={() => handleDeleteProtocol("card", card.id)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                         </Card>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6 animate-fade-in">
                   <h4 className="text-xl font-black uppercase italic text-[var(--foreground)] px-2 shadow-glow-purple/5">Account Security</h4>
                   <Card className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[32px] space-y-8 shadow-glow-purple/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase italic text-primary tracking-widest">CHANGE PASSWORD</h5>
                            <Input type="password" placeholder="Current Password" className="bg-bg-primary italic border-white/5" />
                            <Input type="password" placeholder="New Password" className="bg-bg-primary italic border-white/5" />
                            <Button className="w-full h-12 text-[10px] font-black uppercase shadow-glow-purple rounded-xl italic">UPDATE PASSWORD</Button>
                         </div>
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase italic text-primary tracking-widest">TWO-FACTOR AUTHENTICATION</h5>
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between shadow-glow-purple/5">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-[var(--foreground)] uppercase italic">MFA ENABLED</p>
                                  <p className="text-[8px] font-bold text-text-secondary uppercase">SECURE YOUR ACCOUNT</p>
                                </div>
                               <div className="w-12 h-6 bg-primary/20 rounded-full p-1 cursor-pointer"><div className="w-4 h-4 bg-primary rounded-full shadow-glow-purple translate-x-6" /></div>
                            </div>
                         </div>
                      </div>
                   </Card>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-fade-in">
                   <h4 className="text-xl font-black uppercase italic text-[var(--foreground)] px-2 shadow-glow-purple/5">Notification Preferences</h4>
                   <Card className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[32px] space-y-6 shadow-glow-purple/5">
                      {[
                        { label: "Order Delivery Updates", desc: "Real-time package tracking alerts" },
                        { label: "Market Offers", desc: "Fresh arrivals & price updates" },
                        { label: "Security Alerts", desc: "Login & session alerts" }
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-glow-purple/5">
                           <div className="space-y-1"><p className="text-xs font-black text-[var(--foreground)] uppercase italic">{pref.label}</p><p className="text-[8px] font-bold text-text-secondary uppercase">{pref.desc}</p></div>
                           <div className="w-12 h-6 bg-primary/40 rounded-full p-1 cursor-pointer flex items-center"><div className="w-4 h-4 bg-white rounded-full shadow-glow-purple translate-x-6" /></div>
                        </div>
                      ))}
                   </Card>
                </div>
              )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
