"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Package,
  Plus,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function SellerProductsPage() {
  const router = useRouter(
  );
  const { toast } = useToast(
  );
  const [searchTerm, setSearchTerm] = useState(""
  );
  const [products, setProducts] = useState<any[]>([]
  );
  const [isHydrating, setIsHydrating] = useState(true
  );

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1
  );
  const itemsPerPage = 5;

  const fetchRegistry = async () => {
    setIsHydrating(true
  );
    try {
      const res = await fetch('/api/seller/products'
  );
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setProducts(data
  );
      }
      setIsHydrating(false
  );
    } catch (e) {
      toast("Failed to sync with System Spine", "error"
  );
      setIsHydrating(false
  );
    }
  };

  useEffect(() => {
    fetchRegistry(
  );
  }, []
  );

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    
  );
  }, [searchTerm, products]
  );

  // --- DYNAMIC PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage
  );
  }, [filteredProducts, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1
  ); // Reset to page 1 on search
  }, [searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to decommission ${id}?`)) return;
    
    toast(`Decommissioning ${id}...`, "info"
  );
    try {
      const res = await fetch(`/api/seller/products?id=${id}`, { method: 'DELETE' }
  );
      if (res.ok) {
        toast(`${id} purged from registry.`, "success"
  );
        fetchRegistry(
  );
      }
    } catch (e) {
      toast("Purge failed", "error"
  );
    }
  };

  if (isHydrating && products.length === 0) {
    return (

      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--agent-primary)] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--agent-primary)] italic">Syncing System Registry...</p>
      </div>
    
  );
  }

  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-32 md:pb-10 px-0 animate-fade-in" style={{ color: 'var(--agent-text)' }}>
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center justify-center md:justify-start gap-2 md:gap-3">
             <Anchor className="w-5 h-5 md:w-7 md:h-7 text-primary shadow-glow-purple/20 animate-pulse" /> Live Harbor Registry
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Managing {filteredProducts.length} Real-Time Harvest Nodes in System Spine</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-[10px] md:gap-6">
          <div className="relative w-full sm:w-80 group">
            <Input placeholder="SEARCH DATABASE..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest italic" />
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <div className="flex gap-[4px] w-full sm:w-auto">
             <Button onClick={fetchRegistry} variant="outline" className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-lg md:rounded-xl border-[var(--foreground)]/5 bg-[var(--foreground)]/5 flex items-center justify-center">
                <RefreshCw className={cn("w-3.5 h-3.5", isHydrating && "animate-spin")} />
             </Button>
             <Button onClick={() => router.push("/seller/products/new")} className="flex-1 sm:flex-initial h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase rounded-lg md:rounded-xl shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 italic">
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION NEW
             </Button>
          </div>
        </div>
      </div>

      {/* Mobile Grid */}
      <div className="grid grid-cols-2 gap-[10px] lg:hidden p-4">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="p-[8px] space-y-2 group rounded-[20px] relative overflow-hidden border-[var(--foreground)]/5 bg-bg-secondary/20 shadow-glow-purple/5">
            <div className="relative aspect-square rounded-xl border border-[var(--foreground)]/5 flex items-center justify-center text-2xl overflow-hidden shadow-inner bg-bg-secondary/40">
              {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" /> : <Package className="w-6 h-6 opacity-20" />}
              <div className="absolute top-1 right-1">
                <button onClick={() => router.push(`/seller/products/edit/${product.id}`)} className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-[var(--foreground)]/10 text-[var(--foreground)] shadow-glow-purple/20">
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-1 px-0.5">
              <div className="space-y-0">
                <p className="font-black text-[10px] leading-tight truncate uppercase tracking-tighter italic text-[var(--foreground)]">{product.name}</p>
                <p className="text-[7px] font-black uppercase tracking-widest italic text-primary opacity-60">{product.category}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black italic tracking-tighter text-[var(--foreground)]">₹{Number(product.price).toLocaleString()}</p>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={product.status === "ACTIVE" ? "success" : "danger"} className="text-[6px] px-1 h-4 uppercase italic">{product.status === "ACTIVE" ? "LIVE" : "ALERT"}</Badge>
                  {product.is_live_inventory == 1 && (
                    <span className="text-[6px] font-black text-primary uppercase">⚓ {product.harbor_node}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Inventory Table (Desktop Only) */}
      <Card className="hidden lg:block p-1 rounded-[24px] md:rounded-[40px] overflow-hidden border-[var(--foreground)]/5 bg-bg-secondary/20 shadow-premium">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[var(--foreground)]/5">
              <TableHead className="w-[80px] pl-8 uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Asset</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Product Identity</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Category</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Current Stock</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Price / Kg</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Live Status / Harbor</TableHead>
              <TableHead className="uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Registry State</TableHead>
              <TableHead className="text-right pr-8 uppercase text-[9px] font-black tracking-widest text-text-secondary italic opacity-40">Governance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id} className="group border-[var(--foreground)]/5 hover:bg-white/[0.02] transition-colors h-14 md:h-16">
                <TableCell className="pl-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border border-[var(--foreground)]/5 flex items-center justify-center text-xl group-hover:scale-105 transition-all shadow-inner overflow-hidden bg-bg-secondary/40">
                    {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 md:w-6 md:h-6 opacity-20" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-black text-xs md:text-sm uppercase tracking-tighter italic text-[var(--foreground)]">{product.name}</p>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-40 italic">
                       <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary shadow-glow-purple/20" /> {product.id}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="glass" className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">{product.category}</Badge>
                </TableCell>
                <TableCell>
                   <p className={cn("font-black text-xs md:text-sm italic tracking-tighter", product.status === "OUT_OF_STOCK" ? "text-danger" : "text-[var(--foreground)]")}>{product.stock}kg</p>
                </TableCell>
                <TableCell className="font-black text-xs md:text-sm italic text-[var(--foreground)] tracking-tighter">₹{Number(product.price).toLocaleString()}</TableCell>
                <TableCell>
                   <div className="flex flex-col gap-1">
                      {product.is_live_inventory == 1 ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-success" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">LIVE BATCH</span>
                          </div>
                          <p className="text-[8px] font-black uppercase text-primary italic">⚓ {product.harbor_node || 'NA'}</p>
                          <p className="text-[7px] font-bold text-text-secondary uppercase opacity-40">{product.catch_date || 'RECENT'}</p>
                        </>
                      ) : (
                        <span className="text-[8px] font-black text-text-secondary uppercase opacity-40 italic">CATALOG ITEM</span>
                      )}
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={product.status === "ACTIVE" ? "success" : "warning"} className="shadow-glow-purple/10 text-[8px] md:text-[9px] italic px-2 w-fit">{product.status}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-[4px]">
                    <button onClick={() => router.push(`/seller/products/edit/${product.id}`)} className="p-2 md:p-3 rounded-lg hover:bg-[var(--foreground)]/5 transition-all opacity-40 hover:opacity-100 border border-[var(--foreground)]/5 hover:border-primary/20"><Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 md:p-3 rounded-lg hover:bg-[var(--foreground)]/5 transition-all opacity-40 hover:text-danger hover:opacity-100 border border-[var(--foreground)]/5 hover:border-danger/20"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Footer (Dynamic) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-[10px] md:gap-6 pt-[10px] md:pt-0">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed text-center md:text-left opacity-40 italic">
           Page {currentPage} of {totalPages} • {filteredProducts.length} Asset Nodes
        </p>
        <div className="flex items-center gap-2 p-1 rounded-xl md:rounded-[20px] border shadow-premium bg-bg-secondary/40" style={{ borderColor: 'var(--agent-border)' }}>
           <Button 
            variant="ghost" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full p-0 disabled:opacity-20"
           >
              <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
           </Button>

           {Array.from({ length: totalPages }).map((_, i) => (
             <Button 
               key={i} 
               onClick={() => setCurrentPage(i + 1)}
               className={cn(
                 "h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full text-[9px] md:text-[10px] font-black transition-all italic",
                 currentPage === i + 1 ? "text-[var(--foreground)] shadow-glow-purple" : "bg-transparent opacity-40 hover:bg-[var(--foreground)]/5"
               )}
               style={currentPage === i + 1 ? { backgroundColor: 'var(--agent-primary)' } : {}}
             >
               {i + 1}
             </Button>
           ))}

           <Button 
            variant="ghost" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full p-0 disabled:opacity-20"
           >
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
           </Button>
        </div>
      </div>
    </div>
  
  );
}
