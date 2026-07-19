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
      await fetch("/api/newsletter", {
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
    <div className={cn(
      "w-full max-w-2xl mx-auto bg-gradient-to-b from-[var(--c-bg-alt)]/30 to-[var(--c-bg-alt)]/10 border border-[var(--foreground)]/10 rounded-2xl p-4 shadow-sm",
      className
    )}>
      {/* Search Input and GPS buttons container */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch relative">
        <div className="relative flex-1 flex items-center bg-[var(--c-bg)] border border-[var(--foreground)]/15 hover:border-[var(--foreground)]/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl transition-all h-11">
          <MapPin className="w-4 h-4 text-primary shrink-0 ml-3" />
          <input
            type="text"
            value={areaInput}
            onChange={(e) => handleAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkByArea()}
            placeholder="Enter your delivery area or address..."
            className="w-full pl-2 pr-8 text-xs font-bold bg-transparent text-[var(--c-text-primary)] placeholder-[var(--c-text-secondary)]/60 outline-none h-full"
          />
          {areaInput && (
            <button 
              onClick={() => { setAreaInput(""); setResult(null); }}
              className="absolute right-3 p-0.5 hover:text-primary transition-colors text-[var(--c-text-secondary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons Group */}
        <div className="flex gap-2 sm:shrink-0">
          <button
            onClick={() => checkByArea()}
            disabled={isChecking || !areaInput.trim()}
            className={cn(
              "flex-1 sm:flex-initial h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
              "bg-primary text-black hover:bg-primary/95 hover:shadow-glow-purple",
              (isChecking || !areaInput.trim()) && "opacity-40 cursor-not-allowed"
            )}
          >
            {isChecking ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Check"}
          </button>

          <button
            onClick={checkByGPS}
            disabled={isGPSLoading}
            className={cn(
              "h-11 px-4 rounded-xl border border-[var(--foreground)]/15 text-[var(--c-text-primary)] hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1.5 bg-[var(--c-bg)] font-semibold text-xs",
              isGPSLoading && "opacity-60 cursor-not-allowed"
            )}
            title="Use current GPS location"
          >
            {isGPSLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span className="hidden md:inline">Use Location</span>
          </button>
        </div>

        {/* Autocomplete dropdown dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--c-bg)] border border-[var(--foreground)]/10 rounded-xl shadow-xl overflow-hidden"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2 border-b border-[var(--foreground)]/5 last:border-b-0"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  {s}, Port Blair
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Dynamic Result Box ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-3"
          >
            {result.deliverable ? (
              /* Slim Success Row */
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-black font-black" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-300 uppercase tracking-tight flex items-center gap-1.5">
                      <span>✅ Delivery Available!</span>
                      {result.estimatedMinutes !== null && (
                        <span className="normal-case text-[11px] font-bold text-emerald-400">
                          (ETA: ~{result.estimatedMinutes} mins)
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-emerald-200/80 font-medium">
                      {result.message}
                    </p>
                  </div>
                </div>

                <a
                  href="/customer/products"
                  className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shrink-0"
                >
                  Order Now <ChevronRight className="w-3 h-3 text-black" />
                </a>
              </div>
            ) : (
              /* Slim Out of Area Alert */
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-red-500/5 border border-red-500/25 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-400 uppercase tracking-tight">
                      ❌ Not Available Yet
                    </p>
                    <p className="text-[11px] text-red-300/80 font-medium leading-relaxed">
                      We don't deliver to {areaInput || "this location"} yet, but we are expanding soon!
                    </p>
                  </div>
                </div>

                {/* Inline Notify Email field */}
                {notifySent ? (
                  <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    ✓ Notified
                  </span>
                ) : (
                  <div className="flex gap-1.5 items-center w-full md:w-auto mt-2 md:mt-0">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter email to notify"
                      className="flex-1 md:w-44 h-8 px-2.5 rounded-lg border border-red-500/20 text-xs font-semibold bg-[var(--c-bg)] text-[var(--c-text-primary)] outline-none focus:border-red-400"
                    />
                    <button
                      onClick={handleNotify}
                      disabled={!notifyEmail.includes("@")}
                      className="h-8 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-[9px] uppercase tracking-widest disabled:opacity-40 transition-all shrink-0"
                    >
                      Notify
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek inline info footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5 text-[9px] font-bold text-[var(--c-text-secondary)] uppercase tracking-wider">
        <span>📍 Sri Vijayapuram Hub</span>
        <span>Radius: 8 km</span>
      </div>
    </div>
  );
}
