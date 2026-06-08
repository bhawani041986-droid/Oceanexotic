"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Search, 
  Lock,
  Zap,
  Globe,
  MoreVertical,
  ArrowRight,
  Loader2,
  X,
  FileUp,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { Modal } from "@/components/ui/Modal";

export default function SellerVerificationPage() {
  const [mounted, setMounted] = useState(false
  );
  const [data, setData] = useState<any>(null
  );
  const [loading, setLoading] = useState(true
  );
  const [uploading, setUploading] = useState(false
  );
  const [showModal, setShowModal] = useState(false
  );
  
  // Upload State
  const [selectedDoc, setSelectedDoc] = useState<any>(null
  );
  const [uploadTitle, setUploadTitle] = useState(""
  );
  const [uploadType, setUploadType] = useState("LEGAL"
  );
  const fileInputRef = useRef<HTMLInputElement>(null
  );

  const sellerId = "SEL-001";

  const fetchVerification = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/seller/get_verification?seller_id=${sellerId}&t=${Date.now()}`);
      const result = await res.json(
  );
      setData(result
  );
    } catch (err) {
      console.error("Registry sync failure:", err
  );
    } finally {
      setLoading(false
  );
    }
  };

  const handleUploadClick = (doc?: any) => {
    if (doc) {
      setSelectedDoc(doc
  );
      setUploadTitle(doc.title
  );
      setUploadType(doc.type
  );
    } else {
      setSelectedDoc(null
  );
      setUploadTitle(""
  );
      setUploadType("LEGAL"
  );
    }
    setShowModal(true
  );
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(
  );
    const file = fileInputRef.current?.files?.[0];
    if (!file && !selectedDoc) return;

    setUploading(true
  );
    const formData = new FormData(
  );
    formData.append("seller_id", sellerId
  );
    formData.append("title", uploadTitle
  );
    formData.append("doc_type", uploadType
  );
    if (file) formData.append("file", file
  );

    try {
      const res = await fetch(`${API_BASE_URL}/seller/upload_doc`, {
        method: 'POST',
        body: formData
      }
  );
      if (res.ok) {
        setShowModal(false
  );
        fetchVerification(
  );
      }
    } catch (err) {
      console.error("Transmission error:", err
  );
    } finally {
      setUploading(false
  );
    }
  };

  useEffect(() => {
    setMounted(true
  );
    fetchVerification(
  );
  }, []
  );

  if (!mounted) return null;

  return (

    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
         <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px] tracking-[0.4em] h-10 px-8">
            SOVEREIGNTY COMMISSIONING
         </Badge>
         <h2 className="text-5xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">Node <span className="text-primary">Integrity.</span></h2>
         <p className="text-lg font-medium text-text-secondary italic leading-relaxed">
            Verify your maritime business credentials to establish absolute trust within the OceanExotic Global registry.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Identity Integrity Pulse */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="p-10 space-y-8 text-center bg-bg-secondary/40 relative overflow-hidden group border-primary/20">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="w-24 h-24 text-primary" />
               </div>
               <div className="relative inline-block mx-auto">
                  <div className={cn(
                    "w-32 h-32 rounded-[30px] bg-[var(--foreground)]/5 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple relative z-10",
                    loading ? "animate-pulse" : ""
                  )}>
                     <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-warning border-4 border-bg-primary flex items-center justify-center text-white shadow-lg">
                     <Zap className="w-5 h-5" />
                  </div>
               </div>
               <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">Integrity Rank</h3>
                  <p className="text-[10px] font-black text-warning uppercase tracking-widest leading-none">
                    {loading ? "CALCULATING..." : data?.rank}
                  </p>
               </div>
               <div className="pt-6 border-t border-[var(--foreground)]/5 relative z-10">
                  <div className="h-2 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary rounded-full shadow-glow-purple transition-all duration-1000" 
                        style={{ width: `${data?.progress || 0}%` }} 
                     />
                  </div>
                  <p className="text-[9px] font-black text-text-secondary uppercase mt-3 tracking-widest text-left">Commissioning Progress: {data?.progress || 0}%</p>
               </div>
            </Card>

            <Card className="p-8 space-y-6">
               <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-4">
                  <Lock className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Global Benefits</h4>
               </div>
               <div className="space-y-4">
                  {[
                    { label: "High-Volume Settlements", active: (data?.progress || 0) >= 30 },
                    { label: "Elite Merchant Badge", active: (data?.progress || 0) >= 70 },
                    { label: "Priority Sourcing Nodes", active: (data?.progress || 0) >= 100 },
                  ].map((benefit) => (
                    <div key={benefit.label} className={cn("flex items-center gap-3 transition-opacity", benefit.active ? "opacity-100" : "opacity-40")}>
                       <CheckCircle2 className={cn("w-4 h-4", benefit.active ? 'text-success' : 'text-text-secondary')} />
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{benefit.label}</p>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Document Registry Area */}
         <div className="lg:col-span-2 space-y-10">
            <Card className="p-1 overflow-hidden">
               <div className="p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" /> Credential Registry
                     </h3>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Legal & Quality Certifications</p>
                  </div>
                  <Button 
                    onClick={() => handleUploadClick()}
                    variant="primary" 
                    size="sm" 
                    className="h-10 px-6 text-[9px] font-black uppercase tracking-widest shadow-glow-purple flex items-center gap-2"
                  >
                     <Upload className="w-3.5 h-3.5" /> UPLOAD ASSET
                  </Button>
               </div>
               <div className="hidden lg:block">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Credential</TableHead>
                           <TableHead>Validity</TableHead>
                           <TableHead>Registry Status</TableHead>
                           <TableHead className="text-right">Governance</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {loading ? (
                           <TableRow>
                              <TableCell colSpan={4} className="text-center py-20">
                                 <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-20" />
                              </TableCell>
                           </TableRow>
                        ) : data?.documents.map((doc: any) => (
                           <TableRow key={doc.id} className="group">
                              <TableCell>
                                 <div className="space-y-1">
                                    <p className="font-bold text-[var(--foreground)] text-sm uppercase tracking-tight">{doc.title}</p>
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {doc.id} • {doc.type}</p>
                                 </div>
                              </TableCell>
                              <TableCell className="text-xs font-medium text-text-secondary italic">until {doc.expiry}</TableCell>
                              <TableCell>
                                 <Badge variant={doc.status === "VERIFIED" ? "success" : doc.status === "PENDING" ? "warning" : "danger"} className="shadow-glow-purple">
                                    {doc.status}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => alert(`Reviewing asset ${doc.id} in registry...`)}
                                      className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all"
                                    >
                                       <Search className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleUploadClick(doc)}
                                      className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all"
                                    >
                                       <Upload className="w-4 h-4" />
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
                  {loading ? (
                     <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-20" />
                     </div>
                  ) : data?.documents.map((doc: any) => (
                     <div key={doc.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                        <div className="flex items-start justify-between">
                           <div className="space-y-0.5">
                              <p className="font-bold text-[var(--foreground)] text-sm uppercase tracking-tight">{doc.title}</p>
                              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest font-mono">ID: {doc.id} • {doc.type}</p>
                           </div>
                           <Badge variant={doc.status === "VERIFIED" ? "success" : doc.status === "PENDING" ? "warning" : "danger"} className="shadow-glow-purple text-[8px] px-1.5 py-0.5">
                              {doc.status}
                           </Badge>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                           <p className="text-[10px] font-medium text-text-secondary italic">until {doc.expiry}</p>
                           <div className="flex gap-1.5">
                              <button 
                                onClick={() => alert(`Reviewing asset ${doc.id} in registry...`)}
                                className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5"
                              >
                                 <Search className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleUploadClick(doc)}
                                className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"
                              >
                                 <Upload className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-10 space-y-8 bg-white/[0.02] border-[var(--foreground)]/5 relative overflow-hidden group">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple">
                     <Globe className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">KYC Node Integration</h4>
                     <p className="text-sm text-text-secondary font-medium leading-relaxed italic">
                        Authorize global maritime background checks to unlock Tier-3 settlement directives.
                     </p>
                  </div>
               </div>
               <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group">
                  COMMISSION KYC HANDSHAKE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </Card>
         </div>
      </div>

      {/* Asset Commissioning Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Asset Commissioning"
        description="Synchronizing with Maritime Registry"
        className="bg-bg-secondary border-[var(--foreground)]/10 text-[var(--foreground)]"
      >
        <form onSubmit={handleFileSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Credential Title</label>
              <Input 
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Maritime Business License"
                disabled={!!selectedDoc}
                className="h-14 bg-bg-primary border-white/10 text-white font-bold rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Credential Type</label>
              <select 
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                disabled={!!selectedDoc}
                className="w-full h-14 bg-bg-primary border border-white/10 rounded-2xl px-6 text-[11px] font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="LEGAL">LEGAL</option>
                <option value="QUALITY">QUALITY</option>
                <option value="LOGISTICS">LOGISTICS</option>
                <option value="IDENTITY">IDENTITY</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Asset File</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-primary transition-colors" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">Select PDF or High-Res Image</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" />
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={uploading}
            className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple rounded-2xl flex items-center justify-center gap-4 mt-6"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "COMMIT TO REGISTRY"}
            {!uploading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      </Modal>

    </div>
  
  );
}
