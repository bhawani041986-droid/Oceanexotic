import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SellerStatsCard from "@/components/seller/SellerStatsCard";
import InventoryCard from "@/components/seller/InventoryCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const SELLER_NAV = [
  { title: "Dashboard", href: "/seller/dashboard", icon: "D" },
  { title: "Products", href: "/seller/products", icon: "P" },
  { title: "Orders", href: "/seller/orders", icon: "O" },
  { title: "Reviews", href: "/seller/reviews", icon: "R" },
  { title: "Analytics", href: "/seller/analytics", icon: "A" },
];

export default function SellerDashboard() {
  return (
    <DashboardLayout navItems={SELLER_NAV} role="seller">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Seller Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your performance and manage your inventory.</p>
          </div>
          <Button className="shadow-glow">
            + New Listing
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SellerStatsCard 
            title="Total Revenue" 
            value="$12,450.00" 
            change="12.5%" 
            isPositive={true} 
            icon="💰" 
          />
          <SellerStatsCard 
            title="Active Orders" 
            value="24" 
            change="8.2%" 
            isPositive={true} 
            icon="📦" 
          />
          <SellerStatsCard 
            title="Avg. Rating" 
            value="4.8" 
            change="0.2%" 
            isPositive={true} 
            icon="★" 
          />
          <SellerStatsCard 
            title="Product Views" 
            value="1.2k" 
            change="4.1%" 
            isPositive={false} 
            icon="👁️" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart Placeholder */}
          <Card className="lg:col-span-2 border-white/5 bg-background-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Revenue Overview</CardTitle>
              <select className="bg-white/5 border border-white/10 rounded-md text-xs px-2 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </CardHeader>
            <CardContent className="h-[300px] flex items-end justify-between px-8 pb-4">
              {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="w-12 bg-primary-purple/20 rounded-t-lg relative group transition-all hover:bg-primary-purple/40">
                  <div 
                    className="absolute bottom-0 w-full bg-primary-purple rounded-t-lg transition-all duration-1000" 
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Inventory Section */}
          <Card className="border-white/5 bg-background-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Low Stock Alerts</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-primary-aqua">Manage</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <InventoryCard item={{ id: '1', name: 'Yellowfin Tuna', stock: 2, status: 'Low Stock', price: 45 }} />
              <InventoryCard item={{ id: '2', name: 'Blue Crab', stock: 0, status: 'Out of Stock', price: 22 }} />
              <InventoryCard item={{ id: '3', name: 'Tiger Prawns', stock: 5, status: 'Low Stock', price: 28 }} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Section */}
        <Card className="border-white/5 bg-background-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <Button variant="outline" size="sm" className="glass">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest">
                    <th className="pb-4 font-semibold">Order ID</th>
                    <th className="pb-4 font-semibold">Customer</th>
                    <th className="pb-4 font-semibold">Product</th>
                    <th className="pb-4 font-semibold">Amount</th>
                    <th className="pb-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { id: '#ORD-9281', customer: 'Alice Smith', product: 'Atlantic Salmon', amount: '$120.00', status: 'Processing' },
                    { id: '#ORD-9282', customer: 'Bob Jones', product: 'Tiger Prawns', amount: '$56.00', status: 'Delivered' },
                    { id: '#ORD-9283', customer: 'Charlie Brown', product: 'Bluefin Tuna', amount: '$210.00', status: 'Pending' },
                  ].map((order) => (
                    <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">{order.id}</td>
                      <td className="py-4 text-muted-foreground">{order.customer}</td>
                      <td className="py-4">{order.product}</td>
                      <td className="py-4 font-bold">{order.amount}</td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          order.status === 'Delivered' ? "bg-success/10 text-success" :
                          order.status === 'Processing' ? "bg-primary-blue/10 text-primary-blue" :
                          "bg-warning/10 text-warning"
                        )}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
