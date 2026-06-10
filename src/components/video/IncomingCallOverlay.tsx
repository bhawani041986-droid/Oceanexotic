import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomingCallOverlayProps {
  roomID: string | null;
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallOverlay({ roomID, callerName, onAccept, onDecline }: IncomingCallOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (roomID && typeof window !== 'undefined') {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3');
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log('Audio play failed, waiting for user interaction', e));
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [roomID]);

  if (!roomID || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[90%] max-w-sm bg-bg-secondary rounded-[32px] p-8 flex flex-col items-center shadow-[0_0_100px_rgba(0,209,255,0.15)] border border-[var(--foreground)]/10"
      >
        {/* Ringing Avatar Animation */}
        <div className="relative w-28 h-28 mb-8 mt-4">
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-primary rounded-full blur-xl"
          />
          <div className="absolute inset-0 bg-bg-primary rounded-full border-4 border-primary flex items-center justify-center z-10 shadow-2xl overflow-hidden">
             <div className="w-full h-full bg-primary/20 flex items-center justify-center text-4xl font-black text-primary">
               {callerName.charAt(0)}
             </div>
          </div>
        </div>

        <h2 className="text-xl font-black text-white uppercase tracking-widest text-center mb-1">Incoming Call</h2>
        <p className="text-xs font-medium text-slate-300 mb-12 text-center">{callerName} is requesting a video link</p>

        <div className="flex w-full justify-between px-6">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-danger/20 text-danger border border-danger/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-105 transition-all"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <span className="text-[10px] font-black uppercase text-danger">Decline</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <motion.button 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-success text-bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:scale-105 transition-all"
            >
              <Phone className="w-8 h-8 fill-current" />
            </motion.button>
            <span className="text-[10px] font-black uppercase text-success">Accept</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  const { createPortal } = require('react-dom');
  return createPortal(content, document.body);
}
