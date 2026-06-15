"use client";

import { useEffect, useRef } from "react";

interface PortBlairMapProps {
  driverLat?: number;
  driverLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  status?: string;
  className?: string;
}

// Port Blair center coordinates
const PORT_BLAIR_CENTER: [number, number] = [11.6234, 92.7265];

// Key Port Blair delivery zones (for context dots on map)
const PORT_BLAIR_LANDMARKS = [
  { name: "Phoenix Bay Hub", lat: 11.6670, lng: 92.7359, type: "hub" },
  { name: "Aberdeen Bazaar", lat: 11.6588, lng: 92.7285, type: "market" },
  { name: "Junglighat Harbor", lat: 11.6423, lng: 92.7312, type: "harbor" },
  { name: "Corbyn's Cove", lat: 11.5982, lng: 92.7423, type: "zone" },
];

export default function PortBlairMap({
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
  status = "out_for_delivery",
  className = "",
}: PortBlairMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (client-only)
    import("leaflet").then((L) => {
      // Fix default marker icons (Leaflet + Webpack issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      // Create map centered on Port Blair
      const map = L.map(mapRef.current, {
        center: PORT_BLAIR_CENTER,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Use OpenStreetMap tiles (free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Add minimal attribution bottom-right
      L.control.attribution({ position: "bottomright", prefix: "© OSM" }).addTo(map);

      // Add Port Blair landmark markers
      PORT_BLAIR_LANDMARKS.forEach((landmark) => {
        const color = landmark.type === "hub" ? "#22d3ee" : landmark.type === "harbor" ? "#3b82f6" : "#6366f1";
        const landmarkIcon = L.divIcon({
          html: `<div style="
            width: 10px; height: 10px; 
            border-radius: 50%; 
            background: ${color}; 
            border: 2px solid white;
            box-shadow: 0 0 6px ${color}80;
          "></div>`,
          className: "",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon })
          .bindTooltip(landmark.name, { permanent: false, direction: "top", className: "leaflet-tooltip-dark" })
          .addTo(map);
      });

      // Delivery destination marker
      const destLat = deliveryLat || PORT_BLAIR_CENTER[0] - 0.02;
      const destLng = deliveryLng || PORT_BLAIR_CENTER[1] + 0.015;

      const destIcon = L.divIcon({
        html: `<div style="
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; 
          border-radius: 50%; 
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(34,197,94,0.6);
          font-size: 16px;
        ">🏠</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([destLat, destLng], { icon: destIcon })
        .bindTooltip("Your Delivery Location", { permanent: false, direction: "top" })
        .addTo(map);

      // Driver marker (animated pulse)
      const dLat = driverLat || 11.6670;
      const dLng = driverLng || 92.7359;

      const driverIcon = L.divIcon({
        html: `<div style="position: relative; width: 44px; height: 44px;">
          <div style="
            position: absolute; inset: 0;
            border-radius: 50%;
            background: rgba(14,165,233,0.3);
            animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
            width: 28px; height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(14,165,233,0.7);
            display: flex; align-items: center; justify-content: center;
            font-size: 13px;
          ">🏍️</div>
        </div>
        <style>
          @keyframes ping { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.5);opacity:0} }
        </style>`,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const driverMarker = L.marker([dLat, dLng], { icon: driverIcon })
        .bindTooltip("Your Delivery Rider", { permanent: false, direction: "top" })
        .addTo(map);
      driverMarkerRef.current = driverMarker;

      // Draw delivery route line
      if (status !== "delivered") {
        const routeLine = L.polyline(
          [[dLat, dLng], [destLat, destLng]],
          {
            color: "#0ea5e9",
            weight: 3,
            opacity: 0.7,
            dashArray: "8, 6",
          }
        ).addTo(map);

        // Fit map to show both markers
        const bounds = L.latLngBounds([[dLat, dLng], [destLat, destLng]]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only init once

  // Update driver marker position when GPS updates
  useEffect(() => {
    if (!driverMarkerRef.current || !driverLat || !driverLng) return;
    import("leaflet").then((L) => {
      driverMarkerRef.current?.setLatLng([driverLat, driverLng]);
    });
  }, [driverLat, driverLng]);

  return (
    <>
      <style>{`
        .leaflet-tooltip-dark {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 6px;
          padding: 4px 8px;
          text-transform: uppercase;
        }
        .leaflet-tooltip-dark::before {
          border-top-color: rgba(15, 23, 42, 0.9);
        }
      `}</style>
      <div ref={mapRef} className={className} style={{ borderRadius: "inherit", overflow: "hidden" }} />
    </>
  );
}
