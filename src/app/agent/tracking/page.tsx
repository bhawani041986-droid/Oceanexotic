"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Navigation as NavigationIcon,
  MapPin,
  Phone,
  User,
  CheckCircle,
  Clock,
  Droplets,
  Zap,
  Navigation,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const PortBlairMap = dynamic(() => import("@/components/ui/PortBlairMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/40">
      <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

const QRScanner = dynamic(() => import("@/components/ui/QRScanner"), {
  ssr: false,
});

enum MissionState {
  NOT_STARTED = "NOT_STARTED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  DELIVERED = "DELIVERED",
}

function AgentTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "ORD-9982";
  const { toast } = useToast();
  const urlOtp = searchParams.get("otp");
  const autoMode = searchParams.get("auto") === "true";

  const [coords, setCoords] = React.useState({ lat: 11.667, lng: 92.7359 });
  const [missionState, setMissionState] = React.useState<MissionState>(MissionState.NOT_STARTED);
  const [isSyncing, setIsSyncing] = React.useState(true);
  const [orderInfo, setOrderInfo] = React.useState<any>(null);
  const [mapMode, setMapMode] = React.useState<"tactical" | "satellite">("tactical");

  const [otpInput, setOtpInput] = React.useState("");
  const [verificationError, setVerificationError] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [recenterTrigger, setRecenterTrigger] = React.useState(0);

  // ─── OTP Helpers ────────────────────────────────────────────────────────────
  const getExpectedOtp = () => {
    const cleanId = String(orderId || "123");
    const numericId = parseInt(cleanId.replace(/[^0-9]/g, "")) || 123;
    return String(((numericId * 997 + 12345) % 900000) + 100000);
  };

  const verifyOtp = async (code: string) => {
    const expected = getExpectedOtp();
    if (code.trim() === expected) {
      setVerificationError("");
      await handleStateTransition(MissionState.DELIVERED);
      try {
        const dbId = orderInfo?.original_id || String(orderId).replace(/\D/g, "");
        await fetch("/api/seller/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            order_id: dbId, 
            status: "DELIVERED",
            delivery_agent_name: "Web Agent"
          }),
        });
        toast("Delivery Confirmed ✅ Registry Updated", "success");
      } catch (err) {
        console.error("DB update error:", err);
      }
    } else {
      setVerificationError("Invalid OTP. Please ask customer to show their QR code.");
    }
  };

  // Handle real QR camera scan
  const handleQRScan = async (scannedText: string) => {
    setShowScanner(false);
    setIsVerifying(true);
    // QR may contain just OTP digits, or a URL like /customer/orders/ORD-28?otp=XXXXXX
    const otpMatch = scannedText.match(/(\d{6})/);
    const scannedOtp = otpMatch ? otpMatch[1] : scannedText.trim();
    setOtpInput(scannedOtp);
    if (missionState !== MissionState.ARRIVED && missionState !== MissionState.DELIVERED) {
      await handleStateTransition(MissionState.ARRIVED);
    }
    await verifyOtp(scannedOtp);
    setIsVerifying(false);
  };

  // ─── URL OTP Auto-verify ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (urlOtp && missionState === MissionState.ARRIVED) {
      setOtpInput(urlOtp);
      verifyOtp(urlOtp);
    }
  }, [urlOtp, missionState]);

  // Auto-advance to ARRIVED when ?auto=true
  React.useEffect(() => {
    if (autoMode && missionState === MissionState.NOT_STARTED) {
      const t = setTimeout(() => handleStateTransition(MissionState.ARRIVED), 800);
      return () => clearTimeout(t);
    }
  }, [autoMode]);

  // ─── API Calls ───────────────────────────────────────────────────────────────
  const fetchOrderDetails = async () => {
    try {
      setOrderInfo({
        customer: "Vikram Sharma",
        phone: "+91 98765 43210",
        address: "Marine Villa, Sector 4, Port Blair, Andaman & Nicobar Islands",
        items: [
          { name: "Premium Bluefin Saku", qty: "2kg" },
          { name: "Fresh Atlantic Salmon", qty: "1.5kg" },
        ],
      });
    } catch (err) {}
  };

  const broadcastTelemetry = async (newState?: MissionState) => {
    try {
      const stateToBroadcast = newState || missionState;
      const res = await fetch("/api/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          lat: coords.lat,
          lng: coords.lng,
          status: stateToBroadcast,
          log_entry: {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: stateToBroadcast.replace("_", " "),
            location: "Current Position",
            active: true,
          },
        }),
      });
      if (res.ok) setIsSyncing(false);
    } catch (err) {}
  };

  const handleStateTransition = async (nextState: MissionState) => {
    setMissionState(nextState);
    await broadcastTelemetry(nextState);
    toast(`Update: ${nextState.replace("_", " ")}`, "success");
  };

  // ─── Real-Time GPS Tracking ──────────────────────────────────────────────────
  const PORT_BLAIR_DESTINATION = { lat: 11.6234, lng: 92.7265 };

  React.useEffect(() => {
    fetchOrderDetails();
    let watchId: number;

    if (missionState === MissionState.IN_TRANSIT) {
      const { lat: targetLat, lng: targetLng } = PORT_BLAIR_DESTINATION;
      
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLat = position.coords.latitude;
            const newLng = position.coords.longitude;
            setCoords({ lat: newLat, lng: newLng });

            const latDiff = targetLat - newLat;
            const lngDiff = targetLng - newLng;
            const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
            
            // Auto-arrive if within close proximity
            if (distance < 0.0005) {
              handleStateTransition(MissionState.ARRIVED);
              navigator.geolocation.clearWatch(watchId);
            }
          },
          (error) => {
            console.error("GPS Watch Error:", error);
            toast("GPS Signal Lost. Check permissions.", "error");
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        toast("Geolocation is not supported by your browser", "error");
      }

      return () => {
        if (watchId !== undefined && "geolocation" in navigator) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [missionState]);

  React.useEffect(() => {
    broadcastTelemetry();
  }, [coords]);

  const toggleMapMode = () => toast("Map mode: OpenStreetMap (no API key required)", "success");
  const recenterMap = () => {
    setRecenterTrigger(prev => prev + 1);
    toast("Recalibrating Navigation Node", "success");
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-32 overflow-x-hidden"
      style={{ backgroundColor: "var(--agent-bg)", color: "var(--agent-text)" }}
    >
      {/* 1. MAP */}
      <div className="p-2 lg:p-4">
        <Card
          className="h-[40vh] lg:h-[60vh] relative overflow-hidden border-2 rounded-[12px] lg:rounded-[20px] transition-all duration-500 shadow-lg"
          style={{ backgroundColor: "var(--agent-card-bg)", borderColor: "var(--agent-border)" }}
        >
          <PortBlairMap
            driverLat={coords.lat}
            driverLng={coords.lng}
            deliveryLat={11.6234}
            deliveryLng={92.7265}
            status={missionState === MissionState.DELIVERED ? "delivered" : "out_for_delivery"}
            recenterTrigger={recenterTrigger}
            className="w-full h-full"
          />

          {/* Radar sweep */}
          <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
            <div
              className="w-full h-[1px] opacity-40"
              style={{
                backgroundColor: "var(--agent-primary)",
                boxShadow: "0 0 20px var(--agent-primary)",
                animation: "radar-sweep 5s linear infinite",
              }}
            />
          </div>
          <style>{`
            @keyframes radar-sweep { 0%{transform:translateY(-100%)} 100%{transform:translateY(500%)} }
            .leaflet-container { background:#020617 !important; }
          `}</style>

          {/* HUD overlays */}
          <div className="absolute top-3 left-3 z-[1000] space-y-1.5 pointer-events-none">
            <div
              className="relative -skew-x-12 px-3 py-1 shadow-lg"
              style={{ backgroundColor: "var(--agent-primary)" }}
            >
              <span className="block skew-x-12 text-[9px] font-black uppercase tracking-widest text-white italic">
                Node: Sentinel-01
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-2 py-1 backdrop-blur-md border -skew-x-12"
              style={{ backgroundColor: "var(--agent-bg)CC", borderColor: "var(--agent-primary)4D" }}
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 skew-x-12",
                  isSyncing ? "animate-pulse bg-slate-500" : "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                )}
              />
              <span
                className="skew-x-12 text-[8px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--agent-primary)" }}
              >
                Telemetry: {isSyncing ? "Lock" : "Live"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5">
            <button
              onClick={toggleMapMode}
              className="w-9 h-9 border flex items-center justify-center -skew-x-12"
              style={{ backgroundColor: "var(--agent-bg)E6", borderColor: "var(--agent-primary)4D", color: "var(--agent-primary)" }}
            >
              <Layers className="w-4 h-4 skew-x-12" />
            </button>
            <button
              onClick={recenterMap}
              className="w-9 h-9 border flex items-center justify-center -skew-x-12"
              style={{ backgroundColor: "var(--agent-bg)E6", borderColor: "var(--agent-primary)4D", color: "var(--agent-primary)" }}
            >
              <NavigationIcon className="w-4 h-4 skew-x-12" />
            </button>
          </div>
        </Card>
      </div>

      {/* 2. MISSION HUB */}
      <div className="px-2 lg:px-4 -mt-2 relative z-10">
        <Card
          className="relative overflow-hidden border-x-2 border-b-2 rounded-[8px] p-0 shadow-2xl"
          style={{ backgroundColor: "var(--agent-card-bg)", borderColor: "var(--agent-border)" }}
        >
          {/* Status bar */}
          <div
            className="flex items-center justify-between border-b px-4 py-2"
            style={{ backgroundColor: "var(--agent-text)0D", borderColor: "var(--agent-border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="relative -skew-x-12 p-2 border"
                style={{ backgroundColor: "var(--agent-primary)1A", borderColor: "var(--agent-primary)33" }}
              >
                <Cpu className="w-4 h-4 animate-pulse skew-x-12" style={{ color: "var(--agent-primary)" }} />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase italic tracking-widest leading-none" style={{ color: "var(--agent-text)" }}>
                  Mission Hub
                </h1>
                <p className="text-[7px] font-bold uppercase tracking-[0.3em] mt-1 opacity-40" style={{ color: "var(--agent-text)" }}>
                  Ref: {orderId}
                </p>
              </div>
            </div>
            <div
              className="relative -skew-x-12 border px-3 py-1"
              style={{ backgroundColor: "var(--agent-primary)0D", borderColor: "var(--agent-primary)4D" }}
            >
              <span className="block skew-x-12 text-[9px] font-black uppercase tracking-[0.1em]" style={{ color: "var(--agent-primary)" }}>
                {missionState.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="p-3 lg:p-5 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative overflow-hidden border p-2" style={{ backgroundColor: "var(--agent-text)05", borderColor: "var(--agent-border)" }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" style={{ color: "var(--agent-primary)" }} />
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-40" style={{ color: "var(--agent-text)" }}>ETA</span>
                </div>
                <p className="text-lg font-black italic mt-0.5" style={{ color: "var(--agent-text)" }}>12 MINS</p>
              </div>
              <div className="relative overflow-hidden border p-2" style={{ backgroundColor: "var(--agent-text)05", borderColor: "var(--agent-border)" }}>
                <div className="flex items-center gap-2">
                  <Droplets className="w-3 h-3 text-emerald-400" />
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-40" style={{ color: "var(--agent-text)" }}>Cold Chain</span>
                </div>
                <p className="text-lg font-black italic text-emerald-400 mt-0.5">-22.4°C</p>
              </div>
            </div>

            {/* Customer info */}
            <div className="border p-3 space-y-2 relative" style={{ backgroundColor: "var(--agent-text)08", borderColor: "var(--agent-border)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--agent-primary)1A" }}>
                    <User className="w-3 h-3" style={{ color: "var(--agent-primary)" }} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-tight truncate" style={{ color: "var(--agent-text)" }}>
                    {orderInfo?.customer || "Syncing..."}
                  </p>
                </div>
                <Button variant="ghost" className="w-full sm:w-auto h-7 px-3 text-emerald-400 hover:bg-emerald-500 hover:text-white -skew-x-12 text-[8px] font-black uppercase shrink-0" style={{ backgroundColor: "#10B9811A" }}>
                  <Phone className="w-3 h-3 skew-x-12 mr-1" /> Call
                </Button>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: "var(--agent-border)" }}>
                <MapPin className="w-3 h-3 mt-0.5" style={{ color: "var(--agent-primary)" }} />
                <p className="text-[9px] font-bold leading-relaxed uppercase opacity-60" style={{ color: "var(--agent-text)" }}>
                  {orderInfo?.address || "Acquiring coordinates..."}
                </p>
              </div>
            </div>

            {/* Cargo */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3" style={{ backgroundColor: "var(--agent-primary)" }} />
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: "var(--agent-text)" }}>Cargo Manifest</h3>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {(orderInfo?.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border px-3 py-1.5 -skew-x-6" style={{ backgroundColor: "var(--agent-text)05", borderColor: "var(--agent-border)" }}>
                    <div className="flex items-center gap-2 skew-x-6">
                      <Zap className="w-2.5 h-2.5 opacity-40" style={{ color: "var(--agent-primary)" }} />
                      <span className="text-[10px] font-bold opacity-80" style={{ color: "var(--agent-text)" }}>{item.name}</span>
                    </div>
                    <span className="skew-x-6 text-[9px] font-black" style={{ color: "var(--agent-primary)" }}>{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── COMMAND ACTIONS ── */}
            <div className="pt-2 space-y-3">

              {/* NOT_STARTED → start journey */}
              {missionState === MissionState.NOT_STARTED && (
                <button
                  onClick={() => handleStateTransition(MissionState.IN_TRANSIT)}
                  className="w-full h-12 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all shadow-lg hover:opacity-90"
                  style={{ backgroundColor: "var(--agent-primary)", boxShadow: "0 4px 15px var(--agent-glow)" }}
                >
                  <NavigationIcon className="w-4 h-4 skew-x-12" />
                  <span className="skew-x-12">Initialize Journey</span>
                </button>
              )}

              {/* IN_TRANSIT → mark arrived */}
              {missionState === MissionState.IN_TRANSIT && (
                <button
                  onClick={() => handleStateTransition(MissionState.ARRIVED)}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all shadow-lg"
                  style={{ boxShadow: "0 4px 15px rgba(16,185,129,0.4)" }}
                >
                  <MapPin className="w-4 h-4 skew-x-12" />
                  <span className="skew-x-12">Arrived at Drop-Off</span>
                </button>
              )}

              {/* ARRIVED → scan QR or enter OTP */}
              {missionState === MissionState.ARRIVED && (
                <div className="space-y-3 border border-[var(--agent-border)] p-4 rounded-xl bg-slate-950/40 text-left">

                  {/* PRIMARY: Real camera scan */}
                  <button
                    onClick={() => setShowScanner(true)}
                    disabled={isVerifying}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 rounded-lg transition-all shadow-lg"
                    style={{ boxShadow: "0 4px 15px rgba(16,185,129,0.35)" }}
                  >
                    {isVerifying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Verifying OTP...
                      </>
                    ) : (
                      <>📷 Scan Customer QR Code</>
                    )}
                  </button>
                  <p className="text-center text-[8px] text-slate-500 uppercase tracking-widest">
                    Point camera at customer's delivery QR code
                  </p>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-[8px] text-slate-600 uppercase tracking-widest whitespace-nowrap">or enter OTP manually</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* FALLBACK: Manual OTP */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/[^0-9]/g, ""));
                        setVerificationError("");
                      }}
                      placeholder="ENTER 6-DIGIT OTP"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg h-11 px-4 text-center font-bold tracking-[0.3em] text-base focus:outline-none focus:border-emerald-600 transition-colors placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-medium placeholder:text-[10px]"
                    />
                    {verificationError && (
                      <p className="text-red-400 text-[8px] font-bold text-center uppercase tracking-widest animate-pulse">
                        ⚠️ {verificationError}
                      </p>
                    )}
                    <button
                      onClick={() => verifyOtp(otpInput)}
                      disabled={otpInput.length !== 6 || isVerifying}
                      className="w-full h-10 text-white font-black uppercase tracking-[0.2em] italic text-[10px] flex items-center justify-center gap-2 -skew-x-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--agent-primary)", boxShadow: "0 4px 15px var(--agent-glow)" }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 skew-x-12" />
                      <span className="skew-x-12">Verify & Confirm Delivery</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DELIVERED */}
              {missionState === MissionState.DELIVERED && (
                <div
                  className="p-4 flex items-center gap-4 rounded-xl border"
                  style={{ backgroundColor: "#10B9811A", borderColor: "#10B98133" }}
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Mission Accomplished</p>
                    <p className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">
                      Delivery confirmed • Registry updated
                    </p>
                  </div>
                </div>
              )}

              {/* Quick scan shortcut — shown on NOT_STARTED and IN_TRANSIT states */}
              {(missionState === MissionState.NOT_STARTED || missionState === MissionState.IN_TRANSIT) && (
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={isVerifying}
                  className="w-full h-9 bg-emerald-950/40 hover:bg-emerald-950 text-emerald-600 hover:text-emerald-400 text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-900/50 hover:border-emerald-700 rounded-lg transition-all disabled:opacity-40"
                >
                  📷 Quick Scan &amp; Confirm Delivery
                </button>
              )}

            </div>
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner isOpen={showScanner} onScan={handleQRScan} onClose={() => setShowScanner(false)} />
    </div>
  );
}

export default function AgentTrackingControl() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--agent-bg)" }}>
          <Navigation className="w-12 h-12 animate-bounce" style={{ color: "var(--agent-primary)" }} />
          <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-40" style={{ color: "var(--agent-primary)" }}>
            Acquiring Tactical Vector...
          </p>
        </div>
      }
    >
      <AgentTrackingContent />
    </Suspense>
  );
}
