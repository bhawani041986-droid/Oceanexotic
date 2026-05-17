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
    if (theme) root.classList.add(theme);
    if (font) root.classList.add(font);
  }, [theme, font]);

  return null;
};
