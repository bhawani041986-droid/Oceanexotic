"use client";

import React from 'react';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { VideoCallProvider } from '@/components/video/VideoCallProvider';

export default function AgentSupportPage() {
  // Agent ID would typically come from auth, hardcoded for demo
  const currentUserId = "AGENT-7";

  return (
    <VideoCallProvider currentUserId={currentUserId}>
      <ChatSystem 
        currentUserId={currentUserId} 
        role="agent" 
        backUrl="/agent" 
      />
    </VideoCallProvider>
  );
}
