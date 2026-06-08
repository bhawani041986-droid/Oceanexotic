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
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminSupportHub() {
  const [mounted, setMounted] = useState(false
  );
  const [activeChat, setActiveChat] = useState<number | null>(null
  );
  const [conversations, setConversations] = useState<any[]>([]
  );
  const [messages, setMessages] = useState<any[]>([]
  );
  const [message, setMessage] = useState(""
  );
  const [isLoading, setIsLoading] = useState(true
  );
  const scrollRef = useRef<HTMLDivElement>(null
  );
  const currentUserId = "ADM-001"; 

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setConversations(data
  );
      }
    } catch (err) {
      console.error("Signal failure:", err
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_messages?conversation_id=${convId}&t=${Date.now()}`);
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setMessages(data
  );
      }
    } catch (err) {
      console.error("Transmission error:", err
  );
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(
  );
    if (!message.trim() || activeChat === null) return;
    
    const packet = {
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: message
    };

    try {
      const res = await fetch(`${API_BASE_URL}/chat/send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      }
  );
      if (res.ok) {
        setMessage(""
  );
        fetchMessages(activeChat
  );
        fetchConversations(
  );
      }
    } catch (err) {
      console.error("Signal lost:", err
  );
    }
  };

  useEffect(() => {
    setMounted(true
  );
    fetchConversations(
  );
    const interval = setInterval(fetchConversations, 3000
  );
    return (
) => clearInterval(interval
  );
  }, []
  );

  useEffect(() => {
    if (activeChat !== null) {
      fetchMessages(activeChat
  );
      const interval = setInterval(() => fetchMessages(activeChat), 3000
  );
      return (
) => clearInterval(interval
  );
    }
  }, [activeChat]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]
  );

  const currentChat = conversations.find(c => c.id === activeChat
  );

  if (!mounted) return null;

  if (isLoading) {
    return (

      <>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    
  );
  }

  return (

    <>
      <div className="h-[calc(100vh-12rem)] bg-bg-secondary/20 rounded-[32px] border border-[var(--foreground)]/5 overflow-hidden flex flex-col relative">
        
        <AnimatePresence mode="wait">
          {activeChat === null ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Support Registry</h2>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Communication Nodes</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-glow-purple/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    placeholder="Search Protocols..." 
                    className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl pl-10 pr-4 text-xs font-black uppercase text-[var(--foreground)] outline-none focus:border-primary/50 transition-all italic"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3 no-scrollbar">
                {conversations.length === 0 ? (
                  <div className="text-center py-20 opacity-20 italic text-sm">No active signals found in the registry.</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveChat(conv.id)}
                      className="w-full p-4 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-4 active:scale-95 transition-all relative overflow-hidden shadow-xl"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                          {(conv.other_party_name || "??").substring(0, 2).toUpperCase()}
                        </div>
                        {conv.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B1120] bg-success shadow-lg" />}
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-[var(--foreground)] uppercase italic truncate pr-2">{conv.other_party_name}</p>
                          <span className="text-[8px] font-black text-slate-500 uppercase">{conv.time}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 truncate opacity-80">{conv.last_message}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <header className="h-16 px-4 bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="p-2 text-slate-400 hover:text-[var(--foreground)] transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                        {(currentChat?.other_party_name || "??").substring(0, 2).toUpperCase()}
                      </div>
                      {currentChat?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[#0B1120]" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[var(--foreground)] uppercase italic leading-tight">{currentChat?.other_party_name}</h3>
                      <p className="text-[8px] font-black text-success uppercase tracking-widest italic opacity-60">{currentChat?.other_party_role} NODE</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
                   <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div className="flex flex-col items-center gap-2 mb-8 opacity-20">
                   <Lock className="w-3 h-3" />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-center">ENCRYPTED CHANNEL <br/> SIGNAL STABILITY: 99.8%</p>
                </div>

                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col",
                      msg.sender_id === currentUserId ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-3xl relative shadow-2xl transition-all",
                      msg.sender_id === currentUserId 
                        ? "bg-primary text-[var(--foreground)] rounded-tr-none shadow-glow-purple" 
                        : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)] rounded-tl-none"
                    )}>
                      <p className="text-xs leading-relaxed font-medium">{msg.message_text}</p>
                      <div className={cn(
                        "flex items-center gap-2 mt-2 opacity-40",
                        msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-[8px] font-black uppercase italic">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[var(--foreground)]/5 border-t border-[var(--foreground)]/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-lg mx-auto">
                  <div className="flex-1 flex items-center gap-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-full px-4 py-2">
                    <button type="button" className="p-1.5 text-slate-500 hover:text-primary transition-colors"><Smile className="w-5 h-5" /></button>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="SIGNAL TRANSMISSION..."
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--foreground)] placeholder:text-slate-600 font-medium py-1.5 resize-none max-h-32 no-scrollbar"
                    />
                    <button type="button" className="p-1.5 text-slate-500 hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
                  </div>
                  <button type="submit" className="w-12 h-12 rounded-full bg-primary text-[var(--foreground)] flex items-center justify-center shadow-glow-purple active:scale-90 transition-all shrink-0">
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  
  );
}
