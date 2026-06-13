"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function OAuthOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If not logged in, boot to login
    if (useAuthStore.getState().isHydrated && !user) {
      router.push("/login");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !address) {
      toast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      // For now, we will simulate the API call and just let them in.
      // In a real flow, you'd have an API route like PUT /api/users/profile
      toast("Welcome aboard!", "success");
      router.push("/customer/products");
    } catch (err) {
      toast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent_70%)]" />

      <div className="w-full max-w-md bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[32px] p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/30 rounded-[20px] flex items-center justify-center mx-auto mb-6 text-2xl font-black shadow-inner">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Welcome, {user.name.split(' ')[0]}!</h1>
          <p className="text-xs font-bold text-text-secondary mt-2 tracking-wide">Just a few more details to set up your deliveries.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Phone Number</label>
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210" 
              className="h-14 rounded-[16px] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Default Delivery Address</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Ocean Drive, Port Blair..." 
              className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)] rounded-[16px] p-4 text-sm outline-none focus:border-primary/50 transition-colors resize-none font-medium"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-xs font-black tracking-widest shadow-glow-purple rounded-[16px] mt-4"
            disabled={isLoading}
          >
            {isLoading ? "SAVING..." : "START EXPLORING"}
          </Button>
        </form>
      </div>
    </div>
  );
}
