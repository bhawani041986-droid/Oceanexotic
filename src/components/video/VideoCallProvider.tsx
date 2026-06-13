"use client";

import React, { createContext, useContext, useState } from 'react';
import { NativeVideoCall } from './NativeVideoCall';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { AnimatePresence } from 'framer-motion';

interface VideoCallContextType {
  activeVideoRoom: string | null;
  setActiveVideoRoom: (roomID: string | null) => void;
  incomingCall: { roomID: string; callerName: string } | null;
  setIncomingCall: (call: { roomID: string; callerName: string } | null) => void;
  currentUserId: string | null;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function useVideoCall() {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
}

export function VideoCallProvider({ 
  children,
  currentUserId
}: { 
  children: React.ReactNode;
  currentUserId: string | null;
}) {
  const [activeVideoRoom, setActiveVideoRoom] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{roomID: string, callerName: string} | null>(null);

  // Note: incomingCall can be set by a global polling hook (useChatEngine)
  // that runs at the layout level, or by individual chat pages.

  return (
    <VideoCallContext.Provider value={{ activeVideoRoom, setActiveVideoRoom, incomingCall, setIncomingCall, currentUserId }}>
      {children}
      
      <IncomingCallOverlay 
        roomID={incomingCall?.roomID || null}
        callerName={incomingCall?.callerName || ""}
        onAccept={() => {
          if (incomingCall) {
            setActiveVideoRoom(incomingCall.roomID);
            setIncomingCall(null);
          }
        }}
        onDecline={() => {
          setIncomingCall(null);
          // Declining logic happens in the chat engine
        }}
      />
      
      <AnimatePresence>
        {activeVideoRoom && currentUserId && (
          <NativeVideoCall 
            roomID={activeVideoRoom} 
            userName="User" 
            userID={currentUserId}
            onClose={() => setActiveVideoRoom(null)}
          />
        )}
      </AnimatePresence>
    </VideoCallContext.Provider>
  );
}
