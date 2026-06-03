"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { 
  Truck, 
  Package, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Download,
  AlertCircle,
  Boxes,
  FileText,
  Share2,
  Zap,
  User,
  Phone,
  Navigation,
  Search,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function SellerOrdersPage() {
  const router = useRouter(
  );
  const { toast } = useToast(
  );
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [agentRegistry, setAgentRegistry] = React.useState<any[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  }, [filteredOrders, itemsPerPage]);

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Logistics Form State
  const [logisticsForm, setLogisticsForm] = React.useState({
    status: "SHIPPED",
    delivery_agent_name: "",
    delivery_agent_phone: "",
    shipping_method: "EXPRESS-BOAT",
    tracking_number: "",
    estimated_delivery: "2-4 Hours"
  }
  );

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/seller/orders.php"
  );
      if (res.ok) {
        const data = await res.json(
  );
        setOrders(data
  );
      }
    } catch (error) {
      toast("Fleet Connection Failed", "error"
  );
    } finally {
      setLoading(false
  );
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agent/list.php"
  );
      if (res.ok) {
        const data = await res.json(
  );
        setAgentRegistry(data
  );
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    fetchOrders(
  );
    fetchAgents(
  );
  }, []
  );

  const handleOpenDispatch = (order: any) => {
    setSelectedOrder(order
  );
    setLogisticsForm({
      status: "SHIPPED",
      delivery_agent_name: order.delivery_agent_name || "",
      delivery_agent_phone: order.delivery_agent_phone || "",
      shipping_method: order.shipping_method || "EXPRESS-BOAT",
      tracking_number: order.tracking_number || `TRK-${Math.floor(Math.random() * 100000)}`,
      estimated_delivery: order.estimated_delivery || "2-4 Hours"
    }
  );
    setIsModalOpen(true
  );
  };

  // When agent selected from dropdown, auto-fill their phone
  const handleAgentSelect = (agentId: string) => {
    const agent = agentRegistry.find(a => a.id === agentId
  );
    setLogisticsForm({
      ...logisticsForm,
      delivery_agent_name: agentId,
      delivery_agent_phone: agent?.phone || ""
    }
  );
  };

  const handleSubmitLogistics = async (e: React.FormEvent) => {
    e.preventDefault(
  );
    setIsUpdating(true
  );
    try {
      const res = await fetch("/api/seller/orders.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          ...logisticsForm
        })
      }
  );
      
      if (res.ok) {
        toast(`MISSION SUCCESS: Logistics synchronized for ${selectedOrder.id}`, "success"
  );
        setIsModalOpen(false
  );
        fetchOrders(
  );
      } else {
        toast("Handshake Failed", "error"
  );
      }
    } catch (error) {
      toast("Network Drift Detected", "error"
  );
    } finally {
      setIsUpdating(false
  );
    }
  };


  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-32 md:pb-10 px-0 animate-fade-in" style={{ color: 'var(--agent-text)' }}>
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[15px] lg:gap-6 border-b border-[var(--foreground)]/5 pb-6 lg:pb-10">
        <div className="space-y-1 text-center lg:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5 flex items-center justify-center lg:justify-start gap-2">
            <Package className="w-5 h-5 md:w-7 md:h-7 text-primary shadow-glow-purple/20 animate-pulse" /> Fleet Commissions
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing {filteredOrders.length} Active Fulfillment Lines in Sovereignty</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-[10px] lg:gap-6 w-full lg:w-auto">
          {/* Probe Search */}
          <div className="relative w-full sm:w-72 group">
            <Input 
              placeholder="PROBE SEARCH..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest italic" 
            />
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-[6px] md:gap-4 w-full sm:w-auto">
            {/* Status Dropdown */}
            <div className="flex items-center bg-[var(--foreground)]/5 p-1 border border-[var(--foreground)]/5 rounded-lg md:rounded-xl flex-1 sm:flex-initial">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-[8px] md:text-[10px] font-black uppercase tracking-widest italic outline-none pl-3 pr-8 appearance-none cursor-pointer text-[var(--foreground)]"
                style={{ backgroundColor: 'transparent' }}
              >
                <option value="ALL" className="bg-bg-secondary text-[var(--foreground)]">ALL STATUS</option>
                <option value="PENDING" className="bg-bg-secondary text-[var(--foreground)]">PENDING</option>
                <option value="SHIPPED" className="bg-bg-secondary text-[var(--foreground)]">SHIPPED</option>
                <option value="DELIVERED" className="bg-bg-secondary text-[var(--foreground)]">DELIVERED</option>
              </select>
              <div className="pointer-events-none -ml-6 mr-3">
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary opacity-60" />
              </div>
            </div>

            <Button onClick={fetchOrders} variant="outline" className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-lg md:rounded-xl border-[var(--foreground)]/5 bg-[var(--foreground)]/5 flex items-center justify-center shrink-0">
               <RefreshCw className={cn("w-3.5 h-3.5 text-primary", loading && "animate-spin")} />
            </Button>

            <Button variant="outline" className="flex-1 sm:flex-none h-10 md:h-12 px-4 md:px-6 text-[8px] md:text-[10px] font-black tracking-widest uppercase rounded-lg md:rounded-xl border-[var(--foreground)]/5 bg-[var(--foreground)]/5 flex items-center justify-center gap-2 italic">
              <Download className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> <span className="hidden sm:inline">EXPORT</span>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-20 text-[var(--foreground)] italic font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing with Trade Registry...</div>
      ) : (
        <>
          {/* Mobile: Order Cards */}
          <div className="space-y-[10px] lg:hidden p-4">
            {paginatedOrders.length === 0 ? (
              <div className="text-center py-10 text-[var(--foreground)] italic font-black uppercase tracking-widest text-[10px] opacity-40 bg-bg-secondary/10 rounded-[20px] border border-[var(--foreground)]/5">
                No Active Orders Found
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <Card key={order.id} className="p-[8px] space-y-2 rounded-[20px] bg-bg-secondary/20 shadow-glow-purple/5 border-[var(--foreground)]/5">
                  <div className="flex items-center justify-between px-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-[var(--foreground)] text-[10px] uppercase tracking-tighter italic">{order.id}</p>
                        {order.is_pre_order === 1 && (
                          <span className="px-1 py-0.2 rounded-[4px] bg-amber-500/20 text-amber-500 text-[6px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-2 h-2 text-text-secondary opacity-40" />
                        <p className="text-[6px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{order.created_at}</p>
                      </div>
                    </div>
                    <Badge variant={
                      order.status === "DELIVERED" ? "glass" : 
                      order.status === "SHIPPED" ? "success" : 
                      order.status === "PENDING" ? "danger" : "secondary"
                    } className="h-4 text-[6px] px-1.5 shadow-glow-purple/10 italic uppercase">
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="p-2.5 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0">
                        <span className="text-[6px] font-black text-text-secondary uppercase tracking-[0.2em] italic opacity-40">Customer Node</span>
                        <p className="text-[9px] font-black text-[var(--foreground)] uppercase italic tracking-tighter">{order.customer_name}</p>
                      </div>
                      <div className="text-right space-y-0">
                         <span className="text-[6px] font-black text-text-secondary uppercase tracking-[0.2em] italic opacity-40">Settlement</span>
                         <p className="text-[9px] font-black text-primary italic tracking-tighter">₹{order.total_amount}</p>
                      </div>
                    </div>

                    {order.status === "PENDING" && (
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-danger/10 border border-danger/10 text-danger animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[7px] font-black uppercase tracking-widest italic">Urgent Fulfillment Required</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-[4px] pt-0.5">
                    <Button 
                      onClick={() => handleOpenDispatch(order)}
                      variant="primary" 
                      className="flex-1 h-9 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg shadow-glow-purple gap-2 bg-success border-none italic"
                    >
                      <Zap className="w-3 h-3" /> {order.status === 'PENDING' ? 'DISPATCH' : 'UPDATE'}
                    </Button>
                    <Button 
                      onClick={() => router.push(`/seller/orders/${order.id}/voucher`)}
                      variant="outline" 
                      className="h-9 px-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg border-[var(--foreground)]/5 gap-2 italic"
                    >
                      <FileText className="w-3 h-3 text-primary" /> VOUCHER
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Desktop: Orders Table */}
          <Card className="hidden lg:block p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 border-[var(--foreground)]/5 shadow-premium">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5 hover:bg-transparent">
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40 pl-8">Fleet Order ID</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Customer Node</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Commission Total</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Logistics Status</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Delivery Agent</TableHead>
                  <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40 pr-8">Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-[10px] font-black uppercase tracking-widest opacity-40 italic text-text-secondary">
                      No Active Orders Found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="group border-[var(--foreground)]/5 hover:bg-white/[0.02] transition-all h-14 md:h-16">
                      <TableCell className="pl-8">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{order.id}</p>
                            {order.is_pre_order === 1 && (
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-2.5 h-2.5 text-text-secondary opacity-40" />
                            <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{order.created_at}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-40 uppercase tracking-widest">{order.customer_name}</p>
                      </TableCell>
                      <TableCell className="font-black text-[var(--foreground)] text-xs md:text-sm italic tracking-tighter">₹{order.total_amount}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "DELIVERED" ? "glass" : 
                          order.status === "SHIPPED" ? "success" : 
                          order.status === "PENDING" ? "danger" : "secondary"
                        } className="shadow-glow-purple/10 text-[8px] md:text-[9px] italic uppercase px-2">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         {order.delivery_agent_name ? (
                           <div className="space-y-0.5">
                             <p className="text-[10px] font-black text-[var(--foreground)] uppercase italic">{order.delivery_agent_name}</p>
                             <p className="text-[8px] font-bold text-primary opacity-60">{order.tracking_number}</p>
                           </div>
                         ) : (
                           <p className="text-[8px] font-black text-text-secondary italic opacity-30">UNASSIGNED</p>
                         )}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2 md:gap-3">
                          <Button 
                            onClick={() => handleOpenDispatch(order)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 md:h-10 px-3 md:px-5 text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all gap-1.5 md:gap-2 italic rounded-lg"
                          >
                            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" /> {order.status === 'PENDING' ? 'DISPATCH' : 'UPDATE'}
                          </Button>
                          <Button 
                            onClick={() => router.push(`/seller/orders/${order.id}/voucher`)}
                            variant="primary" 
                            size="sm" 
                            className="h-8 md:h-10 px-3 md:px-5 text-[8px] md:text-[9px] font-black tracking-widest shadow-glow-purple transition-all rounded-lg gap-1.5 md:gap-2 italic"
                          >
                            <FileText className="w-3.5 h-3.5" /> VOUCHER
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination Footer (Dynamic) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-6 pt-4 border-t border-[var(--foreground)]/5">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed text-center sm:text-left opacity-40 italic">
               Page {currentPage} of {totalPages} • {filteredOrders.length} Order Nodes
            </p>
            <div className="flex items-center gap-2 p-1 rounded-xl md:rounded-[20px] border shadow-premium bg-bg-secondary/40" style={{ borderColor: 'var(--agent-border)' }}>
               <Button 
                variant="ghost" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full p-0 disabled:opacity-20 text-[var(--foreground)]"
               >
                  <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
               </Button>

               {Array.from({ length: totalPages }).map((_, i) => (
                 <Button 
                   key={i} 
                   onClick={() => setCurrentPage(i + 1)}
                   className={cn(
                     "h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full text-[9px] md:text-[10px] font-black transition-all italic",
                     currentPage === i + 1 ? "text-[var(--foreground)] shadow-glow-purple" : "bg-transparent opacity-40 hover:bg-[var(--foreground)]/5 text-[var(--foreground)]"
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
                className="h-8 md:h-10 w-8 md:w-10 rounded-lg md:rounded-full p-0 disabled:opacity-20 text-[var(--foreground)]"
               >
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
               </Button>
            </div>
          </div>
        </>
      )}

      {/* Logistics Update Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`LOGISTICS HANDSHAKE: ${selectedOrder?.id}`}
        className="md:max-w-2xl bg-bg-secondary/95 border border-primary/20 text-[var(--foreground)] shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl rounded-t-[28px] md:rounded-[28px] p-5 md:p-8"
      >
        <form onSubmit={handleSubmitLogistics} className="space-y-6 p-1">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                 <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Assign Delivery Agent</label>
                 <select 
                   value={logisticsForm.delivery_agent_name}
                   onChange={(e) => handleAgentSelect(e.target.value)}
                   className="w-full h-12 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)] text-xs font-black px-4 uppercase italic cursor-pointer"
                   style={{ backgroundColor: '#0d0d1f' }}
                   required
                 >
                   <option value="" style={{ backgroundColor: '#0d0d1f', color: '#fff' }}>-- Select Agent --</option>
                   {agentRegistry.map(agent => (
                     <option key={agent.id} value={agent.id} style={{ backgroundColor: '#0d0d1f', color: '#fff' }}>
                       {agent.id} — {agent.name} ({agent.zone})
                     </option>
                   ))}
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Agent Phone (auto-filled)</label>
                 <Input 
                   value={logisticsForm.delivery_agent_phone}
                   onChange={(e) => setLogisticsForm({...logisticsForm, delivery_agent_phone: e.target.value})}
                   placeholder="Auto-filled from Registry"
                   className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-xs font-black uppercase italic"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Shipping Method</label>
                 <select 
                   value={logisticsForm.shipping_method}
                   onChange={(e) => setLogisticsForm({...logisticsForm, shipping_method: e.target.value})}
                   className="w-full h-12 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)] text-xs font-black px-4 uppercase italic cursor-pointer"
                   style={{ backgroundColor: '#0d0d1f' }}
                 >
                    <option value="STANDARD" style={{ backgroundColor: '#0d0d1f', color: '#fff' }}>STANDARD</option>
                    <option value="EXPRESS-BOAT" style={{ backgroundColor: '#0d0d1f', color: '#fff' }}>EXPRESS BOAT</option>
                    <option value="COLD-CHAIN-ELITE" style={{ backgroundColor: '#0d0d1f', color: '#fff' }}>COLD-CHAIN ELITE</option>
                 </select>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Tracking ID</label>
                 <Input 
                   value={logisticsForm.tracking_number}
                   onChange={(e) => setLogisticsForm({...logisticsForm, tracking_number: e.target.value})}
                   placeholder="TRK-XXXXXX"
                   className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-xs font-black uppercase italic"
                 />
              </div>
           </div>

           <div className="pt-4 flex gap-3">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 h-12 shadow-glow-purple italic font-black uppercase tracking-widest"
                disabled={isUpdating}
              >
                {isUpdating ? "SYNCHRONIZING..." : "INITIALIZE DISPATCH"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="h-12 px-6 border-[var(--foreground)]/5 italic font-black uppercase tracking-widest"
              >
                ABORT
              </Button>
           </div>
        </form>
      </Modal>
      
      {/* Cold Chain Reminder */}
      <Card className="p-[10px] md:p-6 bg-primary/5 border border-dashed border-primary/20 flex flex-col md:flex-row items-center gap-[10px] md:gap-8 rounded-[24px] md:rounded-[40px] shadow-glow-purple/5">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-glow-purple/20">
          <Truck className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div className="space-y-1 md:space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
             <Boxes className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shadow-glow-purple/20" />
             <p className="text-[10px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Active Cold-Chain Protocol Required</p>
          </div>
          <p className="text-[8px] md:text-[10px] text-text-secondary font-black italic leading-relaxed max-w-3xl opacity-60 uppercase tracking-tight">
            All "Pending" orders must be initiated into the logistics flow within 4 hours to maintain peak saku freshness guarantees. Failure to synchronize within temporal limits may degrade fleet integrity ranking.
          </p>
        </div>
      </Card>
    </div>
  
  );
}
