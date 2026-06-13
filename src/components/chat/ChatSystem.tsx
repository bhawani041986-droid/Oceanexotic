"use client";

import React from 'react';
import { useChatEngine } from '@/lib/hooks/useChatEngine';
import { ArrowLeft, Search, Send, Paperclip, X, Trash2, Circle, CheckCircle, Video, FileText, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useVideoCall } from '@/components/video/VideoCallProvider';
import { NewChatModal } from '@/components/chat/NewChatModal';

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
    handleSendMessage,
    handleDeleteMessage,
    handleInitiateVideoCall
  } = useChatEngine(currentUserId);

  const { setActiveVideoRoom } = useVideoCall();

  const [message, setMessage] = React.useState('');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [selectedMessages, setSelectedMessages] = React.useState<number[]>([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

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

  const isAdvancedLayout = role !== 'customer';

  return (
    <div className="bg-[#0F172A] h-[100dvh] text-white font-inter flex flex-col selection:bg-[#0077B6]/30 overflow-hidden w-full">
      
      {/* HEADER (60px exactly) */}
      <header className="h-[60px] bg-[#1E293B] border-b border-white/5 px-4 md:px-6 flex items-center justify-between shrink-0 z-50">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(backUrl)}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
               <h1 className="text-[24px] font-black uppercase tracking-tighter">OceanExotic Messenger</h1>
            </div>
         </div>
         {isAdvancedLayout && (
           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#2ECC71]">
              <div className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full animate-pulse" />
              SECURE WORKSPACE
           </div>
         )}
      </header>

      {/* VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* COLUMN 1: CHAT LIST (Sidebar) */}
         <aside className={cn(
           "absolute inset-y-0 left-0 w-full md:relative md:w-[320px] bg-[#1E293B] border-r border-white/5 transition-transform duration-500 z-40 shrink-0",
           !isSidebarOpen && "-translate-x-full md:translate-x-0"
         )}>
            <div className="p-4 space-y-4 flex flex-col h-full">
               <div className="flex items-center gap-2">
                 <div className="relative group flex-1">
                    <Input placeholder="Search Conversations..." className="h-10 bg-white/5 border-white/5 rounded-xl pl-10 text-sm focus:border-[#0077B6] transition-all" />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-[#0077B6] transition-colors" />
                 </div>
                 {isAdvancedLayout && (
                   <button 
                     onClick={() => setIsNewChatModalOpen(true)}
                     className="w-10 h-10 shrink-0 bg-[#0077B6] text-white rounded-xl flex items-center justify-center hover:bg-[#0077B6]/80 transition-colors"
                     title="Start New Chat"
                   >
                     +
                   </button>
                 )}
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
                  {conversations.map((conv) => (
                    <button 
                      key={conv.id}
                      onClick={() => { setActiveChat(conv.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full p-3 rounded-[16px] flex items-center gap-3 transition-all group relative overflow-hidden",
                        activeChat === conv.id ? "bg-[#0077B6] text-white shadow-lg" : "hover:bg-white/5 text-white/70"
                      )}
                    >
                       <div className={cn(
                         "w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110", 
                         activeChat === conv.id ? "bg-white/20" : "bg-white/5"
                       )}>
                          {conv.other_party_role === 'SELLER' ? "🚢" : "👤"}
                       </div>
                       <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                             <h4 className="text-[16px] font-bold truncate">{conv.other_party_name}</h4>
                             <span className="text-[12px] opacity-80">{conv.time}</span>
                          </div>
                          <p className="text-[14px] truncate mt-0.5 opacity-80">{conv.last_message}</p>
                       </div>
                    </button>
                  ))}
               </div>
               <NewChatModal 
                 isOpen={isNewChatModalOpen} 
                 onClose={() => setIsNewChatModalOpen(false)} 
                 currentUserId={currentUserId} 
                 onChatCreated={(convId) => {
                   setActiveChat(convId);
                 }}
               />
            </div>
         </aside>

         {/* COLUMN 2: MAIN CONVERSATION AREA */}
         <main className="flex-1 flex flex-col bg-[#0F172A] relative min-w-0">
            
            {/* Conversation Header (60px) */}
            <header className={cn(
               "h-[60px] px-4 md:px-6 border-b flex items-center justify-between shrink-0 transition-colors bg-[#1E293B]",
               selectedMessages.length > 0 ? "bg-[#0077B6]/20 border-[#0077B6]/30" : "border-white/5"
            )}>
               {selectedMessages.length > 0 ? (
                 <>
                   <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedMessages([])} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                       <X className="w-5 h-5 text-[#0077B6]" />
                     </button>
                     <span className="font-bold text-[#0077B6] text-sm">{selectedMessages.length} Selected</span>
                   </div>
                   <button onClick={handleBulkDelete} className="p-2 text-[#E74C3C] hover:bg-[#E74C3C]/10 rounded-xl transition-colors">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </>
               ) : (
                 <div className="flex items-center justify-between w-full">
                   <div className="flex items-center gap-3">
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors">
                         <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 bg-[#0077B6]/10 text-[#0077B6] rounded-full flex items-center justify-center text-lg">
                         {currentChat?.other_party_role === 'SELLER' ? "🚢" : "👤"}
                      </div>
                      <div>
                         <h3 className="text-[18px] font-bold leading-tight">{currentChat?.other_party_name || "Select a Chat"}</h3>
                         <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("w-2 h-2 rounded-full", currentChat?.online ? 'bg-[#2ECC71]' : 'bg-slate-500')} />
                            <span className="text-[11px] text-white/50 font-bold uppercase tracking-widest">
                               {currentChat?.online ? 'Online' : 'Offline'}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   {/* Actions */}
                   {activeChat && (
                     <div className="flex items-center gap-2">
                       {(role === 'agent' || role === 'admin' || role === 'seller') && (
                         <button 
                           onClick={handleInitiateVideoCall}
                           className="p-2 bg-[#0077B6]/10 text-[#0077B6] hover:bg-[#0077B6]/20 rounded-full transition-colors"
                         >
                           <Video className="w-5 h-5" />
                         </button>
                       )}
                     </div>
                   )}
                 </div>
               )}
            </header>

            <div className="flex-1 flex flex-col items-center w-full relative overflow-hidden">
              <div className="flex-1 w-full max-w-5xl overflow-y-auto p-4 md:p-6 space-y-4">
                 <div className="flex flex-col w-full space-y-2">
                   {messages.map((msg) => {
                     const isOwnMessage = msg.sender_id === currentUserId;
                     return (
                     <div key={msg.id} className="flex flex-col gap-1 w-full">
                       {isOwnMessage && selectedMessages.length > 0 && (
                         <div className="flex justify-end mb-1">
                           <button onClick={() => toggleSelection(msg.id)} className="text-[#0077B6] hover:scale-110 transition-transform">
                             {selectedMessages.includes(msg.id) ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 text-white/30" />}
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

              {/* Input Area (64px exactly) */}
              <footer className="w-full h-[64px] bg-[#1E293B] border-t border-white/5 flex items-center px-4 shrink-0">
                 <div className="flex items-center gap-2 w-full max-w-5xl mx-auto">
                    <button className="p-2 text-white/50 hover:text-[#0077B6] transition-colors shrink-0">
                       <Paperclip className="w-6 h-6" />
                    </button>
                    
                    <input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 text-[14px] font-medium h-10 px-4 rounded-full focus:ring-0 outline-none focus:border-[#0077B6] transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(message);
                          setMessage('');
                        }
                      }}
                    />
                    
                    <button 
                      onClick={() => {
                        handleSendMessage(message);
                        setMessage('');
                      }}
                      disabled={!message.trim()}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                        message.trim() ? "bg-[#0077B6] text-white" : "bg-white/5 text-white/30"
                      )}
                    >
                       <Send className="w-4 h-4 ml-0.5" />
                    </button>
                 </div>
              </footer>
            </div>
         </main>

         {/* COLUMN 3: CUSTOMER DETAILS PANEL (Advanced Layout Only) */}
         {isAdvancedLayout && (
           <aside className="hidden lg:block w-[320px] bg-[#1E293B] border-l border-white/5 shrink-0 overflow-y-auto">
             <div className="p-6 space-y-8">
                <div className="flex flex-col items-center text-center space-y-3">
                   <div className="w-20 h-20 bg-[#0077B6]/20 rounded-full flex items-center justify-center text-3xl">
                     👤
                   </div>
                   <div>
                     <h3 className="text-[18px] font-bold">{currentChat?.other_party_name || "Customer Name"}</h3>
                     <p className="text-[12px] text-white/50">Joined March 2026</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Recent Orders</h4>
                   <div className="space-y-2">
                     <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                        <Package className="w-5 h-5 text-[#0077B6]" />
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold truncate">Order #OX4501</p>
                           <p className="text-[12px] text-[#2ECC71]">Delivered • ₹12,000</p>
                        </div>
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                        <Package className="w-5 h-5 text-[#0077B6]" />
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold truncate">Order #OX4482</p>
                           <p className="text-[12px] text-white/50">Processing • ₹8,500</p>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Shared Documents</h4>
                   <div className="space-y-2">
                     <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                        <FileText className="w-5 h-5 text-[#E74C3C]" />
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold truncate">GST_License.pdf</p>
                        </div>
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                        <FileText className="w-5 h-5 text-[#E74C3C]" />
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-bold truncate">Invoice_OX4501.pdf</p>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
           </aside>
         )}

      </div>
    </div>
  );
}
