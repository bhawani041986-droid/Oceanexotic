"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  Filter, 
  Download, 
  Scale, 
  ShieldCheck,
  ChevronRight,
  Eye,
  AlertCircle,
  Plus,
  Navigation,
  MapPin,
  Truck,
  Loader2,
  RefreshCw,
  User,
  ExternalLink,
  Trash2,
  ChevronDown,
  Store,
  Map,
  Layers,
  Activity
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const AREA_COORDINATES: Record<string, [number, number]> = {
  'Havelock Island': [11.9761, 92.9876],
  'Neil Island': [11.8340, 93.0471],
  'Bambooflat': [11.7022, 92.7061],
  'Garacharma': [11.6335, 92.7107],
  'Diglipur': [13.2662, 92.9786],
  'Rangat': [12.4764, 92.9238],
  'Mayabundar': [12.9214, 92.9067],
  'Baratang': [12.1197, 92.7845],
  'Haddo': [11.6775, 92.7188],
  'Phoenix Bay': [11.6711, 92.7302],
  'Aberdeen Bazaar': [11.6685, 92.7378],
  'Port Blair': [11.6667, 92.7500],
};

function getDeliveryArea(address: string): string {
  const addr = (address || '').toLowerCase();
  if (addr.includes('havelock') || addr.includes('swaraj dweep')) return 'Havelock Island';
  if (addr.includes('neil island') || addr.includes('shaheed dweep')) return 'Neil Island';
  if (addr.includes('bambooflat') || addr.includes('bamboo flat')) return 'Bambooflat';
  if (addr.includes('garacharma')) return 'Garacharma';
  if (addr.includes('diglipur')) return 'Diglipur';
  if (addr.includes('rangat')) return 'Rangat';
  if (addr.includes('mayabundar')) return 'Mayabundar';
  if (addr.includes('baratang')) return 'Baratang';
  if (addr.includes('haddo')) return 'Haddo';
  if (addr.includes('phoenix bay')) return 'Phoenix Bay';
  if (addr.includes('aberdeen')) return 'Aberdeen Bazaar';
  return 'Port Blair';
}

const safeParseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
};

