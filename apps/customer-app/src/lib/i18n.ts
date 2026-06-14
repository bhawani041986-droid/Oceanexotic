import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

// Simple translation dictionary for demonstration
const translations: Record<string, Record<string, string>> = {
  en: {
    todays_catch: "Today's Catch",
    fresh_catch_of_the_day: "Fresh Catch of the Day",
  },
  hi: {
    todays_catch: "आज की पकड़ (Today's Catch)",
    fresh_catch_of_the_day: "आज की ताज़ा पकड़",
  },
  bn: {
    todays_catch: "আজকের ধরা মাছ",
    fresh_catch_of_the_day: "আজকের তাজা মাছ",
  },
  ta: {
    todays_catch: "இன்றைய பிடிப்பு",
    fresh_catch_of_the_day: "இன்றைய புதிய பிடிப்பு",
  }
};

class I18n {
  locale: string = 'en';
  listeners: Set<() => void> = new Set();

  t(key: string): string {
    return translations[this.locale]?.[key] || translations['en']?.[key] || key;
  }

  setLocale(code: string) {
    this.locale = code;
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

const i18n = new I18n();

export const setLanguage = async (code: string) => {
  try {
    i18n.setLocale(code);
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const loadSavedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) {
      i18n.setLocale(saved);
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
};

export default i18n;
