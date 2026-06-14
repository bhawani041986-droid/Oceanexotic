import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import i18n, { setLanguage, loadSavedLanguage } from '@/lib/i18n';
import { useSettingsStore } from "@/store/settingsStore";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'mni-Mtei', name: 'Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)' },
  { code: 'zh-CN', name: 'Chinese (中文)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'tl', name: 'Filipino' },
];

export function LanguageSelector() {
  const colors = useThemeColors();
  const { language, setSettings } = useSettingsStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadSavedLanguage().then(() => {
      setSettings({ language: i18n.locale });
    });
  }, []);

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    setSettings({ language: code });
    setModalVisible(false);
  };

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <View className="shrink-0 relative z-50">
      <Pressable 
        onPress={() => setModalVisible(true)}
        className="h-9 min-w-[48px] items-center justify-center rounded-xl border flex-row px-2 gap-1 active:opacity-70"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Ionicons name="globe-outline" size={14} color={colors.text} />
        <Text style={{ color: colors.text, fontSize: 10, fontWeight: 'bold' }}>
          {activeLang.code.toUpperCase()}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          </View>
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
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
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
