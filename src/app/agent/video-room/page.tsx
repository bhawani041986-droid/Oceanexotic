"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NativeVideoCall } from '@/components/video/NativeVideoCall';

function VideoRoomContent() {
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

export default function StandaloneVideoRoom() {
  return (
    <Suspense fallback={<div className="p-10 text-white font-black">Initializing Secure Uplink...</div>}>
      <VideoRoomContent />
    </Suspense>
  );
}
