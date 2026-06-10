"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  MoreVertical, 
  ArrowLeft, 
  Search,
  Check,
  CheckCheck,
  Phone,
  Video,
  ShieldCheck,
  ShoppingBag,
  Zap,
  Clock,
  X,
  Trash2,
  Circle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";
import { IncomingCallOverlay } from "@/components/video/IncomingCallOverlay";

const NativeVideoCall = dynamic(
  () => import("@/components/video/NativeVideoCall").then(mod => mod.NativeVideoCall),
  { ssr: false }
);

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [mounted, setMounted] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [activeChat, setActiveChat] = React.useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeVideoRoom, setActiveVideoRoom] = React.useState<string | null>(null);
  const [incomingCall, setIncomingCall] = React.useState<{roomID: string, callerName: string} | null>(null);
  const [selectedMessages, setSelectedMessages] = React.useState<number[]>([]);
  
  const processedInvites = React.useRef<Set<string>>(new Set());
  const currentUserId = user?.id || "USR-001";

  // --- FETCH CONVERSATIONS ---
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0 && activeChat === null) {
          setActiveChat(data[0].id);
        }

        // Detect incoming calls
        const recentCall = data.find((c: any) => {
          if (c.unread_count > 0 && c.last_message && c.last_message_sender_id !== currentUserId && c.last_message.includes('[VIDEO_CALL_INVITE]:')) {
            const roomID = c.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
            if (!processedInvites.current.has(roomID) && (Date.now() - c.timestamp < 60000)) {
              return true;
            }
          }
          return false;
        });

        if (recentCall) {
          const roomID = recentCall.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
          setIncomingCall({ roomID, callerName: recentCall.other_party_name });
          processedInvites.current.add(roomID);
        }
      }
    } catch (err) {
      console.error("Signal failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FETCH MESSAGES ---
  const fetchMessages = async (convId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_messages?conversation_id=${convId}&t=${Date.now()}`);
      const data = await res.json(
  );
      setMessages(data
  );
    } catch (err) {
      console.error("Transmission error:", err
  );
    }
  };

  // --- SEND MESSAGE ---
  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || message;
    if (!textToSend.trim() || activeChat === null) return;
    
    const packet = {
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: textToSend
    };

    // Optimistically add message
    const tempMsg = {
      id: Date.now(),
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: textToSend,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    setMessages((prev: any) => [...prev, tempMsg]);
    if (!customMsg) setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/chat/send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error("Signal lost:", err);
      toast("Failed to transmit signal", "error");
    }
  };

  const toggleSelection = (msgId: number) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    const idsToDelete = [...selectedMessages];
    
    // Optimistically remove from state
    setMessages((prev: any) => prev.filter((m: any) => !idsToDelete.includes(m.id)));
    setSelectedMessages([]);
    
    try {
      await fetch(`${API_BASE_URL}/chat/delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_ids: idsToDelete, sender_id: currentUserId })
      });
    } catch (err) {
      console.error("Failed to delete messages", err);
      toast("Failed to delete messages", "error");
      fetchMessages(activeChat!); // revert on failure
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    // Optimistically remove from state
    setMessages((prev: any) => prev.filter((m: any) => m.id !== msgId));
    
    try {
      await fetch(`${API_BASE_URL}/chat/delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId, sender_id: currentUserId })
      });
    } catch (err) {
      console.error("Failed to delete message", err);
      toast("Failed to delete message", "error");
      fetchMessages(activeChat!); // revert on failure
    }
  };

  const handleInitiateVideoCall = () => {
    if (!activeChat) return;
    const roomID = `ROOM_${activeChat}_${Date.now()}`;
    handleSendMessage(`[VIDEO_CALL_INVITE]:${roomID}`);
    setActiveVideoRoom(roomID);
  };

  React.useEffect(() => {
    setMounted(true
  );
    fetchConversations(
  );
  }, []
  );

  // Polling for new messages
  React.useEffect(() => {
    if (activeChat !== null) {
      fetchMessages(activeChat
  );
      const interval = setInterval(() => {
        fetchMessages(activeChat
  );
        fetchConversations(
  );
      }, 3000
  );
      return (
) => clearInterval(interval
  );
    }
  }, [activeChat]
  );

  if (!mounted) return null;

  const currentChat = conversations.find(c => c.id === activeChat
  );

  return (

    <div className="bg-[#0B1120] h-screen text-white font-inter flex flex-col selection:bg-primary/30 overflow-hidden">
      
      <IncomingCallOverlay 
        roomID={incomingCall?.roomID || null}
        callerName={incomingCall?.callerName || ""}
        onAccept={() => {
          if (incomingCall) {
            setActiveVideoRoom(incomingCall.roomID);
            setIncomingCall(null);
          }
        }}
        onDecline={() => setIncomingCall(null)}
      />
      
      {/* 1. UNIVERSAL COMMUNICATION HEADER */}
      <header className="h-20 bg-[#0B1120]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 px-6 flex items-center justify-between shrink-0 z-50">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/customer")}
              className="p-3 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-colors"
            >
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
               <h1 className="text-xl font-black uppercase italic tracking-tighter">Maritime Communication Hub</h1>
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-success">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  ENCRYPTED SIGNAL ACTIVE
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl">
               <ShieldCheck className="w-4 h-4 text-primary" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Authority Secure Handshake</p>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow-purple"><ShoppingBag className="w-5 h-5" /></button>
         </div>
      </header>

      {/* 2. CHAT VIEWPORT REGISTRY */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* CONTACTS SIDEBAR */}
         <aside className={cn(
           "absolute inset-y-0 left-0 w-full md:relative md:w-80 lg:w-96 bg-[#0B1120] border-r border-[var(--foreground)]/5 transition-transform duration-500 z-40",
           !isSidebarOpen && "-translate-x-full md:translate-x-0"
         )}>
            <div className="p-6 space-y-6 flex flex-col h-full">
               <div className="relative group">
                  <Input placeholder="Search Registry..." className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl pl-10 text-xs italic focus:border-primary transition-all" />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                  {conversations.map((conv) => (
                    <button 
                      key={conv.id}
                      onClick={() => { setActiveChat(conv.id
  ); if(window.innerWidth < 768) setIsSidebarOpen(false
  ); }}
                      className={cn(
                        "w-full p-4 rounded-3xl flex items-center gap-4 transition-all group relative overflow-hidden",
                        activeChat === conv.id ? "bg-primary text-white shadow-glow-purple" : "hover:bg-white/5 text-text-secondary"
                      )}
                    >
                       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110 shadow-2xl", activeChat === conv.id ? "bg-[var(--foreground)]/20" : "bg-[var(--foreground)]/5")}>
                          {conv.other_party_role === 'SELLER' ? "🚢" : "🌊"}
                       </div>
                       <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black uppercase italic truncate">{conv.other_party_name}</h4>
                             <span className="text-[9px] opacity-60 font-black">{conv.time}</span>
                          </div>
                          <p className="text-[10px] italic truncate mt-0.5 opacity-60">{conv.last_message}</p>
                       </div>
                    </button>
                  ))}
               </div>
               <Card className="p-6 bg-[var(--foreground)]/5 border-dashed border-[var(--foreground)]/10 rounded-3xl text-center space-y-3">
                  <div className="w-10 h-10 bg-[var(--foreground)]/5 rounded-xl flex items-center justify-center mx-auto"><Clock className="w-5 h-5 text-text-secondary" /></div>
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">COMMUNICATION HISTORY</p>
                  <Button variant="ghost" className="w-full text-[9px] font-black uppercase text-primary">VIEW ARCHIVE</Button>
               </Card>
            </div>
         </aside>

         {/* MAIN CONVERSATION INTERFACE */}
         <main className="flex-1 flex flex-col bg-[#0B1120] relative">
            
            {/* Conversation Header */}
            <header className={cn(
               "h-20 px-6 border-b flex items-center justify-between shrink-0 transition-colors",
               selectedMessages.length > 0 ? "bg-primary/20 border-primary/30" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5"
            )}>
               {selectedMessages.length > 0 ? (
                 <>
                   <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedMessages([])} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                       <X className="w-5 h-5 text-primary" />
                     </button>
                     <span className="font-black text-primary uppercase tracking-widest text-sm">{selectedMessages.length} Selected</span>
                   </div>
                   <button onClick={handleBulkDelete} className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-colors" title="Delete Selected Messages">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><ArrowLeft className="w-5 h-5" /></button>
                  <div className="w-12 h-12 bg-[var(--foreground)]/5 rounded-xl flex items-center justify-center text-2xl shadow-xl">
                     {currentChat?.other_party_role === 'SELLER' ? "🚢" : "🌊"}
                  </div>
                  <div>
                     <h3 className="text-sm font-black uppercase italic leading-none">{currentChat?.other_party_name || "Select Terminal"}</h3>
                     <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", currentChat?.online ? 'bg-success/20 text-success' : 'bg-white/10 text-text-secondary')}>
                           {currentChat?.online ? 'online' : 'offline'}
                        </Badge>
                        <span className="text-[9px] text-text-secondary font-black uppercase tracking-widest">• {currentChat?.other_party_role} Node</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2 md:gap-4">
                  <button className="p-3 bg-white/5 rounded-xl hover:bg-primary transition-colors"><Phone className="w-5 h-5" /></button>
                  
                  {/* Restrict Video Call: Only allow calling Admins or Delivery Agents */}
                  {(currentChat?.other_party_role === 'Admin' || currentChat?.other_party_role === 'Agent') ? (
                    <button onClick={handleInitiateVideoCall} className="p-3 bg-white/5 rounded-xl hover:bg-primary transition-colors" title="Initiate Secure Video Link">
                      <Video className="w-5 h-5 text-success animate-pulse" />
                    </button>
                  ) : (
                    <button className="p-3 bg-white/5 rounded-xl opacity-20 cursor-not-allowed" title="Video Link Unavailable for this Node">
                      <Video className="w-5 h-5" />
                    </button>
                  )}

                  <button className="p-3 bg-[var(--foreground)]/5 rounded-xl hover:bg-[var(--foreground)]/10 transition-colors"><MoreVertical className="w-5 h-5" /></button>
               </div>
                 </>
               )}
            </header>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
               <AnimatePresence initial={false}>
                 {messages.map((msg: any) => {
                   const isVideoInvite = msg.message_text.includes("[VIDEO_CALL_INVITE]:");
                   const roomID = isVideoInvite ? msg.message_text.replace("[VIDEO_CALL_INVITE]:", "").trim() : null;

                   return (
                   <motion.div 
                     key={msg.id}
                     layout
                     initial={{ opacity: 0, x: msg.sender_id === currentUserId ? 20 : -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.8, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                     transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                     className={cn(
                       "flex items-center gap-3",
                       msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                     )}
                   >
                      {msg.sender_id === currentUserId && (
                        <button 
                          onClick={() => toggleSelection(msg.id)}
                          className={cn(
                            "p-1 rounded-full transition-colors",
                            selectedMessages.includes(msg.id) ? "text-primary" : "text-white/20 hover:text-white/40"
                          )}
                        >
                          {selectedMessages.includes(msg.id) ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                      )}

                      <div 
                        onClick={() => selectedMessages.length > 0 && msg.sender_id === currentUserId ? toggleSelection(msg.id) : undefined}
                        className={cn(
                          "max-w-[85%] md:max-w-[60%] space-y-2 cursor-pointer",
                          selectedMessages.length > 0 && msg.sender_id === currentUserId ? "hover:brightness-110" : ""
                        )}
                      >
                         <div className={cn(
                           "p-6 rounded-[32px] text-sm italic relative group transition-all",
                           msg.sender_id === currentUserId ? "bg-primary text-white rounded-tr-none shadow-glow-purple" : "bg-white/5 border border-white/10 text-white rounded-tl-none"
                         )}>
                            <div className={cn("absolute top-0 w-4 h-4", msg.sender_id === currentUserId ? "right-0 bg-primary -mr-2" : "left-0 bg-white/5 border-l border-t border-white/10 -ml-2")} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                            
                            {isVideoInvite ? (
                              <div className="flex flex-col items-center gap-3 p-2">
                                <Video className="w-8 h-8 opacity-80" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-center">Secure Video Link Established</p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveVideoRoom(roomID!); }}
                                  className="w-full py-2 rounded-xl bg-[var(--foreground)] text-bg-primary font-black text-[9px] uppercase tracking-widest hover:scale-95 transition-all"
                                >
                                  Join Connection
                                </button>
                              </div>
                            ) : (
                              <p className="leading-relaxed font-medium">{msg.message_text}</p>
                            )}

                            <div className={cn("mt-4 flex items-center gap-2 text-[9px] font-black opacity-40 uppercase", msg.sender_id === currentUserId ? "justify-end" : "justify-start")}>
                               {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               {msg.sender_id === currentUserId && (
                                 <div className="flex items-center gap-2 ml-1">
                                    <CheckCheck className="w-3 h-3 text-[var(--foreground)]" />
                                    {selectedMessages.length === 0 && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                        className="text-white/40 hover:text-white transition-colors"
                                        title="Delete Message"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                   );
                 })}
               </AnimatePresence>
            </div>

            {/* Input Hub */}
            <footer className="p-6 bg-[#0B1120] border-t border-[var(--foreground)]/5 relative z-10">
               <div className="max-w-5xl mx-auto flex items-end gap-4">
                  <div className="flex gap-2">
                     <button className="p-4 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-colors text-text-secondary"><Paperclip className="w-5 h-5" /></button>
                     <button className="p-4 bg-[var(--foreground)]/5 rounded-2xl hover:bg-[var(--foreground)]/10 transition-colors text-text-secondary"><ImageIcon className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 relative">
                     <textarea 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Authorize a message node..."
                       rows={1}
                       className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[32px] p-4 px-8 text-sm italic focus:border-primary outline-none transition-all no-scrollbar resize-none max-h-32"
                     />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    className="w-14 h-14 rounded-2xl bg-primary text-white shadow-glow-purple flex items-center justify-center p-0 shrink-0 hover:scale-105 active:scale-95 transition-all"
                  >
                     <Send className="w-6 h-6" />
                  </Button>
               </div>
            </footer>

         </main>

      </div>

      <AnimatePresence>
        {activeVideoRoom && (
          <NativeVideoCall
            roomID={activeVideoRoom}
            userID={currentUserId}
            userName={user?.name || "Customer Node"}
            onClose={() => setActiveVideoRoom(null)}
          />
        )}
      </AnimatePresence>

    </div>
  
  );
}
