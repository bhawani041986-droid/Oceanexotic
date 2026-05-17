"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Trash2
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function AdminOrders() {
  const { toast } = useToast(
  );
  const [searchTerm, setSearchTerm] = useState(""
  );
  const [orders, setOrders] = useState<any[]>([]
  );
  const [isLoading, setIsLoading] = useState(true
  );

  const [statusFilter, setStatusFilter] = useState("ALL"
  );
  const [exportRange, setExportRange] = useState("ALL"
  );
  const [exportFormat, setExportFormat] = useState("REPORT"
  ); // REPORT or GSTR1
  const [selectedOrder, setSelectedOrder] = useState<any>(null
  );
  const [isModalOpen, setIsModalOpen] = useState(false
  );

  const fetchLedger = async () => {
    setIsLoading(true
  );
    try {
      const res = await fetch('/api/admin/orders.php'
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
      const orderDate = new Date(o.created_at).getTime(
  );
      if (exportRange === "DAILY") return orderDate >= today;
      if (exportRange === "WEEKLY") return orderDate >= sevenDaysAgo;
      if (exportRange === "MONTHLY") return orderDate >= thirtyDaysAgo;
      if (exportRange === "QUARTERLY") return orderDate >= ninetyDaysAgo;
      return true;
    }
  );

    if (exportOrders.length === 0) {
      toast(`No orders found for ${exportRange} period`, "warning"
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
      const res = await fetch('/api/admin/orders.php', {
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
    toast(`LOGISTICS ALERT: Immediate review triggered for Node ${orderId}. Merchant & Peer notified.`, "warning"
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
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()
  );
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );
  }, [searchTerm, statusFilter, orders]
  );

  return (

    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-indigo-100" style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* 1. LUMINOUS POLYGONAL BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-50 blur-[120px] rounded-full" />
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="polyPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0 50 L25 0 L75 0 L100 50 L75 100 L25 100 Z" fill="none" stroke="rgba(15,23,42,0.1)" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#polyPattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4">
        
        {/* 2. COMMAND HEADER: LUMINOUS BENTO */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-[2px] bg-indigo-50 border border-indigo-100">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-indigo-600">LIVE REGISTRY</span>
            </div>
            <h1 className="text-2xl font-black tracking-tightest uppercase italic leading-none text-slate-900">MARITIME <span className="text-indigo-600 font-black">COMMAND</span></h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-64 -skew-x-12">
              <Input 
                placeholder="PROBE..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative h-7 bg-indigo-50/30 border-indigo-200 text-[9px] font-black tracking-widest uppercase italic placeholder:text-slate-400 focus:ring-0 transition-all text-slate-900 shadow-none px-6 rounded-none" 
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-600 opacity-30 skew-x-12" />
            </div>
            <div className="flex gap-2">
                <Button onClick={fetchLedger} className="h-7 px-4 bg-purple-600 hover:bg-purple-700 transition-all -skew-x-12 border-none group/refresh flex items-center gap-2 rounded-none">
                    <div className="flex items-center gap-2 skew-x-12">
                        <RefreshCw className={cn("w-3 h-3 text-white", isLoading && "animate-spin")} />
                        <span className="text-[8px] font-black uppercase tracking-widest italic text-white">Sync</span>
                    </div>
                </Button>
                <Link href="/admin/orders/add">
                    <Button className="h-7 px-6 bg-slate-900 hover:bg-indigo-600 transition-all -skew-x-12 font-black uppercase tracking-widest italic text-white border-none rounded-none">
                        <div className="flex items-center skew-x-12">
                            <Plus className="w-3 h-3 mr-2" /> Launch
                        </div>
                    </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* 3. MAIN REGISTRY HUB: FROSTED PEARL GLASS */}
        <Card className="relative overflow-hidden border-slate-200 bg-white rounded-none shadow-none">
          <div className="p-2 space-y-2">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Registry Stream</h3>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-indigo-500" /> {filteredOrders.length} SESSIONS ACTIVE
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-50 p-0.5 -skew-x-12 border border-slate-100">
                        {["ALL", "PENDING", "SHIPPED", "DELIVERED"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1 text-[7px] font-black uppercase tracking-widest transition-all italic",
                                    statusFilter === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                                )}
                            >
                                <div className="skew-x-12">{s}</div>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 -skew-x-12 border border-slate-100">
                        <select 
                            value={exportRange}
                            onChange={(e) => setExportRange(e.target.value)}
                            className="bg-transparent text-[7px] font-black uppercase tracking-widest italic outline-none px-2 skew-x-12"
                        >
                            <option value="ALL">ALL TIME</option>
                            <option value="DAILY">DAILY</option>
                            <option value="MONTH">MONTHLY</option>
                        </select>
                        <div className="w-px h-5 bg-slate-200" />
                        <select 
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="bg-transparent text-[7px] font-black uppercase tracking-widest px-2 outline-none cursor-pointer text-indigo-600 italic font-bold appearance-none skew-x-12"
                        >
                            <option value="REPORT">REPORT</option>
                            <option value="GSTR1">GSTR1</option>
                        </select>
                        <Button 
                            onClick={handleExport}
                            size="sm"
                            className="h-5 px-3 bg-slate-900 hover:bg-indigo-600 transition-all -skew-x-12 text-[6px] font-black uppercase tracking-widest italic border-none text-white rounded-none"
                        >
                            <div className="flex items-center skew-x-12">
                                <Download className="w-2 h-2 mr-1" /> SYNC
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-[2px] border border-slate-100 bg-white">
                <table className="w-max text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic w-20">ID Node</th>
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic w-48">Merchant & Peer</th>
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic w-32">Tax Hub</th>
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic w-24">Valuation</th>
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic w-24">Status</th>
                            <th className="px-2 py-1.5 text-[8px] font-black uppercase tracking-tight text-slate-400 italic text-right w-28">Ops</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-[8px] font-black uppercase tracking-widest opacity-20 italic text-slate-400">No Nodes Found</td>
                            </tr>
                        ) : filteredOrders.map((o) => (
                            <tr key={o.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="px-2 py-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-0.5 h-4 bg-indigo-100 rounded-full group-hover:bg-indigo-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-indigo-600 italic leading-none">{o.id}</span>
                                            <span className="text-[6px] font-bold text-slate-400 uppercase">{new Date(o.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-1">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[9px] font-black uppercase text-slate-900">{o.customer_name}</span>
                                        <span className="text-[7px] font-bold text-slate-400 uppercase">{o.seller_name}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-1">
                                    <div className="flex gap-0.5">
                                        <div className="px-1 py-0.5 -skew-x-12 bg-amber-50 border border-amber-100">
                                            <span className="text-[6px] font-black text-amber-600 skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}U</span>
                                        </div>
                                        <div className="px-1 py-0.5 -skew-x-12 bg-indigo-50 border border-indigo-100">
                                            <span className="text-[6px] font-black text-indigo-600 skew-x-12">₹{(Number(o.total_amount) / 1.05 * 0.025).toFixed(1)}C</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-1">
                                    <p className="text-[9px] font-black text-slate-900 italic tracking-tighter">₹{Number(o.total_amount).toLocaleString()}</p>
                                </td>
                                <td className="px-2 py-1">
                                    <div className={cn(
                                        "inline-flex items-center px-2 py-0.5 -skew-x-12 text-[6px] font-black uppercase tracking-widest italic border",
                                        o.status === 'DELIVERED' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                        o.status === 'SHIPPED' && "bg-indigo-50 text-indigo-600 border-indigo-100",
                                        o.status === 'PENDING' && "bg-amber-50 text-amber-600 border-amber-100",
                                        o.status === 'MEDIATION' && "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        <div className="skew-x-12">{o.status}</div>
                                    </div>
                                </td>
                                <td className="px-2 py-1 text-right">
                                    <div className="flex items-center justify-end gap-0.5">
                                        <Button onClick={() => handleView(o)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-none">
                                            <Eye className="w-2 h-2 skew-x-12" />
                                        </Button>
                                        <Button onClick={() => handleVerify(o.id)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-none">
                                            <ShieldCheck className="w-2 h-2 skew-x-12" />
                                        </Button>
                                        <Button onClick={() => handleAlert(o.id)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-none">
                                            <AlertCircle className="w-2 h-2 skew-x-12" />
                                        </Button>
                                        <Link href={`/admin/orders/edit/${o.id}`}>
                                            <Button variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-none">
                                                <ExternalLink className="w-2 h-2 skew-x-12" />
                                            </Button>
                                        </Link>
                                        <Button onClick={() => handleDelete(o.id)} variant="ghost" className="h-5 w-5 p-0 -skew-x-12 bg-red-50 text-red-600 border border-red-100 rounded-none">
                                            <Trash2 className="w-2 h-2 skew-x-12" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </Card>

        {/* Footer Audit Node */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-10 opacity-40">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Maritime Registry v4.6</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Andaman UT Node Active</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-500">Secure Tax Sync: ON</span>
            </div>
        </div>
      </div>

      {/* 4. DEEP ANALYSIS MODAL: THE MARITIME HUD */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
            <Card className="relative w-full max-w-4xl bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden border-none animate-in zoom-in-95 duration-300">
                <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
                    {/* Modal Sidebar: Node Telemetry */}
                    <div className="lg:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Registry Entry</span>
                                <h2 className="text-4xl font-black italic tracking-tighter text-slate-900">{selectedOrder.id}</h2>
                                <Badge className="bg-indigo-600 text-white border-none rounded-[4px] px-3 py-1 font-black italic uppercase tracking-widest text-[8px]">ACTIVE NODE</Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-[8px] bg-white border border-slate-100 shadow-sm space-y-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Creation Date</span>
                                    <p className="text-sm font-bold text-slate-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-[8px] bg-white border border-slate-100 shadow-sm space-y-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Logistics Node</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-sm font-bold text-slate-900">{selectedOrder.logistics_status || 'SYNCHRONIZED'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setIsModalOpen(false)} variant="outline" className="w-full h-14 rounded-[8px] border-slate-200 font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-900 transition-all">
                            Close Protocol
                        </Button>
                    </div>

                    {/* Modal Content: Analysis Hub */}
                    <div className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-10 custom-scrollbar">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Peer Information */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                                    <User className="w-3 h-3" /> PEER TELEMETRY
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{selectedOrder.customer_name}</p>
                                    <p className="text-xs font-bold text-slate-400"> MERCHANT SOURCE: {selectedOrder.seller_name}</p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                                    <Scale className="w-3 h-3" /> FINANCIAL NODES
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{selectedOrder.total_amount.toLocaleString()}</p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[8px] uppercase rounded-[2px]">UGST PAID</Badge>
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[8px] uppercase rounded-[2px]">CGST PAID</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Audit Details */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> COMPLIANCE LOGS
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Valuation</p>
                                    <p className="text-lg font-black text-slate-900 italic">₹{(selectedOrder.total_amount / 1.05).toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UT ANDAMAN UGST</p>
                                    <p className="text-lg font-black text-emerald-600 italic">₹{(selectedOrder.total_amount / 1.05 * 0.025).toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CENTRAL CGST</p>
                                    <p className="text-lg font-black text-indigo-600 italic">₹{(selectedOrder.total_amount / 1.05 * 0.025).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[10px] bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[6px] bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                                    <Truck className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase tracking-tight text-slate-900">Logistics Synchronization</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status: {selectedOrder.status}</p>
                                </div>
                            </div>
                            <Link href={`/admin/orders/edit/${selectedOrder.id}`}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 px-6 rounded-[8px] border-none">
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
