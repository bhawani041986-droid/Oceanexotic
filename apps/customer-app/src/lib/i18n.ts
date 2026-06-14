import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@/store/settingsStore';

const LANGUAGE_KEY = '@app_language';

const translations: Record<string, Record<string, string>> = {
  en: {
    todays_catch: "Today's Catch",
    fresh_catch_of_the_day: "Fresh Catch of the Day",
    select_language: "Select Language",
    home: "Home",
    market: "Market",
    cart: "Cart",
    orders: "Orders",
    profile: "Profile",
    search_seafood: "Search premium seafood...",
    add_to_cart: "Add to Cart",
    out_of_stock: "Out of Stock",
    freshness: "Freshness",
    stock: "Stock",
    handled_by: "Handled by",
    login_title: "OceanExotic Customer",
    login_subtitle: "Access live harbor catches",
    phone_placeholder: "Phone number",
    password_placeholder: "Password",
    sign_in: "Sign In",
    empty_cart: "Your cart is empty",
    checkout: "Checkout",
    order_history: "Order History",
    total: "Total",
    logout: "Log Out",
    special_offer: "Special Offer",
    fresh_catch_market: "Fresh Catch Market",
    recipes: "Recipes",
    my_orders: "My Orders",
    my_profile: "My Profile",
    active_cart: "Active Cart",
    sign_out: "Sign Out",
    place_order: "Place Order",
    delivery_address: "Delivery Address",
    order_summary: "Order Summary",
    payment_method: "Payment Method",
    subtotal: "Subtotal",
    delivery_fee: "Delivery Fee",
    notifications: "Delivery Alerts",
    all: "All",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    promotions: "Promotions",
    batch: "Batch",
  },
  hi: {
    todays_catch: "आज की पकड़",
    fresh_catch_of_the_day: "आज की ताज़ा पकड़",
    select_language: "भाषा चुनें",
    home: "होम",
    market: "मार्केट",
    cart: "कार्ट",
    orders: "ऑर्डर",
    profile: "प्रोफ़ाइल",
    search_seafood: "प्रीमियम समुद्री भोजन खोजें...",
    add_to_cart: "कार्ट में जोड़ें",
    out_of_stock: "आउट ऑफ स्टॉक",
    freshness: "ताज़गी",
    stock: "स्टॉक",
    handled_by: "द्वारा संचालित",
    login_title: "ओशनएक्सोटिक कस्टमर",
    login_subtitle: "लाइव बंदरगाह पकड़ तक पहुंचें",
    phone_placeholder: "फ़ोन नंबर",
    password_placeholder: "पासवर्ड",
    sign_in: "साइन इन करें",
    empty_cart: "आपकी कार्ट खाली है",
    checkout: "चेकआउट",
    order_history: "ऑर्डर इतिहास",
    total: "कुल",
    logout: "लॉग आउट",
    special_offer: "विशेष ऑफर",
    fresh_catch_market: "ताज़ा पकड़ बाज़ार",
    recipes: "रेसिपी",
    my_orders: "मेरे ऑर्डर",
    my_profile: "मेरी प्रोफ़ाइल",
    active_cart: "सक्रिय कार्ट",
    sign_out: "साइन आउट",
    place_order: "ऑर्डर दें",
    delivery_address: "डिलीवरी पता",
    order_summary: "ऑर्डर सारांश",
    payment_method: "भुगतान का तरीका",
    subtotal: "उप-कुल",
    delivery_fee: "डिलीवरी शुल्क",
    notifications: "डिलीवरी अलर्ट",
    all: "सभी",
    morning: "सुबह",
    afternoon: "दोपहर",
    evening: "शाम",
    promotions: "प्रचार",
    batch: "बैच",
  },
  bn: {
    todays_catch: "আজকের ধরা মাছ",
    fresh_catch_of_the_day: "আজকের তাজা মাছ",
    select_language: "ভাষা নির্বাচন করুন",
    home: "হোম",
    market: "মার্কেট",
    cart: "কার্ট",
    orders: "অর্ডার",
    profile: "প্রোফাইল",
    search_seafood: "প্রিমিয়াম সামুদ্রিক মাছ খুঁজুন...",
    add_to_cart: "কার্ট-এ যোগ করুন",
    out_of_stock: "স্টক শেষ",
    freshness: "তাজা ভাব",
    stock: "স্টক",
    handled_by: "বিক্রেতা",
    login_title: "ওশেনএক্সোটিক কাস্টমার",
    login_subtitle: "লাইভ হারবার মাছের অ্যাক্সেস",
    phone_placeholder: "ফোন নম্বর",
    password_placeholder: "পাসওয়ার্ড",
    sign_in: "লগইন করুন",
    empty_cart: "কার্ট খালি আছে",
    checkout: "চেকআউট",
    order_history: "অর্ডারের ইতিহাস",
    total: "মোট",
    logout: "লগ আউট",
    special_offer: "বিশেষ অফার",
    fresh_catch_market: "তাজা মাছ বাজার",
    recipes: "রেসিপি",
    my_orders: "আমার অর্ডার",
    my_profile: "আমার প্রোফাইল",
    active_cart: "সক্রিয় কার্ট",
    sign_out: "সাইন আউট",
    place_order: "অর্ডার দিন",
    delivery_address: "ডেলিভারি ঠিকানা",
    order_summary: "অর্ডার সারসংক্ষেপ",
    payment_method: "পেমেন্ট পদ্ধতি",
    subtotal: "উপমোট",
    delivery_fee: "ডেলিভারি চার্জ",
    notifications: "ডেলিভারি সতর্কতা",
    all: "সব",
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    promotions: "প্রচারসমূহ",
    batch: "ব্যাচ",
  },
  ta: {
    todays_catch: "இன்றைய பிடிப்பு",
    fresh_catch_of_the_day: "இன்றைய புதிய பிடிப்பு",
    select_language: "மொழியைத் தேர்ந்தெடுக்கவும்",
    home: "முகப்பு",
    market: "சந்தை",
    cart: "வண்டி",
    orders: "ஆர்டர்கள்",
    profile: "சுயவிவரம்",
    search_seafood: "பிரீமியம் கடல் உணவைத் தேடுங்கள்...",
    add_to_cart: "கார்ட்டில் சேர்",
    out_of_stock: "இருப்பு இல்லை",
    freshness: "புத்துணர்ச்சி",
    stock: "இருப்பு",
    handled_by: "வழங்குபவர்",
    login_title: "ஓஷன்எக்ஸோடிக் வாடிக்கையாளர்",
    login_subtitle: "நேரடி துறைமுக பிடிப்புகள்",
    phone_placeholder: "தொலைபேசி எண்",
    password_placeholder: "கடவுச்சொல்",
    sign_in: "உள்நுழைக",
    empty_cart: "வண்டி காலியாக உள்ளது",
    checkout: "பணம் செலுத்துதல்",
    order_history: "ஆர்டர் வரலாறு",
    total: "மொத்தம்",
    logout: "வெளியேறு",
    special_offer: "சிறப்பு சலுகை",
    fresh_catch_market: "புதிய மீன் சந்தை",
    recipes: "சமையல் குறிப்புகள்",
    my_orders: "என் ஆர்டர்கள்",
    my_profile: "என் சுயவிவரம்",
    active_cart: "செயலில் உள்ள வண்டி",
    sign_out: "வெளியேறு",
    place_order: "ஆர்டர் செய்",
    delivery_address: "டெலிவரி முகவரி",
    order_summary: "ஆர்டர் சுருக்கம்",
    payment_method: "பணம் செலுத்தும் முறை",
    subtotal: "இடைத்தொகை",
    delivery_fee: "டெலிவரி கட்டணம்",
    notifications: "டெலிவரி விழிப்பூட்டல்கள்",
    all: "அனைத்தும்",
    morning: "காலை",
    afternoon: "மதியம்",
    evening: "மாலை",
    promotions: "சலுகைகள்",
    batch: "தொகுதி",
  }
};

/**
 * Translate a key using the current language from Zustand settingsStore.
 * This function is called inside components that already subscribe to `language`
 * from the store, so re-renders happen automatically when language changes.
 */
export function t(key: string, lang?: string): string {
  // If lang is explicitly provided, use it
  // Otherwise read from the store's current state (not React hooks – this is a utility)
  const locale = lang || useSettingsStore.getState().language || 'en';
  return translations[locale]?.[key] || translations['en']?.[key] || key;
}

/**
 * Save the selected language to AsyncStorage and update the Zustand store.
 * This is the SINGLE source of truth for language changes.
 */
export const setLanguage = async (code: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    // Update Zustand store (which triggers all component re-renders)
    useSettingsStore.getState().setSettings({ language: code });
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

/**
 * Load the saved language from AsyncStorage on app startup.
 * Call this once in AppProviders or root layout.
 */
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    const lang = saved || 'en';
    // Update Zustand store (which triggers all component re-renders)
    useSettingsStore.getState().setSettings({ language: lang });
    return lang;
  } catch (error) {
    console.error('Error loading language:', error);
    return 'en';
  }
};

export default { t, translations };
