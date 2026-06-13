"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If we are exactly on the standalone chat page, bypass the ecommerce layout
  if (pathname === "/customer/chat") {
    return <>{children}</>;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
