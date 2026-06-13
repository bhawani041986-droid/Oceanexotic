"use client";

import React from 'react';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { useAuth } from '@/store/authStore';
import { VideoCallProvider } from '@/components/video/VideoCallProvider';

export default function SellerChatPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  const currentUserId = user?.id || "SELL-001";

  return (
    <VideoCallProvider currentUserId={currentUserId}>
      <ChatSystem 
        currentUserId={currentUserId} 
        role="seller" 
        backUrl="/seller" 
      />
    </VideoCallProvider>
  );
}
