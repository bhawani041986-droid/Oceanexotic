"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function AdminEditUserFallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Redirecting to Registry...</p>
       </div>
    </div>
  );
}
