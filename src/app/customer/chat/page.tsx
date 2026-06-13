"use client";

import React from 'react';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { useAuthStore } from '@/store/authStore';
import { VideoCallProvider } from '@/components/video/VideoCallProvider';

export default function CustomerChatPage() {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return null;
  
  const currentUserId = user?.id || "USR-001";

  return (
    <VideoCallProvider currentUserId={currentUserId}>
      <ChatSystem 
        currentUserId={currentUserId} 
        role="customer" 
        backUrl="/customer" 
      />
    </VideoCallProvider>
  );
}
