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



  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
