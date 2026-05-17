import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Gift, 
  Truck, 
  Navigation as NavigationIcon,
  BarChart3, 
  DollarSign, 
  ShieldCheck, 
  Star, 
  Settings,
  User,
  Palette
} from "lucide-react";

export const SELLER_NAV_ITEMS = [
  { label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/seller/dashboard", color: "#00D1FF" },
  { label: "Mission Control", icon: <NavigationIcon className="w-5 h-5" />, href: "/seller/fleet", color: "#10B981" },
  { label: "Products", icon: <Package className="w-5 h-5" />, href: "/seller/products", color: "#FACC15" },
  { label: "Fleet Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/seller/orders", color: "#F97316" },
  { label: "Chat Signals", icon: <MessageSquare className="w-5 h-5" />, href: "/seller/chat", color: "#A855F7" },
  { label: "Incentives", icon: <Gift className="w-5 h-5" />, href: "/seller/promotions", color: "#EC4899" },
  { label: "Logistics", icon: <Truck className="w-5 h-5" />, href: "/seller/shipping", color: "#06B6D4" },
  { label: "Yields", icon: <BarChart3 className="w-5 h-5" />, href: "/seller/earnings", color: "#84CC16" },
  { label: "Withdrawals", icon: <DollarSign className="w-5 h-5" />, href: "/seller/withdrawals", color: "#3B82F6" },
  { label: "Verification", icon: <ShieldCheck className="w-5 h-5" />, href: "/seller/verification", color: "#6366F1" },
  { label: "Reviews", icon: <Star className="w-5 h-5" />, href: "/seller/reviews", color: "#EAB308" },
  { label: "Directives", icon: <Settings className="w-5 h-5" />, href: "/seller/settings", color: "#94A3B8" },
  { label: "Profile", icon: <User className="w-5 h-5" />, href: "/seller/profile", color: "#0EA5E9" },
];