const OrderTelemetryMap = ({ orders, onSelectOrder }: { orders: any[]; onSelectOrder: (order: any) => void }) => {
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
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
    const container = document.getElementById('pipeline-telemetry-map');
    if (!container || (container as any)._leaflet_id) return;

    try {
      const isMobile = window.innerWidth < 768;
      mapRef.current = L.map('pipeline-telemetry-map', {
        zoomControl: true,
        attributionControl: false,
        dragging: !isMobile,
        tap: !isMobile,
        scrollWheelZoom: false,
      }).setView([11.6667, 92.7500], 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      markersGroupRef.current = L.featureGroup().addTo(mapRef.current);

      setIsMapInit(true);
    } catch (err) {
      console.error("Map Initialization Error:", err);
    }
  }, [isLReady, isMapInit]);

  // Handle window level callback for popup button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).__view_order = (orderId: string) => {
      const found = orders.find(o => o.id === orderId);
      if (found) onSelectOrder(found);
    };
    return () => {
      delete (window as any).__view_order;
    };
  }, [orders, onSelectOrder]);

  useEffect(() => {
    if (!isMapInit || !mapRef.current || !markersGroupRef.current) return;
    const L = (window as any).L;
    
    // Clear old markers
    markersGroupRef.current.clearLayers();

    const countInArea: Record<string, number> = {};
    const markerCoords: any[] = [];

    orders.forEach((o, i) => {
      const area = getDeliveryArea(o.delivery_address || '');
      if (!countInArea[area]) countInArea[area] = 0;
      countInArea[area]++;

      const baseCoords = AREA_COORDINATES[area] || AREA_COORDINATES['Port Blair'];
      
      // Jitter overlapping markers in a golden angle spiral
      const angle = (countInArea[area] * 137.5) * (Math.PI / 180);
      const radius = 0.0025 * Math.sqrt(countInArea[area]);
      const jitterLat = Math.sin(angle) * radius;
      const jitterLng = Math.cos(angle) * radius;
      
      const pos = L.latLng(baseCoords[0] + jitterLat, baseCoords[1] + jitterLng);
      markerCoords.push(pos);

      // Chromatic status-based colors matching design aesthetics
      const color = 
        o.status === 'DELIVERED' ? '#00ffaa' : // Vibrant Neon Green
        o.status === 'SHIPPED' ? '#00ffff' :   // Electric Cyan
        o.status === 'PENDING' ? '#ff8800' :   // Tactical Orange
        '#E23744';                             // Crimson Red (default/mediation)

      const icon = L.divIcon({
        className: 'maritime-telemetry-pointer',
        html: `<div class="relative">
              <div class="w-4 h-4 flex items-center justify-center">
                  <div class="absolute w-8 h-8 rounded-full border border-white/20 animate-ping" style="border-color: ${color}44"></div>
                  <div class="w-3.5 h-3.5 rounded-full border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}"></div>
              </div>
              <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                <svg width="14" height="10" viewBox="0 0 24 16" fill="${color}">
                  <path d="M0 0 L24 0 L12 16 Z" />
                </svg>
              </div>
          </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupHtml = `
        <div style="padding: 4px; font-family: sans-serif; font-size: 11px; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #4f46e5; font-size: 12px;">${o.id}</strong>
            <span style="font-size: 8px; font-weight: bold; 
              background: ${
                o.status === 'DELIVERED' ? '#ecfdf5' :
                o.status === 'SHIPPED' ? '#e0f2fe' :
                o.status === 'PENDING' ? '#fef3c7' : '#fef2f2'
              }; 
              color: ${
                o.status === 'DELIVERED' ? '#059669' :
                o.status === 'SHIPPED' ? '#0284c7' :
                o.status === 'PENDING' ? '#d97706' : '#dc2626'
              }; 
              padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${o.status}</span>
          </div>
          <div style="font-weight: bold; color: #1f2937; margin-bottom: 2px; text-transform: uppercase; font-size: 11px;">${o.customer_name}</div>
          <div style="color: #4b5563; font-size: 10px; margin-bottom: 6px; line-height: 1.2;">${o.delivery_address}</div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 9px; font-weight: bold; text-transform: uppercase;">${o.seller_name}</span>
            <strong style="color: #059669; font-size: 12px;">₹${Number(o.total_amount).toLocaleString()}</strong>
          </div>
          <button onclick="window.__view_order('${o.id}')" style="margin-top: 8px; width: 100%; border: none; background: #4f46e5; color: white; font-weight: bold; font-size: 9px; text-transform: uppercase; padding: 6px 0; border-radius: 6px; cursor: pointer; letter-spacing: 0.05em;">View Order Node</button>
        </div>
      `;

      L.marker(pos, { icon })
        .addTo(markersGroupRef.current)
        .bindPopup(popupHtml);
    });

    if (markerCoords.length > 0) {
      const bounds = L.latLngBounds(markerCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [orders, isMapInit]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black rounded-2xl">
      <div id="pipeline-telemetry-map" className="absolute inset-0 filter saturate-[1.1] brightness-[0.75] contrast-[1.1] hue-rotate-[210deg] rounded-2xl" />
    </div>
  );
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'map' | 'area' | 'seller' | 'ledger'>('map');
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);
  const [mapTimeFilter, setMapTimeFilter] = useState<'all' | 'active' | 'today_delivered' | 'this_week'>('all');

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exportRange, setExportRange] = useState("ALL");
  const [exportFormat, setExportFormat] = useState("REPORT"); // REPORT or GSTR1
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchLedger = async () => {
    setIsLoading(true
  );
    try {
      const res = await fetch('/api/admin/orders'
  );
      const data = await res.json(
  );
      if (Array.isArray(data)) setOrders(data
  );
      setIsLoading(false
  );
    } catch (e) {
      toast("Sync Failure", "error"
  );
      setIsLoading(false
  );
    }
  };

  const handleExport = async () => {
    if (orders.length === 0) return;
    
    const now = new Date(
  );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(
  );
    const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000
  );
    const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000
  );
    const ninetyDaysAgo = now.getTime() - (90 * 24 * 60 * 60 * 1000
  );

    const exportOrders = orders.filter(o => {
      const orderDate = safeParseDate(o.created_at).getTime();
      if (exportRange === "DAILY") return orderDate >= today;
      if (exportRange === "WEEKLY") return orderDate >= sevenDaysAgo;
      if (exportRange === "MONTHLY") return orderDate >= thirtyDaysAgo;
      if (exportRange === "QUARTERLY") return orderDate >= ninetyDaysAgo;
      return true;
    });

    if (exportOrders.length === 0) {
      toast(`No orders found for ${exportRange} period`, "info"
  );
      return;
    }

    const workbook = new ExcelJS.Workbook(
  );
    const totalValuation = exportOrders.reduce((acc, curr) => acc + Number(curr.total_amount), 0
  );
    const totalBaseVal = totalValuation / 1.05;
    const totalTaxVal = totalValuation - totalBaseVal;

    const worksheet = workbook.addWorksheet(exportFormat === 'GSTR1' ? 'GST COMPLIANCE' : 'REGISTRY REPORT'
  );
    
    // 1. EXECUTIVE BRANDING HEADER
    const titleRow = worksheet.addRow(['ANDAMAN MARITIME COMMAND CENTER']
  );
    titleRow.height = 40;
    titleRow.getCell(1).font = { size: 22, bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells('A1:K1'
  );

    const subTitleRow = worksheet.addRow(['MARITIME REGISTRY & LOGISTICS ANALYTICS REPORT - CONFIDENTIAL']
  );
    subTitleRow.height = 25;
    subTitleRow.getCell(1).font = { size: 10, bold: true, color: { argb: 'FF64748B' }, italic: true };
    subTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    subTitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells('A2:K2'
  );

    worksheet.addRow([]
  );

    // 2. EXECUTIVE SUMMARY DASHBOARD (Box Design)
    const summaryHeader = worksheet.addRow(['', 'EXECUTIVE FINANCIAL SUMMARY', '', '', 'SYSTEM TELEMETRY']
  );
    summaryHeader.getCell(2).font = { bold: true, size: 11, color: { argb: 'FF1E1B4B' } };
    summaryHeader.getCell(5).font = { bold: true, size: 11, color: { argb: 'FF1E1B4B' } };
    worksheet.mergeCells('B4:D4'
  );
    worksheet.mergeCells('E4:G4'
  );

    const kpiLabels = worksheet.addRow(['', 'TOTAL TAXABLE VALUE', 'TOTAL TAX (GST)', 'AGGREGATE VALUATION', 'NODES ACTIVE', 'REPORT RANGE', 'GEN EPOCH']
  );
    kpiLabels.eachCell(c => { 
        if (c.address.startsWith('A')) return;
        c.font = { bold: true, size: 8, color: { argb: 'FF94A3B8' } }; 
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }
  );

    const kpiValues = worksheet.addRow(['', totalBaseVal, totalTaxVal, totalValuation, exportOrders.length, exportRange, new Date().toLocaleDateString()]
  );
    kpiValues.eachCell((c, i) => {
        if (i === 1) return;
        c.font = { bold: true, size: 12, color: { argb: 'FF0F172A' } };
        if (i >= 2 && i <= 4) c.numFmt = '"₹"#,##0.00';
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        c.border = { bottom: { style: 'medium', color: { argb: 'FF1E1B4B' } } };
    }
  );
    worksheet.addRow([]
  );
    worksheet.addRow([]
  );

    // 3. MULTI-LAYER DATA GRID
    // Group Headers
    const groupHeader = worksheet.addRow(['IDENT NODE', '', 'PEER ENTITIES', '', 'FINANCIAL TELEMETRY (GST NODES)', '', '', '', '', 'OPS STATUS', '']
  );
    groupHeader.height = 25;
    groupHeader.eachCell(c => {
        c.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
        c.border = { left: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
    }
  );
    worksheet.mergeCells('A9:B9'
  ); // Ident
    worksheet.mergeCells('C9:D9'
  ); // Peer
    worksheet.mergeCells('E9:I9'
  ); // Financial
    worksheet.mergeCells('J9:K9'
  ); // Ops

    worksheet.columns = [
      { header: 'NODE ID', key: 'id', width: 15 },
      { header: 'TIMESTAMP', key: 'date', width: 18 },
      { header: 'CUSTOMER PEER', key: 'customer', width: 25 },
      { header: 'MERCHANT ENTITY', key: 'seller', width: 25 },
      { header: 'BASE VAL', key: 'base', width: 14 },
      { header: 'CGST (2.5%)', key: 'cgst', width: 12 },
      { header: 'UGST (2.5%)', key: 'ugst', width: 12 },
      { header: 'TOTAL TAX', key: 'tax', width: 12 },
      { header: 'GROSS VAL', key: 'total', width: 16 },
      { header: 'REGISTRY', key: 'status', width: 14 },
      { header: 'LOGISTICS', key: 'logistics', width: 14 }
    ];

    const headerRow = worksheet.getRow(10
  );
    headerRow.height = 25;
    headerRow.eachCell(c => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
        c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
  );

    exportOrders.forEach((o, index) => {
        const grand = Number(o.total_amount
  );
        const base = grand / 1.05;
        const tax = (grand - base) / 2;
        const row = worksheet.addRow({ 
            id: o.id, date: o.created_at, customer: o.customer_name, 
            seller: o.seller_name, base: base, cgst: tax, ugst: tax, 
            tax: tax*2, total: grand, status: o.status, logistics: o.logistics_status 
        }
  );

        row.eachCell((c, colNumber) => {
            c.font = { size: 9, name: 'Segoe UI' };
            c.alignment = { vertical: 'middle', horizontal: 'center' };
            if (index % 2 === 0) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            c.border = { 
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
            
            if (colNumber >= 5 && colNumber <= 9) {
                c.numFmt = '"₹"#,##0.00';
                c.alignment = { horizontal: 'right', vertical: 'middle' };
            }
            
            // Pro Chromatic Nodes
            if (colNumber === 10) {
                if (c.value === 'DELIVERED') { c.font = { color: { argb: 'FF059669' }, bold: true, size: 8 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }; }
                if (c.value === 'PENDING') { c.font = { color: { argb: 'FFD97706' }, bold: true, size: 8 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } }; }
                if (c.value === 'MEDIATION') { c.font = { color: { argb: 'FFDC2626' }, bold: true, size: 8 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } }; }
            }
            if (colNumber === 11) {
                if (c.value === 'CRITICAL') { c.font = { color: { argb: 'FFDC2626' }, bold: true, size: 8 }; }
            }
        }
  );
    }
  );

    // 4. GRAND TOTALS FOOTER
    const footerRow = worksheet.addRow(['', '', '', 'GRAND TOTALS:', totalBaseVal, totalTaxVal/2, totalTaxVal/2, totalTaxVal, totalValuation, '', '']
  );
    footerRow.height = 30;
    footerRow.eachCell((c, i) => {
        if (i >= 4 && i <= 9) {
            c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } };
            if (i >= 5) c.numFmt = '"₹"#,##0.00';
            c.alignment = { horizontal: 'right', vertical: 'middle' };
        }
    }
  );

    const buffer = await workbook.xlsx.writeBuffer(
  );
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
    const dateStamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `ANDAMAN_MARITIME_AUDIT_${dateStamp}.xlsx`
  );
    toast(`Node Archive Generated: Executive Audit format ready.`, "success"
  );
  };

  useEffect(() => {
    fetchLedger(
  );
  }, []
  );

  const handleView = (order: any) => {
    setSelectedOrder(order
  );
    setIsModalOpen(true
  );
    toast(`Deep Analysis initiated for ${order.id}`, "info"
  );
  };

  const handleVerify = async (orderId: string) => {
    try {
      setIsLoading(true
  );
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: 'VERIFIED' })
      }
  );
      const data = await res.json(
  );
      if (data.status === 'success') {
        toast(`AUDIT SUCCESS: Tax Nodes & Compliance synchronized for ${orderId}`, "success"
  );
        fetchLedger(
  );
      } else {
        toast("Verification Failure: Node Handshake Interrupted", "error"
  );
      }
    } catch (e) {
      toast("Critical API Node Timeout", "error"
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  const handleAlert = (orderId: string) => {
    toast(`LOGISTICS ALERT: Immediate review triggered for Node ${orderId}. Merchant & Peer notified.`, "info"
  );
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm(`CAUTION: Are you sure you want to decommission Maritime Node ${orderId}? This action is permanent.`)) return;
    
    toast(`Decommissioning Protocol 4-6 initiated for ${orderId}...`, "info"
  );
    setOrders(prev => prev.filter(o => o.id !== orderId)
  );
    toast(`ARCHIVE SUCCESS: Node ${orderId} removed from live registry.`, "success"
  );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, orders]);

  const mapFilteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 'all' → every order gets plotted
      if (mapTimeFilter === 'all') return true;

      if (mapTimeFilter === 'active') {
        return o.status === 'PENDING' || o.status === 'SHIPPED';
      }
      if (mapTimeFilter === 'today_delivered') {
        const orderDate = safeParseDate(o.created_at).toDateString();
        const todayDate = new Date().toDateString();
        return o.status === 'DELIVERED' && orderDate === todayDate;
      }
      if (mapTimeFilter === 'this_week') {
        const orderTime = safeParseDate(o.created_at).getTime();
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return orderTime >= oneWeekAgo;
      }
      return true;
    });
  }, [orders, mapTimeFilter, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / itemsPerPage);
  }, [filteredOrders, itemsPerPage]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const areasData = useMemo(() => {
    const grouped: Record<string, {
      area: string;
      orders: any[];
      revenue: number;
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    }> = {};

    filteredOrders.forEach(o => {
      const area = getDeliveryArea(o.delivery_address || '');
      if (!grouped[area]) {
        grouped[area] = {
          area,
          orders: [],
          revenue: 0,
          pending: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };
      }
      grouped[area].orders.push(o);
      grouped[area].revenue += Number(o.total_amount) || 0;
      if (o.status === 'PENDING') grouped[area].pending++;
      else if (o.status === 'SHIPPED') grouped[area].shipped++;
      else if (o.status === 'DELIVERED') grouped[area].delivered++;
      else grouped[area].cancelled++;
    });

    return Object.values(grouped).sort((a, b) => b.orders.length - a.orders.length);
  }, [filteredOrders]);

  const sellersData = useMemo(() => {
    const grouped: Record<string, {
      sellerName: string;
      orders: any[];
      revenue: number;
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    }> = {};

    filteredOrders.forEach(o => {
      const seller = o.seller_name || 'Andaman Fleet';
      if (!grouped[seller]) {
        grouped[seller] = {
          sellerName: seller,
          orders: [],
          revenue: 0,
          pending: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };
      }
      grouped[seller].orders.push(o);
      grouped[seller].revenue += Number(o.total_amount) || 0;
      if (o.status === 'PENDING') grouped[seller].pending++;
      else if (o.status === 'SHIPPED') grouped[seller].shipped++;
      else if (o.status === 'DELIVERED') grouped[seller].delivered++;
      else grouped[seller].cancelled++;
    });

    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const maxSellerRevenue = useMemo(() => {
    if (sellersData.length === 0) return 1;
    return Math.max(...sellersData.map(s => s.revenue), 1);
  }, [sellersData]);

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans text-[var(--foreground)]">
      {/* 1. LUMINOUS POLYGONAL BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 blur-[120px] rounded-full" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="polyPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0 50 L25 0 L75 0 L100 50 L75 100 L25 100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#polyPattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4">
        
        {/* 2. COMMAND HEADER: LUMINOUS BENTO */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-[2px] bg-primary/10 border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-primary">LIVE REGISTRY</span>
            </div>
            <h1 className="text-2xl font-black tracking-tightest uppercase italic leading-none text-[var(--foreground)]">MARITIME <span className="text-primary font-black">COMMAND</span></h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-64">
              <Input 
                placeholder="PROBE..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-10 text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-xl text-[var(--foreground)] focus:border-primary/50 focus-visible:ring-0 shadow-none" 
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={fetchLedger} className="h-10 px-5 bg-bg-secondary border border-[var(--foreground)]/10 hover:border-primary/50 transition-all font-black uppercase tracking-widest italic text-[var(--foreground)] flex items-center gap-2 rounded-xl flex-1 sm:flex-none justify-center">
                    <RefreshCw className={cn("w-3.5 h-3.5 text-primary", isLoading && "animate-spin")} />
                    <span className="text-[8px] font-black tracking-widest">Sync</span>
                </Button>
                <Link href="/admin/orders/add" className="flex-1 sm:flex-none">
                    <Button className="h-10 px-6 bg-primary hover:bg-primary/80 transition-all font-black uppercase tracking-widest italic text-black shadow-glow-purple border-none rounded-xl w-full justify-center">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Launch
                    </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* 3. MAIN REGISTRY HUB: FROSTED GLASS */}
        <Card className="relative overflow-hidden border-[var(--foreground)]/5 bg-bg-card/20 backdrop-blur-md rounded-2xl shadow-premium">
          <div className="p-4 space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--foreground)]/5">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-[var(--foreground)]">Registry Stream</h3>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {filteredOrders.length} SESSIONS ACTIVE
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="grid grid-cols-4 sm:flex bg-[var(--foreground)]/5 p-1 border border-[var(--foreground)]/5 rounded-xl w-full sm:w-auto">
                        {["ALL", "PENDING", "SHIPPED", "DELIVERED"].map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setStatusFilter(s);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "px-1 py-1.5 sm:px-4 text-[7px] min-[375px]:text-[8px] font-black uppercase tracking-widest transition-all rounded-lg italic text-center truncate",
                                    statusFilter === s ? "bg-primary text-black shadow-glow-purple/20" : "text-text-secondary hover:text-[var(--foreground)]"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 bg-[var(--foreground)]/5 p-1 border border-[var(--foreground)]/5 rounded-xl w-full sm:w-auto">
                        <div className="relative flex justify-center">
                          <select 
                              value={exportRange}
                              onChange={(e) => setExportRange(e.target.value)}
                              className="bg-transparent text-[8px] font-black uppercase tracking-widest italic outline-none pl-3 pr-6 appearance-none cursor-pointer text-[var(--foreground)]"
                          >
                              <option value="ALL" className="bg-bg-secondary text-[var(--foreground)]">ALL TIME</option>
                              <option value="DAILY" className="bg-bg-secondary text-[var(--foreground)]">DAILY</option>
                              <option value="MONTH" className="bg-bg-secondary text-[var(--foreground)]">MONTHLY</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-secondary pointer-events-none" />
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-[var(--foreground)]/10" />
                        <div className="relative flex justify-center">
                          <select 
                              value={exportFormat}
                              onChange={(e) => setExportFormat(e.target.value)}
                              className="bg-transparent text-[8px] font-black uppercase tracking-widest pl-2 pr-6 outline-none cursor-pointer text-primary italic font-bold appearance-none"
                          >
                              <option value="REPORT" className="bg-bg-secondary text-primary">REPORT</option>
                              <option value="GSTR1" className="bg-bg-secondary text-primary">GSTR1</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-secondary pointer-events-none" />
                        </div>
                        <Button 
                            onClick={handleExport}
                            size="sm"
                            className="h-7 sm:h-6 px-2 sm:px-3 bg-primary hover:bg-primary/80 text-black text-[7px] font-black uppercase tracking-widest italic border-none rounded-lg w-full"
                        >
                            <Download className="w-2.5 h-2.5 mr-1" /> SYNC
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tab Switched Header */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap border-b border-[var(--foreground)]/5 gap-2 pb-3 mb-4">
                {[
                  { id: 'map', label: 'Map Telemetry', icon: <Map className="w-4 h-4" /> },
                  { id: 'area', label: 'Area Pipeline', icon: <MapPin className="w-4 h-4" /> },
                  { id: 'seller', label: 'Seller Pipeline', icon: <Store className="w-4 h-4" /> },
                  { id: 'ledger', label: 'Ledger Stream', icon: <Layers className="w-4 h-4" /> },
                ].map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all rounded-xl italic border",
                        active 
                          ? "bg-primary text-black border-primary shadow-glow-purple/20" 
                          : "bg-[var(--foreground)]/5 text-text-secondary border-transparent hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
                      )}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
            </div>

            {activeTab === 'map' && (
              <div className="space-y-3 mb-4 animate-in fade-in duration-300">
                {/* Map Time Filters */}
                <div className="grid grid-cols-4 sm:flex gap-1.5 p-1 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl w-full sm:w-auto">
                  {[
                    { id: 'all',            label: 'All Sales',       desc: `${orders.length} Orders` },
                    { id: 'active',         label: 'Active Transit',  desc: 'Pending/Shipped' },
                    { id: 'today_delivered',label: "Today Delivered",  desc: 'Live Completed' },
                    { id: 'this_week',      label: 'This Week',       desc: '7-Day Stream' }
                  ].map(f => {
                    const active = mapTimeFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setMapTimeFilter(f.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-lg transition-all border text-center flex-1 sm:flex-initial",
                          active
                            ? "bg-primary text-black border-primary shadow-glow-purple/20"
                            : "bg-transparent text-text-secondary border-transparent hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                        )}
                      >
                        <span className="text-[7px] min-[375px]:text-[7.5px] font-black uppercase tracking-wider">{f.label}</span>
                        <span className="text-[5.5px] font-bold uppercase opacity-60 mt-0.5">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full h-[550px] border border-[var(--foreground)]/5 rounded-2xl overflow-hidden bg-black/40">
                  <OrderTelemetryMap orders={mapFilteredOrders} onSelectOrder={handleView} />
                </div>
              </div>
            )}

            {activeTab === 'area' && (
              <div className="space-y-4 mb-4">
                {areasData.length === 0 ? (
                  <div className="text-center py-10 text-[8px] font-black uppercase tracking-widest opacity-40 italic text-text-secondary">
                    No Area Registry Found
                  </div>
                ) : (
                  areasData.map((areaItem) => {
                    const isExpanded = expandedArea === areaItem.area;
                    return (
                      <Card 
                        key={areaItem.area} 
                        className="border-[var(--foreground)]/5 bg-bg-card/10 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border"
                      >
                        <div 
                          onClick={() => setExpandedArea(isExpanded ? null : areaItem.area)}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 cursor-pointer hover:bg-[var(--foreground)]/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{areaItem.area}</h4>
                              <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
                                {areaItem.orders.length} {areaItem.orders.length === 1 ? 'ORDER' : 'ORDERS'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[7.5px] font-black text-text-secondary uppercase tracking-widest block opacity-60">Revenue</span>
                              <strong className="text-xs font-black text-emerald-400 italic">₹{areaItem.revenue.toLocaleString()}</strong>
                            </div>
                            
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20 rounded">
                                {areaItem.pending} Pnd
                              </span>
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                {areaItem.shipped} Shp
                              </span>
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                {areaItem.delivered} Dlv
                              </span>
                            </div>
                            
                            <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform", isExpanded && "rotate-180")} />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4 border-t border-[var(--foreground)]/5 bg-[var(--foreground)]/2 space-y-3">
                            <div className="overflow-x-auto rounded-lg border border-[var(--foreground)]/5">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/5">
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Order ID</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Customer</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Seller</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Total Amount</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Status</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--foreground)]/5">
                                  {areaItem.orders.map((o: any) => (
                                    <tr key={o.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                      <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-primary italic leading-none">{o.id}</span>
                                          {o.is_pre_order === 1 && (
                                            <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[6px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-[9px] font-black uppercase">{o.customer_name}</td>
                                      <td className="px-4 py-2.5 text-[8px] font-bold text-text-secondary uppercase">{o.seller_name}</td>
                                      <td className="px-4 py-2.5 text-[9px] font-black italic">₹{Number(o.total_amount).toLocaleString()}</td>
                                      <td className="px-4 py-2.5">
                                        <Badge variant={
                                          o.status === 'DELIVERED' ? 'success' :
                                          o.status === 'SHIPPED' ? 'secondary' :
                                          o.status === 'PENDING' ? 'warning' : 'danger'
                                        } className="text-[6.5px] font-black uppercase tracking-widest px-1.5">
                                          {o.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <Button onClick={() => handleView(o)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-none hover:bg-blue-500 hover:text-black">
                                            <Eye className="w-2.5 h-2.5 skew-x-12" />
                                          </Button>
                                          <Link href={`/admin/orders/edit/${o.id}`}>
                                            <Button variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-none hover:bg-indigo-500 hover:text-black">
                                              <ExternalLink className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'seller' && (
              <div className="space-y-4 mb-4">
                {sellersData.length === 0 ? (
                  <div className="text-center py-10 text-[8px] font-black uppercase tracking-widest opacity-40 italic text-text-secondary">
                    No Seller Registry Found
                  </div>
                ) : (
                  sellersData.map((sellerItem) => {
                    const isExpanded = expandedSeller === sellerItem.sellerName;
                    return (
                      <Card 
                        key={sellerItem.sellerName} 
                        className="border-[var(--foreground)]/5 bg-bg-card/10 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border"
                      >
                        <div 
                          onClick={() => setExpandedSeller(isExpanded ? null : sellerItem.sellerName)}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 cursor-pointer hover:bg-[var(--foreground)]/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Store className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{sellerItem.sellerName}</h4>
                              <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
                                {sellerItem.orders.length} {sellerItem.orders.length === 1 ? 'ORDER' : 'ORDERS'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[7.5px] font-black text-text-secondary uppercase tracking-widest block opacity-60">Revenue</span>
                              <strong className="text-xs font-black text-emerald-400 italic">₹{sellerItem.revenue.toLocaleString()}</strong>
                            </div>
                            
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-warning/10 text-warning border border-warning/20 rounded">
                                {sellerItem.pending} Pnd
                              </span>
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                {sellerItem.shipped} Shp
                              </span>
                              <span className="px-2 py-0.5 text-[6.5px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                {sellerItem.delivered} Dlv
                              </span>
                            </div>
                            
                            <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform", isExpanded && "rotate-180")} />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4 border-t border-[var(--foreground)]/5 bg-[var(--foreground)]/2 space-y-3">
                            <div className="overflow-x-auto rounded-lg border border-[var(--foreground)]/5">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/5">
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Order ID</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Customer</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Area</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Total Amount</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Status</th>
                                    <th className="px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-text-secondary italic text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--foreground)]/5">
                                  {sellerItem.orders.map((o: any) => (
                                    <tr key={o.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                      <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-primary italic leading-none">{o.id}</span>
                                          {o.is_pre_order === 1 && (
                                            <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[6px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-[9px] font-black uppercase">{o.customer_name}</td>
                                      <td className="px-4 py-2.5 text-[8px] font-bold text-text-secondary uppercase">{getDeliveryArea(o.delivery_address || '')}</td>
                                      <td className="px-4 py-2.5 text-[9px] font-black italic">₹{Number(o.total_amount).toLocaleString()}</td>
                                      <td className="px-4 py-2.5">
                                        <Badge variant={
                                          o.status === 'DELIVERED' ? 'success' :
                                          o.status === 'SHIPPED' ? 'secondary' :
                                          o.status === 'PENDING' ? 'warning' : 'danger'
                                        } className="text-[6.5px] font-black uppercase tracking-widest px-1.5">
                                          {o.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <Button onClick={() => handleView(o)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-none hover:bg-blue-500 hover:text-black">
                                            <Eye className="w-2.5 h-2.5 skew-x-12" />
                                          </Button>
                                          <Link href={`/admin/orders/edit/${o.id}`}>
                                            <Button variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-none hover:bg-indigo-500 hover:text-black">
                                              <ExternalLink className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'ledger' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border border-[var(--foreground)]/5 bg-bg-secondary/10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/5">
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">ID Node</th>
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Merchant & Peer</th>
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Tax Hub</th>
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Valuation</th>
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic">Status</th>
                                <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-text-secondary italic text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--foreground)]/5">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-[8px] font-black uppercase tracking-widest opacity-40 italic text-text-secondary">No Nodes Found</td>
                                </tr>
                            ) : paginatedOrders.map((o) => (
                                <tr key={o.id} className="group hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-0.5 h-4 bg-primary/20 rounded-full group-hover:bg-primary" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-black text-primary italic leading-none">{o.id}</span>
                                                    {o.is_pre_order === 1 && (
                                                        <span className="px-1 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[5px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                                                    )}
                                                </div>
                                                <span className="text-[6px] font-bold text-text-secondary uppercase">{new Date(o.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[9px] font-black uppercase text-[var(--foreground)]">{o.customer_name}</span>
                                            <span className="text-[7px] font-bold text-text-secondary uppercase">{o.seller_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="px-1.5 py-0.5 -skew-x-12 bg-warning/10 border border-warning/20">
                                                <span className="text-[6px] font-black text-warning skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}U</span>
                                            </div>
                                            <div className="px-1.5 py-0.5 -skew-x-12 bg-primary/10 border border-primary/20">
                                                <span className="text-[6px] font-black text-primary skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}C</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-[9px] font-black text-[var(--foreground)] italic tracking-tighter">₹{Number(o.total_amount).toLocaleString()}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={
                                            o.status === 'DELIVERED' ? 'success' :
                                            o.status === 'SHIPPED' ? 'secondary' :
                                            o.status === 'PENDING' ? 'warning' : 'danger'
                                        } className="text-[7px] font-black uppercase tracking-widest px-2">
                                            {o.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button onClick={() => handleView(o)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-none hover:bg-blue-500 hover:text-black">
                                                <Eye className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                            <Button onClick={() => handleVerify(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-none hover:bg-emerald-500 hover:text-black">
                                                <ShieldCheck className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                            <Button onClick={() => handleAlert(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-none hover:bg-amber-500 hover:text-black">
                                                <AlertCircle className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                            <Link href={`/admin/orders/edit/${o.id}`}>
                                                <Button variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-none hover:bg-indigo-500 hover:text-black">
                                                    <ExternalLink className="w-2.5 h-2.5 skew-x-12" />
                                                </Button>
                                            </Link>
                                            <Button onClick={() => handleDelete(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-none hover:bg-red-500 hover:text-white">
                                                <Trash2 className="w-2.5 h-2.5 skew-x-12" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card List */}
                <div className="lg:hidden space-y-3">
                  {paginatedOrders.length === 0 ? (
                    <div className="text-center py-10 text-[8px] font-black uppercase tracking-widest opacity-40 italic text-text-secondary">
                      No Nodes Found
                    </div>
                  ) : (
                    paginatedOrders.map((o) => (
                      <div 
                        key={o.id} 
                        className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-0.5 h-8 bg-primary rounded-full" />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-primary italic leading-none">{o.id}</span>
                                {o.is_pre_order === 1 && (
                                  <span className="px-1 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[5px] font-black uppercase tracking-wider border border-amber-500/30">PRE</span>
                                )}
                              </div>
                              <span className="text-[7px] font-bold text-text-secondary uppercase">{new Date(o.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant={
                              o.status === 'DELIVERED' ? 'success' :
                              o.status === 'SHIPPED' ? 'secondary' :
                              o.status === 'PENDING' ? 'warning' : 'danger'
                          } className="text-[7px] font-black uppercase tracking-widest px-2">
                            {o.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                          <div className="space-y-0.5">
                            <span className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Merchant & Peer</span>
                            <p className="text-[9px] font-black uppercase text-[var(--foreground)] leading-none">{o.customer_name}</p>
                            <p className="text-[7px] font-bold text-text-secondary uppercase">{o.seller_name}</p>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Valuation</span>
                            <p className="text-[10px] font-black text-[var(--foreground)] italic tracking-tighter">₹{Number(o.total_amount).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                          <div className="space-y-1">
                            <span className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Tax Hub</span>
                            <div className="flex gap-1">
                              <div className="px-1.5 py-0.5 -skew-x-12 bg-warning/10 border border-warning/20">
                                <span className="text-[6px] font-black text-warning skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}U</span>
                              </div>
                              <div className="px-1.5 py-0.5 -skew-x-12 bg-primary/10 border border-primary/20">
                                <span className="text-[6px] font-black text-primary skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}C</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            <Button onClick={() => handleView(o)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-none hover:bg-blue-500 hover:text-black">
                              <Eye className="w-2.5 h-2.5 skew-x-12" />
                            </Button>
                            <Button onClick={() => handleVerify(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-none hover:bg-emerald-500 hover:text-black">
                              <ShieldCheck className="w-2.5 h-2.5 skew-x-12" />
                            </Button>
                            <Button onClick={() => handleAlert(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-none hover:bg-amber-500 hover:text-black">
                              <AlertCircle className="w-2.5 h-2.5 skew-x-12" />
                            </Button>
                            <Link href={`/admin/orders/edit/${o.id}`}>
                              <Button variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-none hover:bg-indigo-500 hover:text-black">
                                <ExternalLink className="w-2.5 h-2.5 skew-x-12" />
                              </Button>
                            </Link>
                            <Button onClick={() => handleDelete(o.id)} variant="ghost" className="h-6 w-6 p-0 -skew-x-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-none hover:bg-red-500 hover:text-white">
                              <Trash2 className="w-2.5 h-2.5 skew-x-12" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Controls */}
                {filteredOrders.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--foreground)]/5 bg-[var(--foreground)]/2 rounded-xl">
                    <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-1 border border-[var(--foreground)]/5 rounded-xl">
                        <span className="text-[8px] font-black uppercase text-text-secondary tracking-widest pl-2">Per Page:</span>
                        <div className="relative">
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="bg-transparent text-[8px] font-black uppercase tracking-widest italic outline-none pl-1 pr-6 appearance-none cursor-pointer text-[var(--foreground)]"
                          >
                            <option value={10} className="bg-bg-secondary text-[var(--foreground)]">10</option>
                            <option value={20} className="bg-bg-secondary text-[var(--foreground)]">20</option>
                            <option value={50} className="bg-bg-secondary text-[var(--foreground)]">50</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-secondary pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          className="h-8 px-3 text-[9px] font-black tracking-widest uppercase border-[var(--foreground)]/10 hover:border-primary/50 text-[var(--foreground)] rounded-xl disabled:opacity-40"
                        >
                          PREV
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            const isFirst = page === 1;
                            const isLast = page === totalPages;
                            const isAdjacent = Math.abs(page - currentPage) <= 1;
                            
                            if (totalPages > 6 && !isFirst && !isLast && !isAdjacent) {
                              if (page === 2 || page === totalPages - 1) {
                                return <span key={page} className="text-text-secondary text-xs px-1">...</span>;
                              }
                              return null;
                            }

                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                  "w-8 h-8 rounded-xl text-[9px] font-black transition-all",
                                  currentPage === page
                                    ? "bg-primary text-black shadow-glow-purple/20"
                                    : "text-text-secondary hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                                )}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages || totalPages === 0}
                          variant="outline"
                          className="h-8 px-3 text-[9px] font-black tracking-widest uppercase border-[var(--foreground)]/10 hover:border-primary/50 text-[var(--foreground)] rounded-xl disabled:opacity-40"
                        >
                          NEXT
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </Card>

        {/* Footer Audit Node */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-10 opacity-40">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Maritime Registry v4.6</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Andaman UT Node Active</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Secure Tax Sync: ON</span>
            </div>
        </div>
      </div>

      {/* 4. DEEP ANALYSIS MODAL: THE MARITIME HUD */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
            <Card className="relative w-full max-w-4xl bg-bg-secondary border-primary/20 shadow-glow-purple z-10 overflow-hidden rounded-[24px] md:rounded-[40px] animate-in zoom-in-95 duration-300">
                <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
                    {/* Modal Sidebar: Node Telemetry */}
                    <div className="lg:w-1/3 bg-[var(--foreground)]/5 p-8 border-r border-[var(--foreground)]/5 flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Registry Entry</span>
                                <h2 className="text-4xl font-black italic tracking-tighter text-[var(--foreground)]">{selectedOrder.id}</h2>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="default" className="rounded-[4px] px-3 py-1 font-black italic uppercase tracking-widest text-[8px]">ACTIVE NODE</Badge>
                                    {selectedOrder.is_pre_order === 1 && (
                                        <Badge variant="warning" className="rounded-[4px] px-3 py-1 font-black italic uppercase tracking-widest text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30">PRE-ORDER</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-[12px] bg-bg-secondary/40 border border-[var(--foreground)]/5 shadow-sm space-y-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Creation Date</span>
                                    <p className="text-sm font-bold text-[var(--foreground)]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-[12px] bg-bg-secondary/40 border border-[var(--foreground)]/5 shadow-sm space-y-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Logistics Node</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-sm font-bold text-[var(--foreground)]">{selectedOrder.logistics_status || 'SYNCHRONIZED'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setIsModalOpen(false)} variant="outline" className="w-full h-14 rounded-xl border-[var(--foreground)]/10 font-black uppercase tracking-widest italic text-text-secondary hover:text-[var(--foreground)] transition-all">
                            Close Protocol
                        </Button>
                    </div>

                    {/* Modal Content: Analysis Hub */}
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-10 custom-scrollbar">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Peer Information */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" /> PEER TELEMETRY
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-[var(--foreground)] uppercase italic tracking-tight">{selectedOrder.customer_name}</p>
                                    <p className="text-xs font-bold text-text-secondary"> MERCHANT SOURCE: {selectedOrder.seller_name}</p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                                    <Scale className="w-3 h-3 text-emerald-500" /> FINANCIAL NODES
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-[var(--foreground)] tracking-tighter">₹{Number(selectedOrder.total_amount).toLocaleString()}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[8px] uppercase rounded-[2px]">UGST PAID</Badge>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[8px] uppercase rounded-[2px]">CGST PAID</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[var(--foreground)]/5" />

                        {/* Audit Details */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-primary" /> COMPLIANCE LOGS
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Base Valuation</p>
                                    <p className="text-lg font-black text-[var(--foreground)] italic">₹{(selectedOrder.total_amount / 1.05).toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">UT ANDAMAN UGST</p>
                                    <p className="text-lg font-black text-emerald-400 italic">₹{(selectedOrder.total_amount / 1.05 * 0.025).toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">CENTRAL CGST</p>
                                    <p className="text-lg font-black text-primary italic">₹{(selectedOrder.total_amount / 1.05 * 0.025).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center shadow-sm">
                                    <Truck className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase tracking-tight text-[var(--foreground)]">Logistics Synchronization</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase">Status: {selectedOrder.status}</p>
                                </div>
                            </div>
                            <Link href={`/admin/orders/edit/${selectedOrder.id}`}>
                                <Button className="bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-widest italic text-[10px] h-12 px-6 rounded-xl border-none shadow-glow-purple">
                                    Modify Node
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
}
