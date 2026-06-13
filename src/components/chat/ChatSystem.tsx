"use client";

import React from 'react';
import { useChatEngine } from '@/lib/hooks/useChatEngine';
import { ArrowLeft, Search, Send, Paperclip, X, Trash2, Circle, CheckCircle, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useVideoCall } from '@/components/video/VideoCallProvider';

interface ChatSystemProps {
  currentUserId: string;
  role: 'customer' | 'seller' | 'agent' | 'admin';
  backUrl: string;
}

export function ChatSystem({ currentUserId, role, backUrl }: ChatSystemProps) {
  const router = useRouter();
  const {
    conversations,
    activeChat,
    setActiveChat,
    messages,
    isLoading,
    handleSendMessage,
    handleDeleteMessage,
    handleInitiateVideoCall
  } = useChatEngine(currentUserId);

  const { setActiveVideoRoom } = useVideoCall();

  const [message, setMessage] = React.useState('');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [selectedMessages, setSelectedMessages] = React.useState<number[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSelection = (id: number) => {
    setSelectedMessages(prev => 
      prev.includes(id) ? prev.filter(msgId => msgId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    selectedMessages.forEach(id => handleDeleteMessage(id));
    setSelectedMessages([]);
  };

  const currentChat = conversations.find(c => c.id === activeChat);

  return (
    <div className="bg-[#0B1120] h-[100dvh] text-white font-inter flex flex-col selection:bg-primary/30 overflow-hidden w-full">
      
      {/* HEADER */}
      <header className="h-16 md:h-20 bg-[#0B1120]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 px-4 md:px-6 flex items-center justify-between shrink-0 z-50">
         <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => router.push(backUrl)}
              className="p-2 md:p-3 bg-[var(--foreground)]/5 rounded-xl md:rounded-2xl hover:bg-[var(--foreground)]/10 transition-colors"
            >
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
               <h1 className="text-xl font-black uppercase italic tracking-tighter">Support Chat</h1>
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-success">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  SECURE CONNECTION
               </div>
            </div>
         </div>
      </header>

      {/* VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* SIDEBAR */}
         <aside className={cn(
           "absolute inset-y-0 left-0 w-full md:relative md:w-80 lg:w-96 bg-[#0B1120] border-r border-[var(--foreground)]/5 transition-transform duration-500 z-40",
           !isSidebarOpen && "-translate-x-full md:translate-x-0"
         )}>
            <div className="p-4 md:p-6 space-y-6 flex flex-col h-full">
               <div className="relative group">
                  <Input placeholder="Search Chats..." className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl pl-10 text-xs font-medium focus:border-primary transition-all" />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                  {conversations.map((conv) => (
                    <button 
                      key={conv.id}
                      onClick={() => { setActiveChat(conv.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-4 transition-all group relative overflow-hidden",
                        activeChat === conv.id ? "bg-primary text-white shadow-glow-purple" : "hover:bg-white/5 text-text-secondary"
                      )}
                    >
                       <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110", activeChat === conv.id ? "bg-[var(--foreground)]/20" : "bg-[var(--foreground)]/5")}>
                          {conv.other_party_role === 'SELLER' ? "🚢" : "🎧"}
                       </div>
                       <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black uppercase truncate">{conv.other_party_name}</h4>
                             <span className="text-[9px] opacity-60 font-bold">{conv.time}</span>
                          </div>
                          <p className="text-[10px] font-medium truncate mt-0.5 opacity-80">{conv.last_message}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
         </aside>

         {/* MAIN CHAT */}
         <main className="flex-1 flex flex-col bg-[#050810] relative">
            
            {/* Conversation Header */}
            <header className={cn(
               "h-16 md:h-20 px-4 md:px-6 border-b flex items-center justify-between shrink-0 transition-colors bg-[#0B1120]",
               selectedMessages.length > 0 ? "bg-primary/20 border-primary/30" : "border-[var(--foreground)]/5"
            )}>
               {selectedMessages.length > 0 ? (
                 <>
                   <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedMessages([])} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                       <X className="w-5 h-5 text-primary" />
                     </button>
                     <span className="font-black text-primary uppercase tracking-widest text-sm">{selectedMessages.length} Selected</span>
                   </div>
                   <button onClick={handleBulkDelete} className="p-2 md:p-3 text-danger hover:bg-danger/10 rounded-xl transition-colors">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </>
               ) : (
                 <div className="flex items-center justify-between w-full">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
                         <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl shadow-xl border border-primary/20">
                         {currentChat?.other_party_role === 'SELLER' ? "🚢" : "🎧"}
                      </div>
                      <div>
                         <h3 className="text-sm md:text-base font-black uppercase leading-none">{currentChat?.other_party_name || "Support"}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={cn("w-2 h-2 rounded-full", currentChat?.online ? 'bg-success' : 'bg-slate-500')} />
                            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                               {currentChat?.online ? 'Online' : 'Offline'}
                            </span>
                         </div>
                      </div>
                   </div>
                   {/* Agent / Admin Video Call Initiation */}
                   {(role === 'agent' || role === 'admin') && activeChat && (
                     <button 
                       onClick={handleInitiateVideoCall}
                       className="p-2 md:p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors flex items-center gap-2"
                     >
                       <Video className="w-5 h-5" />
                       <span className="hidden md:inline font-semibold text-sm">Start Video</span>
                     </button>
                   )}
                 </div>
               )}
            </header>

            <div className="flex-1 flex flex-col items-center w-full relative">
              <div className="flex-1 w-full max-w-4xl overflow-y-auto p-4 md:p-6 space-y-6">
                 <div className="flex flex-col w-full">
                   {messages.map((msg) => {
                     const isOwnMessage = msg.sender_id === currentUserId;
                     return (
                     <div 
                       key={msg.id}
                       className="flex flex-col gap-1 w-full"
                     >
                       {isOwnMessage && selectedMessages.length > 0 && (
                         <div className="flex justify-end mb-1">
                           <button onClick={() => toggleSelection(msg.id)} className="text-primary hover:scale-110 transition-transform">
                             {selectedMessages.includes(msg.id) ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 text-text-secondary" />}
                           </button>
                         </div>
                       )}
                       
                       <div 
                         onClick={() => isOwnMessage && selectedMessages.length > 0 ? toggleSelection(msg.id) : undefined}
                         className={cn("w-full transition-all", selectedMessages.includes(msg.id) && "opacity-50")}
                       >
                         <MessageBubble 
                           message={msg} 
                           isOwnMessage={isOwnMessage} 
                           currentUserId={currentUserId} 
                           onJoinVideoCall={(roomID) => setActiveVideoRoom(roomID)}
                         />
                       </div>
                     </div>
                     );
                   })}
                 </div>
                 <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp-Style Input Hub */}
              <footer className="w-full max-w-4xl p-3 md:p-4 bg-transparent relative z-10 shrink-0">
                 <div className="flex items-end gap-2 bg-[#0B1120] border border-[var(--foreground)]/10 rounded-3xl p-2 md:p-3 shadow-2xl">
                    <button className="p-3 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors shrink-0">
                       <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={1}
                      className="flex-1 bg-transparent border-none text-sm md:text-base font-medium focus:ring-0 outline-none resize-none max-h-32 py-3 px-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(message);
                          setMessage('');
                        }
                      }}
                    />
                    
                    <Button 
                      onClick={() => {
                        handleSendMessage(message);
                        setMessage('');
                      }}
                      disabled={!message.trim()}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center p-0 shrink-0 transition-all",
                        message.trim() ? "bg-primary text-white shadow-glow-purple" : "bg-[var(--foreground)]/5 text-text-secondary"
                      )}
                    >
                       <Send className="w-5 h-5 ml-1" />
                    </Button>
                 </div>
              </footer>
            </div>
         </main>
      </div>
    </div>
  );
}
