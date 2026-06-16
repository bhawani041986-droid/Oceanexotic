"use client";

import React, { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: any = null;

    const startScanner = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Dynamically import to avoid SSR issues
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!containerRef.current) return;

        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setError("No camera found on this device.");
          setIsLoading(false);
          return;
        }

        // Prefer back/environment camera on mobile
        const cameraId =
          cameras.find((c: any) =>
            c.label.toLowerCase().includes("back") ||
            c.label.toLowerCase().includes("rear") ||
            c.label.toLowerCase().includes("environment")
          )?.id || cameras[cameras.length - 1].id;

        await html5QrCode.start(
          { deviceId: { exact: cameraId } },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            // QR scanned successfully
            onScan(decodedText);
            html5QrCode.stop().catch(() => {});
          },
          () => {
            // scan failure (every frame) — ignore
          }
        );

        setIsLoading(false);
      } catch (err: any) {
        if (err?.message?.includes("Permission")) {
          setError("Camera permission denied. Please allow camera access in your browser settings.");
        } else {
          setError(`Camera error: ${err?.message || "Unknown error"}`);
        }
        setIsLoading(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
    >
      <div
        className="w-full sm:max-w-sm bg-slate-950 border border-slate-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              📷 Scan Customer QR
            </h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
              Point camera at customer's delivery QR code
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Scanner viewport */}
        <div className="relative bg-black" style={{ minHeight: "320px" }}>
          {isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-8 h-8 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Initializing Camera...
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 z-10">
              <div className="text-4xl">📵</div>
              <p className="text-[10px] text-red-400 text-center uppercase tracking-widest leading-relaxed">
                {error}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-slate-800 text-slate-300 text-[9px] uppercase tracking-widest rounded-lg hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          )}

          {/* QR reader div — html5-qrcode mounts into this */}
          <div
            id="qr-reader"
            ref={containerRef}
            className="w-full"
            style={{ opacity: error ? 0 : 1 }}
          />

          {/* Scanning overlay corners */}
          {!error && !isLoading && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[250px] h-[250px]">
                {/* Corner markers */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 border-emerald-400 ${cls}`}
                  />
                ))}
                {/* Scanning line */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-emerald-400/60"
                  style={{
                    animation: "scanline 2s linear infinite",
                    top: "50%",
                    boxShadow: "0 0 8px rgba(52,211,153,0.8)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950">
          <p className="text-[8px] text-center text-slate-600 uppercase tracking-widest">
            Ask customer to show QR code from their order confirmation page
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        #qr-reader video {
          width: 100% !important;
          border-radius: 0 !important;
        }
        #qr-reader__scan_region {
          border: none !important;
          background: transparent !important;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
