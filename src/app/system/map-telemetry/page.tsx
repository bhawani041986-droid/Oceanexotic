"use client";

import React, { useEffect, useState, useRef } from 'react';

const AndamanMaritimeMap = ({ territories }: { territories: any[] }) => {
  const mapRef = useRef<any>(null);
  const [isLReady, setIsLReady] = useState(false);
  const [isMapInit, setIsMapInit] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setIsLReady(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setIsLReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLReady || isMapInit || typeof window === 'undefined') return;
    const L = (window as any).L;
    const container = document.getElementById('andaman-maritime-map');
    if (!container || (container as any)._leaflet_id) return;

    try {
      mapRef.current = L.map('andaman-maritime-map', {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([11.6667, 92.7500], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      setIsMapInit(true);
    } catch (err) {
      console.error("Map Initialization Error:", err);
    }
  }, [isLReady]);

  useEffect(() => {
    if (!isMapInit || !mapRef.current) return;
    const L = (window as any).L;

    if (Array.isArray(territories)) {
      const activeNodes = territories
        .filter(t => t?.coordinates && t.status === 'ACTIVE')
        .slice(0, 12);
        
      const mainHub = activeNodes.find(t => t.name.toLowerCase().includes('port blair'));
      
      let hubPos: any = null;
      if (mainHub) {
        const hp = String(mainHub.coordinates).split(',').map(s => parseFloat(s.trim()));
        if (hp.length >= 2 && !isNaN(hp[0]) && !isNaN(hp[1])) {
          hubPos = L.latLng(hp[0], hp[1]);
        }
      }

      activeNodes.forEach((t, i) => {
        const raw = String(t.coordinates).split(',').map(s => parseFloat(s.trim()));
        if (raw.length >= 2 && !isNaN(raw[0]) && !isNaN(raw[1])) {
          const pos = L.latLng(raw[0], raw[1]);
          const colors = ['#E23744', '#00ffaa', '#ff00ee', '#f8ff00', '#ff8800', '#ffffff'];
          const color = colors[i % colors.length];
          
          const icon = L.divIcon({
            className: 'maritime-cyber-pointer',
            html: `<div class="relative">
                  <div class="w-3 h-3 flex items-center justify-center">
                      <div class="absolute w-6 h-6 rounded-full border border-white/10 animate-ping" style="border-color: ${color}22"></div>
                      <div class="w-2.5 h-2.5 rounded-full border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}"></div>
                  </div>
                  <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                    <svg width="12" height="8" viewBox="0 0 24 16" fill="${color}">
                      <path d="M0 0 L24 0 L12 16 Z" />
                    </svg>
                  </div>
                  <div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-black/90 border-b-2 px-2 py-0.5 flex flex-col items-center" 
                       style="border-bottom-color: ${color};">
                      <span class="text-[10px] font-black text-white uppercase">${t.name}</span>
                  </div>
              </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker(pos, { icon }).addTo(mapRef.current);
        }
      });
    }
  }, [territories, isMapInit]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <div id="andaman-maritime-map" className="absolute inset-0 filter saturate-[1.1] brightness-[0.75] contrast-[1.1] hue-rotate-[210deg]" />
    </div>
  );
};

export default function MapTelemetryPage() {
  const [territories, setTerritories] = useState([]);

  useEffect(() => {
    fetch('/FISH_MARKET/api/products/todays_catch')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setTerritories(data.items || []);
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <AndamanMaritimeMap territories={territories} />
    </div>
  );
}
