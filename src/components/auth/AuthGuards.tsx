"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { ROUTES } from "@/constants";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push(`${ROUTES.AUTH.LOGIN}?redirect=${pathname}`);
      } else if (requiredRole) {
        // Check if user has required role
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const currentRole = String(user?.role || "").toLowerCase();
        if (!roles.includes(currentRole as UserRole)) {
          // Redirect to appropriate home if role is unauthorized
          if (currentRole === "admin") router.push("/admin/dashboard");
          else if (currentRole === "seller") router.push("/seller/dashboard");
          else router.push("/customer/products");
        }
      }
    }
  }, [isAuthenticated, user, requiredRole, isLoading, router, pathname]);

  if (!isHydrated || isLoading || !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If role is required, check before rendering children
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const currentRole = String(user?.role || "").toLowerCase();
    if (!roles.includes(currentRole as UserRole)) {
      return null;
    }
  }

  return <>{children}</>;
};

// Convenience wrappers
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRole="admin">{children}</AuthGuard>
);

export const SellerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRole="seller">{children}</AuthGuard>
);

export const CustomerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRole="customer">{children}</AuthGuard>
);
