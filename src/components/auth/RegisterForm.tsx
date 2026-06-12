"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/constants";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "seller"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "customer",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    // High-Integrity Diagnostic Log
    console.log("INITIATING_REGISTRATION_HANDSHAKE:", data.email, data.role);
    
    try {
      // Simulate Abyssal Network Latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Execute System State Handshake
      login({
        id: "USR-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: data.name,
        email: data.email,
        role: data.role as any,
      });

      toast(`Account Registered. Welcome to the Fleet, ${data.name.toUpperCase()}.`, "success");

      // Execute Navigational Handshake
      if (data.role === "seller") {
        router.push(ROUTES.SELLER_DASHBOARD);
      } else {
        router.push(ROUTES.PRODUCTS);
      }
    } catch (error) {
      console.error("REGISTRATION_FAILURE:", error);
      toast("Registration signal lost. Verify technical parameters and retry.", "error");
    }
  };

  return (
    <Card className="w-full max-w-md border-[var(--foreground)]/5 bg-background-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join OceanExotic Global and start trading premium seafood
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              placeholder="John Doe"
              className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[14px] px-4 focus:outline-none focus:ring-2 focus:ring-primary-purple transition-all"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[14px] px-4 focus:outline-none focus:ring-2 focus:ring-primary-purple transition-all"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[14px] px-4 focus:outline-none focus:ring-2 focus:ring-primary-purple transition-all"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Join as</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center justify-center h-12 rounded-[14px] border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all has-[:checked]:border-primary-purple has-[:checked]:bg-primary-purple/10">
                <input
                  type="radio"
                  value="customer"
                  className="sr-only"
                  {...register("role")}
                />
                <span className="text-sm font-medium">Customer</span>
              </label>
              <label className="relative flex items-center justify-center h-12 rounded-[14px] border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all has-[:checked]:border-primary-purple has-[:checked]:bg-primary-purple/10">
                <input
                  type="radio"
                  value="seller"
                  className="sr-only"
                  {...register("role")}
                />
                <span className="text-sm font-medium">Seller</span>
              </label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="text-primary-aqua font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
