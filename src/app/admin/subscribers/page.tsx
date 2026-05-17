"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  Download,
  ArrowLeft,
  Loader2,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [searchQuery, setSearchQuery] = React.useState(""
  );
  const { toast } = useToast(
  );
  const router = useRouter(
  );

  const fetchSubscribers = async () => {
    setIsLoading(true
  );
    try {
      const res = await fetch('/api/newsletter/subscribers'
  );
      const data = await res.json(
  );
      setSubscribers(Array.isArray(data) ? data : []
  );
    } catch (err) {
      toast("Subscribers Registry Sync Failure", "error"
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Decommission this subscriber node?")) return;
    try {
      const res = await fetch(`/api/newsletter/subscribers?id=${id}`, { method: 'DELETE' }
  );
      if (res.ok) {
        toast("Subscriber Node Decommissioned", "success"
  );
        fetchSubscribers(
  );
      }
    } catch (err) {
      toast("Decommissioning Failure", "error"
  );
    }
  };

  const handleToggleStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      }
  );
      if (res.ok) {
        toast(`Node status recalibrated`, "success"
  );
        fetchSubscribers(
  );
      }
    } catch (err) {
      toast("Status Recalibration Failure", "error"
  );
    }
  };

  React.useEffect(() => {
    fetchSubscribers(
  );
  }, []
  );

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  
  );

  return (

    <div className="space-y-2 md:space-y-10 pt-2 md:pt-10 pb-10 px-2 md:px-10 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="ghost" className="p-1.5 md:p-2 bg-[var(--foreground)]/5 rounded-lg md:rounded-xl hover:bg-[var(--foreground)]/10">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-lg md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter leading-none">Fleet Registry</h2>
            <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] italic">Subscribed Nodes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 md:h-10 border-primary/20 text-primary gap-1 md:gap-2 text-[7px] md:text-[9px] font-black uppercase italic shadow-glow-purple/5">
            <Download className="w-3 h-3 md:w-4 md:h-4" /> EXPORT
          </Button>
          <Button className="h-8 md:h-10 bg-primary text-[var(--foreground)] gap-1 md:gap-2 text-[7px] md:text-[9px] font-black uppercase italic shadow-glow-purple">
            <Mail className="w-3 h-3 md:w-4 md:h-4" /> BROADCAST
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
        <Card className="p-3 md:p-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-xl md:rounded-[40px] flex items-center gap-4 md:gap-6 group shadow-premium">
           <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
              <Users className="w-5 h-5 md:w-8 md:h-8" />
           </div>
           <div>
              <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Total Citizens</p>
              <h3 className="text-xl md:text-4xl font-black text-[var(--foreground)] italic tracking-tighter">{subscribers.length}</h3>
           </div>
        </Card>
        
        <Card className="md:col-span-2 p-1 md:p-4 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-xl md:rounded-[40px] flex items-center px-4 md:px-8 shadow-premium">
           <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communication nodes..." 
                className="w-full h-10 md:h-16 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-lg md:rounded-2xl pl-10 text-[10px] md:text-sm italic text-[var(--foreground)] placeholder:text-text-secondary/40 focus:border-primary/50 transition-all"
              />
           </div>
        </Card>
      </div>

      <Card className="rounded-xl md:rounded-[40px] overflow-hidden bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium">
        <div className="p-3 md:p-10 border-b border-[var(--foreground)]/5 flex items-center justify-between bg-[var(--foreground)]/5">
           <h3 className="text-[10px] md:text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2 md:gap-3">
              <Mail className="w-4 h-4 text-primary" /> Active Signal Nodes
           </h3>
           <Badge className="bg-primary/20 text-primary border-primary/20 text-[6px] md:text-[10px] font-black px-2 md:px-4 py-0.5 md:py-1 italic uppercase tracking-widest">
              LIVE REGISTRY
           </Badge>
        </div>

        {isLoading ? (
          <div className="p-10 md:p-20 flex flex-col items-center justify-center space-y-2 md:space-y-4">
             <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-primary animate-spin" />
             <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary animate-pulse italic">Hydrating Fleet Registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5 bg-[var(--foreground)]/5">
                  <TableHead className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary py-3 md:py-6 pl-4 md:pl-10">Email Node</TableHead>
                  <TableHead className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Commissioned</TableHead>
                  <TableHead className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Signal</TableHead>
                  <TableHead className="text-right text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-10">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((sub, i) => (
                  <TableRow key={sub.id} className="border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all group/row">
                    <TableCell className="py-3 md:py-6 pl-4 md:pl-10">
                      <div className="flex items-center gap-2 md:gap-3">
                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center text-text-secondary group-hover/row:text-primary transition-all">
                            <Mail className="w-3 h-3 md:w-4 md:h-4" />
                         </div>
                         <span className="font-black text-[var(--foreground)] italic tracking-tighter text-[10px] md:text-base group-hover/row:text-primary transition-colors">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-[8px] md:text-xs font-black text-text-secondary italic">
                         <Calendar className="w-3 h-3 opacity-40" />
                         {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[5px] md:text-[8px] font-black italic uppercase tracking-widest", sub.status === 'ACTIVE' ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20")}>
                         {sub.status || 'ACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4 md:pr-10">
                      <div className="flex justify-end gap-1.5 md:gap-2">
                        <button 
                          onClick={() => handleToggleStatus(sub.id, sub.status || 'ACTIVE')}
                          className="p-1.5 md:p-2.5 bg-[var(--foreground)]/5 rounded-lg md:rounded-xl text-text-secondary hover:text-warning transition-all shadow-glow-purple/5"
                          title="Toggle Status"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 md:p-2.5 bg-[var(--foreground)]/5 rounded-lg md:rounded-xl text-text-secondary hover:bg-danger hover:text-[var(--foreground)] transition-all shadow-glow-purple/5"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredSubscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <div className="space-y-4">
                       <div className="text-6xl grayscale opacity-10">🚢</div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">No signal nodes detected in this sector.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>
    </div>
  
  );
}
