"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  TrendingUp, 
  Package, 
  Users, 
  Activity,
  ArrowUpRight,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Clock,
  FileText,
  Share2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { useToast } from "@/components/ui/Toast";

export default function SellerDashboardPage() {
  const [stats, setStats] = React.useState<any[]>([]
  );
  const [orders, setOrders] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [error, setError] = React.useState(false
  );
  const { toast } = useToast(
  );
  const router = useRouter(
  );

  const fetchDashboardData = async () => {
    setIsLoading(true
  );
    setError(false
  );
    try {
      const [statsData, ordersData] = await Promise.all([
        orderService.getSellerStats(),
        orderService.getSellerOrders()
      ]
  );

      const transformedStats = [
        { label: "Total Revenue", value: `₹${statsData.revenue.toLocaleString()}`, growth: `+${statsData.growth}%`, icon: <TrendingUp className="w-5 h-5" />, trend: "up" },
        { label: "Active Harvests", value: statsData.activeProducts, growth: `+${statsData.newProducts}`, icon: <Package className="w-5 h-5" />, trend: "up" },
        { label: "Global Reach", value: statsData.customers.toLocaleString(), growth: `+${statsData.customerGrowth}%`, icon: <Users className="w-5 h-5" />, trend: "up" },
        { label: "Fleet Perf.", value: `${statsData.performance}%`, growth: `${statsData.perfTrend > 0 ? '+' : ''}${statsData.perfTrend}%`, icon: <Activity className="w-5 h-5" />, trend: statsData.perfTrend >= 0 ? "up" : "down" },
      ];

      setStats(transformedStats
  );
      setOrders(ordersData.orders.slice(0, 5)
  );
    } catch (err) {
      console.error("Dashboard Signal Disruption:", err
  );
      setError(true
  );
      
      const mockStats = [
        { label: "Total Revenue", value: "₹4,26,500", growth: "+12.5%", icon: <TrendingUp className="w-5 h-5" />, trend: "up" },
        { label: "Active Harvests", value: "84", growth: "+4", icon: <Package className="w-5 h-5" />, trend: "up" },
        { label: "Global Reach", value: "1,240", growth: "+18%", icon: <Users className="w-5 h-5" />, trend: "up" },
        { label: "Fleet Perf.", value: "98.2%", growth: "-0.4%", icon: <Activity className="w-5 h-5" />, trend: "down" },
      ];
      const mockOrders = [
        { id: "ORD-9982", product: "Swaraj Dweep Reef Cod", customer: "Bhawani Singh", total: "₹12,800", status: "PENDING", date: "Just now" },
        { id: "ORD-9981", product: "Phoenix Bay Mud Crab", customer: "Port Blair Hub", total: "₹24,000", status: "PREPARING", date: "14m ago" },
        { id: "ORD-9980", product: "Neil Island Squids", customer: "Shaheed Dweep Port", total: "₹8,550", status: "SHIPPED", date: "2h ago" },
        { id: "ORD-9979", product: "Junglighat Sea Bass", customer: "South Andaman Hub", total: "₹12,000", status: "DELIVERED", date: "5h ago" },
      ];
      setStats(mockStats
  );
      setOrders(mockOrders
  );
    } finally {
      setIsLoading(false
  );
    }
  };

  React.useEffect(() => {
    fetchDashboardData(
  );
  }, []
  );

  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-24 md:pb-10 px-0 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[10px] md:gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-[10px] md:p-6 space-y-2 md:space-y-4 rounded-xl md:rounded-[24px]">
               <div className="flex items-center justify-between">
                  <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl" />
                  <Skeleton className="w-12 h-5 md:w-16 md:h-6 rounded-full" />
               </div>
               <div className="space-y-2">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-24 h-6 md:h-8" />
               </div>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label} className="p-[10px] md:p-6 space-y-2 md:space-y-4 group hover:border-primary/30 transition-all rounded-xl md:rounded-[32px] bg-bg-secondary/20 shadow-glow-purple/5">
              <div className="flex items-center justify-between">
                <div className="p-2 md:p-3 rounded-lg md:rounded-[12px] bg-bg-secondary/40 border border-border-primary text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-glow-purple/10">
                  {React.cloneElement(stat.icon as React.ReactElement, { className: "w-3.5 h-3.5 md:w-5 md:h-5" })}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[7px] md:text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 md:px-2 md:py-1 rounded-full italic",
                  stat.trend === "up" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                  {stat.trend === "up" ? <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3 rotate-90" />}
                  {stat.growth}
                </div>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] italic opacity-60">{stat.label}</p>
                <h3 className="text-base md:text-3xl font-black text-[var(--foreground)] leading-none italic tracking-tighter shadow-glow-purple/5">{stat.value}</h3>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[10px] md:gap-10">
        {/* Revenue Visualization */}
        <Card className="xl:col-span-2 p-[10px] md:p-6 space-y-6 md:space-y-8 rounded-[20px] md:rounded-[48px] bg-bg-secondary/10 border-[var(--foreground)]/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5 md:space-y-1">
              <h3 className="text-base md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Revenue Dynamics</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Global Settlement Analysis (Last 30 Days)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 md:flex-none h-8 px-4 text-[7px] md:text-[8px] font-black bg-bg-secondary/40 border border-border-primary rounded-lg italic">WEEKLY</Button>
              <Button variant="primary" size="sm" className="flex-1 md:flex-none h-8 px-4 text-[7px] md:text-[8px] font-black shadow-glow-purple rounded-lg italic">MONTHLY</Button>
            </div>
          </div>
          
          <div className="h-[180px] lg:h-[280px] flex items-end gap-1 lg:gap-3 px-1 lg:px-4 relative">
            {isLoading ? (
               <div className="absolute inset-0 flex items-end gap-1.5 lg:gap-3 px-1 lg:px-4">
                  {Array(12).fill(0).map((_, i) => (
                     <Skeleton key={i} className="flex-1 rounded-t-[6px] lg:rounded-t-[8px]" style={{ height: `${Math.random() * 60 + 20}%` }} />
                  ))}
               </div>
            ) : (
               [45, 60, 40, 75, 55, 90, 65, 80, 50, 70, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-1.5 lg:gap-3 group">
                   <div className="relative w-full">
                     <div 
                       style={{ height: `${h}%` }} 
                       className="w-full bg-bg-secondary/40 rounded-t-[4px] lg:rounded-t-[8px] group-hover:bg-primary/20 transition-all cursor-pointer relative border-x border-t border-border-primary/50"
                     >
                       <div 
                         style={{ height: `${h*0.7}%` }} 
                         className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/50 to-primary rounded-t-[4px] lg:rounded-t-[8px] opacity-0 group-hover:opacity-100 transition-all shadow-glow-purple"
                       />
                     </div>
                   </div>
                   <span className="text-[6px] lg:text-[7px] font-black text-text-secondary uppercase opacity-40 group-hover:opacity-100 italic">
                     {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                   </span>
                 </div>
               ))
            )}
            
            {/* Y-Axis Overlay */}
            <div className="absolute inset-y-0 left-0 hidden sm:flex flex-col justify-between text-[6px] lg:text-[7px] font-black text-text-secondary opacity-20 py-2 pointer-events-none uppercase tracking-widest italic">
              <span>₹100k</span>
              <span>₹75k</span>
              <span>₹50k</span>
              <span>₹25k</span>
              <span>₹0</span>
            </div>
          </div>
        </Card>

        {/* Performance Rankings */}
        <Card className="p-[10px] md:p-6 space-y-6 md:space-y-8 rounded-[20px] md:rounded-[40px] bg-bg-secondary/10 border-[var(--foreground)]/5">
          <div className="space-y-0.5 md:space-y-1">
            <h3 className="text-base md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Performance Rankings</h3>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Your Top Harvest Lines</p>
          </div>
          <div className="space-y-3 md:space-y-5">
            {isLoading ? (
               Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2 md:space-y-3">
                     <div className="flex justify-between">
                        <Skeleton className="w-20 md:w-24 h-4" />
                        <Skeleton className="w-10 md:w-12 h-3" />
                     </div>
                     <Skeleton className="w-full h-1.5 rounded-full" />
                  </div>
               ))
            ) : (
               [
                 { name: "Andaman Mud Crab", sales: "1,240kg", share: 85, color: "bg-primary" },
                 { name: "Swaraj Dweep Reef Cod", sales: "840kg", share: 65, color: "bg-ocean-blue" },
                 { name: "Neil Island Squids", sales: "620kg", share: 45, color: "bg-success" },
                 { name: "Port Blair Prawns", sales: "480kg", share: 30, color: "bg-warning" },
               ].map((p) => (
                 <div key={p.name} className="space-y-1 md:space-y-2.5">
                   <div className="flex justify-between items-end">
                     <p className="text-[9px] md:text-[11px] font-black text-[var(--foreground)] uppercase italic tracking-tighter">{p.name}</p>
                     <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{p.sales}</p>
                   </div>
                   <div className="h-1 md:h-1.5 w-full bg-bg-secondary/40 border border-border-primary/50 rounded-full overflow-hidden">
                     <div style={{ width: `${p.share}%` }} className={cn("h-full rounded-full transition-all duration-1000 shadow-glow", p.color)} />
                   </div>
                 </div>
               ))
            )}
          </div>
          <Button variant="outline" className="w-full h-9 md:h-11 text-[8px] md:text-[9px] font-black tracking-widest uppercase rounded-lg md:rounded-[16px] italic border-[var(--foreground)]/5 bg-[var(--foreground)]/5">
            FULL ANALYTICS REPORT
          </Button>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-[4px] md:space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h3 className="text-base md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Recent Commissions</h3>
            <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Active Fleet Logistics</p>
          </div>
          <Button variant="ghost" className="text-[9px] md:text-[10px] font-black tracking-widest uppercase opacity-60 hover:opacity-100 italic">VIEW ALL</Button>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-[10px] lg:hidden">
          {isLoading ? (
             Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-[10px] space-y-4 rounded-xl">
                   <div className="flex justify-between">
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-16 h-6 rounded-full" />
                   </div>
                   <Skeleton className="w-full h-4" />
                   <div className="flex justify-between">
                      <Skeleton className="w-12 h-4" />
                      <Skeleton className="w-24 h-4" />
                   </div>
                </Card>
             ))
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="p-[10px] space-y-2 group active:scale-[0.98] transition-all rounded-[15px] bg-bg-secondary/40 border-[var(--foreground)]/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-black text-[var(--foreground)] text-xs italic tracking-tighter">{order.id}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-text-secondary opacity-40" />
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic">{order.date || "Just now"}</p>
                    </div>
                  </div>
                  <Badge variant={
                    order.status === "DELIVERED" ? "glass" : 
                    order.status === "SHIPPED" ? "success" : 
                    order.status === "PENDING" ? "danger" : "secondary"
                  } className="h-5 text-[8px] px-2">
                    {order.status}
                  </Badge>
                </div>
                
                <div className="py-2 border-y border-[var(--foreground)]/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black text-text-secondary uppercase italic">Harvest</span>
                    <span className="text-[10px] font-black text-[var(--foreground)] truncate max-w-[150px] italic">{order.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] font-black text-text-secondary uppercase italic">Settlement</span>
                    <span className="text-[10px] font-black text-primary italic">{order.total}</span>
                  </div>
                </div>

                <div className="flex gap-[4px]">
                  <Button 
                    onClick={() => {
                      toast("Logistics Handshake Initialized...", "info"
  );
                      setTimeout(() => {
                        toast(`AUTO-SIGNAL: Link sent for ${order.id}`, "success"
  );
                      }, 1500
  );
                    }}
                    variant="primary" 
                    className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-glow-purple gap-2 bg-success border-none"
                  >
                    <Zap className="w-3 h-3" /> DISPATCH
                  </Button>
                  <Button 
                    onClick={() => router.push(`/seller/orders/${order.id}/voucher`)}
                    variant="outline" 
                    className="h-9 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg border-[var(--foreground)]/5 gap-2"
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <Card className="hidden lg:block p-1 overflow-hidden rounded-[24px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                  <TableHead className="min-w-[120px] text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Order ID</TableHead>
                  <TableHead className="min-w-[150px] text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Product Line</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[150px] text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Customer</TableHead>
                  <TableHead className="min-w-[100px] text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Settlement</TableHead>
                  <TableHead className="min-w-[120px] text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   Array(4).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-[var(--foreground)]/5">
                         <TableCell><Skeleton className="w-20 h-4" /></TableCell>
                         <TableCell><Skeleton className="w-32 h-4" /></TableCell>
                         <TableCell className="hidden md:table-cell"><Skeleton className="w-24 h-4" /></TableCell>
                         <TableCell><Skeleton className="w-16 h-4" /></TableCell>
                         <TableCell><Skeleton className="w-20 h-6 rounded-full" /></TableCell>
                         <TableCell className="text-right"><Skeleton className="w-8 h-8 rounded-full inline-block" /></TableCell>
                      </TableRow>
                   ))
                ) : (
                   orders.map((order) => (
                     <TableRow key={order.id} className="border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell className="font-black text-[var(--foreground)] italic tracking-tighter">{order.id}</TableCell>
                       <TableCell className="text-xs font-black text-text-secondary italic uppercase">{order.product}</TableCell>
                       <TableCell className="hidden md:table-cell text-xs font-black text-text-secondary italic uppercase">{order.customer}</TableCell>
                       <TableCell className="font-black text-[var(--foreground)] italic">{order.total}</TableCell>
                       <TableCell>
                         <Badge variant={
                           order.status === "DELIVERED" ? "glass" : 
                           order.status === "SHIPPED" ? "success" : 
                           order.status === "PENDING" ? "danger" : "secondary"
                         } className="px-3">
                           {order.status}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Button 
                             onClick={() => {
                               toast("Initializing Automated Handshake...", "info"
  );
                               setTimeout(() => {
                                 toast(`SUCCESS: Signal broadcasted for ${order.id}`, "success"
  );
                               }, 1500
  );
                             }}
                             variant="ghost" 
                             size="sm" 
                             className="h-8 md:h-9 px-3 md:px-4 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all rounded-lg md:rounded-xl italic"
                           >
                              <Zap className="w-3 h-3" /> DISPATCH
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => router.push(`/seller/orders/${order.id}/voucher`)}
                             className="h-8 md:h-9 px-3 md:px-4 gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 rounded-lg md:rounded-xl italic"
                           >
                              <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> VOUCHER
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => {
                               navigator.clipboard.writeText(`${window.location.origin}/agent/tracking?order_id=${order.id}&auto=true`
  );
                               toast("Logistics Link Copied", "success"
  );
                             }}
                             className="h-8 md:h-9 w-8 md:w-9 p-0 flex items-center justify-center border border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 rounded-lg md:rounded-xl"
                           >
                              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  
  );
}
