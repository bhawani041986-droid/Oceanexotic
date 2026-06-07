"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid oceanic email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}
  );

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter(
  );
  const { login } = useAuthStore(
  );
  const { toast } = useToast(
  );
  const [isLoading, setIsLoading] = useState(false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  }
  );

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.user;
        localStorage.setItem("auth_token", result.token);
        login({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase() as "admin" | "seller" | "customer",
        });

        toast(`Welcome back, ${user.name}! Transitioning to your dashboard...`, "success");
        
        if (user.role.toLowerCase() === "admin") router.push("/admin/dashboard");
        else if (user.role.toLowerCase() === "seller") router.push("/seller/dashboard");
        else router.push("/customer/products");
      } else {
        toast(result.message || "Authentication failed. Check your credentials.", "error");
      }
    } catch (error) {
      toast("Connection failed with maritime registry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="relative min-h-screen bg-bg-primary flex flex-col justify-center items-center overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=2000" 
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/20 via-bg-primary to-bg-primary" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-6">
        <div className="text-center space-y-4 mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-[32px] font-black tracking-tighter text-[var(--foreground)]">OCEAN<span className="text-primary">FRESH</span></h1>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Admiral Login</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Access the Global Seafood Network</p>
          </div>
        </div>

        <div className="p-1 rounded-[28px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 shadow-premium backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-card rounded-[26px] p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Fleet Identity (Email)</label>
                <Input 
                  {...register("email")}
                  placeholder="name@oceanexotic.com" 
                  className={errors.email ? "border-danger/50" : ""}
                />
                {errors.email && <p className="text-[10px] font-bold text-danger ml-1">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Secret Key</label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">RECOVER KEY</Link>
                </div>
                <Input 
                  {...register("password")}
                  type="password" 
                  placeholder="••••••••" 
                  className={errors.password ? "border-danger/50" : ""}
                />
                {errors.password && <p className="text-[10px] font-bold text-danger ml-1">{errors.password.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-xs font-black tracking-[0.2em] shadow-glow-purple"
              disabled={isLoading}
            >
              {isLoading ? "AUTHENTICATING..." : "INITIATE SESSION"}
            </Button>

            <p className="text-center text-[11px] font-medium text-text-secondary">
              New to the fleet? <Link href="/register" className="text-[var(--foreground)] font-bold hover:text-primary transition-colors">REGISTER ACCOUNT</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  
  );
}
