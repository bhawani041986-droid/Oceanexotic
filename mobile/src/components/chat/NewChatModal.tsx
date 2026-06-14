import React, { useState } from 'react';
import { View, Text, TextInput, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Search, X, UserPlus } from 'lucide-react-native';
import { FULL_API_URL } from '@/config/api';
import { cn } from '@/lib/utils';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatCreated: (conversationId: number) => void;
}

export function NewChatModal({ isOpen, onClose, currentUserId, onChatCreated }: NewChatModalProps) {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Hardcoded demo users for easy testing
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
      const res = await fetch(`${FULL_API_URL}/chat/create_conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_1: currentUserId,
          participant_2: targetUserId
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to start chat');

      if (data.conversation_id) {
        onChatCreated(data.conversation_id);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[80%]" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          
          {/* Header */}
          <View className="p-4 border-b flex-row justify-between items-center" style={{ backgroundColor: colors.bg, borderBottomColor: colors.border }}>
            <View className="flex-row items-center gap-2">
              <UserPlus color={colors.primary} size={20} />
              <Text className="text-lg font-bold" style={{ color: colors.text }}>New Conversation</Text>
            </View>
            <Pressable onPress={onClose} className="p-1">
              <X color={colors.textMuted} size={24} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="relative flex-row items-center rounded-xl px-3 h-12" style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }}>
              <Search color={colors.textMuted} size={20} className="mr-2" />
              <TextInput
                placeholder="Search by name or ID..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-sm font-medium"
                style={{ color: colors.text }}
                autoCapitalize="none"
              />
            </View>
            {error ? <Text className="text-red-500 text-xs mt-2">{error}</Text> : null}
          </View>

          {/* User List */}
          <ScrollView className="flex-1 p-2" showsVerticalScrollIndicator={false}>
            {filteredUsers.length === 0 ? (
              <View className="p-8 items-center justify-center">
                <Text style={{ color: colors.textMuted }}>No users found.</Text>
              </View>
            ) : (
              filteredUsers.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => startChat(u.id)}
                  disabled={isSubmitting}
                  className="w-full flex-row items-center justify-between p-3 rounded-xl mb-1 active:opacity-70"
                  style={({ pressed }) => ({ backgroundColor: pressed ? colors.border : 'transparent' })}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                      <Text className="text-white font-bold">{u.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-sm" style={{ color: colors.text }}>{u.name}</Text>
                      <Text className="text-xs" style={{ color: colors.textMuted }}>{u.id}</Text>
                    </View>
                  </View>
                  <View className="px-2 py-1 rounded-md border" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                    <Text className="text-[10px] uppercase font-bold" style={{ color: colors.textMuted }}>{u.role}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
