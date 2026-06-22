"use client";
import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface AtmosphericGlowProps {
  intensityMultiplier?: number;
  position?: "default" | "center";
}

export function AtmosphericGlow({ 
  intensityMultiplier = 1,
  position = "default" 
}: AtmosphericGlowProps) {
  const settings = useSettingsStore();
  const baseOpacity = (settings.atmosphericGlow || 15) / 100;
  
  const positionClass = position === "center" 
    ? "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"
    : "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] md:bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]";

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${positionClass}`}
      style={{ opacity: baseOpacity * intensityMultiplier }}
    />
  );
}
