"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const AppSplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasSeenSplash = sessionStorage.getItem("oceanexotic-splash-seen");
    if (!hasSeenSplash) {
      setVisible(true);
      // Mark as seen
      sessionStorage.setItem("oceanexotic-splash-seen", "true");

      // Start fade out after 2.5s
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, 2500);

      // Unmount after 3.1s (2.5s + 600ms transition)
      const unmountTimer = setTimeout(() => {
        setVisible(false);
      }, 3100);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070714] select-none pointer-events-none transition-opacity duration-700 ease-out",
        fadingOut ? "opacity-0" : "opacity-100 pointer-events-auto"
      )}
    >
      {/* Background Neon Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Styled JSX for Premium Animations */}
      <style jsx>{`
        @keyframes drawWave {
          0% {
            stroke-dasharray: 0 1000;
            stroke-dashoffset: 0;
            filter: drop-shadow(0 0 2px #00d1ff);
          }
          50% {
            filter: drop-shadow(0 0 12px #00d1ff) drop-shadow(0 0 20px #f0abfc);
          }
          100% {
            stroke-dasharray: 800 1000;
            stroke-dashoffset: 0;
            filter: drop-shadow(0 0 6px #00d1ff);
          }
        }
        @keyframes drawIcon {
          0% {
            stroke-dasharray: 0 1500;
            fill: rgba(0, 209, 255, 0);
          }
          50% {
            stroke-dasharray: 750 1500;
            fill: rgba(0, 209, 255, 0.1);
          }
          100% {
            stroke-dasharray: 1500 1500;
            fill: rgba(0, 209, 255, 1);
          }
        }
        @keyframes textExpand {
          0% {
            opacity: 0;
            letter-spacing: -0.1em;
            transform: scale(0.95);
          }
          30% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            letter-spacing: -0.06em;
            transform: scale(1);
          }
        }
        @keyframes subtitleFade {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          60% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes drawBar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        .smile-curve {
          stroke-dasharray: 0 1000;
          animation: drawWave 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.6s;
        }

        .icon-path {
          stroke-dasharray: 0 1500;
          animation: drawIcon 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .text-brand {
          animation: textExpand 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center;
        }

        .text-sub {
          animation: subtitleFade 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .scanline-effect {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(0, 209, 255, 0.03) 10%,
            rgba(255, 255, 255, 0) 20%
          );
          animation: scanline 6s linear infinite;
        }
      `}</style>

      {/* Centered Animated Logo Canvas */}
      <div className="relative z-10 w-full max-w-[500px] px-6 flex flex-col items-center">
        <svg
          viewBox="0 0 800 300"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <defs>
            <linearGradient id="smileGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D1FF" />
              <stop offset="50%" stopColor="#F0ABFC" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D1FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <mask id="splashMask">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <text
                x="50"
                y="52"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                fontSize="24"
                fontWeight="900"
                fontFamily="Inter, sans-serif"
                fontStyle="italic"
                style={{ letterSpacing: "-1px" }}
              >
                OX
              </text>
              <line x1="38" y1="44" x2="15" y2="44" stroke="black" strokeWidth="2.5" />
              <line x1="62" y1="58" x2="88" y2="58" stroke="black" strokeWidth="2.5" />
              <circle cx="82" cy="48" r="4" fill="black" />
            </mask>
          </defs>

          {/* 1. Styled Icon (Swordfish/Tuna Symbol) */}
          <g transform="translate(350, 20) scale(1.4)">
            <path
              className="icon-path"
              fill="url(#iconGradient)"
              stroke="#00D1FF"
              strokeWidth="1.5"
              d="M50 20 C35 20 20 30 15 50 L5 30 L5 70 L15 50 C20 70 35 80 50 80 C70 80 85 70 90 50 C85 30 70 20 50 20 Z M50 20 C55 10 65 5 75 5 C65 5 55 10 50 20 Z M50 80 C55 90 65 95 75 95 C65 95 55 90 50 80 Z"
              mask="url(#splashMask)"
            />
            <circle cx="82" cy="48" r="3" fill="#FFFFFF" />
          </g>

          {/* 2. Text Brand "OceanExotic" */}
          <g className="text-brand" transform="translate(400, 160)">
            <text
              fill="#FFFFFF"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: "76px",
                textTransform: "uppercase",
              }}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              OceanExotic
            </text>
          </g>

          {/* 3. Amazon-like Smile / Neon wave wave curve under the text */}
          <path
            className="smile-curve"
            d="M160, 215 Q400, 260 640, 215"
            fill="none"
            stroke="url(#smileGradient)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* 4. Subtitle "GLOBAL" */}
          <g className="text-sub" transform="translate(400, 265)">
            <text
              fill="#00D1FF"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.5em",
              }}
              textAnchor="middle"
            >
              GLOBAL
            </text>
          </g>
        </svg>
      </div>

      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none scanline-effect z-10" />

      {/* Cybernetic Status Badge */}
      <div className="absolute bottom-10 z-10 flex flex-col items-center gap-1.5 opacity-60">
        <span className="text-[7px] font-black text-primary uppercase tracking-[0.35em] italic animate-pulse">
          SECURING LOCAL COLD CHAIN SYSTEM...
        </span>
        <div className="w-20 h-0.5 bg-primary/20 rounded-full overflow-hidden">
          <div className="w-full h-full bg-primary origin-left scale-x-0 transition-transform duration-[2.2s] ease-out" style={{
            animation: 'drawBar 2.2s ease-out forwards'
          }} />
        </div>
      </div>
    </div>
  );
};
