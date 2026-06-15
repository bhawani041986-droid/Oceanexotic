"use client";

import { useEffect, useRef } from "react";

// Port Blair correct coordinates
const PORT_BLAIR_CENTER: [number, number] = [11.6234, 92.7265];

// Key Port Blair delivery zones
const PORT_BLAIR_LANDMARKS = [
  { name: "Phoenix Bay Hub", lat: 11.6670, lng: 92.7359, type: "hub" },
  { name: "Aberdeen Bazaar", lat: 11.6588, lng: 92.7285, type: "market" },
  { name: "Junglighat Harbor", lat: 11.6423, lng: 92.7312, type: "harbor" },
  { name: "Corbyn's Cove", lat: 11.5982, lng: 92.7423, type: "zone" },
];

/** Single-driver mode (Customer order tracking) */
export interface PortBlairMapProps {
  driverLat?: number;
  driverLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  status?: string;
  className?: string;
}

/** Fleet mode: show multiple drivers (Admin/Seller/Agent) */
export interface FleetAgent {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  isActive?: boolean;
}

export interface PortBlairFleetMapProps {
  agents?: FleetAgent[];
  activeAgentId?: string | null;
  className?: string;
  zoom?: number;
}

// ─── Single Driver Map (Customer order page) ─────────────────────────────────
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

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: PORT_BLAIR_CENTER,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: "© OSM" }).addTo(map);

      // Landmark dots
      PORT_BLAIR_LANDMARKS.forEach((lm) => {
        const color = lm.type === "hub" ? "#22d3ee" : lm.type === "harbor" ? "#3b82f6" : "#6366f1";
        L.marker([lm.lat, lm.lng], {
          icon: L.divIcon({
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}80"></div>`,
            className: "",
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
        }).bindTooltip(lm.name, { permanent: false, direction: "top", className: "leaflet-tooltip-dark" }).addTo(map);
      });

      // Delivery destination
      const destLat = deliveryLat || PORT_BLAIR_CENTER[0] - 0.02;
      const destLng = deliveryLng || PORT_BLAIR_CENTER[1] + 0.015;
      L.marker([destLat, destLng], {
        icon: L.divIcon({
          html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);border:3px solid white;box-shadow:0 4px 12px rgba(34,197,94,0.6);font-size:16px">🏠</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      }).bindTooltip("Your Delivery Location", { permanent: false, direction: "top" }).addTo(map);

      // Driver marker
      const dLat = driverLat || 11.6670;
      const dLng = driverLng || 92.7359;
      const driverMarker = L.marker([dLat, dLng], {
        icon: L.divIcon({
          html: `<div style="position:relative;width:44px;height:44px"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(14,165,233,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0284c7);border:3px solid white;box-shadow:0 4px 12px rgba(14,165,233,0.7);display:flex;align-items:center;justify-content:center;font-size:13px">🏍️</div></div><style>@keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}</style>`,
          className: "",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
      }).bindTooltip("Your Delivery Rider", { permanent: false, direction: "top" }).addTo(map);
      driverMarkerRef.current = driverMarker;

      if (status !== "delivered") {
        L.polyline([[dLat, dLng], [destLat, destLng]], { color: "#0ea5e9", weight: 3, opacity: 0.7, dashArray: "8, 6" }).addTo(map);
        map.fitBounds(L.latLngBounds([[dLat, dLng], [destLat, destLng]]), { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!driverMarkerRef.current || !driverLat || !driverLng) return;
    driverMarkerRef.current?.setLatLng([driverLat, driverLng]);
  }, [driverLat, driverLng]);

  return (
    <>
      <style>{`.leaflet-tooltip-dark{background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.1);color:white;font-size:10px;font-weight:700;letter-spacing:.05em;border-radius:6px;padding:4px 8px;text-transform:uppercase}.leaflet-tooltip-dark::before{border-top-color:rgba(15,23,42,0.9)}`}</style>
      <div ref={mapRef} className={className} style={{ borderRadius: "inherit", overflow: "hidden" }} />
    </>
  );
}

// ─── Fleet Map (Admin / Seller / Agent) ──────────────────────────────────────
export function PortBlairFleetMap({
  agents = [],
  activeAgentId = null,
  className = "",
  zoom = 13,
}: PortBlairFleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: PORT_BLAIR_CENTER,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // OpenStreetMap tiles (free, no API key — replaces Google Maps)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.control.attribution({ position: "bottomright", prefix: "© OSM" }).addTo(map);

      // Port Blair landmark dots
      PORT_BLAIR_LANDMARKS.forEach((lm) => {
        const color = lm.type === "hub" ? "#22d3ee" : lm.type === "harbor" ? "#3b82f6" : "#6366f1";
        L.marker([lm.lat, lm.lng], {
          icon: L.divIcon({
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}90"></div>`,
            className: "",
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
        }).bindTooltip(lm.name, { permanent: false, direction: "top", className: "leaflet-tooltip-dark" }).addTo(map);
      });

      // Phoenix Bay Hub as headquarter marker
      L.marker([11.6670, 92.7359], {
        icon: L.divIcon({
          html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);border:3px solid white;box-shadow:0 4px 16px rgba(99,102,241,0.7);font-size:16px">⚓</div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        }),
      }).bindTooltip("Phoenix Bay Hub (HQ)", { permanent: false, direction: "top" }).addTo(map);

      // Agent markers
      agents.forEach((agent) => {
        const isActive = agent.id === activeAgentId;
        const marker = L.marker([agent.lat, agent.lng], {
          icon: L.divIcon({
            html: `<div style="position:relative;width:${isActive ? 48 : 38}px;height:${isActive ? 48 : 38}px">
              ${isActive ? `<div style="position:absolute;inset:0;border-radius:50%;background:rgba(14,165,233,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ""}
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isActive ? 32 : 26}px;height:${isActive ? 32 : 26}px;border-radius:50%;background:linear-gradient(135deg,${isActive ? "#0ea5e9,#0284c7" : "#22d3ee,#0891b2"});border:${isActive ? 3 : 2}px solid white;box-shadow:0 4px 12px rgba(14,165,233,${isActive ? "0.8" : "0.4"});display:flex;align-items:center;justify-content:center;font-size:${isActive ? 14 : 11}px">🏍️</div>
            </div><style>@keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}</style>`,
            className: "",
            iconSize: [isActive ? 48 : 38, isActive ? 48 : 38],
            iconAnchor: [isActive ? 24 : 19, isActive ? 24 : 19],
          }),
          zIndexOffset: isActive ? 1000 : 0,
        }).bindTooltip(agent.label || agent.id, { permanent: false, direction: "top", className: "leaflet-tooltip-dark" }).addTo(map);
        markerRefs.current[agent.id] = marker;
      });

      // Fit to agents if any, else show Port Blair
      if (agents.length > 0) {
        const bounds = L.latLngBounds(agents.map((a) => [a.lat, a.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRefs.current = {}; }
    };
  }, []);

  // Update marker positions on agent data change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      agents.forEach((agent) => {
        if (markerRefs.current[agent.id]) {
          markerRefs.current[agent.id].setLatLng([agent.lat, agent.lng]);
        }
      });
    });
  }, [agents]);

  return (
    <>
      <style>{`.leaflet-tooltip-dark{background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.1);color:white;font-size:10px;font-weight:700;letter-spacing:.05em;border-radius:6px;padding:4px 8px;text-transform:uppercase}.leaflet-tooltip-dark::before{border-top-color:rgba(15,23,42,0.9)}`}</style>
      <div ref={mapRef} className={className} style={{ borderRadius: "inherit", overflow: "hidden" }} />
    </>
  );
}
