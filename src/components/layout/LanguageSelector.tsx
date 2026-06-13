"use client";

import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [lang, setLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize lang from googtrans cookie if it exists
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(.*?)(;|$)/);
    if (match && match[1]) {
      setLang(match[1]);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setLang(langCode);
    setIsOpen(false);
    
    // Attempt to change the Google Translate hidden dropdown
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // If widget hasn't fully loaded, set cookie and reload as fallback
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
      window.location.reload();
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 md:p-3 text-muted-foreground hover:text-foreground transition-colors"
        title="Change Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block truncate max-w-[80px]">{currentLang.name.split(' ')[0]}</span>
        <ChevronDown className="w-3 h-3 hidden md:block" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-48 py-2 bg-card backdrop-blur-3xl border border-border rounded-xl shadow-2xl z-[200] flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar"
          >
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/10 ${
                  lang === language.code ? 'text-primary' : 'text-foreground'
                }`}
              >
                {language.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
