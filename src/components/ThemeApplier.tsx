"use client";

import React from "react";
import { useSettingsStore } from "@/store/settingsStore";

export const ThemeApplier = () => {
  const { theme, font } = useSettingsStore();

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // List of all possible themes
    const themes = [
      'theme-ocean-neon',
      'theme-midnight-executive',
      'theme-aqua-glass',
      'theme-royal-purple',
      'theme-carbon-minimal',
      'theme-sunset-energy',
      'theme-light-sovereign',
      'theme-alibaba-orange',
      'theme-amazon-global',
      'theme-swiggy-vibrant',
      'theme-zomato-passion'
    ];

    // List of all possible fonts
    const fonts = [
      'font-inter',
      'font-plus-jakarta',
      'font-outfit',
      'font-space-grotesk',
      'font-kanit',
      'font-cinzel',
      'font-roboto'
    ];

    // Remove existing themes and fonts
    themes.forEach(t => root.classList.remove(t));
    fonts.forEach(f => root.classList.remove(f));
    
    // Add selected theme and font
    if (theme) {
      root.classList.add(theme);
      const lightThemes = ['theme-light-sovereign', 'theme-swiggy-vibrant', 'theme-zomato-passion'];
      if (lightThemes.includes(theme)) {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
    
    if (font) {
      // Map raw font names containing spaces to class tokens, slugifying others safely
      let fontClass = font;
      const lower = font.toLowerCase();
      if (!lower.startsWith('font-')) {
        if (lower === 'inter') fontClass = 'font-inter';
        else if (lower === 'outfit') fontClass = 'font-outfit';
        else if (lower === 'plus jakarta' || lower === 'plus jakarta sans') fontClass = 'font-plus-jakarta';
        else if (lower === 'space grotesk' || lower === 'roboto mono') fontClass = 'font-space-grotesk';
        else if (lower === 'kanit') fontClass = 'font-kanit';
        else if (lower === 'cinzel') fontClass = 'font-cinzel';
        else if (lower === 'roboto') fontClass = 'font-roboto';
        else {
          fontClass = `font-${lower.replace(/\s+/g, '-')}`;
        }
      }
      root.classList.add(fontClass);
    }
  }, [theme, font]);

  return null;
};
