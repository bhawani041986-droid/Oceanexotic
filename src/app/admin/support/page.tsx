"use client";

import React from 'react';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { VideoCallProvider } from '@/components/video/VideoCallProvider';

export default function AdminSupportPage() {
  // Admin ID would typically come from auth, hardcoded for demo
  const currentUserId = "ADM-001";

  return (
    <VideoCallProvider currentUserId={currentUserId}>
      <ChatSystem 
        currentUserId={currentUserId} 
        role="admin" 
        backUrl="/admin" 
      />
    </VideoCallProvider>
  );
}
