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
  MoreVertical, 
  Edit3, 
  Trash2,
  Layers,
  Fish,
  Activity,
  Filter,
  BarChart3,
  Globe
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const MOCK_CATEGORIES = [
  { id: "CAT-001", name: "Premium Saku", species: "Bluefin, Bigeye", products: 24, status: "ACTIVE", volume: "₹42,400,000" },
  { id: "CAT-002", name: "Wild Shellfish", species: "Scallops, Oysters", products: 18, status: "ACTIVE", volume: "₹18,200,000" },
  { id: "CAT-003", name: "Deep Sea Crustaceans", species: "King Crab, Lobster", products: 12, status: "ACTIVE", volume: "₹85,000,000" },
  { id: "CAT-004", name: "Arctic Whitefish", species: "Cod, Halibut", products: 42, status: "ARCHIVED", volume: "₹12,400,000" },
];

export default function AdminCategoriesPage() {
  const { toast } = useToast(
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false
  );
  const [formData, setFormData] = React.useState({
    name: "",
    species: "",
    image_url: ""
  }
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadData = new FormData(
  );
      uploadData.append("file", file
  );
      const res = await fetch("/api/upload", { method: "POST", body: uploadData }
  );
      const data = await res.json(
  );
      setFormData({ ...formData, image_url: data.url }
  );
    }
  };

  const handleSave = () => {
    toast("Category commissioned successfully.", "success"
  );
    setIsModalOpen(false
  );
  };

  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Taxonomy Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing the Global Species Classifications and Trade Sectors</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <div className="relative group w-full md:w-80">
            <Input 
              placeholder="SEARCH TAXONOMY NODES..." 
              className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[9px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
            />
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <Button 
            variant="primary" 
            className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION CATEGORY
          </Button>
        </div>
      </div>

      {/* Category Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-8">
        {[
          { label: "Active Classifications", value: "3 Sectors", icon: <Layers />, trend: "OPTIMAL" },
          { label: "Species Cataloged", value: "84 Varieties", icon: <Fish />, trend: "+12%" },
          { label: "Market Circulation", value: "₹158M", icon: <Activity />, trend: "STABLE" },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
            <div className="flex items-center justify-between">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                 {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
               </div>
               <span className="text-[7px] md:text-[9px] font-black text-success uppercase tracking-widest italic">{stat.trend}</span>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Macro-Taxonomy Ledger</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Authorized Trade Nodes by Maritime Sector</p>
           </div>
           <Button variant="outline" size="sm" className="h-9 md:h-10 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTERS
           </Button>
        </div>
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--foreground)]/5">
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Category Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Cataloged Species</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Product Density</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Trade Volume</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CATEGORIES.map((cat) => (
                <TableRow key={cat.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                  <TableCell>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter group-hover/row:text-primary transition-colors italic">{cat.name}</p>
                      <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {cat.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-40">via {cat.species}</TableCell>
                  <TableCell className="font-black text-[var(--foreground)] italic text-[11px] md:text-sm">{cat.products} NODES</TableCell>
                  <TableCell className="font-black text-primary italic text-[11px] md:text-sm">{cat.volume}</TableCell>
                  <TableCell>
                    <Badge variant={cat.status === "ACTIVE" ? "success" : "secondary"} className="italic uppercase text-[8px] md:text-[10px] px-2">
                      {cat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                        <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      </button>
                      <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                        <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      </button>
                      <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                        <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
          {MOCK_CATEGORIES.map((cat) => (
            <div key={cat.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{cat.name}</p>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{cat.id} • via {cat.species}</p>
                </div>
                <Badge variant={cat.status === "ACTIVE" ? "success" : "secondary"} className="italic uppercase text-[8px] px-2">{cat.status}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                <div className="space-y-0">
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Products</p>
                  <p className="text-xs font-black text-[var(--foreground)] italic">{cat.products} Nodes</p>
                </div>
                <div className="text-right space-y-0">
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Volume</p>
                  <p className="text-xs font-black text-primary italic">{cat.volume}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Global Intelligence Handshake */}
      <div className="flex items-center justify-center gap-10 opacity-30 pt-10">
         <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Global Taxonomy Sync Active</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/20" />
         <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-success" />
            <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic">Market Yield Integrity Verified</span>
         </div>
      </div>

      {/* Commission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <Card className="relative z-10 w-full max-w-sm md:max-w-lg p-6 md:p-10 bg-bg-secondary border-[var(--foreground)]/5 space-y-6 md:space-y-8 animate-in zoom-in-95 duration-300 rounded-[24px] md:rounded-[48px] shadow-glow-purple/20">
              <div className="space-y-1 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                 <h3 className="text-lg md:text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">Commission Sector</h3>
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Defining a New Node in the Global Maritime Taxonomy</p>
              </div>
              <div className="space-y-4 md:space-y-6">
                 <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Sector Nomenclature</label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Saku" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                 </div>
                 <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Species Mapping</label>
                    <Input value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} placeholder="e.g. Bluefin, Bigeye" className="h-11 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 italic rounded-lg md:rounded-xl" />
                 </div>
                 <div className="space-y-3 md:space-y-4">
                    <label className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Sector Visual (Icon/Image)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-[24px] bg-[var(--foreground)]/5 border-2 border-dashed border-[var(--foreground)]/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                    >
                       {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 md:w-8 md:h-8 opacity-20" />}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>
              <div className="flex gap-2 md:gap-4 pt-2 md:pt-4">
                 <Button variant="ghost" className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black italic" onClick={() => setIsModalOpen(false)}>ABORT</Button>
                 <Button className="flex-1 h-11 md:h-12 uppercase text-[9px] md:text-[10px] font-black shadow-glow-purple italic rounded-lg md:rounded-xl" onClick={handleSave}>COMMISSION NODE</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  
  );
}
