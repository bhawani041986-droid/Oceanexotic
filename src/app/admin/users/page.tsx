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
  User,
  Check,
  X
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
  const [activeTab, setActiveTab] = React.useState<"ALL" | "AGENT" | "PENDING">("ALL");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/get_users");
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

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/update_user_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        toast(`User status successfully updated to ${data.db_status}`, "success");
        fetchUsers();
      } else {
        toast(data.message || "Failed to update user status", "error");
      }
    } catch (err) {
      console.error("Status Update Failure:", err);
      toast("Status Update Failure", "error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to terminate/delete the user registry for "${userName}" (${userId})? This will also wipe dependent data.`)) {
      return;
    }
    
    try {
      const res = await fetch("/api/admin/delete_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        toast("Citizen node deleted from fleet registry.", "success");
        fetchUsers();
      } else {
        toast(data.message || "Failed to delete user registry", "error");
      }
    } catch (err) {
      console.error("Deletion Failure:", err);
      toast("Deletion Failure", "error");
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by tab status/role
    if (activeTab === "AGENT" && user.role !== "AGENT") return false;
    if (activeTab === "PENDING" && user.status !== "PENDING") return false;

    // Filter by search query
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (

    <>
      <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-0 animate-fade-in">
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
          <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
             <div className="space-y-0.5 md:space-y-1">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Macro-Identity Ledger</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Authorized Access Nodes and Reputation Ranks</p>
             </div>
             <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setActiveTab("ALL")}
                  className={cn(
                    "px-4 h-10 text-[9px] font-black tracking-widest uppercase rounded-lg border transition-all italic",
                    activeTab === "ALL" 
                      ? "bg-primary/10 border-primary/45 text-primary shadow-glow-purple" 
                      : "bg-transparent border-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)]"
                  )}
                >
                  ALL CITIZENS
                </button>
                <button 
                  onClick={() => setActiveTab("AGENT")}
                  className={cn(
                    "px-4 h-10 text-[9px] font-black tracking-widest uppercase rounded-lg border transition-all italic",
                    activeTab === "AGENT" 
                      ? "bg-primary/10 border-primary/45 text-primary shadow-glow-purple" 
                      : "bg-transparent border-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)]"
                  )}
                >
                  DELIVERY AGENTS
                </button>
                <button 
                  onClick={() => setActiveTab("PENDING")}
                  className={cn(
                    "px-4 h-10 text-[9px] font-black tracking-widest uppercase rounded-lg border transition-all italic relative",
                    activeTab === "PENDING" 
                      ? "bg-primary/10 border-primary/45 text-primary shadow-glow-purple" 
                      : "bg-transparent border-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)]"
                  )}
                >
                  PENDING APPROVALS
                  {users.filter(u => u.status === 'PENDING').length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-danger text-[8px] font-black text-[var(--foreground)] flex items-center justify-center animate-pulse">
                      {users.filter(u => u.status === 'PENDING').length}
                    </span>
                  )}
                </button>
             </div>
          </div>
          
          <div className="hidden lg:block overflow-x-auto">
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
                        <div className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[16px] border border-[var(--foreground)]/10 flex items-center justify-center text-primary group-hover/row:bg-primary group-hover/row:text-[var(--foreground)] transition-all shadow-glow-purple/5 overflow-hidden",
                          user.avatar_url ? "bg-transparent p-0" : "bg-[var(--foreground)]/5"
                        )}>
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover group-hover/row:scale-110 transition-transform duration-300" />
                          ) : (
                            <User className="w-4 md:w-5 h-4 md:h-5" />
                          )}
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
                        {user.status === "PENDING" && (
                          <>
                            <button 
                              title="Approve User"
                              onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                              className="p-2 md:p-2.5 rounded-lg hover:bg-success/15 text-success border border-success/20 hover:border-success/40 transition-all shadow-glow-success"
                            >
                              <Check className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button 
                              title="Suspend User"
                              onClick={() => handleUpdateStatus(user.id, "INACTIVE")}
                              className="p-2 md:p-2.5 rounded-lg hover:bg-danger/15 text-danger border border-danger/20 hover:border-danger/40 transition-all"
                            >
                              <X className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                          </>
                        )}
                        {(user.status === "ACTIVE" || user.status === "VERIFIED") && (
                          <button 
                            title="Suspend User"
                            onClick={() => handleUpdateStatus(user.id, "INACTIVE")}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-danger/15 text-text-secondary hover:text-danger border border-[var(--foreground)]/5 hover:border-danger/20 transition-all"
                          >
                            <ShieldAlert className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                        )}
                        {(user.status === "INACTIVE" || user.status === "SUSPENDED") && (
                          <button 
                            title="Activate User"
                            onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                            className="p-2 md:p-2.5 rounded-lg hover:bg-success/15 text-text-secondary hover:text-success border border-[var(--foreground)]/5 hover:border-success/20 transition-all"
                          >
                            <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                        )}
                        <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5" onClick={() => toast("Broadcasting secure signal to " + user.id, "info")}>
                           <Mail className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </button>
                        <Link href={`/admin/users/edit/${user.id}`}>
                          <button title="Edit" className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                            <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                        </Link>
                        <button 
                          title="Delete User"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 md:p-2.5 rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5 hover:border-danger/20"
                        >
                          <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
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

          {/* Mobile view cards - visible only on lg screens and below */}
          <div className="lg:hidden space-y-4 p-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="p-4 rounded-xl bg-bg-card/40 border border-[var(--foreground)]/5 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg border border-[var(--foreground)]/10 flex items-center justify-center text-primary overflow-hidden",
                      user.avatar_url ? "bg-transparent p-0" : "bg-[var(--foreground)]/5"
                    )}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic">{user.name}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={
                    user.status === "VERIFIED" || user.status === "ACTIVE" ? "success" : 
                    user.status === "SUSPENDED" ? "danger" : "warning"
                  } className="uppercase text-[8px] italic px-2">
                    {user.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                  <div className="space-y-0.5">
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Reputation Rank</p>
                    <Badge variant="glass" className={cn(
                      "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[7px] font-black tracking-[0.2em] italic uppercase",
                      user.role === 'AGENT' ? "text-primary border-primary/20 bg-primary/5" : "text-text-secondary"
                    )}>
                      {user.role === 'AGENT' ? 'DELIVERY AGENT' : user.rank}
                    </Badge>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Trades Completed</p>
                    <p className="font-black text-[var(--foreground)] text-xs italic tracking-tighter">{user.orders} TRADES</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-3">
                  <div>
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Registered On</p>
                    <p className="text-[10px] font-black text-text-secondary uppercase italic opacity-60">{user.joined}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {user.status === "PENDING" && (
                      <>
                        <button 
                          title="Approve User"
                          onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                          className="p-2 rounded-lg hover:bg-success/15 text-success border border-success/20 hover:border-success/40 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          title="Suspend User"
                          onClick={() => handleUpdateStatus(user.id, "INACTIVE")}
                          className="p-2 rounded-lg hover:bg-danger/15 text-danger border border-danger/20 hover:border-danger/40 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {(user.status === "ACTIVE" || user.status === "VERIFIED") && (
                      <button 
                        title="Suspend User"
                        onClick={() => handleUpdateStatus(user.id, "INACTIVE")}
                        className="p-2 rounded-lg hover:bg-danger/15 text-text-secondary hover:text-danger border border-[var(--foreground)]/5 hover:border-danger/20 transition-all"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(user.status === "INACTIVE" || user.status === "SUSPENDED") && (
                      <button 
                        title="Activate User"
                        onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                        className="p-2 rounded-lg hover:bg-success/15 text-text-secondary hover:text-success border border-[var(--foreground)]/5 hover:border-success/20 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      title="Send Mail"
                      className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5" 
                      onClick={() => toast("Broadcasting secure signal to " + user.id, "info")}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/admin/users/edit/${user.id}`}>
                      <button title="Edit" className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button 
                      title="Delete User"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5 hover:border-danger/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && !isLoading && (
              <div className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-text-secondary italic opacity-40">
                No nodes found in current registry
              </div>
            )}
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
