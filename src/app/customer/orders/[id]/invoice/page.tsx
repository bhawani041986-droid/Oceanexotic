"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone,
  FileText,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function InvoicePage() {
  const params = useParams(
  );
  const router = useRouter(
  );
  const [mounted, setMounted] = React.useState(false
  );
  const orderId = params.id as string;

  React.useEffect(() => {
    setMounted(true
  );
  }, []
  );

  if (!mounted) return null;

  const handlePrint = () => {
    window.print(
  );
  };

  // Mock Invoice Data
  const invoiceData = {
    number: `INV-${orderId.split('-').pop()}-2024`,
    date: "October 24, 2024",
    dueDate: "Immediate",
    status: "PAID",
    customer: {
      name: "Vikram Sharma",
      address: "12/A, Maritime Towers, Port Blair, Andaman",
      email: "vikram.sharma@fleet.com"
    },
    items: [
      { name: "Andaman King Lobster", qty: 2, price: 3800, total: 7600 },
      { name: "Saku Bluefin Tuna", qty: 1, price: 2450, total: 2450 },
      { name: "Tiger Prawns (Jumbo)", qty: 3, price: 1200, total: 3600 }
    ],
    subtotal: 13650,
    tax: 682.50,
    platformFee: 250,
    total: 14582.50
  };

  return (

    <div className="bg-[#0B1120] min-h-screen text-white font-inter p-6 md:p-12 selection:bg-primary/30 print:bg-white print:text-black print:p-0">
      
      {/* Action Header - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
         <button 
           onClick={() => router.back()}
           className="flex items-center gap-3 text-text-secondary hover:text-[var(--foreground)] transition-colors group"
         >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest italic">Return to Orders</span>
         </button>
         <div className="flex items-center gap-4">
            <Button onClick={handlePrint} variant="outline" className="rounded-2xl border-[var(--foreground)]/10 h-14 px-8 gap-3 font-black uppercase text-[10px] tracking-widest">
               <Printer className="w-4 h-4" /> PRINT INVOICE
            </Button>
            <Button className="rounded-2xl bg-primary h-14 px-8 gap-3 font-black uppercase text-[10px] tracking-widest shadow-glow-purple">
               <Download className="w-4 h-4" /> DOWNLOAD PDF
            </Button>
         </div>
      </div>

      {/* Main Invoice Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto print:max-w-none"
      >
        <Card className="bg-[#172033]/40 backdrop-blur-2xl border-[var(--foreground)]/5 rounded-[48px] p-10 md:p-16 space-y-12 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:shadow-none print:p-0">
           
           {/* Top Design Element - Hidden on Print */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 print:hidden" />

           {/* Header Section */}
           <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-glow-purple print:shadow-none print:border print:border-black">
                       <ShoppingBag className="w-8 h-8 text-[var(--foreground)] print:text-black" />
                    </div>
                    <div>
                       <h1 className="text-3xl font-black uppercase italic tracking-tighter print:text-black">OceanExotic Global</h1>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] print:text-black">ORDER INVOICE</p>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black text-[var(--foreground)] print:text-black uppercase">Main Headquarters</p>
                    <p className="text-xs text-text-secondary italic print:text-black/60">Sector 4, Harbour Hub, Port Blair</p>
                    <p className="text-xs text-text-secondary italic print:text-black/60">Andaman & Nicobar Islands, 744101</p>
                 </div>
              </div>

              <div className="text-right space-y-2">
                 <h2 className="text-5xl font-black uppercase italic tracking-tighter text-[var(--foreground)]/10 print:text-black/10">INVOICE</h2>
                 <div className="space-y-1">
                    <p className="text-xs font-black text-text-secondary uppercase print:text-black/60">Invoice Number</p>
                    <p className="text-xl font-black text-[var(--foreground)] print:text-black italic">{invoiceData.number}</p>
                 </div>
                 <Badge className="bg-success/10 text-success border-success/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase print:border-black print:text-black">
                    {invoiceData.status}
                 </Badge>
              </div>
           </div>

           <div className="h-px bg-[var(--foreground)]/5 print:bg-black/10" />

           {/* Details Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic border-b border-[var(--foreground)]/5 pb-2 print:text-black print:border-black/10">Billed To</h4>
                 <div className="space-y-1">
                    <p className="text-lg font-black text-[var(--foreground)] print:text-black uppercase">{invoiceData.customer.name}</p>
                    <p className="text-xs text-text-secondary italic leading-relaxed print:text-black/60">{invoiceData.customer.address}</p>
                    <p className="text-xs text-text-secondary italic print:text-black/60">{invoiceData.customer.email}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic border-b border-[var(--foreground)]/5 pb-2 print:text-black print:border-black/10">Order Details</h4>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Date Issued:</span>
                       <span className="font-black text-[var(--foreground)] print:text-black">{invoiceData.date}</span>
                    </div>
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Payment Due:</span>
                       <span className="font-black text-[var(--foreground)] print:text-black">{invoiceData.dueDate}</span>
                    </div>
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Delivery Method:</span>
                       <span className="font-black text-primary print:text-black uppercase">EXPRESS COLD-CHAIN</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic border-b border-[var(--foreground)]/5 pb-2 print:text-black print:border-black/10">Payment Method</h4>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center print:border-black/20">
                       <CreditCard className="w-5 h-5 text-text-secondary print:text-black" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-[var(--foreground)] print:text-black uppercase">VISA • 9021</p>
                       <p className="text-[9px] text-text-secondary uppercase print:text-black/60">Authorized: OK</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Table Section */}
           <div className="space-y-6">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-[var(--foreground)]/5 print:border-black/10">
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary print:text-black/60">Description</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary text-center print:text-black/60">Quantity</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary text-right print:text-black/60">Unit Price</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary text-right print:text-black/60">Total</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 print:divide-black/5">
                       {invoiceData.items.map((item, i) => (
                         <tr key={i} className="group">
                            <td className="py-6">
                               <p className="text-sm font-black text-[var(--foreground)] print:text-black uppercase italic">{item.name}</p>
                               <p className="text-xs text-text-secondary italic print:text-black/60">Premium Sustainable Seafood</p>
                            </td>
                            <td className="py-6 text-center text-sm font-black text-[var(--foreground)] print:text-black">{item.qty}</td>
                            <td className="py-6 text-right text-sm font-black text-[var(--foreground)] print:text-black">₹{item.price.toLocaleString()}</td>
                            <td className="py-6 text-right text-sm font-black text-primary print:text-black">₹{item.total.toLocaleString()}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Totals Section */}
           <div className="flex flex-col md:flex-row justify-between items-start gap-10 pt-10">
              <div className="max-w-xs space-y-4 order-2 md:order-1">
                 <div className="p-6 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[32px] space-y-4 print:bg-black/5 print:border-black/10">
                    <div className="flex items-center gap-3 text-success">
                       <ShieldCheck className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">System Verified</span>
                    </div>
                    <p className="text-[10px] text-text-secondary italic leading-relaxed print:text-black/60">This digital invoice serves as an official transaction record with OceanFresh.</p>
                 </div>
              </div>
              <div className="w-full md:w-80 space-y-4 order-1 md:order-2">
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Subtotal:</span>
                       <span className="text-[var(--foreground)] print:text-black">₹{invoiceData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Platform Service Fee (2%):</span>
                       <span className="text-[var(--foreground)] print:text-black">₹{invoiceData.platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs italic">
                       <span className="text-text-secondary print:text-black/60">Estimated VAT (5%):</span>
                       <span className="text-[var(--foreground)] print:text-black">₹{invoiceData.tax.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-[var(--foreground)]/5 my-4 print:bg-black/10" />
                    <div className="flex justify-between items-end pt-2">
                       <span className="text-sm font-black uppercase italic text-text-secondary print:text-black/60">Grand Total:</span>
                       <span className="text-4xl font-black text-primary italic leading-none print:text-black">₹{invoiceData.total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer Section */}
           <div className="pt-20 border-t border-[var(--foreground)]/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40 print:opacity-100 print:border-black/10">
              <div className="flex gap-10">
                 <div className="flex items-center gap-3"><Globe className="w-4 h-4" /><span className="text-[9px] font-black uppercase">oceanexotic.com</span></div>
                 <div className="flex items-center gap-3"><Mail className="w-4 h-4" /><span className="text-[9px] font-black uppercase">support@oceanexotic.com</span></div>
                 <div className="flex items-center gap-3"><Phone className="w-4 h-4" /><span className="text-[9px] font-black uppercase">+91 999 000 1234</span></div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] italic print:text-black">Thank you for your purchase.</p>
           </div>

        </Card>
      </motion.div>

      {/* Security Anchor - Hidden on Print */}
      <div className="mt-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-20 print:hidden">
         <FileText className="w-4 h-4" />
         <span>Invoice Verified Secure</span>
      </div>

    </div>
  
  );
}
