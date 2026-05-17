"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import { CUSTOMER_THEMES } from "@/config/customerThemes";

export const CustomerThemeApplier = () => {
  const { customerTheme, customerAssets, fetchSettings } = useSettingsStore();
  const pathname = usePathname();
  const isCustomerPath = pathname.startsWith('/customer');

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // High-Authority Asset Injection (Favicon/Apple Icon)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateLink = (rel: string, href: string) => {
      if (!href) return;
      let link: HTMLLinkElement | null = document.querySelector(`link[rel*="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = href;
    };

    if (customerAssets.favicon) updateLink('icon', customerAssets.favicon);
    if (customerAssets.appleIcon) updateLink('apple-touch-icon', customerAssets.appleIcon);
  }, [customerAssets.favicon, customerAssets.appleIcon]);

  React.useEffect(() => {
    if (!isCustomerPath || typeof window === 'undefined') return;

    try {
      const root = window.document.documentElement;
      const theme = CUSTOMER_THEMES.find(t => t.id === customerTheme) || CUSTOMER_THEMES[0];

      if (!theme) return;

      // Apply Customer Variables
      root.style.setProperty('--c-primary', theme.colors.primary);
      root.style.setProperty('--c-primary-light', theme.colors.primaryLight);
      root.style.setProperty('--c-secondary', theme.colors.secondary);
      root.style.setProperty('--c-accent', theme.colors.accent);
      root.style.setProperty('--c-bg', theme.colors.bg);
      root.style.setProperty('--c-bg-alt', theme.colors.bgAlt);
      root.style.setProperty('--c-card', theme.colors.card);
      root.style.setProperty('--c-text-primary', theme.colors.textPrimary);
      root.style.setProperty('--c-text-secondary', theme.colors.textSecondary);

      // Apply Global Overrides to standard variables ONLY for customer pages
      root.style.setProperty('--primary', theme.colors.primary);
      root.style.setProperty('--primary-light', theme.colors.primaryLight);
      root.style.setProperty('--secondary', theme.colors.bgAlt);
      root.style.setProperty('--background', theme.colors.bg);
      root.style.setProperty('--card', theme.colors.card);
      root.style.setProperty('--foreground', theme.colors.textPrimary);
      root.style.setProperty('--muted-foreground', theme.colors.textSecondary);
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');

      // Apply Visuals
      root.style.setProperty('--c-radius-btn', theme.visuals.radiusBtn);
      root.style.setProperty('--c-radius-card', theme.visuals.radiusCard);
      root.style.setProperty('--c-shadow-glow', theme.visuals.shadowGlow);
      root.style.setProperty('--c-gradient-hero', theme.visuals.gradientHero);
      root.style.setProperty('--c-glass-opacity', theme.visuals.glassOpacity);
      root.style.setProperty('--c-glass-blur', theme.visuals.glassBlur);
      root.style.setProperty('--c-font-family', theme.fontFamily);

      // Synchronize UI Registry
      root.style.setProperty('--font-sans', theme.fontFamily);
      root.style.setProperty('--radius-button', theme.visuals.radiusBtn);
      root.style.setProperty('--radius-card', theme.visuals.radiusCard);
      root.style.setProperty('--shadow-glow', theme.visuals.shadowGlow);

      // Force Dark Sovereignty
      root.classList.add('customer-dark', 'dark');
      root.classList.remove('customer-light');
    } catch (error) {
      console.warn("Theme Application Failure (Silenced):", error);
    }

    return () => {
      if (typeof window === 'undefined') return;
      const root = window.document.documentElement;
      const variables = [
        '--primary', '--primary-light', '--secondary', '--background', 
        '--card', '--foreground', '--muted-foreground', '--border',
        '--font-sans', '--radius-button', '--radius-card', '--shadow-glow'
      ];
      variables.forEach(v => root.style.removeProperty(v));
    };
  }, [customerTheme, isCustomerPath]);

  return null;
};
