import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal UI dictionary for the mobile app
const translations = {
  en: { 
    add_to_cart: 'Add to Cart', 
    buy_now: 'Buy Now',
    checkout: 'Checkout',
    home: 'Home',
    catalog: 'Catalog',
    orders: 'Orders',
    profile: 'Profile',
    recipes: 'Recipes',
    search: 'Search OceanExotic',
    total: 'Total',
  },
  hi: { 
    add_to_cart: 'कार्ट में जोड़ें', 
    buy_now: 'अभी खरीदें',
    checkout: 'चेकआउट',
    home: 'होम',
    catalog: 'कैटलॉग',
    orders: 'ऑर्डर',
    profile: 'प्रोफ़ाइल',
    recipes: 'रेसिपी',
    search: 'OceanExotic खोजें',
    total: 'कुल',
  },
  te: { 
    add_to_cart: 'కార్ట్‌కు జోడించు', 
    buy_now: 'ఇప్పుడే కొనండి',
    checkout: 'చెక్అవుట్',
    home: 'హోమ్',
    catalog: 'క్యాటలాగ్',
    orders: 'ఆర్డర్లు',
    profile: 'ప్రొఫైల్',
    recipes: 'వంటకాలు',
    search: 'OceanExotic శోధించండి',
    total: 'మొత్తం',
  },
  bn: {
    add_to_cart: 'কার্টে যোগ করুন',
    buy_now: 'এখনই কিনুন',
    checkout: 'চেকআউট',
    home: 'হোম',
    catalog: 'ক্যাটালগ',
    orders: 'অর্ডার',
    profile: 'প্রোফাইল',
    recipes: 'রেসিপি',
    search: 'OceanExotic অনুসন্ধান করুন',
    total: 'মোট',
  },
  ta: {
    add_to_cart: 'கார்ட்டில் சேர்',
    buy_now: 'இப்போதே வாங்கு',
    checkout: 'செக்அவுட்',
    home: 'முகப்பு',
    catalog: 'கட்டலாக்',
    orders: 'ஆர்டர்கள்',
    profile: 'சுயவிவரம்',
    recipes: 'சமையல்',
    search: 'OceanExotic தேடு',
    total: 'மொத்தம்',
  },
  // Add additional dictionaries as needed for Thai, Filipino, Odia, etc.
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const setLanguage = async (langCode: string) => {
  i18n.locale = langCode;
  await AsyncStorage.setItem('user-language', langCode);
};

export const loadSavedLanguage = async () => {
  const saved = await AsyncStorage.getItem('user-language');
  if (saved) {
    i18n.locale = saved;
  }
};

export default i18n;
