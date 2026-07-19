"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  ArrowLeft, 
  ChevronRight, 
  MapPin, 
  Plus, 
  Search,
  Globe,
  Loader2,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Layers,
  Save,
  X,
  PlusCircle,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function TerritoryWizardPage() {
  const [loading, setLoading] = useState(false);
  const [territories, setTerritories] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  // Selected Nodes
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedHub, setSelectedHub] = useState<any>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [isLReady, setIsLReady] = useState(false);
  const [isDrawReady, setIsDrawReady] = useState(false);
  const [isMapEnlarged, setIsMapEnlarged] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guarantee Leaflet CSS is loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if ((window as any).L) {
      setIsLReady(true);
      if ((window as any).L.Draw) {
        setIsDrawReady(true);
      } else {
        loadLeafletDraw();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      setIsLReady(true);
      loadLeafletDraw();
    };
    document.head.appendChild(script);
  }, []);

  const loadLeafletDraw = () => {
    if (typeof window === 'undefined') return;
    
    // Guarantee Leaflet Draw CSS is loaded
    if (!document.querySelector('link[href*="leaflet.draw.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
    script.onload = () => setIsDrawReady(true);
    document.head.appendChild(script);
  };

  // Modal / Editor State
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    type: "COUNTRY" | "STATE_PROVINCE" | "DISTRICT" | "CITY_ISLAND" | "ADMIN_HUB" | "DELIVERY_ZONE";
    mode: "ADD" | "EDIT";
    nodeId?: number;
    parentId: number | null;
    // Fields
    name: string;
    coordinates: string;
    hub_code?: string;
    manager_name?: string;
    rider_capacity?: number;
    delivery_charge?: number;
    minimum_order?: number;
    eta_mins?: number;
    allowed_slots?: string[];
    custom_slots?: Record<string, string>;
    polygon_coordinates?: [number, number][];
  } | null>(null);

  useEffect(() => {
    fetchTerritories();
  }, []);

  useEffect(() => {
    if (!editorModal || !isLReady || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      const L = (window as any).L;
      const container = document.getElementById('editor-leaflet-map');
      if (!container || (container as any)._leaflet_id) return;

      const defaultCenter = [11.635017, 92.707942] as [number, number];
      let initialCenter = defaultCenter;

      if (editorModal.type === "ADMIN_HUB" && editorModal.coordinates) {
        const [lat, lng] = editorModal.coordinates.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
          initialCenter = [lat, lng];
        }
      } else if (editorModal.type === "DELIVERY_ZONE") {
        if (editorModal.polygon_coordinates && editorModal.polygon_coordinates.length > 0) {
          const lats = editorModal.polygon_coordinates.map(p => p[0]);
          const lngs = editorModal.polygon_coordinates.map(p => p[1]);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
          initialCenter = [centerLat, centerLng];
        } else {
          // Center on parent hub
          const parentNode = territories.find(t => t.id === editorModal.parentId);
          if (parentNode && parentNode.coordinates) {
            const [pLat, pLng] = parentNode.coordinates.split(",").map(Number);
            if (!isNaN(pLat) && !isNaN(pLng) && pLat !== 0) {
              initialCenter = [pLat, pLng];
            }
          }
        }
      }

      const map = L.map('editor-leaflet-map').setView(initialCenter, 14);
      (container as any)._leaflet_map = map;
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      if (editorModal.type === "ADMIN_HUB") {
        const marker = L.marker(initialCenter, { draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const latlng = marker.getLatLng();
          setEditorModal(prev => {
            if (!prev) return null;
            return {
              ...prev,
              coordinates: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
            };
          });
        });
      } else if (editorModal.type === "DELIVERY_ZONE") {
        let activePolygon: any = null;

        if (editorModal.polygon_coordinates && editorModal.polygon_coordinates.length > 0) {
          activePolygon = L.polygon(editorModal.polygon_coordinates, { color: '#6366f1' }).addTo(drawnItems);
          
          // Enable direct vertex editing immediately
          if (activePolygon.editing) {
            activePolygon.editing.enable();
            
            const updateCoords = () => {
              const latlngs = activePolygon.getLatLngs()[0];
              const coords = (Array.isArray(latlngs) ? latlngs : []).map((pt: any) => [pt.lat, pt.lng] as [number, number]);
              setEditorModal(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  polygon_coordinates: coords
                };
              });
            };

            activePolygon.on('edit', updateCoords);
            activePolygon.on('editvertex', updateCoords);
            map.on('draw:editvertex', updateCoords);
          }

          map.fitBounds(activePolygon.getBounds());
        }

        if (L.Draw) {
          const drawControl = new L.Control.Draw({
            edit: {
              featureGroup: drawnItems
            },
            draw: {
              polygon: {
                allowIntersection: false,
                shapeOptions: { color: '#6366f1' }
              },
              polyline: false,
              circle: false,
              rectangle: false,
              circlemarker: false,
              marker: false
            }
          });
          map.addControl(drawControl);

          map.on(L.Draw.Event.CREATED, (e: any) => {
            const layer = e.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);
            activePolygon = layer;
            
            // Enable editing on new polygon as well
            if (activePolygon.editing) {
              activePolygon.editing.enable();
              
              const updateCoords = () => {
                const latlngs = activePolygon.getLatLngs()[0];
                const coords = (Array.isArray(latlngs) ? latlngs : []).map((pt: any) => [pt.lat, pt.lng] as [number, number]);
                setEditorModal(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    polygon_coordinates: coords
                  };
                });
              };

              activePolygon.on('edit', updateCoords);
              activePolygon.on('editvertex', updateCoords);
              map.on('draw:editvertex', updateCoords);
            }

            const latlngs = layer.getLatLngs()[0];
            const coords = (Array.isArray(latlngs) ? latlngs : []).map((pt: any) => [pt.lat, pt.lng] as [number, number]);
            setEditorModal(prev => {
              if (!prev) return null;
              return {
                ...prev,
                polygon_coordinates: coords
              };
            });
          });

          map.on(L.Draw.Event.EDITED, (e: any) => {
            const layers = e.layers;
            layers.eachLayer((layer: any) => {
              const latlngs = layer.getLatLngs()[0];
              const coords = (Array.isArray(latlngs) ? latlngs : []).map((pt: any) => [pt.lat, pt.lng] as [number, number]);
              setEditorModal(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  polygon_coordinates: coords
                };
              });
            });
          });
        }
      }

      const containerLeaflet = document.getElementById('editor-leaflet-map');
      return () => {
        clearTimeout(timer);
        if (containerLeaflet && (containerLeaflet as any)._leaflet_map) {
          (containerLeaflet as any)._leaflet_map.remove();
          delete (containerLeaflet as any)._leaflet_map;
        }
        mapRef.current = null;
      };
    }, 100);
  }, [editorModal, isLReady, isDrawReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [isMapEnlarged]);

  useEffect(() => {
    if (territories.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const selectIdStr = urlParams.get("selectId");
    if (!selectIdStr) return;

    const selectId = parseInt(selectIdStr);
    const targetNode = territories.find(t => t.id === selectId);
    if (!targetNode) return;

    // Trace ancestors
    const ancestors: any[] = [];
    let current = targetNode;
    while (current && current.parent_id) {
      const parent = territories.find(t => t.id === current.parent_id);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    // Assign based on zone types
    ancestors.forEach((node: any) => {
      if (node.zone_type === 'COUNTRY') setSelectedCountry(node);
      if (node.zone_type === 'STATE_PROVINCE') setSelectedState(node);
      if (node.zone_type === 'DISTRICT') setSelectedDistrict(node);
      if (node.zone_type === 'CITY_ISLAND') setSelectedCity(node);
      if (node.zone_type === 'ADMIN_HUB') setSelectedHub(node);
    });

    // If target itself is one of these levels
    if (targetNode.zone_type === 'COUNTRY') setSelectedCountry(targetNode);
    if (targetNode.zone_type === 'STATE_PROVINCE') setSelectedState(targetNode);
    if (targetNode.zone_type === 'DISTRICT') setSelectedDistrict(targetNode);
    if (targetNode.zone_type === 'CITY_ISLAND') setSelectedCity(targetNode);
    if (targetNode.zone_type === 'ADMIN_HUB') setSelectedHub(targetNode);

    // If it's a zone or hub, open the editor automatically!
    if (targetNode.zone_type === 'ADMIN_HUB') {
      openEditor("ADMIN_HUB", "EDIT", targetNode.parent_id, targetNode);
    } else if (targetNode.zone_type === 'DELIVERY_ZONE') {
      const delTerr = territories.find(t => t.id === targetNode.parent_id);
      const hubNode = delTerr ? territories.find(t => t.id === delTerr.parent_id) : null;
      if (hubNode) setSelectedHub(hubNode);
      openEditor("DELIVERY_ZONE", "EDIT", targetNode.parent_id, targetNode);
    }

    // Clean query param
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }, [territories]);

  const fetchTerritories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/system/get_territories`);
      const data = await res.json();
      setTerritories(data || []);
      
      // Update selected references if the database changed
      if (selectedCountry) {
        const updated = data.find((t: any) => t.id === selectedCountry.id);
        if (updated) setSelectedCountry(updated);
      }
      if (selectedState) {
        const updated = data.find((t: any) => t.id === selectedState.id);
        if (updated) setSelectedState(updated);
      }
      if (selectedDistrict) {
        const updated = data.find((t: any) => t.id === selectedDistrict.id);
        if (updated) setSelectedDistrict(updated);
      }
      if (selectedCity) {
        const updated = data.find((t: any) => t.id === selectedCity.id);
        if (updated) setSelectedCity(updated);
      }
      if (selectedHub) {
        const updated = data.find((t: any) => t.id === selectedHub.id);
        if (updated) setSelectedHub(updated);
      }

    } catch (error) {
      console.error("Failed to fetch territories", error);
    } finally {
      setLoading(false);
    }
  };

  const getChildren = (parentId: number | null, type: string) => {
    return territories.filter(t => t.parent_id == parentId && t.zone_type === type);
  };

  // Hierarchy helper filter
  const countries = territories.filter(t => t.zone_type === 'COUNTRY');
  const states = selectedCountry ? getChildren(selectedCountry.id, 'STATE_PROVINCE') : [];
  const districts = selectedState ? getChildren(selectedState.id, 'DISTRICT') : [];
  const cities = selectedDistrict ? getChildren(selectedDistrict.id, 'CITY_ISLAND') : [];
  const hubs = selectedCity ? getChildren(selectedCity.id, 'ADMIN_HUB') : [];

  const getZonesForHub = (hubId: number) => {
    // Delivery Zones are children of the Delivery Territory which is a child of the Hub
    const hubTerritories = getChildren(hubId, 'DELIVERY_TERRITORY');
    let zones: any[] = [];
    hubTerritories.forEach(t => {
      zones = [...zones, ...getChildren(t.id, 'DELIVERY_ZONE')];
    });
    return zones;
  };

  const activeZones = selectedHub ? getZonesForHub(selectedHub.id) : [];

  // Toggle ACTIVE/INACTIVE
  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/system/toggle_territory_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchTerritories();
      } else {
        alert(data.message || "Failed to update node status.");
      }
    } catch (e: any) {
      alert("Error toggle status: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Node
  const handleDeleteNode = async (id: number) => {
    if (!confirm("Are you absolutely sure you want to decommission/delete this logistics node? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/system/delete_territory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === "success") {
        // Clear selected path if deleted
        if (selectedHub?.id === id) setSelectedHub(null);
        if (selectedCity?.id === id) setSelectedCity(null);
        if (selectedDistrict?.id === id) setSelectedDistrict(null);
        if (selectedState?.id === id) setSelectedState(null);
        if (selectedCountry?.id === id) setSelectedCountry(null);
        
        await fetchTerritories();
      } else {
        alert(data.message || "Failed to delete node.");
      }
    } catch (e: any) {
      alert("Error deleting node: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Save Editor (ADD/EDIT)
  const openEditor = (
    type: "COUNTRY" | "STATE_PROVINCE" | "DISTRICT" | "CITY_ISLAND" | "ADMIN_HUB" | "DELIVERY_ZONE",
    mode: "ADD" | "EDIT",
    parentId: number | null,
    existingNode?: any
  ) => {
    let customSlots: Record<string, string> = { TODAY_AM: "", TODAY_PM: "", TOMORROW: "" };
    let allowedSlots: string[] = ["TODAY_AM", "TODAY_PM", "TOMORROW"];
    let hubCode = existingNode?.hub_code || "";
    let managerName = existingNode?.manager_name || "";
    let riderCap = existingNode?.rider_capacity || 0;
    let delCharge = existingNode?.delivery_charge || 0;
    let minOrder = existingNode?.minimum_order || 0;
    let eta = existingNode?.eta_mins || 30;
    let coordinates = existingNode?.coordinates || "";

    if (existingNode?.coordinates) {
      if (type === "ADMIN_HUB") {
        const parts = existingNode.coordinates.split(",");
        if (parts.length > 2) {
          coordinates = `${parts[0] || ""}, ${parts[1] || ""}`.trim();
          hubCode = parts[2]?.trim() || hubCode;
          managerName = parts[3]?.trim() || managerName;
          riderCap = parseInt(parts[4]) || riderCap;
          if (parts[5] && parts[5].trim()) {
            allowedSlots = parts[5].split("|").map((s: string) => s.trim()).filter(Boolean);
          }
          if (parts[6] && parts[6].trim()) {
            parts[6].split("|").forEach((pair: string) => {
              const [k, v] = pair.split(":").map((s: string) => s.trim());
              if (k) customSlots[k] = v || "";
            });
          }
        }
      } else if (type === "DELIVERY_ZONE") {
        const parts = existingNode.coordinates.split(",");
        if (parts.length >= 2) {
          delCharge = parseFloat(parts[0]) || delCharge;
          minOrder = parseFloat(parts[1]) || minOrder;
          eta = parseInt(parts[2]) || eta;
          if (parts[3] && parts[3].trim()) {
            allowedSlots = parts[3].split("|").map((s: string) => s.trim()).filter(Boolean);
          }
          if (parts[4] && parts[4].trim()) {
            parts[4].split("|").forEach((pair: string) => {
              const [k, v] = pair.split(":").map((s: string) => s.trim());
              if (k) customSlots[k] = v || "";
            });
          }
        }
      }
    }

    let polygonCoords: [number, number][] = [];
    if (existingNode?.coordinates && type === "DELIVERY_ZONE") {
      if (existingNode.coordinates.includes("POLYGON")) {
        const polyPart = existingNode.coordinates.substring(existingNode.coordinates.indexOf("POLYGON"));
        const matches = polyPart.match(/\(\((.*?)\)\)/);
        if (matches && matches[1]) {
          const pointsStr = matches[1].split(",");
          polygonCoords = pointsStr.map((ptStr: string) => {
            const [lat, lng] = ptStr.trim().split(/\s+/).map(Number);
            return [lat, lng] as [number, number];
          }).filter((pt: any) => !isNaN(pt[0]) && !isNaN(pt[1]));
        }
      }
    }

    setEditorModal({
      isOpen: true,
      type,
      mode,
      nodeId: existingNode?.id,
      parentId,
      name: existingNode?.name || "",
      coordinates,
      hub_code: hubCode,
      manager_name: managerName,
      rider_capacity: riderCap,
      delivery_charge: delCharge,
      minimum_order: minOrder,
      eta_mins: eta,
      allowed_slots: allowedSlots,
      custom_slots: customSlots,
      polygon_coordinates: polygonCoords
    });
  };

  // Save Editor Changes (Submit handler)
  const handleSaveNode = async () => {
    if (!editorModal) return;
    if (!editorModal.name.trim()) return alert("Name field is required.");

    try {
      setLoading(true);

      let coordVal = editorModal.coordinates || null;
      const customSlotsStr = [
        `TODAY_AM:${editorModal.custom_slots?.TODAY_AM || ""}`,
        `TODAY_PM:${editorModal.custom_slots?.TODAY_PM || ""}`,
        `TOMORROW:${editorModal.custom_slots?.TOMORROW || ""}`
      ].join("|");

      if (editorModal.type === "ADMIN_HUB") {
        const [lat, lng] = (editorModal.coordinates || "0, 0").split(",");
        coordVal = `${(lat || "0").trim()}, ${(lng || "0").trim()}, ${editorModal.hub_code || ""}, ${editorModal.manager_name || ""}, ${editorModal.rider_capacity || 0}, ${(editorModal.allowed_slots || []).join("|")}, ${customSlotsStr}`;
      } else if (editorModal.type === "DELIVERY_ZONE") {
        let polyWkt = "";
        if (editorModal.polygon_coordinates && editorModal.polygon_coordinates.length > 0) {
          polyWkt = `, POLYGON((${editorModal.polygon_coordinates.map(pt => `${pt[0]} ${pt[1]}`).join(", ")}))`;
        }
        coordVal = `${editorModal.delivery_charge || 0}, ${editorModal.minimum_order || 0}, ${editorModal.eta_mins || 30}, ${(editorModal.allowed_slots || []).join("|")}, ${customSlotsStr}${polyWkt}`;
      }

      const payload: any = {
        name: editorModal.name.trim(),
        zone_type: editorModal.type,
        parent_id: editorModal.parentId,
        coordinates: coordVal,
        hub_code: editorModal.hub_code || null,
        manager_name: editorModal.manager_name || null,
        rider_capacity: Number(editorModal.rider_capacity || 0),
        delivery_charge: Number(editorModal.delivery_charge || 0),
        minimum_order: Number(editorModal.minimum_order || 0),
        eta_mins: Number(editorModal.eta_mins || 30)
      };

      let url = `${API_BASE_URL}/system/add_territory`;
      if (editorModal.mode === "EDIT") {
        url = `${API_BASE_URL}/system/edit_territory`;
        payload.id = editorModal.nodeId;
      }

      // If we are creating a delivery zone, ensure parent DELIVERY_TERRITORY exists first
      if (editorModal.type === "DELIVERY_ZONE" && editorModal.mode === "ADD") {
        let defaultTerritory = territories.find(t => t.parent_id == selectedHub.id && t.zone_type === 'DELIVERY_TERRITORY');
        if (!defaultTerritory) {
          // create default hidden delivery territory
          const terrPayload = {
            name: `${selectedHub.name} Primary Territory`,
            zone_type: "DELIVERY_TERRITORY",
            parent_id: selectedHub.id,
            status: "ACTIVE"
          };
          const terrRes = await fetch(`${API_BASE_URL}/system/add_territory`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(terrPayload)
          });
          const terrData = await terrRes.json();
          if (terrData.status === "success") {
            payload.parent_id = terrData.id;
          } else {
            throw new Error("Failed to configure delivery territory.");
          }
        } else {
          payload.parent_id = defaultTerritory.id;
        }
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        setEditorModal(null);
        await fetchTerritories();
      } else {
        alert(data.message || "Failed to save node.");
      }
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJumpToLevel = (level: number) => {
    if (level < 5) setSelectedHub(null);
    if (level < 4) setSelectedCity(null);
    if (level < 3) setSelectedDistrict(null);
    if (level < 2) setSelectedState(null);
    if (level < 1) setSelectedCountry(null);
  };

  return (
    <div className="space-y-8 pb-24 w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/logistics" className="w-10 h-10 bg-bg-secondary rounded-full flex items-center justify-center border border-[var(--foreground)]/10 hover:border-primary/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--foreground)]/60" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Logistics Registry</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Autonomous Territorial Geofence calibrator</p>
          </div>
        </div>
        
        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search sector or nodes..."
            className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-2.5 pl-10 rounded-xl text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Interactive Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 bg-bg-secondary p-4 rounded-xl border border-[var(--foreground)]/10 text-sm">
        <button onClick={() => handleJumpToLevel(0)} className={cn("transition-colors font-bold uppercase text-xs tracking-wider", !selectedCountry ? "text-primary" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]")}>
          🌍 World
        </button>
        
        {selectedCountry && <>
          <span className="text-[var(--foreground)]/30">/</span>
          <button onClick={() => handleJumpToLevel(1)} className={cn("transition-colors font-bold uppercase text-xs tracking-wider", selectedCountry && !selectedState ? "text-primary" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]")}>
            {selectedCountry.name}
          </button>
        </>}
        
        {selectedState && <>
          <span className="text-[var(--foreground)]/30">/</span>
          <button onClick={() => handleJumpToLevel(2)} className={cn("transition-colors font-bold uppercase text-xs tracking-wider", selectedState && !selectedDistrict ? "text-primary" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]")}>
            {selectedState.name}
          </button>
        </>}
        
        {selectedDistrict && <>
          <span className="text-[var(--foreground)]/30">/</span>
          <button onClick={() => handleJumpToLevel(3)} className={cn("transition-colors font-bold uppercase text-xs tracking-wider", selectedDistrict && !selectedCity ? "text-primary" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]")}>
            {selectedDistrict.name}
          </button>
        </>}

        {selectedCity && <>
          <span className="text-[var(--foreground)]/30">/</span>
          <button onClick={() => handleJumpToLevel(4)} className={cn("transition-colors font-bold uppercase text-xs tracking-wider", selectedCity && !selectedHub ? "text-primary" : "text-[var(--foreground)]/50 hover:text(--foreground)")}>
            {selectedCity.name}
          </button>
        </>}

        {selectedHub && <>
          <span className="text-[var(--foreground)]/30">/</span>
          <span className="text-primary font-black uppercase text-xs tracking-wider">{selectedHub.name}</span>
        </>}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMN 1: Sovereign Region Tree (Country / State / District / City) */}
        <Card className="lg:col-span-2 p-5 bg-bg-secondary border-[var(--foreground)]/10 space-y-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]/60">Sovereign Hierarchy</h2>
            <div className="flex gap-1.5">
              {!selectedCountry && (
                <Button size="sm" onClick={() => openEditor("COUNTRY", "ADD", null)} className="h-7 px-2 bg-primary/20 hover:bg-primary/30 text-primary border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                  <PlusCircle className="w-3.5 h-3.5" /> Country
                </Button>
              )}
              {selectedCountry && !selectedState && (
                <Button size="sm" onClick={() => openEditor("STATE_PROVINCE", "ADD", selectedCountry.id)} className="h-7 px-2 bg-primary/20 hover:bg-primary/30 text-primary border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                  <PlusCircle className="w-3.5 h-3.5" /> State
                </Button>
              )}
              {selectedState && !selectedDistrict && (
                <Button size="sm" onClick={() => openEditor("DISTRICT", "ADD", selectedState.id)} className="h-7 px-2 bg-primary/20 hover:bg-primary/30 text-primary border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                  <PlusCircle className="w-3.5 h-3.5" /> District
                </Button>
              )}
              {selectedDistrict && !selectedCity && (
                <Button size="sm" onClick={() => openEditor("CITY_ISLAND", "ADD", selectedDistrict.id)} className="h-7 px-2 bg-primary/20 hover:bg-primary/30 text-primary border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                  <PlusCircle className="w-3.5 h-3.5" /> City
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
            {/* Render Country Selection */}
            {!selectedCountry && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                  <div key={c.id} className="group flex items-center justify-between p-3.5 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 hover:border-primary/20 transition-all">
                    <button onClick={() => setSelectedCountry(c)} className="flex-1 text-left">
                      <span className="text-sm font-bold text-[var(--foreground)] block">{c.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{c.zone_type}</span>
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditor("COUNTRY", "EDIT", null, c)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNode(c.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render States */}
            {selectedCountry && !selectedState && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground p-1 font-black uppercase tracking-wider">
                  <span>States in {selectedCountry.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor("COUNTRY", "EDIT", null, selectedCountry)} className="text-[10px] font-bold text-primary flex items-center gap-0.5"><Edit className="w-3 h-3" /> Edit Country</button>
                    <button onClick={() => handleDeleteNode(selectedCountry.id)} className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
                {states.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-6">No States/Provinces configured yet.</p>}
                {states.map(s => (
                  <div key={s.id} className="group flex items-center justify-between p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 hover:border-primary/20 transition-all">
                    <button onClick={() => setSelectedState(s)} className="flex-1 text-left font-bold text-sm text-[var(--foreground)]">{s.name}</button>
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditor("STATE_PROVINCE", "EDIT", selectedCountry.id, s)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteNode(s.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render Districts */}
            {selectedState && !selectedDistrict && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground p-1 font-black uppercase tracking-wider">
                  <span>Districts in {selectedState.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor("STATE_PROVINCE", "EDIT", selectedCountry.id, selectedState)} className="text-[10px] font-bold text-primary flex items-center gap-0.5"><Edit className="w-3 h-3" /> Edit State</button>
                    <button onClick={() => handleDeleteNode(selectedState.id)} className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
                {districts.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-6">No Districts configured yet.</p>}
                {districts.map(d => (
                  <div key={d.id} className="group flex items-center justify-between p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 hover:border-primary/20 transition-all">
                    <button onClick={() => setSelectedDistrict(d)} className="flex-1 text-left font-bold text-sm text-[var(--foreground)]">{d.name}</button>
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditor("DISTRICT", "EDIT", selectedState.id, d)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteNode(d.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render Cities */}
            {selectedDistrict && !selectedCity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground p-1 font-black uppercase tracking-wider">
                  <span>Cities/Islands in {selectedDistrict.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor("DISTRICT", "EDIT", selectedState.id, selectedDistrict)} className="text-[10px] font-bold text-primary flex items-center gap-0.5"><Edit className="w-3 h-3" /> Edit District</button>
                    <button onClick={() => handleDeleteNode(selectedDistrict.id)} className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
                {cities.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-6">No Cities/Islands configured yet.</p>}
                {cities.map(c => (
                  <div key={c.id} className="group flex items-center justify-between p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 hover:border-primary/20 transition-all">
                    <button onClick={() => setSelectedCity(c)} className="flex-1 text-left font-bold text-sm text-[var(--foreground)]">{c.name}</button>
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditor("CITY_ISLAND", "EDIT", selectedDistrict.id, c)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteNode(c.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* If City is selected, show general edit city info */}
            {selectedCity && (
              <div className="bg-[var(--foreground)]/5 p-4 rounded-xl border border-[var(--foreground)]/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-primary">Regional Parent Node</h3>
                  <div className="flex gap-2">
                    <button onClick={() => openEditor("CITY_ISLAND", "EDIT", selectedDistrict.id, selectedCity)} className="text-[10px] font-bold text-[var(--foreground)]/50 hover:text-primary flex items-center gap-0.5"><Edit className="w-3 h-3" /> Edit City</button>
                    <button onClick={() => handleDeleteNode(selectedCity.id)} className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-bold text-[var(--foreground)]">{selectedCity.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">Coordinates: {selectedCity.coordinates || "Not Configured"}</div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* COLUMN 2: Physical Logistics Hubs (Under City) */}
        <Card className="p-5 bg-bg-secondary border-[var(--foreground)]/10 space-y-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]/60">Logistics Hubs</h2>
            {selectedCity && (
              <Button size="sm" onClick={() => openEditor("ADMIN_HUB", "ADD", selectedCity.id)} className="h-7 px-2 bg-success/20 hover:bg-success/30 text-success border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                <Plus className="w-3.5 h-3.5" /> Commission
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
            {!selectedCity && (
              <p className="text-xs text-muted-foreground italic text-center py-12">Select a City first to inspect physical Admin Hubs.</p>
            )}
            {selectedCity && hubs.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-12">No Admin Hubs commissioned for {selectedCity.name} yet.</p>
            )}
            {selectedCity && hubs.map(h => {
              const isSelected = selectedHub?.id === h.id;
              const isInactive = h.status === 'INACTIVE';
              return (
                <div 
                  key={h.id} 
                  className={cn(
                    "group flex flex-col p-4 rounded-xl border transition-all relative overflow-hidden",
                    isSelected 
                      ? "bg-primary/15 border-primary/30 text-foreground" 
                      : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 hover:border-primary/20",
                    isInactive && "opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <button onClick={() => setSelectedHub(isSelected ? null : h)} className="flex-1 text-left">
                      <span className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1">
                        📍 {h.name}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 block">
                        CODE: {h.hub_code || "N/A"}
                      </span>
                    </button>
                    <div className="flex gap-1.5 shrink-0 transition-opacity">
                      <button onClick={() => handleToggleStatus(h.id)} title="Toggle Active/Inactive" className="p-1 hover:text-primary">
                        {isInactive ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button onClick={() => openEditor("ADMIN_HUB", "EDIT", selectedCity.id, h)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNode(h.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-3 flex justify-between">
                    <span>Manager: {h.manager_name || "N/A"}</span>
                    <span>Fleet: {h.rider_capacity || 0} Riders</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* COLUMN 3: Active Delivery Zones (Under Hub) */}
        <Card className="p-5 bg-bg-secondary border-[var(--foreground)]/10 space-y-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]/60">Delivery Zones</h2>
            {selectedHub && (
              <Button size="sm" onClick={() => openEditor("DELIVERY_ZONE", "ADD", selectedHub.id)} className="h-7 px-2 bg-success/20 hover:bg-success/30 text-success border-transparent rounded-lg flex items-center gap-1 text-[10px] font-black uppercase">
                <Plus className="w-3.5 h-3.5" /> Add Zone
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
            {!selectedHub && (
              <p className="text-xs text-muted-foreground italic text-center py-12">Select an Admin Hub to configure area-wise delivery settings.</p>
            )}
            {selectedHub && activeZones.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-12">No Delivery Zones configured for {selectedHub.name} yet.</p>
            )}
            {selectedHub && activeZones.map(z => {
              const isInactive = z.status === 'INACTIVE';
              return (
                <div 
                  key={z.id} 
                  className={cn(
                    "group flex flex-col p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 hover:border-primary/20 transition-all",
                    isInactive && "opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1">
                        🚚 {z.name}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-2 grid grid-cols-2 gap-1 bg-[var(--foreground)]/5 p-2 rounded-lg border border-[var(--foreground)]/5">
                        <div>Charge: <span className="font-bold text-primary">₹{z.delivery_charge || 0}</span></div>
                        <div>Min Order: <span className="font-bold text-primary">₹{z.minimum_order || 0}</span></div>
                        <div className="col-span-2">ETA: <span className="font-bold text-[var(--foreground)]">{z.eta_mins || 30} mins</span></div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0 transition-opacity">
                      <button onClick={() => handleToggleStatus(z.id)} title="Toggle Active Status" className="p-1 hover:text-primary">
                        {isInactive ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button onClick={() => openEditor("DELIVERY_ZONE", "EDIT", z.parent_id, z)} className="p-1 hover:text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNode(z.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* Modern Dialog/Drawer Editor Modal */}
      {editorModal && editorModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-lg p-6 bg-bg-secondary border border-[var(--foreground)]/10 shadow-2xl relative space-y-6">
            <button 
              onClick={() => setEditorModal(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center hover:bg-[var(--foreground)]/15 transition-all text-muted-foreground hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--foreground)]">
                {editorModal.mode === "ADD" ? "Commission" : "Modify"} {editorModal.type.replace("_", " ")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Calibrate configuration parameters in the sovereign registry.</p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Node Name</label>
                <input 
                  value={editorModal.name}
                  onChange={e => setEditorModal({ ...editorModal, name: e.target.value })}
                  placeholder="e.g. South Andaman, Dollygunj Hub..."
                  className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                />
              </div>

              {editorModal.type !== "DELIVERY_ZONE" && (
                <div>
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Telemetry Coordinates (Lat, Lng)</label>
                  <input 
                    value={editorModal.coordinates}
                    onChange={e => setEditorModal({ ...editorModal, coordinates: e.target.value })}
                    placeholder="e.g. 11.6350, 92.7079"
                    className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                  />
                </div>
              )}

              {/* Hub fields */}
              {editorModal.type === "ADMIN_HUB" && (
                <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Hub Code</label>
                      <input 
                        value={editorModal.hub_code}
                        onChange={e => setEditorModal({ ...editorModal, hub_code: e.target.value })}
                        placeholder="e.g. PB-DOL-01"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Manager Name</label>
                      <input 
                        value={editorModal.manager_name}
                        onChange={e => setEditorModal({ ...editorModal, manager_name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Rider Fleet Capacity</label>
                      <input 
                        type="number"
                        value={editorModal.rider_capacity}
                        onChange={e => setEditorModal({ ...editorModal, rider_capacity: Number(e.target.value) })}
                        placeholder="e.g. 15"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Allowed Delivery Slots</label>
                    <div className="grid grid-cols-1 gap-3 bg-[var(--foreground)]/5 p-4 rounded-xl border border-[var(--foreground)]/10">
                      {[
                        { key: "TODAY_AM", label: "Today Morning (10:00 AM – 12:00 PM)" },
                        { key: "TODAY_PM", label: "Today Evening (4:00 PM – 7:00 PM)" },
                        { key: "TOMORROW", label: "Tomorrow (Next Day Delivery)" }
                      ].map(slot => {
                        const isChecked = (editorModal.allowed_slots || []).includes(slot.key);
                        return (
                          <div key={slot.key} className="space-y-1.5 pb-1 border-b border-[var(--foreground)]/5 last:border-b-0 last:pb-0">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[var(--foreground)] hover:text-primary transition-colors">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  const newSlots = e.target.checked 
                                    ? [...(editorModal.allowed_slots || []), slot.key]
                                    : (editorModal.allowed_slots || []).filter(k => k !== slot.key);
                                  setEditorModal({ ...editorModal, allowed_slots: newSlots });
                                }}
                                className="rounded border-[var(--foreground)]/20 text-primary focus:ring-primary focus:ring-offset-bg bg-[var(--foreground)]/5 w-4 h-4"
                              />
                              <span>{slot.label}</span>
                            </label>
                            {isChecked && (
                              <input 
                                value={editorModal.custom_slots?.[slot.key] || ""}
                                onChange={e => {
                                  const newCustom = { ...(editorModal.custom_slots || {}), [slot.key]: e.target.value };
                                  setEditorModal({ ...editorModal, custom_slots: newCustom });
                                }}
                                placeholder="Override Time (e.g. 6:00 AM – 7:00 AM)"
                                className="w-full max-w-[280px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-2 rounded-lg text-[var(--foreground)] outline-none focus:border-primary/50 text-[11px] mt-1 ml-7 block"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Zone fields */}
              {editorModal.type === "DELIVERY_ZONE" && (
                <div className="space-y-4 pt-4 border-t border-[var(--foreground)]/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Delivery Charge (₹)</label>
                      <input 
                        type="number"
                        value={editorModal.delivery_charge}
                        onChange={e => setEditorModal({ ...editorModal, delivery_charge: Number(e.target.value) })}
                        placeholder="e.g. 40"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Min Order Limit (₹)</label>
                      <input 
                        type="number"
                        value={editorModal.minimum_order}
                        onChange={e => setEditorModal({ ...editorModal, minimum_order: Number(e.target.value) })}
                        placeholder="e.g. 300"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">ETA Duration (Mins)</label>
                      <input 
                        type="number"
                        value={editorModal.eta_mins}
                        onChange={e => setEditorModal({ ...editorModal, eta_mins: Number(e.target.value) })}
                        placeholder="e.g. 25"
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-3 rounded-xl text-[var(--foreground)] outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Allowed Delivery Slots</label>
                    <div className="grid grid-cols-1 gap-3 bg-[var(--foreground)]/5 p-4 rounded-xl border border-[var(--foreground)]/10">
                      {[
                        { key: "TODAY_AM", label: "Today Morning (10:00 AM – 12:00 PM)" },
                        { key: "TODAY_PM", label: "Today Evening (4:00 PM – 7:00 PM)" },
                        { key: "TOMORROW", label: "Tomorrow (Next Day Delivery)" }
                      ].map(slot => {
                        const isChecked = (editorModal.allowed_slots || []).includes(slot.key);
                        return (
                          <div key={slot.key} className="space-y-1.5 pb-1 border-b border-[var(--foreground)]/5 last:border-b-0 last:pb-0">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-[var(--foreground)] hover:text-primary transition-colors">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  const newSlots = e.target.checked 
                                    ? [...(editorModal.allowed_slots || []), slot.key]
                                    : (editorModal.allowed_slots || []).filter(k => k !== slot.key);
                                  setEditorModal({ ...editorModal, allowed_slots: newSlots });
                                }}
                                className="rounded border-[var(--foreground)]/20 text-primary focus:ring-primary focus:ring-offset-bg bg-[var(--foreground)]/5 w-4 h-4"
                              />
                              <span>{slot.label}</span>
                            </label>
                            {isChecked && (
                              <input 
                                value={editorModal.custom_slots?.[slot.key] || ""}
                                onChange={e => {
                                  const newCustom = { ...(editorModal.custom_slots || {}), [slot.key]: e.target.value };
                                  setEditorModal({ ...editorModal, custom_slots: newCustom });
                                }}
                                placeholder="Override Time (e.g. 6:00 AM – 7:00 AM)"
                                className="w-full max-w-[280px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-2 rounded-lg text-[var(--foreground)] outline-none focus:border-primary/50 text-[11px] mt-1 ml-7 block"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Geofence Map Drawer for Hubs & Zones */}
              {(editorModal.type === "ADMIN_HUB" || editorModal.type === "DELIVERY_ZONE") && (
                <div className={cn(
                  "space-y-2 pt-4 border-t border-[var(--foreground)]/5 transition-all duration-300",
                  isMapEnlarged 
                    ? "fixed inset-4 md:inset-10 z-[9999] bg-bg-secondary rounded-2xl border border-[var(--foreground)]/20 shadow-2xl p-6 flex flex-col space-y-4" 
                    : "relative flex flex-col"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest block">Geofence Boundary Map</label>
                      <p className="text-[9px] text-muted-foreground">
                        {editorModal.type === "ADMIN_HUB" 
                          ? "Drag the marker on the map to set the exact logistics hub coordinates." 
                          : "Use the draw polygon tool on the right side of the map to outline the strict geofence boundary."}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsMapEnlarged(!isMapEnlarged)}
                      className="h-7 px-2.5 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] border-transparent rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider"
                    >
                      {isMapEnlarged ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" /> Minimize Map
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" /> Enlarge Map
                        </>
                      )}
                    </Button>
                  </div>
                  <div 
                    id="editor-leaflet-map" 
                    className="bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/10 overflow-hidden relative w-full"
                    style={{ 
                      height: isMapEnlarged ? '450px' : '240px', 
                      minHeight: isMapEnlarged ? '400px' : '240px' 
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end border-t border-[var(--foreground)]/5 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setEditorModal(null)}
                className="px-6 rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNode} 
                disabled={loading}
                className="px-8 bg-primary uppercase font-black text-[11px] tracking-widest shadow-glow-purple h-auto rounded-xl flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editorModal.mode === "ADD" ? "Create Node" : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
