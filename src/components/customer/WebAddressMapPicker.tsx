"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Maximize2, Minimize2, Search } from "lucide-react";
import { getPreciseDirectionalLandmark } from "@/lib/landmarkUtils";

interface WebAddressMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, addressName?: string, landmark?: string) => void;
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
  // iframeKey only changes when we explicitly need to re-render the map (layer toggle)
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── FIX 1: Listen to postMessage from the iframe ──────────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "WEB_COORDS") {
        const nLat = Number(Number(event.data.lat).toFixed(6));
        const nLng = Number(Number(event.data.lng).toFixed(6));
        setLat(nLat);
        setLng(nLng);
        const landmark = getPreciseDirectionalLandmark(nLat, nLng);
        onLocationSelect(nLat, nLng, undefined, landmark);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLocationSelect]);

  // ── FIX 2: When lat/lng change from outside (GPS / search), send command to iframe ─
  const sendPinToMap = (newLat: number, newLng: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SET_PIN", lat: newLat, lng: newLng },
      "*"
    );
  };

  const triggerSelect = (newLat: number, newLng: number, name?: string) => {
    const formattedLat = Number(newLat.toFixed(6));
    const formattedLng = Number(newLng.toFixed(6));
    const landmark = getPreciseDirectionalLandmark(formattedLat, formattedLng, name);
    setLat(formattedLat);
    setLng(formattedLng);
    sendPinToMap(formattedLat, formattedLng);
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
        setNotice("⚠️ No results found. Try a different landmark.");
        setTimeout(() => setNotice(null), 3000);
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
      setNotice("📡 Detecting GPS position...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let nLat = pos.coords.latitude;
          let nLng = pos.coords.longitude;
          const isAndaman = nLat >= 6.0 && nLat <= 14.0 && nLng >= 92.0 && nLng <= 94.0;
          if (!isAndaman) {
            nLat = 11.6234;
            nLng = 92.7265;
            setNotice("📍 Device GPS outside Andaman. Map pin centered on Port Blair.");
          } else {
            setNotice("✅ GPS coordinates locked!");
          }
          setTimeout(() => setNotice(null), 4000);
          triggerSelect(nLat, nLng);
        },
        () => {
          triggerSelect(11.6234, 92.7265);
          setNotice("⚠️ GPS unavailable. Map pin centered on Port Blair Harbour.");
          setTimeout(() => setNotice(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setNotice("⚠️ Geolocation is not supported by this browser.");
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // The iframe HTML — listens for SET_PIN messages to update the marker
  const mapHtml = `<!DOCTYPE html>
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
    var initLat = ${lat};
    var initLng = ${lng};
    var map = L.map('map', { zoomControl: true }).setView([initLat, initLng], 17);
    L.tileLayer('https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);

    var marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);

    function sendCoords(lat, lng) {
      window.parent.postMessage({ type: 'WEB_COORDS', lat: lat, lng: lng }, '*');
    }

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      map.panTo(pos);
      sendCoords(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      map.panTo(e.latlng);
      sendCoords(e.latlng.lat, e.latlng.lng);
    });

    // Listen for SET_PIN from React to move marker programmatically
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SET_PIN') {
        var ll = L.latLng(event.data.lat, event.data.lng);
        marker.setLatLng(ll);
        map.setView(ll, 17);
      }
    });
  </script>
</body>
</html>`;

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
            onClick={() => { setLayerType(layerType === "y" ? "m" : "y"); setIframeKey(k => k + 1); }}
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
          key={iframeKey}
          ref={iframeRef}
          className="w-full h-full border-0"
          srcDoc={mapHtml}
          title="Location Map"
        />
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-teal-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:bg-teal-500 z-10"
        >
          <Navigation className="w-3 h-3" /> GPS LOCATE ME
        </button>
      </div>

      {/* Coordinates Display */}
      <div className="flex items-center justify-between text-[10px] font-bold text-teal-400 px-1">
        <span>📍 Coordinates Locked: {lat.toFixed(6)}, {lng.toFixed(6)}</span>
        <span className="text-slate-300 text-right max-w-[55%] truncate">📍 {getPreciseDirectionalLandmark(lat, lng)}</span>
      </div>
    </div>
  );
};
