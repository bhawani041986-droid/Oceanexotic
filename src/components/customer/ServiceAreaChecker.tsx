"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Loader2,
  Bell,
  ChevronRight,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PORT_BLAIR_AREAS = [
  "Dollygunj", "Shiv Colony", "Sri Vijayapuram", "Phoenix Bay", "Aberdeen Bazaar",
  "Goalghar", "Haddo", "Atlanta Point", "Junglighat", "Bathubasti",
  "Dairy Farm", "Birdline", "Prothrapur", "Brookshabad", "Garacharma",
  "Mannarghat", "South Andaman", "Bambooflat", "Chatham", "Minnie Bay",
  "Corbyn's Cove", "Lamba Line", "Teal Island", "Prem Nagar",
];

type CheckResult = {
  deliverable: boolean;
  distanceKm: number | null;
  estimatedMinutes: number | null;
  message: string;
  method: "gps" | "area_name";
};

interface ServiceAreaCheckerProps {
  className?: string;
  compact?: boolean;
}

export function ServiceAreaChecker({ className, compact = false }: ServiceAreaCheckerProps) {
  const [areaInput, setAreaInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAreaInput = (val: string) => {
    setAreaInput(val);
    setResult(null);
    if (val.length > 1) {
      const matches = PORT_BLAIR_AREAS.filter((a) =>
        a.toLowerCase().startsWith(val.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (area: string) => {
    setAreaInput(area);
    setSuggestions([]);
    checkByArea(area);
  };

  const checkByArea = async (area: string = areaInput) => {
    if (!area.trim()) return;
    setIsChecking(true);
    setResult(null);
    setSuggestions([]);
    try {
      const res = await fetch(
        `/api/system/check-area?area=${encodeURIComponent(area)}`
      );
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        deliverable: false,
        distanceKm: null,
        estimatedMinutes: null,
        message: "Could not check area. Please try again.",
        method: "area_name",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkByGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGPSLoading(true);
    setResult(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(
            `/api/system/check-area?lat=${lat}&lng=${lng}`
          );
          const data = await res.json();
          setResult(data);
        } catch {
          setResult({
            deliverable: false,
            distanceKm: null,
            estimatedMinutes: null,
            message: "Location check failed. Try entering your area name.",
            method: "gps",
          });
        } finally {
          setIsGPSLoading(false);
        }
      },
      () => {
        setIsGPSLoading(false);
        setResult({
          deliverable: false,
          distanceKm: null,
          estimatedMinutes: null,
          message: "Location access denied. Please type your area below.",
          method: "gps",
        });
      },
      { timeout: 10000 }
    );
  };

  const handleNotify = async () => {
    if (!notifyEmail.includes("@")) return;
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: notifyEmail,
          source: "service-area-checker",
          area: areaInput,
        }),
      });
      setNotifySent(true);
    } catch {
      setNotifySent(true);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <button
          onClick={checkByGPS}
          className="text-xs font-bold text-[var(--c-text-primary)] hover:text-primary transition-colors"
          disabled={isGPSLoading}
        >
          {isGPSLoading ? "Checking…" : "Check delivery to your location"}
        </button>
        {result && (
          <span className={cn("text-xs font-black px-2 py-0.5 rounded-full",
            result.deliverable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700")}>
            {result.deliverable ? "✅ Available" : "❌ Not yet"}
          </span>
        )}
      </div>
    );
  }

  // ── Redesigned Slim & Premium Amazon-Style Widget ──
  return (
    <div className={cn("w-full max-w-md mx-auto relative", className)}>
      {/* 1. Amazon-style Location selector Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 border border-transparent hover:border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 rounded-lg transition-all text-left w-full select-none cursor-pointer focus:outline-none group"
      >
        <MapPin className="w-4 h-4 text-primary shrink-0 transition-transform group-hover:scale-105" />
        <div className="flex flex-col leading-tight">
          <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">
            {result?.deliverable 
              ? `Delivering to ${areaInput}` 
              : "Delivering to Port Blair"}
          </span>
          <span className="text-[10px] font-black text-[var(--c-text-primary)] uppercase tracking-widest flex items-center gap-0.5 whitespace-nowrap">
            {result?.deliverable ? "Change location" : "Update location"} 
            <ChevronRight className={cn("w-2.5 h-2.5 text-primary transition-transform", isOpen && "rotate-90")} />
          </span>
        </div>
      </button>

      {/* 2. Interactive Input Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full left-0 right-0 xl:left-auto xl:right-0 xl:w-[320px] mt-2 z-[100] bg-[var(--c-card)]/95 backdrop-blur-3xl border border-[var(--foreground)]/10 rounded-2xl p-4 shadow-2xl space-y-3"
          >
            {/* Header label & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--foreground)]/5">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                Choose Location
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-[var(--foreground)] transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Row */}
            <div className="flex gap-2 relative">
              <div className="relative flex-1 flex items-center bg-[var(--c-bg)] border border-[var(--foreground)]/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl transition-all h-10">
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => handleAreaInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkByArea()}
                  placeholder="Enter area or address..."
                  className="w-full px-3 text-xs font-bold bg-transparent text-[var(--c-text-primary)] placeholder-[var(--c-text-secondary)]/50 outline-none h-full"
                />
                {areaInput && (
                  <button 
                    onClick={() => { setAreaInput(""); setResult(null); }}
                    className="absolute right-2.5 p-0.5 hover:text-primary transition-colors text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => checkByArea()}
                disabled={isChecking || !areaInput.trim()}
                className={cn(
                  "h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1 bg-primary text-black hover:bg-primary/95",
                  (isChecking || !areaInput.trim()) && "opacity-40 cursor-not-allowed"
                )}
              >
                {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
              </button>

              <button
                onClick={checkByGPS}
                disabled={isGPSLoading}
                className={cn(
                  "h-10 px-3 rounded-xl border border-[var(--foreground)]/15 text-[var(--c-text-primary)] hover:border-primary/45 hover:text-primary transition-all flex items-center justify-center bg-[var(--c-bg)]",
                  isGPSLoading && "opacity-60 cursor-not-allowed"
                )}
                title="Use GPS coordinates"
              >
                {isGPSLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>

              {/* Suggestions List */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1 z-[110] bg-[var(--c-bg)] border border-[var(--foreground)]/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2 border-b border-[var(--foreground)]/5 last:border-b-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{s}, Port Blair</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Zones Selector */}
            <div className="space-y-1.5 pt-1.5 border-t border-[var(--foreground)]/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">
                Active Delivery Zones:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Atamphad", "Bhatubasti", "Dollygunj", "Minibay"].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => selectSuggestion(zone)}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[9px] font-black uppercase tracking-wider text-[var(--c-text-primary)] hover:border-primary/45 hover:text-primary transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    🚚 <span>{zone}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="pt-1"
                >
                  {result.deliverable ? (
                    <div className="flex flex-col gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>✓ Available</span>
                          {result.estimatedMinutes !== null && (
                            <span className="normal-case text-[10px] font-bold text-emerald-500">
                              (ETA: ~{result.estimatedMinutes} mins)
                            </span>
                          )}
                        </span>
                        <a
                          href="/customer/products"
                          className="h-6 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center shrink-0"
                        >
                          Order Now
                        </a>
                      </div>
                      <p className="text-[10px] text-emerald-200/80 font-medium">
                        {result.message}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-2.5 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                        ✗ Coming Soon
                      </span>
                      <p className="text-[10px] text-red-300/80 font-medium">
                        We don't deliver to {areaInput || "this location"} yet. Join waitlist:
                      </p>
                      {notifySent ? (
                        <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded-lg text-center">
                          ✓ Notified
                        </span>
                      ) : (
                        <div className="flex gap-1.5 items-center w-full">
                          <input
                            type="email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            placeholder="Email address"
                            className="flex-1 h-7 px-2 rounded-lg border border-red-500/20 text-xs font-medium bg-[var(--c-bg)] text-[var(--c-text-primary)] outline-none"
                          />
                          <button
                            onClick={handleNotify}
                            disabled={!notifyEmail.includes("@")}
                            className="h-7 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-[8px] uppercase tracking-widest disabled:opacity-40 transition-all shrink-0"
                          >
                            Join
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer metadata */}
            <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>📍 Sri Vijayapuram Hub</span>
              <span>Radius: 8 km</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
