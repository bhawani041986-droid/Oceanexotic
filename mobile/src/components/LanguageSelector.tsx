import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { setLanguage } from '@/lib/i18n';
import { useSettingsStore } from "@/store/settingsStore";
import { ChamferedBox } from '@/components/ui/ChamferedBox';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese (অસમীয়া)' },
  { code: 'mni-Mtei', name: 'Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)' },
  { code: 'zh-CN', name: 'Chinese (中文)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'tl', name: 'Filipino' },
];

interface LanguageSelectorProps {
  showText?: boolean;
}

export function LanguageSelector({ showText = false }: LanguageSelectorProps) {
  const colors = useThemeColors();
  // Subscribe directly to the `language` field — re-renders on every change
  const language = useSettingsStore((s) => s.language);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (code: string) => {
    setModalVisible(false);
    // setLanguage saves to AsyncStorage AND updates Zustand store
    await setLanguage(code);
  };

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <View className="shrink-0 relative z-50">
      {showText ? (
        <Pressable 
          onPress={() => setModalVisible(true)}
          className="flex-row items-center gap-2 active:opacity-70 px-3 py-1.5 rounded-full border"
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.card + '80'
          }}
        >
          <Text style={{ fontSize: 14 }}>🌐</Text>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            {activeLang.name.split(' ')[0]}
          </Text>
          <Text style={{ color: colors.text, fontSize: 10, marginLeft: 2 }}>▼</Text>
        </Pressable>
      ) : (
        <Pressable 
          onPress={() => setModalVisible(true)}
          className="relative h-9 w-9 items-center justify-center rounded-xl border active:opacity-70"
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.card
          }}
        >
          <Ionicons name="globe-outline" size={18} color={colors.text} />
          {/* Active 2-letter language code badge */}
          <View 
            className="absolute -bottom-1 -right-1 px-1 py-[0.5px] rounded-md border shadow-sm" 
            style={{ 
              backgroundColor: colors.primary,
              borderColor: colors.bg
            }}
          >
            <Text className="text-[7.5px] font-black uppercase text-slate-950">
              {activeLang.code.slice(0, 2)}
            </Text>
          </View>
        </Pressable>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ChamferedBox
            fillColor={colors.card}
            strokeColor={colors.border}
            bevelSize={20}
            style={{ width: '100%', maxHeight: '80%' }}
            className="overflow-hidden"
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Language</Text>
              <Pressable onPress={() => setModalVisible(false)} className="p-2">
                <Ionicons name="close-outline" size={20} color={colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.code)}
                  style={[
                    styles.langItem,
                    { borderBottomColor: colors.border },
                    language === item.code && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.langText,
                    { color: language === item.code ? colors.primary : colors.text }
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </ChamferedBox>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  langItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
