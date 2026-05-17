import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, RADII, FONTS } from './tokens';

type ThemeType = keyof typeof THEMES;

interface ThemeContextType {
  theme: typeof THEMES.oceanNeon;
  currentThemeName: ThemeType;
  setTheme: (name: ThemeType) => void;
  radii: typeof RADII;
  fonts: typeof FONTS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeType>('oceanNeon');

  const value = {
    theme: THEMES[themeName],
    currentThemeName: themeName,
    setTheme: setThemeName,
    radii: RADII,
    fonts: FONTS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
