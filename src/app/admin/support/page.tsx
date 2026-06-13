"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  MessageSquare, 
  Search, 
  User, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile, 
  ChevronLeft,
  Lock,
  Phone,
  Video,
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  Plus,
  Trash2,
  Circle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";
import { MessageBubble, ChatMessage } from "@/components/chat/MessageBubble";
import { IncomingCallOverlay } from "@/components/video/IncomingCallOverlay";
import { supabase } from "@/lib/supabase";

const NativeVideoCall = dynamic(
  () => import("@/components/video/NativeVideoCall").then(mod => mod.NativeVideoCall),
  { ssr: false }
);

export default function AdminSupportHub() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideoRoom, setActiveVideoRoom] = useState<string | null>(null);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [incomingCall, setIncomingCall] = React.useState<{roomID: string, callerName: string} | null>(null);
  const processedInvites = React.useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id || "ADM-001"; 

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        
        // Detect incoming calls
        const recentCall = data.find((c: any) => {
          if (c.unread_count > 0 && c.last_message && c.last_message_sender_id !== currentUserId) {
            if (c.last_message.includes('[VIDEO_CALL_INVITE]:')) {
              // Extract RoomID. Format: "[VIDEO_CALL_INVITE]:ROOM_1_17180000"
              const roomID = c.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
              if (!processedInvites.current.has(roomID)) {
                return true;
              }
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

  const fetchMessages = async (convId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_messages?conversation_id=${convId}&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Transmission error:", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || message;
    if (!textToSend.trim() || activeChat === null) return;
    
    // Optimistically add message
    const tempMsg = {
      id: Date.now(),
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: textToSend,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    if (!customMsg) setMessage("");

    try {
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: textToSend,
          is_read: 0
        }]);
        
      if (msgError) throw msgError;

      await supabase
        .from('chat_conversations')
        .update({
          last_message_text: textToSend,
          last_message_time: new Date().toISOString()
        })
        .eq('id', activeChat);

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
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
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
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await fetch(`${API_BASE_URL}/chat/delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId, sender_id: currentUserId })
      });
    } catch (err) {
      console.error("Failed to delete message", err);
      toast("Failed to delete message", "error");
      fetchMessages(activeChat!);
    }
  };

  const handleUpdateStatus = async (convId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/chat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: convId, status })
      });
      if (res.ok) {
        toast(`Ticket marked as ${status}`, "success");
        fetchConversations();
        if (status === 'RESOLVED') setActiveChat(null);
      }
    } catch (err) {
      toast("Failed to update status", "error");
    }
  };

  const handleInitiateVideoCall = () => {
    if (!activeChat || !currentChat) return;
    const roomID = `ROOM_${activeChat}_${Date.now()}`;
    setActiveVideoRoom(roomID);
    handleSendMessage(undefined, `[VIDEO_CALL_INVITE]:${roomID}`);
  };

  const handleCreateContactDirect = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/create_conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_1: currentUserId, participant_2: userId })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast("Secure channel established.", "success");
        setIsCreatingContact(false);
        setContactSearchQuery("");
        await fetchConversations();
        setActiveChat(data.conversation_id);
      } else {
        toast(data.error ? String(data.error) : "Failed to establish channel.", "error");
      }
    } catch (err) {
      toast("Transmission error", "error");
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch(`/api/admin/get_users`);
      const data = await res.json();
      if (Array.isArray(data)) setAvailableUsers(data);
    } catch (err) {
      console.error("Failed to fetch target nodes");
    }
  };

  useEffect(() => {
    if (isCreatingContact && availableUsers.length === 0) {
      fetchAvailableUsers();
    }
  }, [isCreatingContact]);

  useEffect(() => {
    setMounted(true);
    fetchConversations();
    // Keep a slow poll for conversation list updates (status changes, etc)
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat !== null) {
      fetchMessages(activeChat);
      
      const channel = supabase
        .channel(`admin_messages_${activeChat}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${activeChat}` },
          (payload) => {
            if (payload.new.sender_id !== currentUserId) {
              setMessages((prev) => {
                if (prev.find(m => m.id === payload.new.id)) return prev;
                return [...prev, payload.new as any];
              });
              fetchConversations();
            }
          }
        )
        .subscribe();

      // Robust Polling Fallback (every 5 seconds)
      const interval = setInterval(() => {
        fetchConversations();
        fetchMessages(activeChat);
      }, 5000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentChat = conversations.find(c => c.id === activeChat);

  const filteredConversations = conversations.filter(c => 
    (c.other_party_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.last_message || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
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
          // Auto-send decline message
          if (incomingCall && activeChat) {
            handleSendMessage(undefined, `[CALL_DECLINED]:${incomingCall.roomID}`);
          }
        }}
      />
      {activeVideoRoom && (
        <NativeVideoCall 
          roomID={activeVideoRoom} 
          userName="OceanExotic Admin" 
          userID={currentUserId}
          onClose={() => setActiveVideoRoom(null)}
        />
      )}
      <div className="h-[calc(100vh-12rem)] bg-bg-secondary/20 rounded-[32px] border border-[var(--foreground)]/5 overflow-hidden flex flex-col relative">
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
          
          {/* LIST VIEW */}
          <div 
            className={cn(
              "flex flex-col h-full overflow-hidden lg:w-[280px] lg:border-r lg:border-[var(--foreground)]/5 shrink-0",
              activeChat !== null ? "hidden lg:flex" : "flex w-full"
            )}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Support Registry</h2>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Communication Nodes</p>
                </div>
                <button 
                  onClick={() => setIsCreatingContact(!isCreatingContact)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-90",
                    isCreatingContact 
                      ? "bg-danger/10 text-danger border-danger/20" 
                      : "bg-primary/10 text-primary border-primary/20 shadow-glow-purple/20"
                  )}
                >
                  {isCreatingContact ? <Plus className="w-5 h-5 rotate-45 transition-transform" /> : <Plus className="w-5 h-5 transition-transform" />}
                </button>
              </div>

              <AnimatePresence>
                {isCreatingContact && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                      <input 
                        value={contactSearchQuery}
                        onChange={(e) => setContactSearchQuery(e.target.value)}
                        placeholder="SEARCH NODE DIRECTORY..."
                        autoFocus
                        className="w-full bg-black/20 rounded-xl px-3 py-2 text-xs font-black uppercase text-[var(--foreground)] outline-none placeholder:text-primary/40 border border-primary/10 focus:border-primary/50 transition-all"
                      />
                      <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
                        {availableUsers.filter(u => 
                          (u.name || "").toLowerCase().includes(contactSearchQuery.toLowerCase()) || 
                          (u.id || "").toLowerCase().includes(contactSearchQuery.toLowerCase())
                        ).map(user => (
                          <button
                            key={user.id}
                            onClick={() => handleCreateContactDirect(user.id)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary/20 flex items-center justify-between group transition-all border border-transparent hover:border-primary/30"
                          >
                            <div>
                              <p className="text-xs font-black uppercase truncate leading-tight">{user.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] font-bold text-slate-500 uppercase">{user.id}</span>
                                <span className="text-[8px] px-1 py-0.5 rounded bg-[var(--foreground)]/5 text-[var(--foreground)] font-bold uppercase">{user.role}</span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><Plus className="w-3 h-3" /> LINK</span>
                          </button>
                        ))}
                        {availableUsers.length > 0 && availableUsers.filter(u => 
                          (u.name || "").toLowerCase().includes(contactSearchQuery.toLowerCase()) || 
                          (u.id || "").toLowerCase().includes(contactSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <p className="text-[9px] text-center text-slate-500 py-3 font-black uppercase tracking-widest italic">NO NODES FOUND</p>
                        )}
                        {availableUsers.length === 0 && (
                           <div className="flex items-center justify-center py-4">
                             <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                           </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  placeholder="Search Protocols..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl pl-10 pr-4 text-xs font-black uppercase text-[var(--foreground)] outline-none focus:border-primary/50 transition-all italic"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3 no-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-20 opacity-40 italic text-xs font-black uppercase tracking-widest text-slate-500">No active signals found.</div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChat(conv.id)}
                    className={cn(
                      "w-full p-4 rounded-3xl border flex items-start gap-4 transition-all relative overflow-hidden",
                      activeChat === conv.id 
                        ? "bg-[var(--foreground)]/10 border-primary/30 shadow-glow-purple/10" 
                        : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {(conv.other_party_name || "??").substring(0, 2).toUpperCase()}
                      </div>
                      {conv.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B1120] bg-success shadow-lg" />}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-black text-[var(--foreground)] uppercase italic truncate pr-2">{conv.other_party_name}</p>
                        <span className="text-[8px] font-black text-slate-500 uppercase">{conv.time}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 truncate opacity-80 mb-2">{conv.last_message}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={conv.status === 'RESOLVED' ? 'success' : 'warning'} className="text-[6px] px-1 py-0 border-none">
                          {conv.status || 'OPEN'}
                        </Badge>
                        {conv.priority === 'HIGH' && (
                          <Badge variant="danger" className="text-[6px] px-1 py-0 border-none">URGENT</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CHAT VIEW */}
          <div 
            className={cn(
              "flex flex-col h-full overflow-hidden lg:flex-1 relative",
              activeChat === null ? "hidden lg:flex" : "flex w-full"
            )}
          >
            {activeChat === null ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-black uppercase tracking-widest italic">Intercepting Signals</h3>
                <p className="text-xs font-bold">Select a node from the registry</p>
              </div>
            ) : (
              <>
                <header className={cn(
                  "h-16 px-4 border-b flex items-center justify-between shrink-0 transition-colors",
                  selectedMessages.length > 0 ? "bg-primary/20 border-primary/30" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5"
                )}>
                  {selectedMessages.length > 0 ? (
                    <>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedMessages([])} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X className="w-5 h-5 text-primary" />
                        </button>
                        <span className="font-black text-primary uppercase tracking-widest text-sm">{selectedMessages.length} Selected</span>
                      </div>
                      <button onClick={handleBulkDelete} className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors" title="Delete Selected Messages">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="p-2 text-slate-400 hover:text-[var(--foreground)] transition-colors lg:hidden">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="relative hidden sm:block">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {(currentChat?.other_party_name || "??").substring(0, 2).toUpperCase()}
                        </div>
                        {currentChat?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[#0B1120]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[var(--foreground)] uppercase italic leading-tight">{currentChat?.other_party_name}</h3>
                          {currentChat?.order_id && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-black border border-primary/20">
                              {currentChat.order_id}
                            </span>
                          )}
                        </div>
                        <p className="text-[8px] font-black text-success uppercase tracking-widest italic opacity-60">{currentChat?.other_party_role} NODE</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentChat?.status !== 'RESOLVED' ? (
                      <button 
                        onClick={() => handleUpdateStatus(activeChat, 'RESOLVED')}
                        className="h-8 px-3 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(activeChat, 'OPEN')}
                        className="h-8 px-3 rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Reopen
                      </button>
                    )}
                     <button className="p-2 text-slate-400 hover:text-primary transition-colors hidden sm:block"><Phone className="w-5 h-5" /></button>
                     <button 
                       onClick={handleInitiateVideoCall}
                       className="p-2 text-slate-400 hover:text-primary transition-colors hidden sm:block"
                       title="Initiate Secure Video Link"
                     >
                       <Video className="w-5 h-5" />
                     </button>
                  </div>
                    </>
                  )}
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                  <div className="flex flex-col items-center gap-2 mb-8 opacity-20">
                     <Lock className="w-3 h-3" />
                     <p className="text-[8px] font-black uppercase tracking-[0.2em] text-center">ENCRYPTED CHANNEL <br/> SIGNAL STABILITY: 99.8%</p>
                  </div>

                  <div className="flex flex-col w-full space-y-4">
                    {messages.map((msg) => {
                      const isVideoInvite = msg.message_text.includes("[VIDEO_CALL_INVITE]:");
                      const roomID = isVideoInvite ? msg.message_text.replace("[VIDEO_CALL_INVITE]:", "").trim() : null;

                      return (
                        <div 
                          key={msg.id}
                          className={cn(
                            "flex items-center gap-3 w-full",
                            msg.sender_id === currentUserId ? "flex-row-reverse" : "flex-row"
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
                              {selectedMessages.includes(msg.id) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </button>
                          )}

                          <div 
                            onClick={() => selectedMessages.length > 0 && msg.sender_id === currentUserId ? toggleSelection(msg.id) : undefined}
                            className={cn("w-full transition-all", selectedMessages.includes(msg.id) && "opacity-50")}
                          >
                            <MessageBubble message={msg as any} isOwnMessage={msg.sender_id === currentUserId} currentUserId={currentUserId} onJoinVideoCall={(roomID) => setActiveVideoRoom(roomID)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-bg-secondary/40 backdrop-blur-xl border-t border-[var(--foreground)]/5 shrink-0">
                  
                  {/* Quick Replies */}
                  {currentChat?.status !== 'RESOLVED' && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1 max-w-3xl mx-auto">
                      {[
                        "I am checking with the logistics fleet.",
                        "Your payment has been fully verified.",
                        "The shipment is out for delivery."
                      ].map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(undefined, qr)}
                          className="px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 hover:border-primary/50 text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5 transition-all text-text-secondary hover:text-primary"
                        >
                          <Zap className="w-3 h-3" /> {qr.substring(0, 20)}...
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
                    <div className="flex-1 flex items-center gap-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors">
                      <button type="button" className="p-1.5 text-slate-500 hover:text-primary transition-colors"><Smile className="w-5 h-5" /></button>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={currentChat?.status === 'RESOLVED' ? "TICKET CLOSED" : "SIGNAL TRANSMISSION..."}
                        disabled={currentChat?.status === 'RESOLVED'}
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--foreground)] placeholder:text-slate-600 font-medium py-1.5 resize-none max-h-32 no-scrollbar disabled:opacity-50"
                      />
                      <button type="button" className="p-1.5 text-slate-500 hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
                    </div>
                    <button 
                      type="submit" 
                      disabled={!message.trim() || currentChat?.status === 'RESOLVED'}
                      className="w-12 h-12 rounded-full bg-primary text-[var(--foreground)] flex items-center justify-center shadow-glow-purple active:scale-90 transition-all shrink-0 disabled:opacity-50 disabled:shadow-none"
                    >
                      <Send className="w-5 h-5 ml-0.5 text-black" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* 3. CUSTOMER DETAILS (320px) */}
          {activeChat !== null && (
            <div className="hidden lg:flex flex-col w-[320px] bg-bg-secondary/40 border-l border-[var(--foreground)]/5 shrink-0 overflow-y-auto p-6 space-y-6">
               <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-white/5">
                 <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <User className="w-10 h-10" />
                 </div>
                 <div>
                    <h3 className="font-black text-lg uppercase">{currentChat?.other_party_name || "Contact"}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{currentChat?.other_party_role || "User"}</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Admin Actions</h4>
                 <div className="space-y-2">
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white border border-white/5 transition-all flex items-center justify-center gap-2">
                      View Full Profile
                    </button>
                    <button className="w-full py-3 bg-danger/10 hover:bg-danger/20 rounded-xl text-xs font-black uppercase tracking-widest text-danger border border-danger/20 transition-all flex items-center justify-center gap-2">
                      Block User
                    </button>
                    <button className="w-full py-3 bg-primary/10 hover:bg-primary/20 rounded-xl text-xs font-black uppercase tracking-widest text-primary border border-primary/20 transition-all flex items-center justify-center gap-2">
                      Assign Agent
                    </button>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>

      <AnimatePresence>
        {activeVideoRoom && (
          <NativeVideoCall
            roomID={activeVideoRoom}
            userID={currentUserId}
            userName="OceanExotic Command"
            onClose={() => setActiveVideoRoom(null)}
          />
        )}
      </AnimatePresence>

    </>
  );
}
