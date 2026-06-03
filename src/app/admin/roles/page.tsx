"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Lock, 
  Users, 
  Eye, 
  Edit3, 
  Trash2,
  ChevronRight,
  Shield
} from "lucide-react";

const ROLE_REGISTRY = [
  { id: "ROLE-001", name: "System Admiral", users: 4, level: "LEVEL 10 (TOTAL)", status: "IMMUTABLE" },
  { id: "ROLE-002", name: "Marketplace Overseer", users: 12, level: "LEVEL 7 (GOVERNANCE)", status: "ACTIVE" },
  { id: "ROLE-003", name: "Financial Auditor", users: 6, level: "LEVEL 5 (SETTLEMENT)", status: "ACTIVE" },
  { id: "ROLE-004", name: "Content Custodian", users: 18, level: "LEVEL 3 (BROADCAST)", status: "ACTIVE" },
];

export default function AdminRolesPage() {
  return (

    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Authority Sovereignty</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Administrative Roles & Global Platform Permissions</p>
        </div>
        <Button variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
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
                     Platform sovereignty is currently divided across <span className="text-[var(--foreground)]">42</span> permission nodes. System integrity: <span className="text-success shadow-glow-purple">UNCOMPROMISED</span>.
                  </p>
               </div>
               <Button variant="outline" size="sm" className="w-full h-8 text-[8px] font-black uppercase tracking-widest italic rounded-lg">AUDIT GLOBAL KEYS</Button>
            </Card>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2">Role Categories</h4>
              {[
                { label: "Administrative Elite", count: 4, icon: <Crown className="w-3.5 h-3.5" /> },
                { label: "Merchant Governance", count: 12, icon: <Store className="w-3.5 h-3.5" /> },
                { label: "Support Fleet", count: 24, icon: <Users className="w-3.5 h-3.5" /> },
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
                 <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Identity Sovereignty Logs</p>
              </div>
              <div className="relative group w-full md:w-64">
                 <Input placeholder="SEARCH ROLES..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              </div>
           </div>
            <div className="hidden lg:block">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Role Identity</TableHead>
                        <TableHead>Active Users</TableHead>
                        <TableHead>Sovereignty Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Governance</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {ROLE_REGISTRY.map((role) => (
                        <TableRow key={role.id}>
                           <TableCell>
                              <div className="space-y-1">
                                 <p className="font-bold text-[var(--foreground)] text-sm">{role.name}</p>
                                 <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {role.id}</p>
                              </div>
                           </TableCell>
                           <TableCell className="font-black text-[var(--foreground)]">{role.users}</TableCell>
                           <TableCell>
                              <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[8px] tracking-widest">
                                 {role.level}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge variant={role.status === "IMMUTABLE" ? "default" : "success"}>
                                 {role.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                                    <Eye className="w-4 h-4" />
                                 </button>
                                 <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all">
                                    <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
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
               {ROLE_REGISTRY.map((role) => (
                  <div key={role.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <p className="font-bold text-[var(--foreground)] text-sm">{role.name}</p>
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ID: {role.id}</p>
                        </div>
                        <Badge variant={role.status === "IMMUTABLE" ? "default" : "success"}>
                           {role.status}
                        </Badge>
                     </div>
                     <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Users</p>
                           <p className="font-black text-[var(--foreground)] text-xs">{role.users}</p>
                        </div>
                        <div className="space-y-0">
                           <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Sovereignty Level</p>
                           <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] tracking-widest px-1 py-0.5">
                              {role.level}
                           </Badge>
                        </div>
                        <div className="flex gap-1">
                           <button className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                              <Eye className="w-4 h-4" />
                           </button>
                           <button className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all">
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button className="p-2 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
        </Card>
      </div>

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
