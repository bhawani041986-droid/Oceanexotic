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
    search_placeholder: 'Search harvests...',
    live_delivery_hub: 'Port Blair • Live Delivery Hub',
    local_delivery_hub: 'Local Delivery Hub',
    guest_mode: 'Guest Mode',
    logout: 'Logout',
    login_title: 'Admiral Login',
    login_subtitle: 'Access the Global Seafood Network',
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
    search_placeholder: 'फ़सलें खोजें...',
    live_delivery_hub: 'पोर्ट ब्लेयर • लाइव डिलीवरी हब',
    local_delivery_hub: 'स्थानीय डिलीवरी हब',
    guest_mode: 'अतिथि मोड',
    logout: 'लॉग आउट',
    login_title: 'एडमिरल लॉगिन',
    login_subtitle: 'वैश्विक समुद्री भोजन नेटवर्क तक पहुंचें',
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
    search_placeholder: 'పంటలను శోధించండి...',
    live_delivery_hub: 'పోర్ట్ బ్లెయిర్ • లైవ్ డెలివరీ హబ్',
    local_delivery_hub: 'స్థానిక డెలివరీ హబ్',
    guest_mode: 'అతిథి మోడ్',
    logout: 'లాగ్అవుట్',
    login_title: 'అడ్మిరల్ లాగిన్',
    login_subtitle: 'గ్లోబల్ సీఫుడ్ నెట్‌వర్క్‌ను యాక్సెస్ చేయండి',
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
    search_placeholder: 'ফসল অনুসন্ধান করুন...',
    live_delivery_hub: 'পোর্ট ব্লেয়ার • লাইভ ডেলিভারি হাব',
    local_delivery_hub: 'স্থানীয় ডেলিভারি হাব',
    guest_mode: 'গেস্ট মোড',
    logout: 'লগ আউট',
    login_title: 'অ্যাডমিরাল লগইন',
    login_subtitle: 'গ্লোবাল সিফুড নেটওয়ার্ক অ্যাক্সেস করুন',
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
