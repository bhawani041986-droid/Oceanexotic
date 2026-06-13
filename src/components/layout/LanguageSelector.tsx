"use client";

import React, { useState } from 'react';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
];

export function LanguageSelector() {
  const { lang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 md:p-3 text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)] transition-colors"
      >
        <Globe className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{lang}</span>
        <ChevronDown className="w-3 h-3 hidden md:block" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-32 py-2 bg-[var(--c-card)]/95 backdrop-blur-3xl border border-[var(--foreground)]/5 rounded-xl shadow-2xl z-[200] flex flex-col"
          >
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setLang(language.code);
                  setIsOpen(false);
                }}
                className={`text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--foreground)]/5 ${
                  lang === language.code ? 'text-[var(--c-primary)]' : 'text-[var(--c-text-primary)]'
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
