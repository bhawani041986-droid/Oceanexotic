"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export type ThemeType = 
  | "theme-ocean-neon"
  | "theme-midnight-executive"
  | "theme-aqua-glass"
  | "theme-royal-purple"
  | "theme-carbon-minimal"
  | "theme-sunset-energy"
  | "theme-light-sovereign"
  | "theme-alibaba-orange"
  | "theme-amazon-global"
  | "theme-swiggy-vibrant"
  | "theme-zomato-passion";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  blurIntensity: number;
  setBlurIntensity: (intensity: number) => void;
  glowIntensity: number;
  setGlowIntensity: (intensity: number) => void;
  font: string;
  setFont: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: storeTheme, font: storeFont, setSettings } = useSettingsStore();
  const [theme, setThemeState] = useState<ThemeType>("theme-ocean-neon");
  const [font, setFontState] = useState<string>("font-inter");
  const [blurIntensity, setBlurIntensity] = useState(100);
  const [glowIntensity, setGlowIntensity] = useState(100);

  // Sync with store on load and changes
  useEffect(() => {
    if (storeTheme && storeTheme !== theme) {
      setThemeState(storeTheme as ThemeType);
    }
    if (storeFont && storeFont !== font) {
      setFontState(storeFont);
    }
  }, [storeTheme, storeFont]);

  // Initialize from localStorage for intensities
  useEffect(() => {
    const savedTheme = localStorage.getItem("oceanexotic-theme") as ThemeType;
    const savedFont = localStorage.getItem("oceanexotic-font");
    const savedBlur = localStorage.getItem("oceanexotic-blur");
    const savedGlow = localStorage.getItem("oceanexotic-glow");
    
    if (savedTheme && !storeTheme) setThemeState(savedTheme);
    if (savedFont && !storeFont) setFontState(savedFont);
    if (savedBlur) setBlurIntensity(parseInt(savedBlur));
    if (savedGlow) setGlowIntensity(parseInt(savedGlow));
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setSettings({ theme: newTheme }); // Broadcast to global ThemeApplier
    localStorage.setItem("oceanexotic-theme", newTheme);
  };

  const setFont = (newFont: string) => {
    setFontState(newFont);
    setSettings({ font: newFont });
    localStorage.setItem("oceanexotic-font", newFont);
  };

  useEffect(() => {
    localStorage.setItem("oceanexotic-blur", blurIntensity.toString());
    localStorage.setItem("oceanexotic-glow", glowIntensity.toString());
    
    // Update CSS variables for intensity
    document.documentElement.style.setProperty('--glass-blur-factor', (blurIntensity / 100).toString());
    document.documentElement.style.setProperty('--glow-opacity-factor', (glowIntensity / 100).toString());
  }, [blurIntensity, glowIntensity]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      blurIntensity, 
      setBlurIntensity, 
      glowIntensity, 
      setGlowIntensity,
      font,
      setFont
    }}>
      <div className={`${theme} ${font}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
