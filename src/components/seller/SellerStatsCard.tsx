import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface SellerStatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

export default function SellerStatsCard({
  title,
  value,
  change,
  isPositive,
  icon,
}: SellerStatsCardProps) {
  return (
    <Card className="border-[var(--foreground)]/5 bg-background-card hover:border-primary-purple/20 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {title}
            </p>
            <h3 className="text-3xl font-extrabold tracking-tight">{value}</h3>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-[var(--foreground)]/5 flex items-center justify-center text-xl">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {isPositive ? "+" : "-"}{change}
          </div>
          <span className="text-[10px] text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
