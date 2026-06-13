"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta';

type Translations = Record<string, string>;

export const dictionaries: Record<LanguageCode, Translations> = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.support': 'Support',
    'nav.login': 'Sign In',
    'hero.title': 'Commission Your Identity',
    'hero.subtitle': 'Global maritime trade and harvest distribution.',
    'product.add_to_cart': 'Add to Cart',
    'product.out_of_stock': 'Out of Stock',
  },
  hi: {
    'nav.home': 'होम',
    'nav.products': 'उत्पाद',
    'nav.orders': 'ऑर्डर',
    'nav.support': 'सहायता',
    'nav.login': 'लॉग इन करें',
    'hero.title': 'अपनी पहचान बनाएं',
    'hero.subtitle': 'वैश्विक समुद्री व्यापार और फसल वितरण।',
    'product.add_to_cart': 'कार्ट में डालें',
    'product.out_of_stock': 'स्टॉक से बाहर',
  },
  bn: {
    'nav.home': 'হোম',
    'nav.products': 'পণ্য',
    'nav.orders': 'অর্ডার',
    'nav.support': 'সাপোর্ট',
    'nav.login': 'লগ ইন করুন',
    'hero.title': 'আপনার পরিচয় তৈরি করুন',
    'hero.subtitle': 'বিশ্বব্যাপী সামুদ্রিক বাণিজ্য এবং ফসল বিতরণ।',
    'product.add_to_cart': 'কার্টে যোগ করুন',
    'product.out_of_stock': 'স্টক আউট',
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.products': 'பொருட்கள்',
    'nav.orders': 'ஆர்டர்கள்',
    'nav.support': 'ஆதரவு',
    'nav.login': 'உள்நுழைய',
    'hero.title': 'உங்கள் அடையாளத்தை உருவாக்கவும்',
    'hero.subtitle': 'உலகளாவிய கடல் வணிகம் மற்றும் அறுவடை விநியோகம்.',
    'product.add_to_cart': 'கூடையில் சேர்',
    'product.out_of_stock': 'கையிருப்பு இல்லை',
  }
};

interface I18nContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('oceanexotic-lang') as LanguageCode;
    if (savedLang && dictionaries[savedLang]) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem('oceanexotic-lang', newLang);
  };

  const t = (key: string) => {
    return dictionaries[lang]?.[key] || dictionaries['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
