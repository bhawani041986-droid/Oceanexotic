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
import { authService } from "@/services/authService";

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Please enter a valid oceanic email"),
  phone: z.string()
    .min(10, "Signal node (phone) must be at least 10 digits")
    .max(15, "Signal node too long")
    .regex(/^\+?[0-9\s-]+$/, "Invalid signal node format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "seller"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "customer",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);

      if (response.status === "success") {
        login({
          id: response.user.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });

        toast(`Account commissioned successfully, ${data.name}!`, "success");
        
        if (data.role === "seller") router.push("/seller/onboarding");
        else router.push("/customer/products");
      } else {
        toast(response.message || "Registration failed.", "error");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast("Registration failed. Fleet registry is busy.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="relative min-h-screen bg-bg-primary flex flex-col justify-center items-center overflow-hidden py-20">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=2000" 
          alt="Deep Sea"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary to-bg-primary" />
      </div>

      <div className="relative z-10 w-full max-w-[540px] px-6">
        <div className="text-center space-y-4 mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-[32px] font-black tracking-tighter text-[var(--foreground)]">OCEAN<span className="text-primary">FRESH</span></h1>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Join the Fleet</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Establish your presence in the Global Seafood Network</p>
          </div>
        </div>

        <div className="p-1 rounded-[28px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 shadow-premium backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-card rounded-[26px] p-10 space-y-8">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 text-center block">Commission Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("role", "customer")}
                  className={cn(
                    "p-4 rounded-[16px] border transition-all text-left space-y-1",
                    selectedRole === "customer" 
                      ? "bg-primary/10 border-primary shadow-glow-purple" 
                      : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 hover:border-[var(--foreground)]/20"
                  )}
                >
                  <p className={cn("text-[11px] font-black uppercase tracking-widest", selectedRole === "customer" ? "text-primary" : "text-text-secondary")}>Customer</p>
                  <p className="text-[10px] font-medium text-text-secondary/60">I want to source premium seafood.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "seller")}
                  className={cn(
                    "p-4 rounded-[16px] border transition-all text-left space-y-1",
                    selectedRole === "seller" 
                      ? "bg-primary/10 border-primary shadow-glow-purple" 
                      : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 hover:border-[var(--foreground)]/20"
                  )}
                >
                  <p className={cn("text-[11px] font-black uppercase tracking-widest", selectedRole === "seller" ? "text-primary" : "text-text-secondary")}>Seller</p>
                  <p className="text-[10px] font-medium text-text-secondary/60">I want to list my harvest for trade.</p>
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Full Name</label>
                <Input 
                  {...register("name")}
                  placeholder="Admiral Name" 
                  className={errors.name ? "border-danger/50" : ""}
                />
                {errors.name && <p className="text-[10px] font-bold text-danger ml-1">{errors.name.message}</p>}
              </div>

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
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Signal Node (Phone)</label>
                <Input 
                  {...register("phone")}
                  placeholder="+91 00000 00000" 
                  className={errors.phone ? "border-danger/50" : ""}
                />
                {errors.phone && <p className="text-[10px] font-bold text-danger ml-1">{errors.phone.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Secret Key</label>
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
              {isLoading ? "COMMISSIONING..." : "CREATE ACCOUNT"}
            </Button>

            <p className="text-center text-[11px] font-medium text-text-secondary">
              Already in the fleet? <Link href="/login" className="text-[var(--foreground)] font-bold hover:text-primary transition-colors">INITIATE SESSION</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  
  );
}
