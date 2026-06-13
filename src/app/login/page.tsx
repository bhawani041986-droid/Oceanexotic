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
import { cn } from "@/lib/utils";

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
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary to-bg-primary" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="text-center space-y-4 mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--foreground)]">OCEAN<span className="text-primary">FRESH</span></h1>
          </Link>
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--foreground)]">Welcome Back</h2>
            <p className="text-text-secondary font-medium text-xs md:text-sm">Sign in to access the global seafood network</p>
          </div>
        </div>

        <div className="p-1 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 shadow-2xl backdrop-blur-xl">
          <div className="bg-bg-card rounded-[22px] p-6 md:p-8 space-y-6">
            
            {/* Google OAuth Button */}
            <Button 
              type="button" 
              variant="outline"
              onClick={async () => {
                const { supabaseFrontend } = await import('@/lib/supabase-client');
                await supabaseFrontend.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`
                  }
                });
              }}
              className="w-full h-12 md:h-14 bg-white hover:bg-slate-100 text-slate-900 border-none font-bold text-xs md:text-sm tracking-wide gap-3 shadow-sm transition-all rounded-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-[var(--foreground)]/10"></div>
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">OR EMAIL</span>
              <div className="flex-1 border-t border-[var(--foreground)]/10"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Email Address</label>
                  <Input 
                    {...register("email")}
                    placeholder="name@example.com" 
                    className={cn("h-12 md:h-14 rounded-xl", errors.email ? "border-danger/50" : "")}
                  />
                  {errors.email && <p className="text-[10px] font-bold text-danger ml-1">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Password</label>
                    <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">Forgot?</Link>
                  </div>
                  <Input 
                    {...register("password")}
                    type="password" 
                    placeholder="••••••••" 
                    className={cn("h-12 md:h-14 rounded-xl", errors.password ? "border-danger/50" : "")}
                  />
                  {errors.password && <p className="text-[10px] font-bold text-danger ml-1">{errors.password.message}</p>}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 md:h-14 text-xs font-black tracking-widest shadow-glow-purple rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </Button>

              <p className="text-center text-xs font-medium text-text-secondary">
                New to the platform? <Link href="/register" className="text-[var(--foreground)] font-bold hover:text-primary transition-colors">Create an account</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  
  );
}
