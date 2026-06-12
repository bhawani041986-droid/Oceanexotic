"use client";

import React, { useState, useEffect } from "react";
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
  CheckCheck,
  ChevronLeft,
  Store,
  Signal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { supabase } from "@/lib/supabase";

export default function SellerChatPage() {
  const [mounted, setMounted] = useState(false
  );
  const [view, setView] = useState<'list' | 'chat'>('list'
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
  const currentUserId = "SEL-001"; // Seller ID

  // --- FETCH CONVERSATIONS ---
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json(
  );
      setConversations(data
  );
      if (data.length > 0 && activeChat === null) {
        setActiveChat(data[0].id
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
  const handleSendMessage = async () => {
    if (!message.trim() || activeChat === null) return;
    
    const textToSend = message;
    
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
    setMessage("");

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
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchConversations();
    // Keep a slow poll for conversation list updates
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
              setMessages((prev: any) => [...prev, payload.new]);
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

  const currentChat = conversations.find(c => c.id === activeChat
  );

  const handleChatSelect = (convId: number) => {
    setActiveChat(convId
  );
    setView('chat'
  );
  };

  if (!mounted) return null;

  return (

    <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] flex gap-8 animate-fade-in relative overflow-hidden pb-32 lg:pb-0">
      
      {/* Signals Sidebar */}
      <Card className={cn(
        "w-full lg:w-96 flex flex-col bg-bg-secondary/40 border-[var(--foreground)]/5 overflow-hidden transition-all duration-300 rounded-[24px] lg:rounded-[28px]",
        view === 'chat' ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-6 lg:p-8 border-b border-[var(--foreground)]/5 space-y-6 bg-white/[0.02]">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg lg:text-xl font-black text-[var(--foreground)] tracking-tight uppercase flex items-center gap-2">
                   <Signal className="w-5 h-5 text-primary" /> Signals
                </h3>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Active Fleet Comms</p>
              </div>
              <Badge variant="success" className="h-6 px-3 text-[8px] font-black tracking-widest uppercase shadow-glow-purple">LIVE</Badge>
           </div>
           <div className="relative group">
              <Input placeholder="Search signals..." className="h-11 lg:h-12 pl-12 bg-bg-primary border-white/5 text-[10px] font-black uppercase rounded-[16px]" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
           {conversations.map((conv) => (
             <button 
                key={conv.id} 
                onClick={() => handleChatSelect(conv.id)}
                className={cn(
                  "w-full p-4 rounded-[24px] flex items-center gap-4 transition-all group relative active:scale-95",
                  activeChat === conv.id ? "bg-[var(--foreground)]/5 shadow-premium border border-[var(--foreground)]/5" : "hover:bg-[var(--foreground)]/5"
                )}
             >
                <div className="relative">
                   <div className={cn(
                      "w-11 h-11 lg:w-12 lg:h-12 rounded-[18px] border border-[var(--foreground)]/10 flex items-center justify-center transition-all shadow-inner",
                      activeChat === conv.id ? "bg-primary text-white shadow-glow-purple" : "bg-white/5 text-primary group-hover:bg-primary group-hover:text-white"
                   )}>
                      <User className="w-5 h-5 lg:w-6 lg:h-6" />
                   </div>
                   {conv.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-success border-[3px] border-bg-secondary shadow-lg" />}
                </div>
                <div className="flex-1 text-left space-y-1 overflow-hidden">
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase truncate tracking-tight">{conv.other_party_name}</p>
                      <span className="text-[8px] font-black text-text-secondary uppercase">{conv.time}</span>
                   </div>
                   <p className="text-[10px] text-text-secondary truncate font-medium italic opacity-60">{conv.last_message}</p>
                </div>
             </button>
           ))}
        </div>
      </Card>

      {/* Main Transmission Interface */}
      <Card className={cn(
        "flex-1 flex flex-col bg-bg-secondary/40 border-[var(--foreground)]/5 overflow-hidden transition-all duration-300 rounded-[24px] lg:rounded-[28px]",
        view === 'list' ? "hidden lg:flex" : "flex"
      )}>
        {/* Chat Header */}
        <div className="p-5 lg:p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between bg-white/[0.04]">
           <div className="flex items-center gap-4 lg:gap-6">
              {/* Mobile Back Button */}
              <button 
                onClick={() => setView('list')}
                className="lg:hidden p-2.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 active:scale-90 transition-all shadow-premium"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              
              <div className="relative">
                <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-[16px] lg:rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-inner">
                   <User className="w-5 h-5 lg:w-7 lg:h-7" />
                </div>
                {currentChat?.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-success border-[3px] border-bg-secondary shadow-glow-purple" />}
              </div>
              <div className="space-y-0.5 lg:space-y-1">
                 <h4 className="text-sm lg:text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">{currentChat?.other_party_name || "Select Contact"}</h4>
                 <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", currentChat?.online ? "bg-success shadow-glow-purple" : "bg-text-secondary")} />
                    <p className={cn(
                      "text-[8px] lg:text-[9px] font-black uppercase tracking-widest",
                      currentChat?.online ? "text-success" : "text-text-secondary"
                    )}>
                      {currentChat?.online ? "System Link Active" : "Link Terminated"}
                    </p>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-1 lg:gap-2">
              <button className="hidden sm:flex p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                 <Phone className="w-5 h-5" />
              </button>
              <button className="hidden sm:flex p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                 <Video className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                 <MoreVertical className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 lg:space-y-10 no-scrollbar bg-gradient-to-b from-transparent to-bg-primary/20">
           <div className="flex flex-col gap-8 lg:gap-10">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex gap-3 lg:gap-4 max-w-[90%] lg:max-w-[80%] animate-fade-in",
                    msg.sender_id === currentUserId ? "self-end flex-row-reverse animate-fade-in-right" : "animate-fade-in-left"
                  )}
                >
                   <div className={cn(
                     "w-9 h-9 lg:w-10 lg:h-10 rounded-[12px] lg:rounded-[14px] flex items-center justify-center shrink-0 shadow-glow-purple",
                     msg.sender_id === currentUserId ? "bg-primary text-white" : "bg-white/5 border border-white/5 text-primary"
                   )}>
                      {msg.sender_id === currentUserId ? <Store className="w-4 h-4 lg:w-5 lg:h-5" /> : <User className="w-4 h-4 lg:w-5 lg:h-5" />}
                   </div>
                   <div className={cn("space-y-2 lg:space-y-3", msg.sender_id === currentUserId ? "text-right" : "")}>
                      <div className={cn(
                        "p-5 lg:p-7 rounded-[24px] shadow-premium relative",
                        msg.sender_id === currentUserId ? "bg-primary border-primary rounded-tr-none shadow-glow-purple" : "bg-white/5 border border-white/5 text-white rounded-tl-none"
                      )}>
                         <p className="text-xs lg:text-sm text-[var(--foreground)] font-medium leading-relaxed">
                            {msg.message_text}
                         </p>
                      </div>
                      <div className={cn("flex items-center gap-2 text-[7px] lg:text-[8px] font-black text-text-secondary uppercase tracking-widest", msg.sender_id === currentUserId ? "justify-end mr-2" : "ml-2")}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {msg.sender_id === currentUserId && <CheckCheck className="w-3 h-3 text-success" />}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Message Input */}
        <div className="p-6 lg:p-10 border-t border-[var(--foreground)]/5 bg-white/[0.04]">
           <form 
             onSubmit={(e) => { e.preventDefault(
  ); handleSendMessage(
  ); }}
             className="flex items-center gap-3 lg:gap-5"
           >
              <button type="button" className="p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all active:scale-90 shadow-premium">
                 <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="hidden sm:flex p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all active:scale-90 shadow-premium">
                 <ImageIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                 <Input 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="Type transmission..." 
                   className="h-12 lg:h-14 pl-6 lg:pl-8 pr-14 lg:pr-16 bg-bg-primary border-white/10 rounded-[20px] lg:rounded-[24px] text-xs lg:text-sm text-white focus:border-primary/50 shadow-inner" 
                 />
                 <Button 
                   type="submit"
                   className="absolute right-1.5 lg:right-2 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 p-0 rounded-full bg-primary hover:bg-primary/90 shadow-glow-purple active:scale-90 transition-all"
                 >
                    <Send className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--foreground)]" />
                 </Button>
              </div>
           </form>
        </div>
      </Card>

    </div>
  
  );
}
