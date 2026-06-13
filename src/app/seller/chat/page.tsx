"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  Send, 
  User, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  ChevronLeft,
  Store,
  Signal,
  MapPin,
  Clock,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";
import { MessageBubble, ChatMessage } from "@/components/chat/MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

export default function SellerChatPage() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = "SEL-001"; // Seller ID
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- FETCH CONVERSATIONS ---
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && activeChat === null) {
        setActiveChat(data[0].id);
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
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Transmission error:", err);
    }
  };

  // --- SEND MESSAGE ---
  const handleSendMessage = async () => {
    if (!message.trim() || activeChat === null) return;
    
    const textToSend = message;
    
    // Optimistically add message
    const tempMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: activeChat,
      sender_id: currentUserId,
      message_text: textToSend,
      message_type: 'TEXT',
      is_read: false,
      created_at: new Date().toISOString()
    } as any;
    
    setMessages((prev) => [...prev, tempMsg]);
    setMessage("");

    try {
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: textToSend,
          message_type: 'TEXT',
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
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat !== null) {
      fetchMessages(activeChat);
      
      const channel = supabase
        .channel(`seller_messages_${activeChat}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${activeChat}` },
          (payload) => {
            if (payload.new.sender_id !== currentUserId) {
              setMessages((prev) => [...prev, payload.new as ChatMessage]);
              fetchConversations();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChat]);

  const currentChat = conversations.find(c => c.id === activeChat);

  const handleChatSelect = (convId: number) => {
    setActiveChat(convId);
    setView('chat');
  };

  if (!mounted) return null;

  return (
    <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] flex gap-4 lg:gap-6 animate-fade-in relative overflow-hidden pb-32 lg:pb-0">
      
      {/* 1. Signals Sidebar (280px) */}
      <Card className={cn(
        "w-full lg:w-[280px] flex flex-col bg-bg-secondary/40 border-[var(--foreground)]/5 overflow-hidden transition-all duration-300 rounded-[24px] shrink-0",
        view === 'chat' ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-5 border-b border-[var(--foreground)]/5 space-y-4 bg-white/[0.02]">
           <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[var(--foreground)] tracking-tight uppercase flex items-center gap-2">
                 <Signal className="w-4 h-4 text-primary" /> Inbox
              </h3>
              <Badge variant="success" className="px-2 text-[8px] font-black tracking-widest shadow-glow-purple">LIVE</Badge>
           </div>
           <div className="relative group">
              <Input placeholder="Search..." className="h-10 pl-9 bg-bg-primary border-white/5 text-xs font-black uppercase rounded-xl" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
           {conversations.map((conv) => (
             <button 
                key={conv.id} 
                onClick={() => handleChatSelect(conv.id)}
                className={cn(
                  "w-full p-3 rounded-[16px] flex items-center gap-3 transition-all group relative active:scale-95",
                  activeChat === conv.id ? "bg-[var(--foreground)]/5 shadow-premium border border-[var(--foreground)]/5" : "hover:bg-[var(--foreground)]/5"
                )}
             >
                <div className="relative">
                   <div className={cn(
                      "w-10 h-10 rounded-xl border border-[var(--foreground)]/10 flex items-center justify-center transition-all shadow-inner",
                      activeChat === conv.id ? "bg-primary text-white shadow-glow-purple" : "bg-white/5 text-primary group-hover:bg-primary group-hover:text-white"
                   )}>
                      {conv.other_party_role === 'CUSTOMER' ? <User className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                   </div>
                   {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-[2px] border-bg-secondary shadow-lg" />}
                </div>
                <div className="flex-1 text-left space-y-0.5 overflow-hidden">
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase truncate">{conv.other_party_name}</p>
                   </div>
                   <p className="text-[10px] text-text-secondary truncate font-medium">{conv.last_message}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      {/* 2. Main Transmission Interface (Flexible) */}
      <Card className={cn(
        "flex-1 flex flex-col bg-bg-secondary/40 border-[var(--foreground)]/5 overflow-hidden transition-all duration-300 rounded-[24px]",
        view === 'list' ? "hidden lg:flex" : "flex"
      )}>
        {activeChat !== null ? (
          <>
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-[var(--foreground)]/5 flex items-center justify-between bg-white/[0.04]">
               <div className="flex items-center gap-3 lg:gap-4">
                  <button 
                    onClick={() => setView('list')}
                    className="lg:hidden p-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 active:scale-90 transition-all shadow-premium"
                  >
                    <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
                  </button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-inner">
                       <User className="w-5 h-5" />
                    </div>
                    {currentChat?.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-[2px] border-bg-secondary shadow-glow-purple" />}
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-[var(--foreground)] tracking-tight uppercase">{currentChat?.other_party_name || "Contact"}</h4>
                     <p className={cn("text-[9px] font-black uppercase tracking-widest", currentChat?.online ? "text-success" : "text-text-secondary")}>
                       {currentChat?.online ? "Online" : "Offline"}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <button className="hidden sm:flex p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                     <Phone className="w-4 h-4" />
                  </button>
                  <button className="hidden sm:flex p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                     <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                     <MoreVertical className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 no-scrollbar bg-gradient-to-b from-transparent to-bg-primary/20">
               <div className="flex flex-col w-full space-y-4">
                 {messages.map((msg) => (
                   <div 
                     key={msg.id}
                     className="w-full"
                   >
                     <MessageBubble 
                       message={msg} 
                       isOwnMessage={msg.sender_id === currentUserId} 
                       currentUserId={currentUserId} 
                     />
                   </div>
                 ))}
               </div>
               <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 lg:p-6 border-t border-[var(--foreground)]/5 bg-white/[0.04]">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                 className="flex items-center gap-2 lg:gap-3"
               >
                  <button type="button" className="p-3 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-all active:scale-90 shadow-premium shrink-0">
                     <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" className="hidden sm:flex p-3 rounded-full hover:bg-primary/10 text-text-secondary hover:text-primary transition-all active:scale-90 shadow-premium shrink-0">
                     <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                     <Input 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Type transmission..." 
                       className="h-12 pl-6 pr-14 bg-bg-primary border-white/10 rounded-full text-sm text-white focus:border-primary/50 shadow-inner" 
                     />
                     <Button 
                       type="submit"
                       disabled={!message.trim()}
                       className={cn(
                         "absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 p-0 rounded-full transition-all shrink-0",
                         message.trim() ? "bg-primary text-white shadow-glow-purple hover:bg-primary/90" : "bg-white/5 text-text-secondary"
                       )}
                     >
                        <Send className="w-4 h-4 ml-0.5" />
                     </Button>
                  </div>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary opacity-50">
            <Signal className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="font-black uppercase tracking-widest">Select a channel</h3>
          </div>
        )}
      </Card>

      {/* 3. Customer Details Sidebar (320px) - Visible only on Desktop when a chat is active */}
      {activeChat !== null && (
        <Card className="hidden lg:flex flex-col w-[320px] bg-bg-secondary/40 border-[var(--foreground)]/5 overflow-hidden transition-all duration-300 rounded-[24px] shrink-0">
          <div className="p-6 border-b border-[var(--foreground)]/5 flex flex-col items-center text-center space-y-3 bg-white/[0.02]">
            <div className="w-20 h-20 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-inner">
               <User className="w-10 h-10" />
            </div>
            <div>
               <h3 className="font-black text-lg uppercase">{currentChat?.other_party_name || "Contact"}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{currentChat?.other_party_role || "Customer"}</p>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
            <div className="space-y-3">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-[var(--foreground)]/5 pb-2">Information</h4>
               <div className="space-y-2">
                 <div className="flex items-center gap-3 text-sm">
                   <MapPin className="w-4 h-4 text-text-secondary" />
                   <span className="font-medium">Kolkata, India</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                   <Clock className="w-4 h-4 text-text-secondary" />
                   <span className="font-medium">10:45 AM (Local)</span>
                 </div>
               </div>
            </div>
            
            <div className="space-y-3">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-[var(--foreground)]/5 pb-2">Recent Orders</h4>
               <div className="space-y-2">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-bold">#OX-4921</p>
                        <p className="text-[9px] text-success font-black uppercase">Delivered</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">₹1,250</span>
                 </div>
               </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
