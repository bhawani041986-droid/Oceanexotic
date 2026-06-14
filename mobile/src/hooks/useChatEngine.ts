import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import { FULL_API_URL } from '@/config/api';

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: string;
  message_text: string;
  is_read: boolean | number;
  created_at: string;
  message_type?: "TEXT" | "IMAGE" | "PDF" | "PRODUCT_CARD" | "ORDER_CARD" | "QUOTATION_CARD" | "VOICE";
  attachment_url?: string | null;
  metadata?: any;
}

export interface Conversation {
  id: number;
  other_party_id: string;
  other_party_name: string;
  other_party_role: string;
  last_message: string;
  last_message_sender_id: string;
  time: string;
  timestamp: number;
  unread_count: number;
  status: string;
  priority: string;
  online: boolean;
}

export function useChatEngine(currentUserId: string | undefined | null) {
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [incomingCall, setIncomingCall] = useState<{roomID: string, callerName: string} | null>(null);
  const [activeVideoRoom, setActiveVideoRoom] = useState<string | null>(null);
  
  const processedInvites = useRef<Set<string>>(new Set());
  const mounted = useRef(true);

  const fetchConversations = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${FULL_API_URL}/chat/get_conversations?user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        if (mounted.current) setConversations(data);
        
        // Auto-select first chat if none selected
        if (data.length > 0 && mounted.current) {
          setActiveChat(prev => prev === null ? data[0].id : prev);
        }
        
        // Detect incoming calls globally
        const recentCall = data.find((c: any) => {
          if (c.unread_count > 0 && c.last_message && c.last_message_sender_id !== currentUserId && c.last_message.includes('[VIDEO_CALL_INVITE]:')) {
            const roomID = c.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
            if (!processedInvites.current.has(roomID) && (Date.now() - c.timestamp < 60000)) {
              return true;
            }
          }
          return false;
        });

        if (recentCall && mounted.current) {
          const roomID = recentCall.last_message.replace('[VIDEO_CALL_INVITE]:', '').trim();
          setIncomingCall({ roomID, callerName: recentCall.other_party_name });
          processedInvites.current.add(roomID);
        }
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      // Fetch and implicitly mark as read if user_id is passed
      const res = await fetch(`${FULL_API_URL}/chat/get_messages?conversation_id=${convId}&user_id=${currentUserId}&t=${Date.now()}`);
      const data = await res.json();
      if (mounted.current && Array.isArray(data)) {
        // We reverse it since React Native FlatList with inverted={true} needs it backwards
        setMessages(data.reverse());
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // Setup Global Polling
  useEffect(() => {
    mounted.current = true;
    if (currentUserId) {
      fetchConversations();
      const interval = setInterval(() => {
        fetchConversations();
      }, 5000);
      return () => clearInterval(interval);
    }
    return () => { mounted.current = false; };
  }, [currentUserId]);

  // Setup Chat-specific Polling
  useEffect(() => {
    if (activeChat !== null && currentUserId) {
      fetchMessages(activeChat);

      const interval = setInterval(() => {
        fetchMessages(activeChat);
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [activeChat, currentUserId]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || activeChat === null || !currentUserId) return;
    
    const tempMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: activeChat,
      message_text: textToSend,
      message_type: 'TEXT',
      sender_id: currentUserId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Prepend for optimistic UI update
    setMessages((prev) => [tempMsg, ...prev]);

    try {
      const res = await fetch(`${FULL_API_URL}/chat/send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeChat,
          sender_id: currentUserId,
          message_text: textToSend
        })
      });

      if (!res.ok) throw new Error("Failed to send message via API");

    } catch (err) {
      console.error("Signal lost:", err);
      toast("Failed to transmit message", "error");
    }
  };

  const handleInitiateVideoCall = () => {
    if (!activeChat || !currentUserId) return;
    const roomID = `ROOM_${activeChat}_${Date.now()}`;
    setActiveVideoRoom(roomID);
    handleSendMessage(`[VIDEO_CALL_INVITE]:${roomID}`);
  };

  const handleDeleteMessage = async (msgId: number) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await fetch(`${FULL_API_URL}/chat/delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId, sender_id: currentUserId })
      });
    } catch (err) {
      toast("Failed to delete message", "error");
      if (activeChat) fetchMessages(activeChat);
    }
  };

  return {
    conversations,
    activeChat,
    setActiveChat,
    messages,
    isLoading,
    incomingCall,
    setIncomingCall,
    activeVideoRoom,
    setActiveVideoRoom,
    handleSendMessage,
    handleInitiateVideoCall,
    handleDeleteMessage
  };
}
