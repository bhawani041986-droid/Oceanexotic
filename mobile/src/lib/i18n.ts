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
    todays_catch: "Today's Catch",
    fresh_catch_of_the_day: "Fresh Catch of the Day",
    all: "All",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    promotions: "Promotions",
    batch: "Batch",
    flash_deals: "Flash Deals",
    grab_before_gone: "Grab them before they're gone!"
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
    todays_catch: "आज की पकड़",
    fresh_catch_of_the_day: "आज की ताज़ा पकड़",
    all: "सभी",
    morning: "सुबह",
    afternoon: "दोपहर",
    evening: "शाम",
    promotions: "प्रचार",
    batch: "बैच",
    flash_deals: "फ्लैश डील्स",
    grab_before_gone: "जाने से पहले पकड़ें!"
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
    todays_catch: "నేటి క్యాచ్",
    fresh_catch_of_the_day: "ఈ రోజు తాజా క్యాచ్",
    all: "అన్నీ",
    morning: "ఉదయం",
    afternoon: "మధ్యాహ్నం",
    evening: "సాయంత్రం",
    promotions: "ప్రమోషన్లు",
    batch: "బ్యాచ్",
    flash_deals: "ఫ్లాష్ డీల్స్",
    grab_before_gone: "అవి పోయే లోపు తీసుకోండి!"
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
    todays_catch: "আজকের ধরা মাছ",
    fresh_catch_of_the_day: "আজকের তাজা মাছ",
    all: "সব",
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    promotions: "প্রচারসমূহ",
    batch: "ব্যাচ",
    flash_deals: "ফ্ল্যাশ ডিল",
    grab_before_gone: "শেষ হওয়ার আগেই লুফে নিন!"
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
    todays_catch: "இன்றைய பிடிப்பு",
    fresh_catch_of_the_day: "இன்றைய புதிய பிடிப்பு",
    all: "அனைத்தும்",
    morning: "காலை",
    afternoon: "மதியம்",
    evening: "மாலை",
    promotions: "சலுகைகள்",
    batch: "தொகுதி",
    flash_deals: "மின்னல் சலுகைகள்",
    grab_before_gone: "முடிவதற்குள் வாங்குங்கள்!"
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
