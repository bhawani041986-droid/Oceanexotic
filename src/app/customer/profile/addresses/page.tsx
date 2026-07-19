"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  MapPin, 
  Plus, 
  Home as HomeIcon, 
  Briefcase, 
  Ship, 
  Trash2, 
  CheckCircle2,
  X,
  Navigation
} from "lucide-react";

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [type, setType] = useState("HOME");
  const [hotelName, setHotelName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [jetty, setJetty] = useState("Phoenix Bay Jetty");
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [lat, setLat] = useState<number>(11.6234);
  const [lng, setLng] = useState<number>(92.7265);

  const fetchAddresses = async () => {
    try {
      // Get user from local storage or cookie
      const authUserStr = localStorage.getItem("oceanexotic-auth");
      let userId = "1";
      if (authUserStr) {
        try {
          const parsed = JSON.parse(authUserStr);
          if (parsed.state?.user?.id) userId = parsed.state.user.id;
        } catch {}
      }

      const res = await fetch(`/api/user/addresses?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch (e) {
      console.error("Failed to load addresses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine || !phone) return;

    setSubmitting(true);
    try {
      const authUserStr = localStorage.getItem("oceanexotic-auth");
      let userId = "1";
      if (authUserStr) {
        try {
          const parsed = JSON.parse(authUserStr);
          if (parsed.state?.user?.id) userId = parsed.state.user.id;
        } catch {}
      }

      await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          type,
          hotel_name: hotelName,
          room_no: roomNo,
          jetty,
          address: addressLine,
          phone,
          is_default: isDefault,
          latitude: lat,
          longitude: lng,
        }),
      });

      setModalOpen(false);
      setHotelName("");
      setRoomNo("");
      setAddressLine("");
      setPhone("");
      fetchAddresses();
    } catch (e) {
      console.error("Failed to add address", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch (e) {
      console.error("Failed to delete address", e);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
        },
        (err) => console.warn("Geolocation error", err)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Saved Addresses</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Manage Your Delivery Addresses & Pinpoint Coordinates</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setModalOpen(true)}
          className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> ADD NEW ADDRESS
        </Button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-8">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-xs uppercase font-bold text-slate-400">Loading Address Vault…</div>
        ) : addresses.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-xs uppercase font-bold text-slate-400">No saved addresses found. Register a node below.</div>
        ) : (
          addresses.map((port) => (
            <Card 
              key={port.id} 
              className={`p-[10px] md:p-8 space-y-[10px] md:space-y-6 group transition-all hover:border-primary/40 rounded-[20px] md:rounded-[30px] ${port.is_default ? "border-primary/20 bg-primary/5 shadow-glow-purple/10" : "bg-bg-secondary/40 border-white/5"}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary shrink-0">
                  {port.type === "HOME" ? <HomeIcon className="w-5 h-5 md:w-6 md:h-6" /> : port.type === "WORK" ? <Briefcase className="w-5 h-5 md:w-6 md:h-6" /> : <Ship className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                {port.is_default ? (
                  <Badge variant="success" className="bg-success/20 text-success border-success/20 uppercase text-[8px] tracking-[0.2em] h-6 px-3">
                     <CheckCircle2 className="w-3 h-3 mr-2" /> PRIMARY
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-1 md:space-y-2">
                <h4 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tight uppercase italic">{port.hotel_name || port.label || "Residence"}</h4>
                <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-relaxed italic">
                  {port.address || port.address_line1}
                </p>
                {port.jetty && <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Jetty: {port.jetty}</p>}
                {port.latitude && port.longitude ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" /> GPS: {Number(port.latitude).toFixed(4)}, {Number(port.longitude).toFixed(4)}
                  </div>
                ) : null}
              </div>

              <div className="pt-4 border-t border-[var(--foreground)]/5 flex items-center justify-between">
                 <button 
                  onClick={() => handleDelete(port.id)}
                  className="p-2 rounded-full hover:bg-danger/10 text-text-secondary hover:text-danger transition-all flex items-center gap-1 text-[10px] font-bold"
                 >
                    <Trash2 className="w-4 h-4" /> Delete
                 </button>
              </div>
            </Card>
          ))
        )}

        {/* Add New Empty State Button */}
        <button 
          onClick={() => setModalOpen(true)}
          className="group p-8 rounded-[30px] border-2 border-dashed border-[var(--foreground)]/10 hover:border-primary/40 transition-all flex flex-col items-center justify-center space-y-4 bg-transparent min-h-[200px]"
        >
           <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
              <Plus className="w-7 h-7" />
           </div>
           <div className="text-center">
              <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">ADD NEW ADDRESS NODE</p>
              <p className="text-[9px] text-text-secondary font-medium mt-1">Register address with pinpoint map coordinates.</p>
           </div>
        </button>
      </div>

      {/* Add Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Register Delivery Node</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              {/* Type Select */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Type / Label</label>
                <div className="flex gap-2">
                  {["HOME", "WORK", "HOTEL", "OTHER"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${type === t ? "border-primary bg-primary/20 text-white" : "border-slate-800 bg-slate-900 text-slate-400"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinpoint Location Leaflet Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pinpoint Map Coordinates</label>
                  <button 
                    type="button" 
                    onClick={handleLocateMe} 
                    className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1 hover:underline"
                  >
                    <Navigation className="w-3 h-3" /> Get Current Location
                  </button>
                </div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-700">
                  <iframe
                    className="w-full h-full border-0"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          body, html, #map { margin:0; padding:0; height:100%; width:100%; background:#0f172a; }
                          .leaflet-control-attribution { display:none; }
                        </style>
                      </head>
                      <body>
                        <div id="map"></div>
                        <script>
                          var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
                          L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 19 }).addTo(map);
                          var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
                          map.on('click', function(e) {
                            marker.setLatLng(e.latlng);
                          });
                        </script>
                      </body>
                      </html>
                    `}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-teal-400 font-bold">
                  <span>Selected Pin: {lat}, {lng}</span>
                </div>
              </div>

              {/* Hotel / Resort Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Hotel / Resort / Building Name</label>
                <input
                  type="text"
                  placeholder="e.g. Symphony Palms Resort"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Govind Nagar Beach No 3, Havelock"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Commissioning…" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logistics Notice */}
      <Card className="p-[10px] md:p-10 bg-bg-secondary/40 border border-[var(--foreground)]/5 flex items-center gap-[10px] md:gap-8 rounded-[20px] md:rounded-[30px]">
         <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[18px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Ship className="w-6 h-6 md:w-7 md:h-7" />
         </div>
         <div className="space-y-0.5 md:space-y-1">
            <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase italic tracking-tight">Delivery Routing</h4>
            <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-relaxed italic">
               Saved addresses with pinpoint coordinates are used to calculate the most efficient delivery route to your destination.
            </p>
         </div>
      </Card>
    </div>
  );
}
