"use client";

import React from 'react';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { useAuth } from '@/lib/hooks/useAuth';
import { VideoCallProvider } from '@/components/video/VideoCallProvider';

export default function CustomerChatPage() {
  const { user, isLoading } = useAuth();
  
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
