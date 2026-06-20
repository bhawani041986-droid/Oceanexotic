"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NativeVideoCall } from '@/components/video/NativeVideoCall';

export default function StandaloneVideoRoom() {
  const searchParams = useSearchParams();
  const roomID = searchParams.get('room');
  const userID = searchParams.get('user');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!roomID || !userID) {
    return <div className="p-10 text-white font-black">Missing Video Coordinates.</div>;
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50">
      <NativeVideoCall 
        roomID={roomID} 
        userName={userID} 
        userID={userID}
        onClose={() => {
          if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage('CLOSE_VIDEO');
          } else {
            window.close();
          }
        }}
      />
    </div>
  );
}
