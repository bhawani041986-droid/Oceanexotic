"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  ChevronRight,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Port Blair areas autocomplete list
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

  // ── Area input autocomplete ──────────────────────────
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

  // ── Check by area name ───────────────────────────────
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

  // ── Check by GPS ─────────────────────────────────────
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

  // ── Notify me ────────────────────────────────────────
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
      setNotifySent(true); // optimistic
    }
  };

  if (compact) {
    // ── Compact version (for nav bar / sticky banner) ──
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

  // ── Full widget ──────────────────────────────────────
  return (
    <div className={cn(
      "relative w-full max-w-lg mx-auto rounded-2xl overflow-visible",
      "bg-[var(--c-bg)] border border-[var(--foreground)]/10 shadow-xl",
      className
    )}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[var(--foreground)]/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-[var(--c-text-primary)]">
            Check Delivery Availability
          </h3>
        </div>
        <p className="text-[10px] text-[var(--c-text-secondary)] font-medium">
          Enter your area in Port Blair to see if we deliver to you
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* GPS button */}
        <button
          onClick={checkByGPS}
          disabled={isGPSLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
            "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black",
            isGPSLoading && "opacity-60 cursor-not-allowed"
          )}
        >
          {isGPSLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Detecting Location…</>
          ) : (
            <><Navigation className="w-4 h-4" /> Use My Current Location</>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--foreground)]/10" />
          <span className="text-[9px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-[var(--foreground)]/10" />
        </div>

        {/* Manual area input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--c-text-secondary)]" />
              <input
                type="text"
                value={areaInput}
                onChange={(e) => handleAreaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkByArea()}
                placeholder="Type your area (e.g. Haddo, Aberdeen…)"
                className={cn(
                  "w-full pl-9 pr-3 h-11 rounded-xl border text-xs font-semibold",
                  "bg-[var(--c-bg)] border-[var(--foreground)]/10 text-[var(--c-text-primary)]",
                  "placeholder:text-[var(--c-text-secondary)] placeholder:font-normal",
                  "outline-none focus:border-primary transition-all"
                )}
              />
            </div>
            <button
              onClick={() => checkByArea()}
              disabled={isChecking || !areaInput.trim()}
              className={cn(
                "h-11 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                "bg-[var(--c-text-primary)] text-[var(--c-bg)] hover:bg-primary hover:text-black",
                (isChecking || !areaInput.trim()) && "opacity-40 cursor-not-allowed"
              )}
            >
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-12 mt-1 z-50 bg-[var(--c-bg)] border border-[var(--foreground)]/10 rounded-xl shadow-xl overflow-hidden"
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3 h-3 text-[var(--c-text-secondary)]" />
                    {s}, Port Blair
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Result card ─────────────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {result.deliverable ? (
                /* ── AVAILABLE ── */
                <div className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">
                        ✅ Delivery Available!
                      </p>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {result.distanceKm !== null && (
                      <div className="bg-white rounded-lg p-2.5 text-center border border-emerald-100">
                        <p className="text-lg font-black text-emerald-700">{result.distanceKm} km</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">from hub</p>
                      </div>
                    )}
                    {result.estimatedMinutes !== null && (
                      <div className="bg-white rounded-lg p-2.5 text-center border border-emerald-100">
                        <p className="text-lg font-black text-emerald-700">~{result.estimatedMinutes} min</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">delivery time</p>
                      </div>
                    )}
                  </div>

                  <a
                    href="/customer/products"
                    className={cn(
                      "flex items-center justify-center gap-2 w-full h-10 rounded-lg",
                      "bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all"
                    )}
                  >
                    Order Fresh Seafood Now <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                /* ── NOT AVAILABLE YET ── */
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-red-800 uppercase tracking-tight">
                        ❌ Not Available Yet
                      </p>
                      <p className="text-xs text-red-600 font-medium mt-0.5">
                        We're not in your area yet — but we're expanding soon!
                      </p>
                    </div>
                  </div>

                  {/* Notify me */}
                  {notifySent ? (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-bold text-emerald-700">
                        You're on the list! We'll notify you when we launch in your area.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Notify me when available:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={cn(
                            "flex-1 h-9 px-3 rounded-lg border text-xs font-medium",
                            "bg-white border-red-200 text-slate-700 placeholder:text-slate-300",
                            "outline-none focus:border-red-400 transition-all"
                          )}
                        />
                        <button
                          onClick={handleNotify}
                          disabled={!notifyEmail.includes("@")}
                          className="h-9 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-40 transition-all"
                        >
                          NOTIFY ME
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hub info footer */}
        <p className="text-[9px] text-center text-[var(--c-text-secondary)] font-medium">
          🏪 Delivery hub: Dollygunj, Shiv Colony, Sri Vijayapuram, Port Blair · Current radius: 8 km
        </p>
      </div>
    </div>
  );
}
