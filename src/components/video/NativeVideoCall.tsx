"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface NativeVideoCallProps {
  roomID: string;
  userName: string;
  userID: string;
  onClose: () => void;
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

export function NativeVideoCall({ roomID, userName, userID, onClose }: NativeVideoCallProps) {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<any>(null);

  // Use a queue for early ICE candidates
  const earlyCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (videoErr) {
          console.warn("Failed to get video, falling back to audio only:", videoErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsCameraOn(false);
        }
        localStream.current = stream;
        
        if (localVideoRef.current && mounted) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize Peer Connection
        const pc = new RTCPeerConnection(configuration);
        peerConnection.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && mounted) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
          }
        };

        // 3. Initialize Supabase Signaling Channel
        const chan = supabase.channel(`video-${roomID}`, {
          config: {
            broadcast: { ack: false }
          }
        });
        channel.current = chan;

        // Handle ICE Candidates generated locally
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            chan.send({
              type: 'broadcast',
              event: 'webrtc',
              payload: { type: 'ice-candidate', candidate: event.candidate, sender: userID }
            });
          }
        };

        // Listen for WebRTC signals from remote
        chan.on('broadcast', { event: 'webrtc' }, async ({ payload }) => {
          if (payload.sender === userID) return; // Ignore own messages

          try {
            if (payload.type === 'peer-joined') {
              // Acknowledge so the late joiner knows the early joiner is already here
              chan.send({
                type: 'broadcast',
                event: 'webrtc',
                payload: { type: 'peer-joined-ack', sender: userID }
              });

              if (userID < payload.sender && pc.signalingState === 'stable') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                chan.send({
                  type: 'broadcast',
                  event: 'webrtc',
                  payload: { type: 'offer', offer, sender: userID }
                });
              }
            }
            else if (payload.type === 'peer-joined-ack') {
              if (userID < payload.sender && pc.signalingState === 'stable') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                chan.send({
                  type: 'broadcast',
                  event: 'webrtc',
                  payload: { type: 'offer', offer, sender: userID }
                });
              }
            }
            else if (payload.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
              
              // Process any ICE candidates we received before the offer
              for (const candidate of earlyCandidates.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              earlyCandidates.current = [];

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              chan.send({
                type: 'broadcast',
                event: 'webrtc',
                payload: { type: 'answer', answer, sender: userID }
              });
            } 
            else if (payload.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            } 
            else if (payload.type === 'ice-candidate') {
              if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } else {
                earlyCandidates.current.push(payload.candidate);
              }
            }
            else if (payload.type === 'peer-left') {
              toast("The other party left the call.", "info");
              cleanup();
            }
          } catch (err) {
            console.error("WebRTC Error:", err);
          }
        });

        // Join channel
        chan.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            chan.send({
              type: 'broadcast',
              event: 'webrtc',
              payload: { type: 'peer-joined', sender: userID }
            });
          }
        });

      } catch (err) {
        console.error("Failed to access media devices:", err);
        if (mounted) {
          toast("Microphone access required. Please check permissions.", "error");
          onClose();
        }
      }
    };

    initCall();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [roomID, userID]);

  const cleanup = () => {
    if (channel.current) {
      channel.current.send({
        type: 'broadcast',
        event: 'webrtc',
        payload: { type: 'peer-left', sender: userID }
      }).catch(() => {});
      channel.current.unsubscribe();
      channel.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    onClose();
  };

  const toggleMic = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {!isConnected && (
          <div className="absolute z-10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-medium animate-pulse">Establishing Secure Connection...</p>
          </div>
        )}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Local Video (Picture in Picture) */}
      <div className="absolute top-6 right-6 w-32 h-48 bg-zinc-900 rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <CameraOff className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-[32px] border border-white/10 z-20 shadow-2xl">
        <button 
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-danger/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button 
          onClick={cleanup}
          className="w-16 h-16 rounded-full bg-danger text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-105 transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        <button 
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isCameraOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-danger/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          }`}
        >
          {isCameraOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );

  if (typeof document === 'undefined') return null;
  const { createPortal } = require('react-dom');
  return createPortal(modalContent, document.body);
}
