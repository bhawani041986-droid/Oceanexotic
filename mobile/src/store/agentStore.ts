import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TacticalMood = "SENTINEL" | "MIDNIGHT" | "DAYLIGHT";

export interface MoodConfig {
  primary: string;
  glow: string;
  bg: string;
  cardBg: string;
  text: string;
  border: string;
  label: string;
}

export const MOODS: Record<TacticalMood, MoodConfig> = {
  SENTINEL: {
    primary: "#00D1FF", // Neon Cyan
    glow: "rgba(0, 209, 255, 0.5)",
    bg: "#020617", // slate-950
    cardBg: "rgba(15, 23, 42, 0.95)",
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.08)",
    label: "Neon Sentinel",
  },
  MIDNIGHT: {
    primary: "#EF4444", // Neon Crimson Red
    glow: "rgba(239, 68, 68, 0.5)",
    bg: "#0f0101", // Midnight Black-Red
    cardBg: "rgba(24, 0, 0, 0.95)",
    text: "#FFFFFF",
    border: "rgba(239, 68, 68, 0.12)",
    label: "Midnight Stealth",
  },
  DAYLIGHT: {
    primary: "#F97316", // Tactical Orange
    glow: "rgba(249, 115, 22, 0.1)",
    bg: "#FFFFFF", // Light White
    cardBg: "#F8FAFC", // Slate-50
    text: "#020617", // Slate-950
    border: "#E2E8F0", // Slate-200
    label: "Daylight Command",
  },
};

interface AgentState {
  currentMood: TacticalMood;
  setMood: (mood: TacticalMood) => void;
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      currentMood: "SENTINEL",
      setMood: (mood) => set({ currentMood: mood }),
      activeMissionId: null,
      setActiveMissionId: (id) => set({ activeMissionId: id }),
    }),
    {
      name: "oceanexotic-agent",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
