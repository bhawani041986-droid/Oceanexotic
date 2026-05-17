"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "seller"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "customer" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: "2",
        email: data.email,
        name: data.name,
        role: data.role,
      });
      setIsLoading(false);
      router.push(`/${data.role}/dashboard`);
    }, 1500);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {['customer', 'seller'].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => form.setValue("role", role as any)}
            className={cn(
              "p-4 rounded-[12px] border text-center transition-all",
              form.watch("role") === role 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-bg-card border-[var(--foreground)]/10 text-text-secondary hover:border-[var(--foreground)]/20"
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-widest">{role}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Full Name</label>
          <Input {...form.register("name")} placeholder="Bhawani Shankar" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Email</label>
          <Input {...form.register("email")} type="email" placeholder="name@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Password</label>
          <Input {...form.register("password")} type="password" placeholder="••••••••" />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 shadow-glow" disabled={isLoading}>
        {isLoading ? "CREATING ACCOUNT..." : "JOIN THE MARKETPLACE"}
      </Button>
    </form>
  );
}
