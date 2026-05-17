"use client";

import React from "react";
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
  Mail,
  History,
  Edit3,
  Trash2,
  Filter,
  User
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Live data will be fetched from the registry


export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/get_users.php");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (err) {
        console.error("Registry Sync Failure:", err);
        toast("Registry Sync Failure", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

    <>
      <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic text-primary">Citizen Registry</h2>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing the Identity Nodes of {users.length} Global Citizens</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
            <div className="relative group w-full md:w-80">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH IDENTITY REGISTRY..." 
                className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[9px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
              />
              <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Link href="/admin/users/add" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
                <UserPlus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION CITIZEN
              </Button>
            </Link>
          </div>
        </div>

        {/* Registry Table */}
        <Card className="p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5 overflow-hidden">
          <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
             <div className="space-y-0.5 md:space-y-1">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Macro-Identity Ledger</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Authorized Access Nodes and Reputation Ranks</p>
             </div>
             <Button variant="outline" size="sm" className="h-10 px-6 flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg italic">
                <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTERS
             </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Fleet Identity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Account Status</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Rank</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Order Volume</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Date</TableHead>
                  <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary group-hover/row:bg-primary group-hover/row:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                          <User className="w-4 md:w-5 h-4 md:h-5" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{user.name}</p>
                          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.status === "VERIFIED" || user.status === "ACTIVE" ? "success" : 
                        user.status === "SUSPENDED" ? "danger" : "warning"
                      } className="uppercase text-[8px] md:text-[10px] italic px-2">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant="glass" className={cn(
                         "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[7px] md:text-[8px] font-black tracking-[0.2em] italic uppercase",
                         user.role === 'AGENT' ? "text-primary border-primary/20 bg-primary/5" : "text-text-secondary"
                       )}>
                         {user.role === 'AGENT' ? 'DELIVERY AGENT' : user.rank}
                       </Badge>
                    </TableCell>
                    <TableCell className="font-black text-[var(--foreground)] italic text-[10px] md:text-xs tracking-tighter">{user.orders} TRADES</TableCell>
                    <TableCell className="text-[10px] md:text-xs font-black text-text-secondary uppercase italic opacity-40">{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 md:gap-2">
                        <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5" onClick={() => toast("Broadcasting secure signal to " + user.id, "info")}>
                          <Mail className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                        <Link href={`/admin/users/edit/${user.id}`}>
                          <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                            <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                        </Link>
                        <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5" onClick={() => toast("Account flagged for mandatory audit: " + user.id, "warning")}>
                          <ShieldAlert className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                        <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                          <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase tracking-widest text-text-secondary italic opacity-40">No nodes found in current registry</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination Handshake */}
        <div className="flex items-center justify-between pt-6 md:pt-10">
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Global Citizen Statistics: {users.length} Total Nodes Syncing</p>
          <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-1.5 rounded-lg md:rounded-[18px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-premium">
             <Button variant="primary" size="sm" className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-[12px] p-0 text-[10px] md:text-[11px] font-black shadow-glow-purple italic">1</Button>
             <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-[12px] p-0 text-[10px] md:text-[11px] font-black opacity-40 hover:opacity-100 transition-all italic">2</Button>
             <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-[12px] p-0 text-[10px] md:text-[11px] font-black opacity-40 hover:opacity-100 transition-all italic">3</Button>
          </div>
        </div>
      </div>
    </>
  
  );
}
