"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert,
  Ship,
  TrendingUp,
  Activity,
  Award,
  Filter,
  BarChart2,
  Mail,
  Zap,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  FileText,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL, PHP_SERVER_URL } from "@/config/api";
import { Modal } from "@/components/ui/Modal";



export default function AdminSellersPage() {
  const router = useRouter(
  );
  const { toast } = useToast(
  );
  const [mounted, setMounted] = useState(false
  );
  const [sellers, setSellers] = useState<any[]>([]
  );
  const [loading, setLoading] = useState(true
  );
  const [searchQuery, setSearchQuery] = useState(""
  );
  
  // Audit Modal State
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null
  );
  const [sellerDocs, setSellerDocs] = useState<any[]>([]
  );
  const [docsLoading, setDocsLoading] = useState(false
  );
  const [auditingId, setAuditingId] = useState<number | null>(null
  );
  const [statusLoading, setStatusLoading] = useState<string | null>(null
  );

  const fetchSellers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/get_sellers.php?t=${Date.now()}`
);
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setSellers(data
  );
      } else {
        setSellers([]
  );
      }
    } catch (err) {
      console.error("Fleet telemetry failure:", err
  );
      setSellers([]
  );
    } finally {
      setLoading(false
  );
    }
  };

  const fetchSellerDocs = async (sellerId: string) => {
    setDocsLoading(true
  );
    setSellerDocs([]
  );
    try {
      const res = await fetch(`${API_BASE_URL}/admin/get_seller_docs.php?seller_id=${sellerId}&t=${Date.now()}`
);
      const data = await res.json(
  );
      if (Array.isArray(data)) setSellerDocs(data
  );
    } catch (err) {
      console.error("Dossier retrieval failure:", err
  );
    } finally {
      setDocsLoading(false
  );
    }
  };

  const handleUpdateDocStatus = async (docId: number, status: string) => {
    setAuditingId(docId
  );
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update_doc_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, status })
      }
  );
      if (res.ok) {
        toast(`Credential status transitioned to ${status}`, "success"
  );
        if (selectedSeller) fetchSellerDocs(selectedSeller.id
  );
        fetchSellers(
  );
      }
    } catch (err) {
      console.error("Audit failure:", err
  );
    } finally {
      setAuditingId(null
  );
    }
  };

  const handleToggleSellerStatus = async (sellerId: string, currentStatus: string, explicitTarget?: string) => {
    const targetStatus = explicitTarget || (currentStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED'
  );
    setStatusLoading(sellerId
  );
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update_seller_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sellerId, status: targetStatus })
      }
  );
      if (res.ok) {
        toast(`Merchant ${sellerId} state transitioned to ${targetStatus}`, "success"
  );
        fetchSellers(
  );
      }
    } catch (err) {
      console.error("Governance failure:", err
  );
    } finally {
      setStatusLoading(null
  );
    }
  };

  useEffect(() => {
    setMounted(true
  );
    fetchSellers(
  );
  }, []
  );

  if (!mounted) return (

    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
       <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  
  );

  const filteredSellers = sellers.filter(s => 
    (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  
  );

  return (

    <>
      <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-0 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Merchant Fleet Command</h2>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">
              Governing {sellers.length} Sovereign Merchant Nodes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 px-6 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 border-[var(--foreground)]/10">
               <BarChart2 className="w-4 h-4 text-primary" /> COMMISSION AUDIT
            </Button>
            <Button 
              onClick={() => router.push("/admin/users/add?role=SELLER")}
              variant="primary" 
              className="w-full sm:w-auto h-12 px-6 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-3"
            >
              <UserPlus className="w-4 h-4" /> COMMISSION NEW MERCHANT
            </Button>
          </div>
        </div>

        {/* Fleet Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
          {[
            { label: "Active Merchants", value: sellers.filter(s => s.status === 'VERIFIED').length, icon: <Ship className="text-primary" />, trend: "+4.2%" },
            { label: "Global Revenue", value: "₹85.4M", icon: <TrendingUp className="text-success" />, trend: "+12.8%" },
            { label: "Pending Audits", value: sellers.filter(s => s.health === 'PENDING').length, icon: <Activity className="text-warning" />, trend: "STABLE" },
            { label: "Fleet Integrity", value: "99.2%", icon: <Award className="text-tertiary" />, trend: "OPTIMAL" },
          ].map((stat) => (
            <Card key={stat.label} className="p-[10px] md:p-8 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-glow-purple/5">
              <div className="flex items-center justify-between">
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all">
                   {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
                 </div>
                 <span className="text-[7px] md:text-[9px] font-black text-success uppercase tracking-widest italic">{stat.trend}</span>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
                <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
              </div>
            </Card>
          ))}
        </div>

        {/* Merchant Registry Table */}
        <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
          <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
             <div className="space-y-0.5 md:space-y-1">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Sovereign Merchant Registry</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Authorized Trade Nodes</p>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
                <div className="relative group w-full md:w-80">
                   <Input 
                     placeholder="SEARCH MERCHANT NODES..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[10px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
                   />
                   <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <Button variant="outline" size="sm" className="h-10 md:h-12 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
                   <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTERS
                </Button>
             </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Merchant Identity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Account Status</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Performance</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Fleet Health</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Revenue Node</TableHead>
                  <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-20" />
                    </TableCell>
                  </TableRow>
                ) : filteredSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 opacity-20 italic text-xs uppercase tracking-widest">No merchant nodes registered in the registry.</TableCell>
                  </TableRow>
                ) : filteredSellers.map((seller) => (
                  <TableRow key={seller.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell>
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary font-black group-hover/row:border-primary/50 transition-all text-sm md:text-base italic">
                          {seller.name?.[0] || 'M'}
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{seller.name}</p>
                          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Lead: {seller.lead} • {seller.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        seller.status === "VERIFIED" ? "success" : 
                        seller.status === "SUSPENDED" ? "danger" : "warning"
                      } className="italic uppercase text-[8px] md:text-[10px] px-2 shadow-glow-purple/20">
                        {seller.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="flex items-center gap-1 text-warning">
                           <Award className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" />
                           <span className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] italic">{seller.rating}</span>
                        </div>
                        <span className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">• {seller.products} ASSETS</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 md:gap-3">
                          <div className={cn(
                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
                            seller.health === "OPTIMAL" ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                            seller.health === "PENDING" ? "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                            "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          )} />
                          <span className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{seller.health}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-0.5 md:space-y-1">
                          <p className="font-black text-[var(--foreground)] text-xs md:text-sm italic tracking-tighter">{seller.revenue}</p>
                          <p className="text-[7px] md:text-[9px] font-black text-primary uppercase tracking-widest italic opacity-60">Comm: {seller.commission}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 md:gap-2">
                        {seller.status === 'PENDING' && (
                          <button 
                            title="Authorize Merchant Node"
                            onClick={() => handleToggleSellerStatus(seller.id, seller.status, 'VERIFIED')}
                            className="p-2 md:p-2.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-[var(--foreground)] transition-all border border-success/20 shadow-glow-purple/20"
                          >
                            <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                        )}
                        <button 
                          title="Node Audit Dossier"
                          onClick={() => {
                            setSelectedSeller(seller);
                            fetchSellerDocs(seller.id);
                          }}
                          className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                        >
                          <Zap className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                        <button 
                          title="Direct Signal Hub"
                          onClick={() => router.push(`/admin/support?seller=${seller.id}`)}
                          className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5"
                        >
                          <Mail className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                        <button 
                          title={seller.status === 'SUSPENDED' ? "Reactivate Node" : "Suspend Node"}
                          onClick={() => handleToggleSellerStatus(seller.id, seller.status)}
                          disabled={statusLoading === seller.id}
                          className={cn(
                            "p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 transition-all border border-[var(--foreground)]/5",
                            seller.status === 'SUSPENDED' ? "text-success hover:text-success" : "text-text-secondary hover:text-danger"
                          )}
                        >
                          {statusLoading === seller.id ? (
                            <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" />
                          ) : (
                            seller.status === 'SUSPENDED' ? <Unlock className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <ShieldAlert className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          )}
                        </button>
                        <button 
                          title="More Options"
                          onClick={() => toast("Advanced Node Configuration: " + seller.id, "info")}
                          className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5"
                        >
                          <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
            {loading ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-20" />
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="text-center py-10 opacity-20 italic text-xs uppercase tracking-widest">
                No merchant nodes registered in the registry.
              </div>
            ) : (
              filteredSellers.map((seller) => (
                <div 
                  key={seller.id} 
                  className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary font-black italic">
                        {seller.name?.[0] || 'M'}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic">{seller.name}</p>
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Lead: {seller.lead} • {seller.id}</p>
                      </div>
                    </div>
                    <Badge variant={
                      seller.status === "VERIFIED" ? "success" : 
                      seller.status === "SUSPENDED" ? "danger" : "warning"
                    } className="italic uppercase text-[8px] px-2 shadow-glow-purple/20">
                      {seller.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                    <div className="space-y-0.5">
                      <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Performance</p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-warning">
                          <Award className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[9px] font-black text-[var(--foreground)] italic">{seller.rating}</span>
                        </div>
                        <span className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">• {seller.products} ASSETS</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Fleet Health</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          seller.health === "OPTIMAL" ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                          seller.health === "PENDING" ? "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                          "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        )} />
                        <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{seller.health}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                    <div>
                      <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Revenue Node</p>
                      <p className="font-black text-[var(--foreground)] text-xs italic tracking-tighter">{seller.revenue}</p>
                      <p className="text-[7px] font-black text-primary uppercase tracking-widest italic opacity-60">Comm: {seller.commission}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {seller.status === 'PENDING' && (
                        <button 
                          title="Authorize Merchant Node"
                          onClick={() => handleToggleSellerStatus(seller.id, seller.status, 'VERIFIED')}
                          className="p-2 rounded-lg bg-success/10 text-success hover:bg-success hover:text-[var(--foreground)] transition-all border border-success/20 shadow-glow-purple/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        title="Node Audit Dossier"
                        onClick={() => {
                          setSelectedSeller(seller);
                          fetchSellerDocs(seller.id);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        title="Direct Signal Hub"
                        onClick={() => router.push(`/admin/support?seller=${seller.id}`)}
                        className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        title={seller.status === 'SUSPENDED' ? "Reactivate Node" : "Suspend Node"}
                        onClick={() => handleToggleSellerStatus(seller.id, seller.status)}
                        disabled={statusLoading === seller.id}
                        className={cn(
                          "p-2 rounded-lg hover:bg-[var(--foreground)]/5 transition-all border border-[var(--foreground)]/5",
                          seller.status === 'SUSPENDED' ? "text-success hover:text-success" : "text-text-secondary hover:text-danger"
                        )}
                      >
                        {statusLoading === seller.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          seller.status === 'SUSPENDED' ? <Unlock className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Verification Audit Modal */}
        <Modal
          isOpen={!!selectedSeller}
          onClose={() => setSelectedSeller(null)}
          title="Node Audit Dossier"
          description={selectedSeller ? `${selectedSeller.name} • ${selectedSeller.id}` : ""}
          className="max-w-2xl bg-bg-secondary border-[var(--foreground)]/10 text-[var(--foreground)]"
        >
          {selectedSeller && (
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Account State</p>
                    <Badge variant={selectedSeller.status === 'VERIFIED' ? 'success' : 'warning'} className="text-[9px]">{selectedSeller.status}</Badge>
                  </div>
                  <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fleet Health</p>
                    <p className="text-sm font-black text-[var(--foreground)] italic">{selectedSeller.health}</p>
                  </div>
                  <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Audit Progress</p>
                    <p className="text-sm font-black text-primary italic">{selectedSeller.progress}%</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                       <FileText className="w-4 h-4 text-primary" /> Credential Registry
                    </h4>
                    {docsLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                     {sellerDocs.length === 0 && !docsLoading ? (
                        <div className="py-10 text-center border-2 border-dashed border-[var(--foreground)]/5 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">No assets found in registry dossier.</p>
                        </div>
                     ) : sellerDocs.map((doc) => (
                        <div key={doc.id} className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors">
                                 <FileText className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-xs font-bold text-[var(--foreground)] uppercase italic">{doc.title}</p>
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{doc.display_id} • {doc.type}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge variant={doc.status === 'VERIFIED' ? 'success' : doc.status === 'REJECTED' ? 'danger' : 'warning'} className="text-[8px]">
                                 {doc.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                 <Button 
                                   onClick={() => handleUpdateDocStatus(doc.id, 'VERIFIED')}
                                   disabled={auditingId === doc.id || doc.status === 'VERIFIED'}
                                   className="h-8 w-8 p-0 bg-success/20 text-success hover:bg-success hover:text-[var(--foreground)] border-success/20 rounded-lg"
                                 >
                                    <CheckCircle2 className="w-4 h-4" />
                                 </Button>
                                 <Button 
                                   onClick={() => handleUpdateDocStatus(doc.id, 'REJECTED')}
                                   disabled={auditingId === doc.id || doc.status === 'REJECTED'}
                                   className="h-8 w-8 p-0 bg-danger/20 text-danger hover:bg-danger hover:text-[var(--foreground)] border-danger/20 rounded-lg"
                                 >
                                    <XCircle className="w-4 h-4" />
                                 </Button>
                                 <Button 
                                   variant="outline"
                                   className="h-8 w-8 p-0 border-[var(--foreground)]/10 rounded-lg"
                                   onClick={() => window.open(`${PHP_SERVER_URL}/FISH_MARKET/${doc.file_path}`, '_blank')}
                                 >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-[var(--foreground)]/5">
                  <Button className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest shadow-glow-purple rounded-2xl">
                     AUTHORIZE GLOBAL TRADE NODE
                  </Button>
                  <Button variant="outline" className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 rounded-2xl">
                     RE-COMMISSION AUDIT
                  </Button>
               </div>
            </div>
          )}
        </Modal>

        {/* Pagination Command */}
        <div className="flex items-center justify-between">
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Fleet Telemetry Active</p>
          <div className="flex items-center gap-1.5 md:gap-2 p-1 rounded-[12px] md:rounded-[14px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-premium">
            <Button variant="primary" size="sm" className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black shadow-glow-purple italic">1</Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black opacity-40 hover:opacity-100 transition-opacity italic">2</Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black opacity-40 hover:opacity-100 transition-opacity italic">3</Button>
          </div>
        </div>
      </div>
    </>
  
  );
}
