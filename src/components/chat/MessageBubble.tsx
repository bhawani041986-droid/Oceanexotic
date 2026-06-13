import React from 'react';
import { cn } from '@/lib/utils';
import { Package, Receipt, FileText, Check, CheckCheck, Play, Video } from 'lucide-react';
import Image from 'next/image';

export interface ChatMessage {
  id: number;
  message_text: string;
  message_type?: 'TEXT' | 'IMAGE' | 'PDF' | 'PRODUCT_CARD' | 'ORDER_CARD' | 'QUOTATION_CARD' | 'VOICE';
  attachment_url?: string | null;
  metadata?: any;
  created_at: string;
  is_read: boolean | number;
  sender_id: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  currentUserId: string;
  onJoinVideoCall?: (roomID: string) => void;
}

export function MessageBubble({ message, isOwnMessage, onJoinVideoCall }: MessageBubbleProps) {
  const [timeString, setTimeString] = React.useState("");

  React.useEffect(() => {
    if (message?.created_at) {
      setTimeString(new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [message?.created_at]);

  const renderContent = () => {
    switch (message.message_type) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            <div className="relative w-full max-w-[280px] h-[200px] rounded-xl overflow-hidden bg-black/10">
              {message.attachment_url ? (
                <Image 
                  src={message.attachment_url} 
                  alt="Chat Attachment" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs opacity-50">Image loading...</div>
              )}
            </div>
            {message.message_text && <p className="text-sm">{message.message_text}</p>}
          </div>
        );

      case 'PDF':
        return (
          <div className="space-y-2">
            <a 
              href={message.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                isOwnMessage ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-black/5 border-black/10 hover:bg-black/10"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Document.pdf</p>
                <p className="text-[10px] opacity-70">Click to view</p>
              </div>
            </a>
            {message.message_text && <p className="text-sm">{message.message_text}</p>}
          </div>
        );

      case 'PRODUCT_CARD':
        const product = message.metadata;
        return (
          <div className="w-full max-w-[280px] bg-white text-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            {product?.image && (
              <div className="w-full h-32 relative bg-slate-100">
                <Image src={product.image} alt={product.name || "Product"} fill className="object-cover" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-black text-sm uppercase leading-tight">{product?.name || "Product"}</h4>
                <div className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-black shrink-0">
                  ₹{product?.price || 0}/kg
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Stock: {product?.stock || 0}kg available</p>
              <button className="w-full mt-2 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors">
                View Details
              </button>
            </div>
          </div>
        );

      case 'ORDER_CARD':
        const order = message.metadata;
        return (
          <div className="w-full max-w-[280px] bg-[#0B1120] text-white rounded-xl overflow-hidden shadow-lg border border-[var(--foreground)]/10">
            <div className="p-4 border-b border-[var(--foreground)]/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider">Order #{order?.id || "---"}</h4>
                <p className="text-[10px] text-primary">{order?.status || "Processing"}</p>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[var(--foreground)]/5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Value</span>
                <span className="font-bold">₹{order?.total || 0}</span>
              </div>
              <button className="w-full py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 transition-colors">
                Track Shipment
              </button>
            </div>
          </div>
        );

      case 'QUOTATION_CARD':
        const quote = message.metadata;
        return (
          <div className="w-full max-w-[280px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-amber-500/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-500">Export Quotation</h4>
                <p className="text-[10px] opacity-70">Valid for 24 hours</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Quantity</span>
                <span className="font-medium">{quote?.qty || 0}kg</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Final Price</span>
                <span className="font-bold text-amber-500">₹{quote?.price || 0}</span>
              </div>
              <button className="w-full mt-3 py-2 bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors">
                Accept Quote
              </button>
            </div>
          </div>
        );

      case 'VOICE':
        return (
          <div className="flex items-center gap-3 bg-black/10 p-2 pr-4 rounded-full">
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform">
              <Play className="w-4 h-4 ml-1" />
            </button>
            <div className="flex-1">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary rounded-full" />
              </div>
              <p className="text-[9px] mt-1 opacity-70">0:14</p>
            </div>
          </div>
        );

      case 'TEXT':
      default:
        if (message.message_text.includes("[VIDEO_CALL_INVITE]:")) {
          const roomID = message.message_text.replace("[VIDEO_CALL_INVITE]:", "").trim();
          return (
            <div className="flex flex-col items-center gap-2 md:gap-3 p-2 min-w-[200px]">
              <Video className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
              <p className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-center">Secure Video Link Established</p>
              <button 
                onClick={(e) => { e.stopPropagation(); if (onJoinVideoCall) onJoinVideoCall(roomID); }}
                className={cn(
                  "w-full py-2 rounded-lg md:rounded-xl font-black text-[12px] uppercase tracking-widest hover:scale-95 transition-all",
                  isOwnMessage ? "bg-white text-[#0077B6]" : "bg-[#0077B6] text-white"
                )}
              >
                Join Connection
              </button>
            </div>
          );
        }
        return <p className="text-[14px] whitespace-pre-wrap leading-relaxed font-inter">{message.message_text}</p>;
    }
  };

  return (
    <div className={cn("flex w-full", isOwnMessage ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "relative group max-w-[80%] min-w-[80px] px-[16px] py-[12px] rounded-[20px] shadow-sm",
          isOwnMessage 
            ? "bg-[#0077B6] text-white rounded-br-sm" 
            : "bg-[#1E293B] text-white border border-[#1E293B] rounded-bl-sm"
        )}
      >
        {renderContent()}
        
        <div className={cn(
          "flex items-center gap-1 mt-1 justify-end",
          isOwnMessage ? "text-white/70" : "text-white/50"
        )}>
          <span className="text-[12px] font-medium">{timeString}</span>
          {isOwnMessage && (
            message.is_read ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
            ) : (
              <Check className="w-3.5 h-3.5 opacity-70" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
