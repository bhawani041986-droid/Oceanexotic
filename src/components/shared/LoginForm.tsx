"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // Mocking auth for now
    setTimeout(() => {
      let role: 'admin' | 'seller' | 'customer' = 'customer';
      if (data.email.includes('admin')) role = 'admin';
      if (data.email.includes('seller')) role = 'seller';

      login({
        id: "1",
        email: data.email,
        name: "User Name",
        role: role,
      });
      
      setIsLoading(false);
      router.push(`/${role}/dashboard`);
    }, 1500);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Email Address</label>
          <Input 
            {...form.register("email")}
            placeholder="name@example.com"
            type="email"
            className={form.formState.errors.email ? "border-danger" : ""}
          />
          {form.formState.errors.email && (
            <p className="text-[10px] text-danger font-bold uppercase">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Password</label>
            <button type="button" className="text-[10px] text-primary font-bold hover:underline">Forgot?</button>
          </div>
          <Input 
            {...form.register("password")}
            placeholder="••••••••"
            type="password"
            className={form.formState.errors.password ? "border-danger" : ""}
          />
          {form.formState.errors.password && (
            <p className="text-[10px] text-danger font-bold uppercase">{form.formState.errors.password.message}</p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 shadow-glow" 
        disabled={isLoading}
      >
        {isLoading ? "AUTHENTICATING..." : "SIGN IN TO OceanExotic Global"}
      </Button>
    </form>
  );
}
