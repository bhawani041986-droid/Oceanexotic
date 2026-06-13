import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Globe, ChevronDown, X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import i18n, { setLanguage, loadSavedLanguage } from '@/lib/i18n';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.locale);

  useEffect(() => {
    loadSavedLanguage().then(() => {
      setCurrentLang(i18n.locale);
    });
  }, []);

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    setCurrentLang(code);
    setModalVisible(false);
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <>
      <Pressable 
        onPress={() => setModalVisible(true)}
        className="h-9 items-center justify-center rounded-xl border flex-row px-2 gap-1 active:opacity-70"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Globe size={14} color={colors.text} />
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
                <X size={20} color={colors.text} />
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
                    currentLang === item.code && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.langText,
                    { color: currentLang === item.code ? colors.primary : colors.text }
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
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
