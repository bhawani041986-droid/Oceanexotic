"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Truck, MapPin, Clock, CheckCircle2, Circle, Thermometer, Navigation } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map to prevent SSR issues with Leaflet
const PortBlairMap = dynamic(() => import("@/components/ui/PortBlairMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-secondary/50 rounded-2xl">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Loading Map...</p>
      </div>
    </div>
  ),
});

interface TrackingData {
  order_id: string;
  status: string;
  stage: string;
  stage_label: string;
  minutes_remaining: number;
  estimated_delivery_at: string;
  driver_location: { latitude: number; longitude: number } | null;
  driver_name: string | null;
  current_temp: number;
  delivery_area: string;
  last_updated: string;
  stages: Array<{ key: string; label: string; done: boolean }>;
}

interface DeliveryTrackingCardProps {
  orderId: string;
}

// Refresh interval: 20 seconds
const REFRESH_INTERVAL_MS = 20000;

function formatETA(minutes: number, status: string): string {
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  if (minutes <= 0) return "Arriving Soon";
  if (minutes < 5) return "Arriving Soon";
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m} min` : `${h} hour${h > 1 ? "s" : ""}`;
  }
  return `${minutes} min${minutes !== 1 ? "s" : ""}`;
}

function formatTime(iso: string): string {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "--";
  }
}

export default function DeliveryTrackingCard({ orderId }: DeliveryTrackingCardProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TrackingData = await res.json();
      setTrackingData(data);
      setError(null);
      setLastRefresh(new Date());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch (err) {
      setError("Unable to load live tracking. Retrying...");
      console.error("[DeliveryTrackingCard]", err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchTracking();
    intervalRef.current = setInterval(fetchTracking, REFRESH_INTERVAL_MS);

    // Countdown timer (visual indicator)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_MS / 1000 : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchTracking]);

  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-40 bg-primary/20 rounded animate-pulse" />
            <div className="h-2 w-24 bg-primary/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-2 w-full bg-primary/10 rounded animate-pulse" />
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className="rounded-[24px] border border-orange-500/20 bg-orange-500/5 p-6 flex items-center gap-4">
        <Truck className="w-6 h-6 text-orange-400 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-400">Tracking Unavailable</p>
          <p className="text-[10px] text-text-secondary mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!trackingData) return null;

  const isDelivered = trackingData.status === "delivered" || trackingData.status === "DELIVERED";
  const isCancelled = trackingData.status === "cancelled" || trackingData.status === "CANCELLED";
  
  // Support both old and new API formats
  const driverLoc = trackingData.driver_location || ((trackingData as any).fleet ? { latitude: (trackingData as any).fleet.lat, longitude: (trackingData as any).fleet.lng } : null);
  const showMap = !isDelivered && !isCancelled && driverLoc !== null;
  
  const etaLabel = (trackingData as any).eta ? ((trackingData as any).eta.isDelayed ? "Delayed" : "Arriving Soon") : formatETA(trackingData.minutes_remaining || 0, trackingData.status);
  const etaTime = (trackingData as any).eta ? (trackingData as any).eta.formatted : formatTime(trackingData.estimated_delivery_at);
  const stageLabel = trackingData.stage_label || ((trackingData as any).timeline && (trackingData as any).timeline.find((t: any) => t.status === trackingData.status)?.label) || trackingData.status;
  const driverName = trackingData.driver_name || ((trackingData as any).fleet?.agent);


  return (
    <div className="rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5 overflow-hidden">
      
      {/* ── Header ── */}
      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-[var(--c-shadow-glow)] ${
            isDelivered ? "bg-success/20 border-success/30 text-success" :
            isCancelled ? "bg-red-500/20 border-red-500/30 text-red-400" :
            "bg-primary/20 border-primary/30 text-primary animate-pulse"
          }`}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase italic tracking-tighter text-[var(--foreground)]">
              {isDelivered ? "Order Delivered" : isCancelled ? "Order Cancelled" : "Live Delivery Tracking"}
            </h3>
            <p className="text-[10px] font-medium text-text-secondary mt-0.5">
              {isDelivered
                ? "Your order has been successfully delivered."
                : isCancelled
                ? "This order was cancelled."
                : <>
                    Current Stage: <span className="font-bold text-[var(--foreground)]">{stageLabel}</span>
                    {driverName && (
                      <> • Rider: <span className="font-bold text-[var(--foreground)]">{driverName}</span></>
                    )}
                  </>
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Temperature chip */}
          <div className="bg-blue-500/10 px-3 py-1.5 border border-blue-500/30 rounded-xl flex items-center gap-2">
            <Thermometer className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {trackingData.current_temp || ((trackingData as any).fleet?.temp) || "-18.5"}°C Chilled
            </span>
          </div>

          {/* ETA Display */}
          {!isCancelled && (
            <div className="text-right">
              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Estimated Arrival</p>
              <p className={`text-sm font-black italic ${
                isDelivered ? "text-success" : "text-[var(--foreground)]"
              }`}>
                {etaLabel}
              </p>
              {!isDelivered && etaTime !== "--" && (
                <p className="text-[8px] text-text-secondary font-medium">By {etaTime} IST</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Stage Pipeline ── */}
      <div className="px-5 md:px-6 pb-4 overflow-x-auto">
        <div className="flex items-center min-w-max gap-0">
          {(trackingData.stages || (trackingData as any).timeline || []).map((stage: any, idx: number, arr: any[]) => {
            const key = stage.key || stage.status;
            const isActive = key === (trackingData.stage || trackingData.status);
            const isDone = stage.done !== undefined ? stage.done : stage.completed;
            return (
              <React.Fragment key={key}>
                <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-primary text-white shadow-[0_0_8px_rgba(14,165,233,0.6)]"
                      : isActive
                      ? "bg-primary/30 border-2 border-primary text-primary"
                      : "bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-text-secondary"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className={`w-3 h-3 ${isActive ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                  <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-wide text-center leading-tight ${
                    isDone ? "text-primary" : isActive ? "text-[var(--foreground)]" : "text-text-secondary/50"
                  }`}>
                    {stage.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`h-[2px] flex-1 min-w-[24px] mb-4 transition-all ${
                    (arr[idx + 1]?.done !== undefined ? arr[idx + 1]?.done : arr[idx + 1]?.completed) ? "bg-primary/60" : "bg-[var(--foreground)]/10"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Leaflet Map ── */}
      {showMap && (
        <div className="relative mx-4 md:mx-6 mb-5 rounded-[18px] overflow-hidden border border-primary/15 shadow-inner" style={{ height: "220px" }}>
          <PortBlairMap
            driverLat={driverLoc?.latitude}
            driverLng={driverLoc?.longitude}
            status={trackingData.status}
            className="w-full h-full"
          />
          {/* Map overlay label */}
          <div className="absolute top-3 left-3 bg-[#0a0f1a]/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 z-[1000]">
            <Navigation className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Map — Port Blair</span>
          </div>
        </div>
      )}

      {/* ── Footer: refresh indicator ── */}
      <div className="px-5 md:px-6 py-3 border-t border-[var(--foreground)]/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
          <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">
            Live • Refreshes in {countdown}s
          </span>
        </div>
        <button
          onClick={fetchTracking}
          className="text-[8px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
}
