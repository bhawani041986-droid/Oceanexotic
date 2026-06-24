"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function MobileAuthComponent() {
  const searchParams = useSearchParams();
  const expoUrl = searchParams.get("expoUrl");
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;

    if (!expoUrl) {
      setStatus("Error: Missing return URL");
      return;
    }

    if (!hash || !hash.includes("access_token")) {
      setStatus("Error: Missing access token");
      return;
    }

    const deepLink = `${expoUrl}${hash}`;
    setStatus(`Redirecting back to app...`);
    
    setTimeout(() => {
      window.location.href = deepLink;
    }, 500);

  }, [expoUrl]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050B18]">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-[#0E90E3] border-r-transparent border-b-transparent border-l-transparent"></div>
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-gray-400">Please wait, you will be redirected shortly.</p>
      </div>
    </div>
  );
}

export default function MobileAuth() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050B18] text-white">Loading proxy...</div>}>
      <MobileAuthComponent />
    </Suspense>
  );
}
