"use client";

import React, { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  ArrowLeft, 
  Package, 
  Printer, 
  Download, 
  Anchor,
  FileText,
  CreditCard,
  Truck,
  Star,
  MessageSquare,
  X,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
  Video,
  Play,
  Droplets,
  UtensilsCrossed,
  Lock
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { reviewService } from "@/services/reviewService";

export default function OrderDetailsPage() {
  const { toast } = useToast();
  const { id } = useParams();
  const router = useRouter();
  const [reviewingItem, setReviewingItem] = React.useState<any | null>(null);
  const [existingReviews, setExistingReviews] = React.useState<any[]>([]);
  const [comment, setComment] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [evidence, setEvidence] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [origin, setOrigin] = React.useState("http://localhost:3000");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  React.useEffect(() => {
    const fetchOrderReviews = async () => {
      if (!id) return;
      try {
        const data = await reviewService.getOrderReviews(id as string);
        setExistingReviews(data || []);
      } catch (err) {
        console.error("Order Registry Check Failure:", err);
      }
    };
    fetchOrderReviews();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // High-Fidelity Mock Order Metadata
  const order = {
    id: id,
    date: "May 09, 2026",
    status: "DELIVERED",
    total: 12800,
    shipping: 500,
    tax: 640,
    subtotal: 11660,
    address: {
      name: "Bhawani Singh",
      line1: "North Jetty Road, Phoenix Bay",
      city: "Port Blair",
      state: "South Andaman",
      zip: "744101"
    },
    items: [
      { id: "p1", name: "Premium Bluefin Tuna", price: 8500, qty: 1, sellerId: "4", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400" },
      { id: "p2", name: "Hokkaido Scallops", price: 3160, qty: 1, sellerId: "4", image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=400" },
    ]
  };

  // ── Print & PDF handlers ──────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    // Trigger browser Save-as-PDF via print dialog
    // The print stylesheet (below) hides everything except #order-printable
    const prevTitle = document.title;
    document.title = `OceanExotic-Order-${id}`;
    window.print();
    document.title = prevTitle;
  }, [id]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleReviewSubmit = async () => {
    if (!comment.trim()) {
      toast("Please provide some feedback on your harvest.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process Evidence Gallery (Base64 conversion for JSON API)
      const evidenceData = await Promise.all(
        evidence.map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
              url: reader.result,
              type: file.type.startsWith('video') ? 'video' : 'image',
              name: file.name
            });
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch("/api/reviews/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: reviewingItem.id,
          product_name: reviewingItem.name,
          seller_id: reviewingItem.sellerId,
          user_id: "USR-123", // Mock Citizen ID
          user_name: "Bhawani Singh",
          rating: rating,
          comment: comment,
          order_id: id,
          photos: JSON.stringify(evidenceData)
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast("Review submitted for moderation registry.", "success");
        setReviewingItem(null);
        setComment("");
        setRating(5);
        setEvidence([]);
      } else {
        toast(data.message || "Registry synchronization failed.", "error");
      }
    } catch (err) {
      toast("Connection failed with maritime registry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-primary pb-10 md:pb-20">
        {/* ── PRINT STYLESHEET — visibility trick: works in all Next.js DOM depths ── */}
        <style>{`
          @media print {
            * { visibility: hidden !important; }
            #print-receipt,
            #print-receipt * { visibility: visible !important; }
            #print-receipt {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: #ffffff !important;
              z-index: 99999 !important;
              padding: 40px !important;
              box-sizing: border-box !important;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}</style>

        <div className="container mx-auto px-4 md:px-10 pt-4 md:pt-16 pb-10">
          <div id="order-printable" className="max-w-5xl mx-auto space-y-[10px] md:space-y-12">
            
            <div data-no-print className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
               <Button 
                 variant="ghost" 
                 onClick={() => router.back()}
                 className="group gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 h-8 md:h-10 px-0 md:px-4"
               >
                 <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:-translate-x-1" /> BACK TO COMMISSIONS
               </Button>
               <div className="flex gap-[4px] md:gap-4">
                  <Button
                     variant="outline"
                     onClick={handlePrint}
                     className="h-8 md:h-10 px-3 md:px-4 text-[8px] md:text-[9px] font-black tracking-widest uppercase gap-1.5 md:gap-2 border-[var(--foreground)]/5 rounded-lg md:rounded-xl hover:bg-primary/10 hover:border-primary/30 transition-all"
                  >
                     <Printer className="w-3 md:w-3.5 h-3 md:h-3.5" /> PRINT
                  </Button>
                  <Button
                     variant="outline"
                     onClick={handleDownloadPDF}
                     className="h-8 md:h-10 px-3 md:px-4 text-[8px] md:text-[9px] font-black tracking-widest uppercase gap-1.5 md:gap-2 border-[var(--foreground)]/5 rounded-lg md:rounded-xl hover:bg-primary/10 hover:border-primary/30 transition-all"
                  >
                     <Download className="w-3 md:w-3.5 h-3 md:h-3.5" /> PDF
                  </Button>
               </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-[10px] md:gap-8 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-12">
               <div className="space-y-2 md:space-y-4">
                  <div className="flex items-center gap-3 md:gap-4">
                     <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic">{order.id}</h1>
                     <Badge variant="success" className="px-3 md:px-4 py-1 md:py-1.5 shadow-glow-purple text-[8px] md:text-[10px]">IN TRANSIT</Badge>
                  </div>
                  <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[9px] md:text-[11px]">Sovereign Settlement Manifest • {order.date}</p>
               </div>
               <div className="text-left md:text-right space-y-0.5 md:space-y-1">
                  <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Manifest Value</p>
                  <p className="text-2xl md:text-4xl font-black text-[var(--foreground)] leading-none tracking-tighter italic">₹{order.total.toLocaleString()}</p>
               </div>
            </div>

            {/* 🚚 LIVE COLD-CHAIN DELIVERY RADAR */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-[24px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[var(--c-shadow-glow)] animate-pulse">
                     <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-[var(--foreground)]">Live Cold-Chain Delivery Radar</h3>
                    <p className="text-[10px] font-medium text-text-secondary mt-1">
                      Current Node: <span className="font-bold text-[var(--foreground)]">Port Blair Phoenix Bay Hub</span> • In-Transit
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="bg-blue-500/10 px-3 py-1.5 border border-blue-500/35 rounded-xl flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Stable 1.2°C Chilled</span>
                  </div>
                  <div className="flex gap-1">
                    {[-18.0, -18.2, -18.1, -18.2].map((t, idx) => (
                      <span key={idx} className="bg-blue-500/5 px-2 py-1 border border-blue-500/10 rounded-md text-[9px] font-black text-blue-400">{t}°C</span>
                    ))}
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Estimated Arrival</p>
                     <p className="text-sm font-black text-[var(--foreground)] italic">32 mins remaining</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 🔐 SECURE HANDOFF PROTOCOL */}
            <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-[24px] mt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shadow-[var(--c-shadow-glow)]">
                     <Lock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-[var(--foreground)]">Secure Handoff Protocol</h3>
                    <p className="text-[10px] font-medium text-text-secondary mt-1">
                      Show this QR code or provide the OTP below to the delivery agent to confirm your delivery.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* OTP display */}
                  <div className="text-center md:text-right">
                     <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Verification Password (OTP)</p>
                     <p className="text-2xl font-black text-primary tracking-[0.2em] italic mt-1 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                       {((parseInt((typeof id === 'string' ? id : String(id || "123")).replace(/[^0-9]/g, "")) || 123) * 997 + 12345) % 900000 + 100000}
                     </p>
                  </div>
                  {/* QR Code */}
                  <div className="p-2 bg-white rounded-2xl border border-white/10 shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${origin}/agent/confirm/${id}?otp=${((parseInt((typeof id === 'string' ? id : String(id || "123")).replace(/[^0-9]/g, "")) || 123) * 997 + 12345) % 900000 + 100000}`)}`} 
                      alt="Delivery verification QR Code" 
                      className="w-[100px] h-[100px] object-contain"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] md:gap-12">
               {/* Order Items Registry */}
               <div className="lg:col-span-2 space-y-[4px] md:space-y-8">
                  <h2 className="text-[10px] md:text-sm font-black text-[var(--foreground)] tracking-[0.2em] uppercase italic flex items-center gap-2 md:gap-3">
                     <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Manifest Items
                  </h2>
                   <div className="space-y-[4px] md:space-y-4">
                     {order.items.map((item) => {
                        const existingReview = existingReviews.find(r => r.product_id === item.id);
                        return (
                        <Card key={item.id} className="p-[10px] md:p-6 bg-bg-secondary/40 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all rounded-[15px] md:rounded-[24px]">
                           <div className="flex flex-col space-y-4">
                              <div className="flex items-center gap-4 md:gap-8">
                                 <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-[20px] overflow-hidden border border-[var(--foreground)]/5 relative shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-all duration-700" />
                                 </div>
                                 <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-0.5 md:space-y-1">
                                       <h3 className="text-sm md:text-lg font-bold text-[var(--foreground)] tracking-tight">{item.name}</h3>
                                       <p className="text-[8px] md:text-[10px] font-bold text-text-secondary uppercase tracking-widest">QTY: {item.qty} • SKU: OF-{item.id}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <div className="text-right">
                                          <p className="text-sm md:text-xl font-black text-[var(--foreground)] leading-none">₹{item.price.toLocaleString()}</p>
                                       </div>
                                       {order.status === "DELIVERED" && !existingReview && (
                                          <Button 
                                            onClick={() => setReviewingItem(item)}
                                            className="h-8 md:h-10 px-4 md:px-6 text-[8px] md:text-[9px] font-black tracking-widest uppercase gap-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all rounded-lg md:rounded-xl"
                                          >
                                             <MessageSquare className="w-3 md:w-3.5 h-3 md:h-3.5" /> RATE PRODUCT
                                          </Button>
                                       )}
                                       {existingReview && (
                                          <Badge variant="glass" className="bg-success/10 text-success border-success/20 uppercase text-[8px] tracking-[0.2em] px-3 py-1.5 italic font-black">
                                             <ShieldCheck className="w-3 h-3 mr-2" /> VERIFIED AUDIT
                                          </Badge>
                                       )}
                                    </div>
                                 </div>
                              </div>

                              {/* Inline Audit History for this Item */}
                              {existingReview && (
                                 <div className="bg-white/[0.03] rounded-[20px] p-4 lg:p-5 border border-[var(--foreground)]/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                       <div className="flex text-primary">
                                          {[...Array(5)].map((_, i) => (
                                             <Star key={i} className={cn("w-3.5 h-3.5", i < existingReview.rating ? "fill-current" : "opacity-20")} />
                                          ))}
                                       </div>
                                       <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                                          {new Date(existingReview.created_at).toLocaleDateString()}
                                       </span>
                                    </div>
                                    <p className="text-[11px] lg:text-xs text-text-secondary font-medium leading-relaxed italic">
                                       "{existingReview.comment}"
                                    </p>
                                    {existingReview.seller_response && (
                                       <div className="pl-4 border-l border-primary/30 space-y-1">
                                          <p className="text-[8px] font-black text-primary uppercase tracking-widest italic">Merchant Reply</p>
                                          <p className="text-[10px] font-bold text-[var(--foreground)]/80 italic leading-relaxed">
                                             "{existingReview.seller_response}"
                                          </p>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        </Card>
                        );
                     })}
                  </div>

                  {/* 🔄 "CATCH AGAIN" INSTANT REORDER HUB */}
                  <div className="pt-6 border-t border-[var(--foreground)]/5 space-y-4">
                     <h3 className="text-sm font-black text-[var(--foreground)] tracking-[0.2em] uppercase italic flex items-center gap-2">
                        Reorder Hub
                     </h3>
                     <Card className="p-4 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[20px] flex flex-col md:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <span className="text-2xl">🐟</span>
                         <div>
                           <p className="text-xs font-bold text-[var(--foreground)] uppercase">Re-commission your last catch?</p>
                           <p className="text-[9px] font-medium text-text-secondary">Instant one-click checkout for Premium Bluefin Tuna & Hokkaido Scallops.</p>
                         </div>
                       </div>
                       <Button 
                         onClick={() => {
                           toast("Re-commissioning previous order items to cart...", "success");
                         }}
                         className="w-full md:w-auto h-10 px-6 text-[9px] font-black tracking-widest uppercase shadow-glow-purple rounded-xl"
                       >
                         CATCH AGAIN
                       </Button>
                     </Card>
                  </div>

                  {/* 🍳 CULINARY PREP & STORAGE LEDGER */}
                  <div className="pt-6 border-t border-[var(--foreground)]/5 space-y-4">
                     <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] tracking-[0.2em] uppercase italic flex items-center gap-2">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-primary" /> Culinary Prep & Storage Ledger
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Card className="p-4 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[20px] space-y-2">
                         <p className="text-[10px] font-black uppercase text-primary tracking-widest">❄️ Thawing & Storage Protocol</p>
                         <p className="text-[10px] text-text-secondary font-medium leading-relaxed">
                           For optimum freshness, keep vacuum-sealed Bluefin Tuna chilled at 0-2°C and consume within 24h, or freeze at -18°C. Thaw in cold water for 30 mins before preparation.
                         </p>
                       </Card>
                       <Card className="p-4 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[20px] space-y-2">
                         <p className="text-[10px] font-black uppercase text-primary tracking-widest">👨‍🍳 Verified Culinary Guide</p>
                         <p className="text-[10px] text-text-secondary font-medium leading-relaxed">
                           Recommended preparation: Pan-seared Hokkaido Scallops with garlic herb butter (2 mins per side). Access matching chef recipes on product pages.
                         </p>
                       </Card>
                     </div>
                  </div>
               </div>

               {/* Settlement & Logistics Metadata */}
               <div className="space-y-[10px] md:space-y-8">
                  <Card className="p-[10px] md:p-8 bg-bg-secondary/40 border-[var(--foreground)]/5 space-y-[10px] md:space-y-8 rounded-[20px] md:rounded-[30px]">
                     <div className="space-y-[4px] md:space-y-6">
                        <h2 className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] tracking-widest uppercase italic flex items-center gap-2 md:gap-3">
                           <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Manifest Summary
                        </h2>
                        <div className="space-y-2 md:space-y-4">
                           <div className="flex justify-between text-[10px] md:text-xs font-medium text-text-secondary">
                              <span>Subtotal</span>
                              <span className="text-[var(--foreground)]">₹{order.subtotal.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-[10px] md:text-xs font-medium text-text-secondary">
                              <span>Maritime Transit</span>
                              <span className="text-[var(--foreground)] font-black text-success uppercase text-[8px] md:text-[10px]">Complimentary</span>
                           </div>
                           <div className="flex justify-between text-[10px] md:text-xs font-medium text-text-secondary">
                              <span>Settlement Tax</span>
                              <span className="text-[var(--foreground)]">₹{order.tax.toLocaleString()}</span>
                           </div>
                           <div className="pt-3 md:pt-4 border-t border-[var(--foreground)]/5 flex justify-between items-center">
                              <span className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Total Settlement</span>
                              <span className="text-xl md:text-2xl font-black text-primary italic">₹{order.total.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-[4px] md:space-y-6 pt-[10px] md:pt-6 border-t border-[var(--foreground)]/5">
                        <h2 className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] tracking-widest uppercase italic flex items-center gap-2 md:gap-3">
                           <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Settlement Method
                        </h2>
                        <div className="flex items-center gap-3 md:gap-4">
                           <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center border border-[var(--foreground)]/5">
                              <span className="text-[7px] md:text-[8px] font-black text-[var(--foreground)] uppercase">VISA</span>
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[10px] md:text-[11px] font-bold text-[var(--foreground)] tracking-tight">Visa ending in 4421</p>
                              <p className="text-[8px] md:text-[9px] text-text-secondary font-medium uppercase tracking-widest">Auth: 9982-S</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-[4px] md:space-y-6 pt-[10px] md:pt-6 border-t border-[var(--foreground)]/5">
                        <h2 className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] tracking-widest uppercase italic flex items-center gap-2 md:gap-3">
                           <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> Port of Destination
                        </h2>
                        <div className="space-y-1 md:space-y-2">
                           <p className="text-[10px] md:text-[11px] font-bold text-[var(--foreground)] tracking-tight uppercase italic">{order.address.name}</p>
                           <p className="text-[10px] md:text-[11px] text-text-secondary leading-tight font-medium italic">
                              {order.address.line1}<br />
                              {order.address.city}, {order.address.state} {order.address.zip}
                           </p>
                        </div>
                     </div>
                  </Card>

                  {/* ⚓ FLEET IMPACT & SUSTAINABILITY LEDGER */}
                  <Card className="p-6 bg-[var(--c-bg-alt)]/40 border border-[var(--foreground)]/5 space-y-4 rounded-[20px] md:rounded-[30px]">
                     <h2 className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] tracking-widest uppercase italic flex items-center gap-2">
                        <Anchor className="w-3.5 h-3.5 text-primary" /> Fleet Impact & Sustainability
                     </h2>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-medium text-text-secondary">
                           <span>Harvest Method</span>
                           <span className="text-[var(--foreground)] font-black uppercase text-[9px] italic">100% Line-Caught</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-medium text-text-secondary">
                           <span>Vessel Impact</span>
                           <span className="text-[var(--foreground)] font-black">₹340 Crew Support</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-normal font-medium italic pt-2 border-t border-[var(--foreground)]/5">
                           Your purchase directly contributes to local artisanal fisherman groups at Junglighat & Phoenix Bay.
                        </p>
                     </div>
                  </Card>

                  <Card className="p-[10px] md:p-8 bg-primary/5 border-primary/20 relative overflow-hidden group rounded-[20px] md:rounded-[30px]">
                     <Anchor className="absolute -bottom-4 -right-4 w-20 md:w-24 h-20 md:h-24 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-1000" />
                     <div className="space-y-3 md:space-y-4 relative z-10">
                        <h3 className="text-[10px] md:text-xs font-black text-[var(--foreground)] tracking-[0.1em] uppercase italic">Need Maritime Assistance?</h3>
                        <p className="text-[9px] md:text-[11px] text-text-secondary font-medium italic leading-tight">Our sovereign harvest support node is available 24/7 for manifest inquiries.</p>
                        <Button 
                           variant="outline" 
                           onClick={() => toast("Maritime Support Dispatch: Connecting to Sovereign Harvest Node...", "info")}
                           className="w-full h-10 text-[8px] md:text-[9px] font-black tracking-widest uppercase border-primary/20 hover:bg-primary/10 rounded-lg md:rounded-xl"
                        >
                           CONTACT HARVEST NODE
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>

          </div>
        </div>

        {/* ── PRINT RECEIPT — kept in layout (off-screen), visibility trick makes it take over at @media print ── */}
        <div
          id="print-receipt"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '794px', /* A4 width at 96dpi */
            pointerEvents: 'none',
          }}
        >
          <div style={{
            fontFamily: "'Segoe UI', Arial, sans-serif",
            color: '#111',
            maxWidth: '720px',
            margin: '0 auto',
            background: '#fff',
          }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: '3px', borderBottomStyle: 'solid', borderBottomColor: '#0ea5e9', paddingBottom: '20px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a', textTransform: 'uppercase' }}>OCEAN<span style={{ color: '#0ea5e9' }}>EXOTIC</span></div>
                <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '4px' }}>Global Maritime Registry</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>oceanexotic.com • support@oceanexotic.com</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Settlement Manifest</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{order.id}</div>
                <div style={{ display: 'inline-block', marginTop: '6px', padding: '3px 10px', background: '#dcfce7', borderWidth: '1px', borderStyle: 'solid', borderColor: '#86efac', borderRadius: '20px', fontSize: '9px', fontWeight: 700, color: '#166534', letterSpacing: '2px', textTransform: 'uppercase' }}>DELIVERED</div>
              </div>
            </div>

            {/* Meta row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: '10px' }}>
                <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Order Date</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{order.date}</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: '10px' }}>
                <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Payment Method</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Visa •••• 4421</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: '10px' }}>
                <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Auth Code</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>9982-S</div>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: '28px', padding: '14px 18px', background: '#f0f9ff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#bae6fd', borderRadius: '10px' }}>
              <div style={{ fontSize: '9px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '6px' }}>Port of Destination</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{order.address.name}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                {order.address.line1}, {order.address.city}, {order.address.state} — {order.address.zip}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#fff' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', borderRadius: '8px 0 0 0' }}>Item</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>SKU</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', borderRadius: '0 8px 0 0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#e2e8f0' }}>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>OF-{item.id}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>{item.qty}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>₹{item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginLeft: 'auto', maxWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#64748b', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#f1f5f9' }}>
                <span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#64748b', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#f1f5f9' }}>
                <span>Maritime Transit</span><span style={{ color: '#16a34a', fontWeight: 700 }}>COMPLIMENTARY</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#64748b', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#f1f5f9' }}>
                <span>Settlement Tax</span><span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', marginTop: '6px', background: '#0f172a', borderRadius: '8px', color: '#fff' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Total Settlement</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8' }}>₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', paddingTop: '16px', borderTopWidth: '1px', borderTopStyle: 'dashed', borderTopColor: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Thank you for your maritime commission. Cold-chain integrity guaranteed.</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Printed: {new Date().toLocaleDateString('en-IN', { day:'2-digit', month: 'short', year: 'numeric' })}</div>
            </div>

          </div>
        </div>

        {/* REVIEW MODAL */}
        {reviewingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-lg bg-[#0d1117] border border-[var(--foreground)]/10 rounded-[32px] overflow-hidden shadow-premium relative">
                <button 
                  onClick={() => setReviewingItem(null)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-all"
                >
                   <X className="w-4 h-4 text-[var(--foreground)]" />
                </button>

                <div className="p-4 md:p-10 space-y-6 md:space-y-8">
                   <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                         <ShieldCheck className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary/90">Verified Maritime Review</span>
                      </div>
                      <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] uppercase italic tracking-tighter leading-tight">Rate Your Harvest</h2>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                         <p className="text-[10px] md:text-xs text-[var(--foreground)]/70 font-medium flex-1 leading-tight">Your feedback helps the OceanExotic Global community maintain the highest standards of maritime excellence.</p>
                         <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-success/10 border border-success/30 flex items-center gap-1.5 md:gap-2">
                            <Droplets className="w-2.5 h-2.5 md:w-3 md:h-3 text-success animate-pulse" />
                            <span className="text-[6px] md:text-[7px] font-black text-success uppercase tracking-widest leading-none">Cold Chain<br/>Verified</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-[4px] md:gap-4 p-[4px] md:p-4 rounded-2xl bg-[var(--foreground)]/10 border border-[var(--foreground)]/20">
                      <img src={reviewingItem.image} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-premium" alt="" />
                      <div className="flex-1 min-w-0">
                         <h3 className="text-xs md:text-sm font-bold text-[var(--foreground)] tracking-tight truncate">{reviewingItem.name}</h3>
                         <p className="text-[8px] md:text-[10px] font-bold text-[var(--foreground)]/60 uppercase tracking-widest">Order: {order.id}</p>
                      </div>
                   </div>

                   <div className="space-y-5 md:space-y-6">
                      <div className="space-y-2 md:space-y-3">
                         <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)]/80 uppercase tracking-widest text-center">Quality Rating</p>
                         <div className="flex justify-center gap-1 md:gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                               <button 
                                 key={s} 
                                 onClick={() => setRating(s)}
                                 className="transition-transform active:scale-90"
                               >
                                  <Star className={cn(
                                    "w-7 h-7 md:w-10 md:h-10",
                                    s <= rating ? "text-warning fill-warning" : "text-[var(--foreground)]/20"
                                  )} />
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                         <div className="flex items-center justify-between">
                            <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)]/80 uppercase tracking-widest">Evidence Gallery</p>
                            <span className="text-[7px] md:text-[8px] font-bold text-[var(--foreground)]/40 uppercase italic">Optional Support</span>
                         </div>
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            multiple 
                            accept="image/*,video/*"
                         />
                         <div className="grid grid-cols-2 gap-[4px] md:gap-3">
                            <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="h-16 md:h-20 rounded-xl md:rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.05] flex flex-col items-center justify-center gap-1 md:gap-2 group hover:border-primary/60 hover:bg-primary/10 transition-all"
                            >
                               <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-[var(--foreground)]/40 group-hover:text-primary transition-colors" />
                               <span className="text-[7px] md:text-[8px] font-black text-[var(--foreground)]/60 uppercase tracking-widest group-hover:text-[var(--foreground)] transition-colors">Add Photos</span>
                            </button>
                            <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="h-16 md:h-20 rounded-xl md:rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.05] flex flex-col items-center justify-center gap-1 md:gap-2 group hover:border-primary/60 hover:bg-primary/10 transition-all"
                            >
                               <Video className="w-4 h-4 md:w-5 md:h-5 text-[var(--foreground)]/40 group-hover:text-primary transition-colors" />
                               <span className="text-[7px] md:text-[8px] font-black text-[var(--foreground)]/60 uppercase tracking-widest group-hover:text-[var(--foreground)] transition-colors">Add Video</span>
                            </button>
                         </div>
                         {evidence.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                               {evidence.map((file, i) => (
                                  <div key={i} className="px-2 py-1 rounded-lg bg-[var(--foreground)]/10 border border-[var(--foreground)]/10 flex items-center gap-2">
                                     <span className="text-[8px] text-[var(--foreground)]/60 truncate max-w-[100px]">{file.name}</span>
                                     <button onClick={() => setEvidence(prev => prev.filter((_, idx) => idx !== i))}>
                                        <X className="w-3 h-3 text-[var(--foreground)]/40 hover:text-[var(--foreground)]" />
                                     </button>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>

                      <div className="space-y-2 md:space-y-3">
                         <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)]/80 uppercase tracking-widest">Harvest Notes</p>
                         <textarea 
                           placeholder="Share your experience with this edible product (taste, freshness, texture)..."
                           value={comment}
                           onChange={(e) => setComment(e.target.value)}
                           className="w-full h-24 md:h-24 bg-[var(--foreground)]/10 border border-[var(--foreground)]/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                         />
                      </div>

                      <Button 
                        onClick={handleReviewSubmit}
                        disabled={isSubmitting}
                        className="w-full h-14 text-[10px] font-black tracking-[0.2em] uppercase shadow-glow-purple rounded-xl flex items-center justify-center gap-3"
                      >
                         {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "SUBMIT REVIEW"}
                      </Button>
                   </div>
                </div>
             </Card>
          </div>
        )}
      </div>
  );
}
