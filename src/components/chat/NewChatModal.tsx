import React, { useState } from 'react';
import { Search, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatCreated: (conversationId: number) => void;
}

export function NewChatModal({ isOpen, onClose, currentUserId, onChatCreated }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Hardcoded demo users for easy testing, since auth.users is restricted
  const demoUsers = [
    { id: 'USR-001', name: 'John Doe (Customer)', role: 'customer' },
    { id: 'USR-002', name: 'Jane Smith (Customer)', role: 'customer' },
    { id: 'SEL-001', name: 'Abhijeet (Seller)', role: 'seller' },
    { id: 'SEL-002', name: 'Ocean Catch (Seller)', role: 'seller' },
    { id: 'ADM-001', name: 'System Admin', role: 'admin' },
    { id: 'AGN-001', name: 'Delivery Agent Alpha', role: 'agent' },
  ];

  const filteredUsers = demoUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(u => u.id !== currentUserId);

  const startChat = async (targetUserId: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Check if conversation already exists
      const { data: existing, error: checkErr } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${targetUserId}),and(participant_1.eq.${targetUserId},participant_2.eq.${currentUserId})`)
        .limit(1);

      if (checkErr) throw checkErr;

      if (existing && existing.length > 0) {
        onChatCreated(existing[0].id);
        onClose();
        return;
      }

      // 2. Create new conversation
      const { data: newConv, error: insertErr } = await supabase
        .from('chat_conversations')
        .insert([
          {
            participant_1: currentUserId,
            participant_2: targetUserId,
            title: `Chat with ${targetUserId}`,
            last_message_text: "Chat started",
          }
        ])
        .select();

      if (insertErr) throw insertErr;

      if (newConv && newConv.length > 0) {
        onChatCreated(newConv[0].id);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0F172A]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0077B6]" />
            New Conversation
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Input 
              autoFocus
              placeholder="Search by name or ID (e.g. USR-001)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0F172A] border-slate-700 text-white w-full h-11 rounded-xl"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => startChat(user.id)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0077B6] to-[#00B4D8] flex items-center justify-center text-white font-bold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{user.name}</div>
                    <div className="text-slate-400 text-xs">{user.id}</div>
                  </div>
                </div>
                <div className="text-xs bg-[#0F172A] px-2 py-1 rounded-md text-slate-300 border border-slate-700">
                  {user.role}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
