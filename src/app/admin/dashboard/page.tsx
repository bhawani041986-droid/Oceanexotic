import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SellerStatsCard from "@/components/seller/SellerStatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ADMIN_NAV = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "D" },
  { title: "Users", href: "/admin/users", icon: "U" },
  { title: "Orders", href: "/admin/orders", icon: "O" },
  { title: "Reviews", href: "/admin/reviews", icon: "R" },
  { title: "Analytics", href: "/admin/analytics", icon: "A" },
  { title: "Settings", href: "/admin/settings", icon: "S" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} role="admin">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
            <p className="text-muted-foreground mt-1">Global overview of the OceanFresh platform ecosystem.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="glass">Generate Report</Button>
            <Button className="shadow-glow">System Health</Button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SellerStatsCard 
            title="Total Platform GMV" 
            value="$452.8k" 
            change="24.5%" 
            isPositive={true} 
            icon="📈" 
          />
          <SellerStatsCard 
            title="Active Customers" 
            value="12.4k" 
            change="18.2%" 
            isPositive={true} 
            icon="👥" 
          />
          <SellerStatsCard 
            title="Verified Sellers" 
            value="850" 
            change="5.2%" 
            isPositive={true} 
            icon="🏢" 
          />
          <SellerStatsCard 
            title="Pending Disputes" 
            value="12" 
            change="4" 
            isPositive={false} 
            icon="⚖️" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Platform Traffic Chart Placeholder */}
          <Card className="lg:col-span-2 border-white/5 bg-background-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Platform Traffic & Conversions</CardTitle>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] text-primary-purple">
                  <span className="w-2 h-2 rounded-full bg-primary-purple" /> Traffic
                </span>
                <span className="flex items-center gap-1 text-[10px] text-primary-blue">
                  <span className="w-2 h-2 rounded-full bg-primary-blue" /> Orders
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] flex items-end justify-between px-8 pb-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between p-8 opacity-5">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white" />)}
              </div>
              {[60, 45, 80, 55, 95, 75, 85].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                  <div className="w-8 md:w-12 bg-white/5 rounded-full overflow-hidden h-[250px] relative">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary-purple to-primary-blue transition-all duration-1000" 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Mon</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Feed Section */}
          <Card className="border-white/5 bg-background-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { user: 'Admin Sarah', action: 'Approved Seller #892', time: '2m ago', color: 'bg-success' },
                { user: 'System', action: 'Automated backup completed', time: '15m ago', color: 'bg-primary-blue' },
                { user: 'Admin Mike', action: 'Refunded Order #ORD-9281', time: '45m ago', color: 'bg-danger' },
                { user: 'Seller Bot', action: 'Updated pricing for 120 items', time: '1h ago', color: 'bg-warning' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${activity.color} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                  <div>
                    <p className="text-xs font-bold">{activity.action}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Management Quick View */}
        <Card className="border-white/5 bg-background-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">User Moderation Queue</CardTitle>
            <Button variant="outline" size="sm" className="glass">Audit Logs</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Fresh Catch Co.', type: 'Seller', status: 'Pending Verification', joined: 'May 8, 2026' },
                { name: 'Deep Sea Inc.', type: 'Seller', status: 'Under Review', joined: 'May 7, 2026' },
                { name: 'Oceanic Traders', type: 'Seller', status: 'Verification Failed', joined: 'May 5, 2026' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-[16px] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">
                      🏢
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{user.name}</h4>
                      <p className="text-[10px] text-muted-foreground">Joined {user.joined}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      user.status === 'Pending Verification' ? "bg-primary-blue/10 text-primary-blue" :
                      user.status === 'Under Review' ? "bg-warning/10 text-warning" :
                      "bg-danger/10 text-danger"
                    )}>
                      {user.status}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-3 text-[10px]">Reject</Button>
                      <Button size="sm" className="h-8 px-3 text-[10px] bg-success hover:bg-success/90">Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
