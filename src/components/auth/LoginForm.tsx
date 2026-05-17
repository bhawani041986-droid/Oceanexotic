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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const onSubmit = async (data: LoginFormValues) => {
    // High-Integrity Diagnostic Log
    console.log("INITIATING_AUTHENTICATION_HANDSHAKE:", data.email);
    
    try {
      // Simulate Abyssal Network Latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Sovereign Role Detection (Mock Logic for Enterprise Demo)
      let role: "admin" | "seller" | "customer" = "customer";
      if (data.email.toLowerCase().includes("admin")) role = "admin";
      else if (data.email.toLowerCase().includes("seller")) role = "seller";

      // Execute Sovereign State Handshake
      login({
        id: "USR-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: data.email.split("@")[0].charAt(0).toUpperCase() + data.email.split("@")[0].slice(1),
        email: data.email,
        role: role,
      });

      toast(`Authentication Successful. Welcome, ${role.toUpperCase()}.`, "success");

      // Execute Navigational Handshake
      if (role === "admin") {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else if (role === "seller") {
        router.push(ROUTES.SELLER_DASHBOARD);
      } else {
        router.push(ROUTES.PRODUCTS);
      }
    } catch (error) {
      console.error("AUTHENTICATION_FAILURE:", error);
      toast("Authentication signal lost. Verify credentials and retry.", "error");
    }
  };

  return (
    <Card className="w-full max-w-md border-[var(--foreground)]/5 bg-background-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your OceanExotic account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary-aqua hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
          <Button
            type="submit"
            className="w-full h-12 mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="text-primary-aqua font-medium hover:underline"
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
