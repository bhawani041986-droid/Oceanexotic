import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo-vector-icons';

export default function LogisticsDashboard() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50 p-6 justify-center items-center">
      <View className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg w-full items-center">
        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-6">
          <FontAwesome5 name="shipping-fast" size={28} color="#00B4D8" />
        </View>
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">Logistics Control</Text>
        <Text className="text-slate-500 text-center mb-8">Manage your global delivery network, configure operational territories, and geo-tag distribution hubs.</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/logistics/territories')}
          className="bg-primary w-full py-4 rounded-xl flex-row justify-center items-center shadow-md"
        >
          <FontAwesome5 name="globe-americas" size={16} color="white" />
          <Text className="text-white font-bold text-lg ml-3">Configure Territories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
