"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Fish, 
  Search, 
  Plus, 
  Star, 
  ShieldCheck, 
  AlertTriangle,
  Eye,
  Trash2,
  Edit3,
  Filter,
  BarChart2,
  MoreVertical,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Users,
  IndianRupee,
  Anchor
} from "lucide-react";

import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { broadcastHarvest } from "@/lib/social";

export default function AdminProductsPage() {
  const { toast } = useToast(
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null
  );
  const [isDeleting, setIsDeleting] = useState(false
  );
  const [isAuditing, setIsAuditing] = useState(false
  );
  const [isProcessing, setIsProcessing] = useState(false
  );

  // --- SOVEREIGN REGISTRY FETCH ENGINE ---
  const [products, setProducts] = useState<any[]>([]
  );
  const [isLoading, setIsLoading] = useState(true
  );

  const fetchRegistry = async () => {
    setIsLoading(true
  );
    try {
      const res = await fetch('/api/seller/products'
  );
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setProducts(data
  );
      } else {
        console.error("Registry data is not an array:", data
  );
        toast("Registry format mismatch.", "error"
  );
      }
    } catch (err) {
      toast("Registry Synchronization Failure.", "error"
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchRegistry(
  );
  }, []
  );

  const handleApproval = async (product: any) => {
    setIsProcessing(true);
    try {
      const updatedProduct = { ...product, status: 'PUBLISHED' };
      const res = await fetch('/api/seller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      
      if (res.ok) {
        toast(`Asset ${product.id} approved. Initiating broadcast...`, "success");
        await broadcastHarvest({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image_url: product.image_url,
          description: product.description || ""
        });
        toast("Social Media Dispatch Complete.", "success");
        fetchRegistry();
        setIsAuditing(false);
      }
    } catch (err) {
      toast("Approval handshake disrupted.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true
  );
    try {
      const res = await fetch(`/api/seller/products?id=${selectedProduct.id}`, {
        method: 'DELETE'
      }
  );
      if (res.ok) {
        setProducts(products.filter(p => p.id !== selectedProduct.id)
  );
        setIsDeleting(false
  );
        setSelectedProduct(null
  );
        toast("Directive executed: Asset decommissioned from registry.", "success"
  );
      } else {
        toast("Decommissioning handshake failed.", "error"
  );
      }
    } catch (err) {
      toast("Technical disruption during decommissioning.", "error"
  );
    } finally {
      setIsProcessing(false
  );
    }
  };

  if (isLoading) {
    return (

      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Syncing Sovereign Registry...</p>
      </div>
    
  );
  }

  return (

    <>
      {/* Visual Audit Overlay */}
      {isAuditing && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex justify-center bg-bg-primary/95 backdrop-blur-2xl animate-in fade-in duration-500 p-[4px] md:p-4 pt-20 md:pt-24 pb-20 overflow-y-auto">
           <Card className="w-full max-w-4xl h-fit mb-32 p-0 overflow-hidden borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--foreground)/10', shadow-glow-purple relative rounded-lg md:rounded-[40px]">
              <button onClick={() => setIsAuditing(false)} className="absolute top-4 right-4 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 text-[var(--foreground)] flex items-center justify-center hover:bg-black/60 transition-all">
                 <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="bg-bg-secondary/40 p-4 md:p-8 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-[60%] md:w-[60%] aspect-square relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10">
                       <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/20 to-transparent" />
                    </div>
                 </div>
                 <div className="p-4 md:p-10 space-y-3 md:space-y-6 flex flex-col justify-center bg-bg-secondary/20">
                    <div className="space-y-1 md:space-y-2">
                       <div className="inline-flex items-center rounded-full px-2.5 py-0.5 font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[7px] md:text-[8px] tracking-[0.2em] italic uppercase bg-primary/10 text-primary border border-primary/20">
                          {selectedProduct.id}
                       </div>
                       <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">{selectedProduct.name}</h2>
                       <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest italic opacity-60">Maritime Registry: {selectedProduct.category}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                       <div className="p-3 md:p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase mb-0.5 md:mb-1 italic opacity-60">Market Value</p>
                          <p className="text-base md:text-xl font-black text-[var(--foreground)] italic tracking-tighter">{selectedProduct.price}</p>
                       </div>
                       <div className="p-3 md:p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase mb-0.5 md:mb-1 italic opacity-60">Quality Rank</p>
                          <p className="text-base md:text-xl font-black text-success uppercase italic tracking-tighter">{selectedProduct.quality}</p>
                       </div>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                       <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2 italic">
                          <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary" /> Visual Integrity Verified
                       </p>
                       <p className="text-[10px] md:text-xs text-text-secondary leading-relaxed italic opacity-60">
                          This asset has been audited for compliance with global maritime trade protocols and visual authenticity standards.
                       </p>
                    </div>
                    <div className="pt-4 md:pt-6 flex gap-3">
                       <button onClick={() => setIsAuditing(false)} className="inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] border bg-transparent hover:bg-[var(--foreground)]/5 text-text-primary px-4 py-2 flex-1 h-12 md:h-14 text-[9px] md:text-[10px] font-black tracking-widest uppercase border-[var(--foreground)]/10 rounded-lg md:rounded-xl italic">
                           CLOSE AUDIT
                       </button>
                       {selectedProduct.status !== 'PUBLISHED' && (
                         <Button 
                            onClick={() => handleApproval(selectedProduct)}
                            disabled={isProcessing}
                            className="flex-[2] h-12 md:h-14 bg-success text-[var(--foreground)] text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-success rounded-lg md:rounded-xl flex items-center justify-center gap-2"
                         >
                            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> APPROVE & BROADCAST</>}
                         </Button>
                       )}
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* Decommission Confirmation Modal */}
      {isDeleting && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex justify-center bg-bg-primary/80 backdrop-blur-xl animate-in fade-in duration-300 p-[4px] md:p-4 pt-20 md:pt-24 pb-20 overflow-y-auto">
           <Card className="w-full max-w-md h-fit mb-32 p-6 md:p-10 space-y-6 md:space-y-8 border-danger/30 shadow-glow-purple text-center relative z-[110] rounded-lg md:rounded-[40px]">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mx-auto">
                 <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase italic">Directive Required</h3>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-relaxed">
                    Confirm decommissioning of asset <br />
                    <span className="text-danger italic font-black">{selectedProduct.name}</span> <br />
                    from the Global Registry?
                 </p>
              </div>
              <div className="flex gap-4">
                 <Button variant="ghost" className="flex-1 h-12 text-[10px] font-black tracking-widest uppercase" onClick={() => setIsDeleting(false)} disabled={isProcessing}>CANCEL</Button>
                 <Button variant="primary" className="flex-1 h-12 bg-danger text-[10px] font-black tracking-widest uppercase shadow-glow-purple" onClick={handleDelete} disabled={isProcessing}>
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "DECOMMISSION"}
                 </Button>
              </div>
            </Card>
         </div>
      )}

      <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-0 animate-fade-in relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center gap-3">
              <Fish className="w-8 h-8 text-primary animate-pulse" /> Live Harbor Authority
            </h2>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Every Individual Harvest Listed on the Global Marketplace</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
                <BarChart2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shadow-glow-purple/5" /> PRICE INDEX
            </Button>
            <Link href="/admin/products/add" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
                  <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION OVERRIDE
                </Button>
            </Link>
          </div>
        </div>

        {/* Subscription Pulse */}
        <div className="grid grid-cols-4 w-full gap-1 md:gap-6">
          {[
            { label: "Enterprise Nodes", value: "42", icon: <ShieldCheck />, color: "text-primary", bg: "bg-primary/10", glow: "shadow-glow-purple/10" },
            { label: "Premium Tiers", value: "158", icon: <Zap />, color: "text-warning", bg: "bg-warning/10", glow: "shadow-glow-warning/10" },
            { label: "Active Subscribers", value: "624", icon: <Users />, color: "text-success", bg: "bg-success/10", glow: "shadow-glow-success/10" },
            { label: "Monthly Yield", value: "₹124K", icon: <IndianRupee />, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-glow-cyan/10" },
          ].map((stat) => (
            <Card key={stat.label} className={cn("p-1.5 md:p-6 flex flex-col sm:flex-row items-center gap-1 md:gap-4 bg-bg-secondary/20 border-[var(--foreground)]/5 group hover:border-[var(--foreground)]/10 transition-all rounded-[12px] md:rounded-[32px] shadow-premium min-w-0", stat.glow)}>
              <div className={cn("w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-[16px] flex items-center justify-center border border-[var(--foreground)]/5 shadow-inner shrink-0", stat.bg, stat.color)}>
                {React.cloneElement(stat.icon as React.ReactElement, { className: "w-3 md:w-6 h-3 md:h-6" })}
              </div>
              <div className="space-y-0 md:space-y-0.5 min-w-0 text-center sm:text-left">
                 <p className="text-[5px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 truncate w-full">{stat.label}</p>
                 <h4 className="text-[9px] md:text-xl font-black text-[var(--foreground)] italic tracking-tighter truncate w-full">{stat.value}</h4>
              </div>
            </Card>
          ))}
        </div>

        {/* Registry Table */}
        <Card className="p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5 overflow-hidden">
          <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
            <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Live Catch Registry</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Real-Time Harbor Integrated Inventory Management</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative group w-full md:w-80">
                  <Input placeholder="SEARCH MERCHANT..." className="h-10 md:h-12 pl-10 md:pl-12 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                  <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <Button variant="outline" size="sm" className="h-10 md:h-12 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
                  <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTER
                </Button>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="border-[var(--foreground)]/5">
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Listing Identity</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Merchant Hub</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Category</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Live Status / Harbor</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry State</TableHead>
                    <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                  </TableRow>
              </TableHeader>
                <TableBody>
                  {products.map((prd) => (
                      <TableRow key={prd.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                        <TableCell>
                            <div className="space-y-0.5 md:space-y-1">
                              <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{prd.name}</p>
                              <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">ID: {prd.id} • ₹{prd.price}</p>
                            </div>
                        </TableCell>
                        <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-60">via {prd.seller}</TableCell>
                        <TableCell className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{prd.category}</TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                {prd.is_live_inventory == 1 ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-success" />
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">LIVE BATCH</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <Anchor className="w-2.5 h-2.5 text-primary" />
                                            <span className="text-[8px] font-black text-primary uppercase">{prd.harbor_node || 'UNLINKED'}</span>
                                        </div>
                                        <span className="text-[7px] font-bold text-text-secondary uppercase opacity-40 italic">{prd.catch_date || 'RECENT'}</span>
                                    </>
                                ) : (
                                    <span className="text-[8px] font-black text-text-secondary uppercase opacity-40 italic">STATIC CATALOG</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <Badge variant={
                                prd.status === "PUBLISHED" ? "success" : 
                                prd.status === "PENDING AUDIT" ? "warning" : 
                                "danger"
                                } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest w-fit">
                                {prd.status}
                                </Badge>
                                {prd.is_live_inventory == 1 && (
                                    <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">● LIVE HARBOR</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 md:pr-6">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <button 
                                className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5" 
                                onClick={() => { setSelectedProduct(prd); setIsAuditing(true); }}
                              >
                                  <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                              </button>
                              <Link href={`/admin/products/edit/${prd.id}`}>
                                  <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                                    <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                  </button>
                              </Link>
                              <button 
                                className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5" 
                                onClick={() => { setSelectedProduct(prd); setIsDeleting(true); }}
                              >
                                  <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                              </button>
                            </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
            </Table>
          </div>

          {/* Mobile view cards - visible only on lg screens and below */}
          <div className="lg:hidden space-y-4 p-4">
            {products.map((prd) => (
              <div 
                key={prd.id} 
                className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic">{prd.name}</p>
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {prd.id} • ₹{prd.price}</p>
                  </div>
                  <Badge variant={
                    prd.status === "PUBLISHED" ? "success" : 
                    prd.status === "PENDING AUDIT" ? "warning" : 
                    "danger"
                  } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                    {prd.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Merchant Hub</p>
                    <p className="text-[10px] font-black text-text-secondary italic opacity-60">via {prd.seller}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Category</p>
                    <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{prd.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Live Status / Harbor</p>
                    <div className="flex flex-col gap-0.5">
                      {prd.is_live_inventory == 1 ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-success" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">LIVE BATCH</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-60">
                            <Anchor className="w-2 h-2 text-primary" />
                            <span className="text-[8px] font-black text-primary uppercase">{prd.harbor_node || 'UNLINKED'}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-[8px] font-black text-text-secondary uppercase opacity-40 italic">STATIC CATALOG</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <button 
                      title="View Details"
                      className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5" 
                      onClick={() => { setSelectedProduct(prd); setIsAuditing(true); }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/admin/products/edit/${prd.id}`}>
                      <button title="Edit" className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button 
                      title="Decommission"
                      className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5" 
                      onClick={() => { setSelectedProduct(prd); setIsDeleting(true); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  
  );
}
