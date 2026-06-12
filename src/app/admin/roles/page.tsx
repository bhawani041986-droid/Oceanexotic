"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Users, 
  Eye, 
  Edit3, 
  Trash2,
  Shield,
  X,
  Save,
  Loader2
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  users: number;
  level: string;
  status: string;
}

export default function AdminRolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      toast("Failed to synchronize roles registry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.level) {
      toast("Missing vital role parameters", "error");
      return;
    }

    setIsSaving(true);
    try {
      let updatedRoles = [...roles];
      
      if (editingRole) {
        // Edit existing
        updatedRoles = updatedRoles.map(r => r.id === editingRole.id ? { ...r, ...formData } as Role : r);
      } else {
        // Create new
        const newRole: Role = {
          id: `ROLE-${Date.now().toString().slice(-4)}`,
          name: formData.name,
          level: formData.level,
          status: formData.status || "ACTIVE",
          users: 0
        };
        updatedRoles.push(newRole);
      }

      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: updatedRoles })
      });

      const data = await res.json();
      if (data.status === "success") {
        toast("Role sovereignty established", "success");
        setRoles(updatedRoles);
        setIsModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast("Failed to update role: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id.includes('ADMIN')) {
      toast("Cannot delete core administrative identity", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to eradicate the ${name} role from the global registry?`)) return;

    try {
      const updatedRoles = roles.filter(r => r.id !== id);
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: updatedRoles })
      });

      if (res.ok) {
        toast("Role purged from system", "success");
        setRoles(updatedRoles);
      }
    } catch (err) {
      toast("Failed to delete role", "error");
    }
  };

  const openAddModal = () => {
    setEditingRole(null);
    setFormData({ status: "ACTIVE", level: "LEVEL 1 (BASIC)" });
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData(role);
    setIsModalOpen(true);
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Authority Systemty</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Administrative Roles & Global Platform Permissions</p>
        </div>
        <Button onClick={openAddModal} variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION ROLE
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Permission Pulse */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="p-[10px] md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 rounded-[24px] md:rounded-[40px] shadow-premium">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-[18px] bg-primary/20 flex items-center justify-center text-primary shadow-glow-purple">
                  <ShieldCheck className="w-6 md:w-8 h-6 md:h-8" />
               </div>
               <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase italic tracking-tighter">Active Directives</h3>
                  <p className="text-[8px] md:text-[10px] text-text-secondary font-black uppercase tracking-tight leading-relaxed italic opacity-60">
                     Platform sovereignty is currently divided across <span className="text-[var(--foreground)]">{roles.length}</span> permission nodes. System integrity: <span className="text-success shadow-glow-purple">UNCOMPROMISED</span>.
                  </p>
               </div>
            </Card>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2">Role Categories</h4>
              {[
                { label: "Administrative Elite", count: roles.filter(r => r.level.includes("10")).length, icon: <Crown className="w-3.5 h-3.5" /> },
                { label: "Merchant Governance", count: roles.filter(r => r.level.includes("7") || r.id.includes("SELLER")).length, icon: <Store className="w-3.5 h-3.5" /> },
                { label: "Support Fleet", count: roles.filter(r => r.level.includes("1") || r.id.includes("CUSTOMER") || r.id.includes("AGENT")).length, icon: <Users className="w-3.5 h-3.5" /> },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-[var(--foreground)]/20 transition-all cursor-default group">
                   <div className="flex items-center gap-3 md:gap-4 text-text-secondary group-hover:text-[var(--foreground)] transition-all">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-[10px] bg-[var(--foreground)]/5 flex items-center justify-center">
                         {React.cloneElement(cat.icon as React.ReactElement)}
                      </div>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">{cat.label}</span>
                   </div>
                   <Badge variant="secondary" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 text-[7px] md:text-[8px] italic">{cat.count}</Badge>
                </div>
              ))}
           </div>
        </div>

        {/* Role Registry Table */}
        <Card className="lg:col-span-2 p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium overflow-hidden">
           <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
              <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Access Registry</h3>
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Identity Systemty Logs</p>
              </div>
              <div className="relative group w-full md:w-64">
                 <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="SEARCH ROLES..." 
                   className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" 
                 />
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              </div>
           </div>
            <div className="hidden lg:block">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Role Identity</TableHead>
                        <TableHead>Systemty Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Governance</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-primary"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell>
                        </TableRow>
                     ) : filteredRoles.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-[10px] font-black text-text-secondary uppercase tracking-widest">No roles found in registry.</TableCell>
                        </TableRow>
                     ) : filteredRoles.map((role) => (
                        <TableRow key={role.id}>
                           <TableCell>
                              <div className="space-y-1">
                                 <p className="font-bold text-[var(--foreground)] text-sm">{role.name}</p>
                                 <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {role.id}</p>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[8px] tracking-widest">
                                 {role.level}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge variant={role.status === "IMMUTABLE" ? "default" : role.status === "ACTIVE" ? "success" : "danger"}>
                                 {role.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => openEditModal(role)} className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all">
                                    <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDelete(role.id, role.name)} className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
                                    <Trash2 className="w-4 h-4" />
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
               {filteredRoles.map((role) => (
                  <div key={role.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <p className="font-bold text-[var(--foreground)] text-sm">{role.name}</p>
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {role.id}</p>
                        </div>
                        <Badge variant={role.status === "IMMUTABLE" ? "default" : role.status === "ACTIVE" ? "success" : "danger"}>
                           {role.status}
                        </Badge>
                     </div>
                     <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Systemty Level</p>
                           <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] tracking-widest px-1 py-0.5">
                              {role.level}
                           </Badge>
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => openEditModal(role)} className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all">
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(role.id, role.name)} className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
        </Card>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <Card className="w-full max-w-md p-6 bg-bg-primary border-[var(--foreground)]/10 shadow-premium relative space-y-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-[var(--foreground)] rounded-full hover:bg-[var(--foreground)]/5 transition-all"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" /> {editingRole ? "Reconfigure Identity" : "Commission New Role"}
                 </h3>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Modify global permission vectors</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Role Nomenclature</label>
                    <Input 
                      value={formData.name || ""} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Financial Auditor"
                      className="h-12 bg-bg-secondary border-[var(--foreground)]/10 font-bold" 
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Systemty Level</label>
                    <select 
                      value={formData.level || ""} 
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full h-12 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[12px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                    >
                       <option value="LEVEL 1 (BASIC)">LEVEL 1 (BASIC)</option>
                       <option value="LEVEL 3 (BROADCAST)">LEVEL 3 (BROADCAST)</option>
                       <option value="LEVEL 5 (SETTLEMENT)">LEVEL 5 (SETTLEMENT)</option>
                       <option value="LEVEL 7 (GOVERNANCE)">LEVEL 7 (GOVERNANCE)</option>
                       <option value="LEVEL 10 (TOTAL)">LEVEL 10 (TOTAL)</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={formData.status || ""} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full h-12 bg-bg-secondary border border-[var(--foreground)]/10 rounded-[12px] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all"
                    >
                       <option value="ACTIVE">ACTIVE</option>
                       <option value="INACTIVE">INACTIVE</option>
                       <option value="IMMUTABLE">IMMUTABLE</option>
                    </select>
                 </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="text-[10px] font-black tracking-widest uppercase">CANCEL</Button>
                 <Button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   variant="primary" 
                   className="text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2"
                 >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} COMMIT DIRECTIVE
                 </Button>
              </div>
           </Card>
        </div>
      )}

    </div>
  );
}

// Sub-components for better organization
function Crown(props: any) {
  return <Shield {...props} className={props.className + " text-warning"} />
}

function Store(props: any) {
  return <Shield {...props} className={props.className + " text-primary"} />
}
