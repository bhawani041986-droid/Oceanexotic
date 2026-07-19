"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Maximize2, Minimize2, Search } from "lucide-react";

interface WebAddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, addressName?: string, landmark?: string) => void;
}

const PORT_BLAIR_LANDMARKS = [
  { name: 'Phoenix Bay Jetty', lat: 11.6744, lng: 92.7365 },
  { name: 'Dollygunj Junction & Hub', lat: 11.6350, lng: 92.7079 },
  { name: 'Aberdeen Clock Tower', lat: 11.6710, lng: 92.7410 },
  { name: 'Junglighat Fish Landing', lat: 11.6605, lng: 92.7280 },
  { name: 'Haddo Port', lat: 11.6826, lng: 92.7202 },
  { name: 'Bhatubasti Market', lat: 11.6320, lng: 92.7260 },
  { name: 'Minibay Junction', lat: 11.6210, lng: 92.7150 },
  { name: 'Atamphad Crossing', lat: 11.6370, lng: 92.7030 }
];

function findNearestLandmark(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearestName = 'Port Blair Landmark';
  PORT_BLAIR_LANDMARKS.forEach((lm) => {
    const d = Math.sqrt(Math.pow(lat - lm.lat, 2) + Math.pow(lng - lm.lng, 2));
    if (d < minDistance) {
      minDistance = d;
      nearestName = lm.name;
    }
  });
  return nearestName;
}

export const WebAddressMapPicker: React.FC<WebAddressMapPickerProps> = ({
  initialLat = 11.6234,
  initialLng = 92.7265,
  onLocationSelect,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [layerType, setLayerType] = useState<"y" | "m">("y");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const triggerSelect = (newLat: number, newLng: number, name?: string) => {
    const formattedLat = Number(newLat.toFixed(6));
    const formattedLng = Number(newLng.toFixed(6));
    const landmark = findNearestLandmark(formattedLat, formattedLng);
    setLat(formattedLat);
    setLng(formattedLng);
    onLocationSelect(formattedLat, formattedLng, name, landmark);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Port Blair, Andaman"
        )}&viewbox=92.0,14.0,94.0,6.0&bounded=0`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data.slice(0, 4));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = (item: any) => {
    const nLat = parseFloat(item.lat);
    const nLng = parseFloat(item.lon);
    triggerSelect(nLat, nLng, item.display_name);
    setSearchResults([]);
    setSearchQuery(item.display_name.split(",")[0]);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let nLat = pos.coords.latitude;
          let nLng = pos.coords.longitude;
          const isAndaman = nLat >= 6.0 && nLat <= 14.0 && nLng >= 92.0 && nLng <= 94.0;
          if (!isAndaman) {
            nLat = 11.6234;
            nLng = 92.7265;
            setNotice("📍 Device GPS outside Andaman. Map pin centered on Port Blair.");
            setTimeout(() => setNotice(null), 4000);
          }
          triggerSelect(nLat, nLng);
        },
        () => {
          triggerSelect(11.6234, 92.7265);
          setNotice("📍 Map pin centered on Port Blair Harbour.");
          setTimeout(() => setNotice(null), 4000);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      {/* Search Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-primary">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search Port Blair landmarks (e.g. Havelock, Phoenix Bay)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button type="submit" className="text-[9px] font-black text-primary uppercase px-2 py-0.5 rounded bg-primary/10">
              {searching ? "..." : "Search"}
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickResult(item)}
                  className="w-full text-left px-3 py-2 text-[10px] text-slate-300 hover:bg-primary/20 hover:text-white border-b border-slate-800 last:border-0 truncate"
                >
                  📍 {item.display_name}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLayerType(layerType === "y" ? "m" : "y")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[9px] font-black uppercase tracking-wider text-slate-300 hover:text-white"
          >
            {layerType === "y" ? "🛰️ Hybrid" : "🗺️ Streets"}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[9px] font-black uppercase tracking-wider text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {isExpanded ? "Minimize" : "Enlarge"}
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
          {notice}
        </div>
      )}

      {/* Map Canvas */}
      <div className={`relative ${isExpanded ? "h-96" : "h-52"} w-full rounded-xl overflow-hidden border border-slate-700 shadow-xl transition-all duration-300`}>
        <iframe
          key={`${lat}-${lng}-${layerType}`}
          className="w-full h-full border-0"
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
              <style>
                body, html, #map { margin:0; padding:0; height:100%; width:100%; background:#020617; }
                .leaflet-control-attribution { display:none !important; }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <script>
                var map = L.map('map', { zoomControl: false }).setView([${lat}], [${lng}], 16);
                L.tileLayer('https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}', { maxZoom: 19 }).addTo(map);
                var marker = L.marker([${lat}], [${lng}], { draggable: true }).addTo(map);
                
                marker.on('dragend', function(e) {
                  var pos = marker.getLatLng();
                  if (window.parent) {
                    window.parent.postMessage({ type: 'WEB_COORDS', lat: pos.lat, lng: pos.lng }, '*');
                  }
                });

                map.on('click', function(e) {
                  marker.setLatLng(e.latlng);
                  if (window.parent) {
                    window.parent.postMessage({ type: 'WEB_COORDS', lat: e.latlng.lat, lng: e.latlng.lng }, '*');
                  }
                });
              </script>
            </body>
            </html>
          `}
        />
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-teal-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:bg-teal-500"
        >
          <Navigation className="w-3 h-3" /> GPS LOCATE ME
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-teal-400 px-1">
        <span>📍 Coordinates Locked: {lat}, {lng}</span>
        <span className="text-slate-400">Nearest Landmark: {findNearestLandmark(lat, lng)}</span>
      </div>
    </div>
  );
};
