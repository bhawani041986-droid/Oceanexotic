"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Package, 
  Store, 
  Activity, 
  AlertTriangle,
  Eye,
  Trash2,
  Edit3,
  Filter,
  BarChart2,
  Navigation
} from "lucide-react";

const GLOBAL_INVENTORY = [
  { id: "PRD-001", name: "Premium Bluefin Saku", seller: "Global Seafoods", price: "₹64", stock: "140kg", status: "PUBLISHED", category: "Premium Saku" },
  { id: "PRD-002", name: "Wild Alaskan Salmon", seller: "Nordic Harvest", price: "₹42", stock: "280kg", status: "PUBLISHED", category: "Fresh Fish" },
  { id: "PRD-003", name: "Omani Tiger Prawns", seller: "Desert Ocean", price: "₹55", stock: "12kg", status: "LOW STOCK", category: "Crustaceans" },
  { id: "PRD-004", name: "Arctic Whitefish", seller: "Arctic Sourcing", price: "₹38", stock: "500kg", status: "ARCHIVED", category: "Whitefish" },
];

export default function AdminInventoryPage() {
  return (

    <div className="space-y-[5px] md:space-y-5 pt-2 md:pt-5 pb-10 px-2 md:px-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[5px] md:gap-5 md:border-b md:border-[var(--foreground)]/5 md:pb-5">
        <div className="space-y-0.5 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center justify-center md:justify-start gap-3 md:gap-4 shadow-glow-purple/5">
             <Navigation className="w-6 h-6 md:w-8 md:h-8 text-primary shadow-glow-purple" /> Distribution Governance
          </h2>
          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Logistics Sectors & Delivery Coverage Nodes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="h-8 md:h-10 px-4 md:px-6 text-[8px] md:text-[9px] font-black tracking-widest uppercase flex items-center gap-2 border-[var(--foreground)]/5 rounded-lg italic">
              <BarChart2 className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary" /> PRICE ANALYTICS
           </Button>
           <Button variant="primary" className="h-8 md:h-10 px-4 md:px-6 text-[8px] md:text-[9px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 rounded-lg italic">
             <AlertTriangle className="w-3 md:w-3.5 h-3 md:h-3.5" /> AUDIT QUALITY
           </Button>
        </div>
      </div>

      {/* Inventory Pulse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[5px] md:gap-5">
        {[
          { label: "Global Listings", value: "4,240", icon: <Package className="text-primary" /> },
          { label: "Active Merchants", value: "842", icon: <Store className="text-success" /> },
          { label: "Market Circulation", value: "₹850K", icon: <Activity className="text-warning" /> },
          { label: "Quality Flags", value: "14", icon: <AlertTriangle className="text-danger" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-2 md:p-4 space-y-1 md:space-y-2 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[16px] md:rounded-[24px] hover:border-primary/20 transition-all group shadow-premium">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-[8px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center shadow-glow-purple/5">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-3 h-3 md:w-4 md:h-4" })}
            </div>
            <div className="space-y-0">
              <p className="text-[6px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h4 className="text-base md:text-xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Global Registry Table */}
      <Card className="lg:col-span-2 p-1 rounded-[16px] md:rounded-[24px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
        <div className="p-2 md:p-4 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[5px] md:gap-5">
           <div className="space-y-0.5 text-center md:text-left">
              <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tighter uppercase italic">System Logistics Registry</h3>
              <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Monitoring of All Distribution Handshake Nodes</p>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
              <div className="relative group w-full md:w-48">
                 <Input placeholder="SEARCH SECTORS..." className="h-8 md:h-9 pl-8 text-[7px] md:text-[8px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg" />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              </div>
              <Button variant="outline" size="sm" className="h-8 md:h-9 px-3 flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase border-[var(--foreground)]/5 rounded-lg italic">
                 <Filter className="w-3 h-3 md:w-3.5 md:h-3.5" /> FILTER
              </Button>
           </div>
        </div>
        <div className="hidden lg:block">
           <Table>
              <TableHeader>
                 <TableRow className="border-[var(--foreground)]/5">
                    <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Harvest Identity</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Merchant Source</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Category</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Stock Level</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Market Status</TableHead>
                    <TableHead className="text-right text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {GLOBAL_INVENTORY.map((item) => (
                    <TableRow key={item.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell>
                          <div className="space-y-0.5 md:space-y-1">
                             <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{item.name}</p>
                             <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {item.id}</p>
                          </div>
                       </TableCell>
                       <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-40">via {item.seller}</TableCell>
                       <TableCell>
                          <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] md:text-[8px] tracking-[0.2em] italic">
                             {item.category}
                          </Badge>
                       </TableCell>
                       <TableCell className="font-black text-[var(--foreground)] italic text-[11px] md:text-sm tracking-tighter">{item.stock}</TableCell>
                       <TableCell>
                          <Badge variant={item.status === "PUBLISHED" ? "success" : item.status === "LOW STOCK" ? "warning" : "secondary"} className="uppercase text-[8px] md:text-[10px] italic px-2">
                             {item.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                                <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                                <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                                <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                          </div>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3 p-4">
           {GLOBAL_INVENTORY.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                 <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                       <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{item.name}</p>
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {item.id} • {item.seller}</p>
                    </div>
                    <Badge variant={item.status === "PUBLISHED" ? "success" : item.status === "LOW STOCK" ? "warning" : "secondary"} className="uppercase text-[8px] italic px-2">
                       {item.status}
                    </Badge>
                 </div>
                 <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Category</p>
                       <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] tracking-[0.15em] italic px-1.5 py-0.5">
                          {item.category}
                       </Badge>
                    </div>
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Stock Level</p>
                       <p className="text-xs font-black text-[var(--foreground)] italic">{item.stock}</p>
                    </div>
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Price</p>
                       <p className="text-xs font-black text-primary italic">{item.price}</p>
                    </div>
                    <div className="flex gap-1">
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                          <Eye className="w-3.5 h-3.5" />
                       </button>
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                          <Edit3 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </Card>
    </div>
  
  );
}
