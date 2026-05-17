"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Printer, 
  ArrowLeft, 
  Truck, 
  User, 
  MapPin, 
  ShieldCheck, 
  Zap,
  Navigation,
  Anchor,
  Download,
  Box,
  Activity,
  Fingerprint,
  Verified,
  Globe,
  Waves
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function DispatchVoucherPage() {
  const { id } = useParams(
  );
  const router = useRouter(
  );
  const [mounted, setMounted] = React.useState(false
  );

  React.useEffect(() => {
    setMounted(true
  );
  }, []
  );

  const handlePrint = () => {
    window.print(
  );
  };

  if (!mounted) return null;

  // UNIQUE ENCODING PARAMETERS
  const agentUrl = `http://localhost:3000/agent/confirm/${id}`;
  const customerUrl = `http://localhost:3000/customer/track/${id}`;

  return (

    <div className="bg-[#f1f5f9] min-h-screen p-4 md:p-8 flex flex-col items-center font-sans text-slate-900 print:bg-white print:p-0">
      
      {/* NAVIGATION CONTROLS - HIDDEN ON PRINT */}
      <div className="w-full max-w-3xl mb-4 flex items-center justify-between print:hidden">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> RETURN TO REGISTRY
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={handlePrint}
            className="gap-3 bg-slate-900 text-white shadow-xl hover:bg-black text-[10px] font-bold uppercase tracking-wider px-6 h-10 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" /> GENERATE PHYSICAL DOC
          </Button>
        </div>
      </div>

      {/* THE OFFICIAL DOCUMENT VOUCHER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[780px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] relative overflow-hidden print:shadow-none print:border-0 print:w-full print:max-w-none"
        style={{ minHeight: '0' }} 
      >
        {/* TOP SECURITY BAR */}
        <div className="h-1.5 bg-slate-900 w-full" />
        
        {/* DOCUMENT HEADER */}
        <div className="p-8 md:p-10 flex justify-between items-start border-b border-slate-100 relative print:p-6">
          <div className="space-y-4 relative z-10">
            <Logo size="sm" variant="dark" className="filter grayscale" />
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">OFFICIAL DISPATCH</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">Maritime Logistics Registry & Certification</p>
            </div>
          </div>

          <div className="text-right space-y-3 relative z-10">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Document ID</p>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{id}</h2>
              <div className="flex items-center justify-end gap-1 mt-1.5 text-[7px] font-mono text-slate-400">
                <Fingerprint className="w-2.5 h-2.5" />
                AUTH: OX-{id?.toString().slice(-4)}-SYNC
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 border border-green-100 rounded-full">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[7px] font-black text-green-700 uppercase tracking-wider">Node Authorized</span>
            </div>
          </div>

          {/* SUBTLE WATERMARK */}
          <div className="absolute right-[-5%] top-[10%] opacity-[0.015] pointer-events-none rotate-12">
            <Anchor size={300} />
          </div>
        </div>

        {/* LOGISTICS PARTICIPANTS */}
        <div className="p-8 md:p-10 grid grid-cols-2 gap-8 border-b border-slate-100 print:p-6 print:gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Truck size={12} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Shipment Source</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Agent</p>
              <h3 className="text-lg font-black text-slate-900 uppercase italic leading-none">MARITIME FLEET NODE</h3>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Registry: PB-882-EX | Tier-1 Prime
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <User size={12} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Consignee Destination</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</p>
              <h3 className="text-lg font-black text-slate-900 uppercase italic leading-none">PREMIUM GUEST NODE</h3>
              <div className="flex items-start gap-1.5 text-[10px] font-medium text-slate-500">
                <MapPin size={10} className="mt-0.5 shrink-0" />
                <span>Port Blair Sector-04 Hub, A&N</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARGO MANIFEST */}
        <div className="p-8 md:p-10 space-y-4 print:p-6 print:space-y-3">
           <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Cargo Manifest</p>
                <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Harvest Inventory</h4>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Transaction</p>
                <p className="text-2xl font-black text-slate-900 italic leading-none">₹12,450.00</p>
              </div>
           </div>

           <table className="w-full text-left">
             <thead>
               <tr className="border-b border-slate-100">
                 <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Serial</th>
                 <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                 <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Batch</th>
                 <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {[
                 { id: "01", name: "Yellowfin Tuna Saku (Grade AAA)", batch: "MAR-992", qty: "2.5 KG" },
                 { id: "02", name: "Black Tiger Prawns (Jumbo)", batch: "MAR-104", qty: "4.0 KG" }
               ].map((item, i) => (
                 <tr key={i} className="group">
                   <td className="py-3 text-[10px] font-black text-slate-900">#{item.id}</td>
                   <td className="py-3">
                      <p className="text-[10px] font-black text-slate-900 uppercase">{item.name}</p>
                   </td>
                   <td className="py-3 text-[10px] font-mono text-slate-500 text-center">{item.batch}</td>
                   <td className="py-3 text-[10px] font-black text-slate-900 text-right italic">{item.qty}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* VERIFICATION NODES (DYNAMIC QR) */}
        <div className="mx-8 md:mx-10 p-6 bg-slate-50 rounded-[32px] border border-slate-200/60 relative overflow-hidden print:border-slate-100 print:bg-white print:mx-6 print:p-5 print:rounded-2xl">
           <div className="grid grid-cols-2 gap-10 relative z-10 print:gap-8">
              {/* Agent Node */}
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Agent Node Auth</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Initialization</p>
                 </div>
                 
                 <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <QRCodeSVG 
                      value={agentUrl} 
                      size={110} 
                      level="H" 
                      includeMargin={false}
                      imageSettings={{
                        src: "/logo-icon.svg",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                 </div>

                 <div className="space-y-2 max-w-[240px]">
                    <div className="inline-flex items-center gap-1.5 text-[7px] font-mono text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                      NODE: AGT_{id?.toString().slice(-4)}
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium leading-tight">
                      Confirm <span className="text-slate-900 font-black italic">Handoff</span> and sync live logistics telemetry.
                    </p>
                 </div>
              </div>

              {/* Customer Node */}
              <div className="flex flex-col items-center text-center gap-4 border-l border-slate-200 print:border-slate-100">
                 <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Live Tracking Hub</h5>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Telemetry Node</p>
                 </div>
                 
                 <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
                    <QRCodeSVG 
                      value={customerUrl} 
                      size={110} 
                      level="H" 
                      includeMargin={false}
                      imageSettings={{
                        src: "/logo-icon.svg",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                 </div>

                 <div className="space-y-2 max-w-[240px]">
                    <div className="inline-flex items-center gap-1.5 text-[7px] font-mono text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                      NODE: TRK_{id?.toString().slice(-4)}
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium leading-tight">
                      Initialize <span className="text-slate-900 font-black italic">Vessel Tracking</span> and live transit status.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* OFFICIAL FOOTER */}
        <div className="p-8 md:p-10 flex justify-between items-end mt-4 print:p-6 print:mt-2">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-slate-900 rounded-full flex items-center justify-center p-0.5">
                 <div className="w-full h-full border border-dashed border-slate-900 rounded-full flex items-center justify-center">
                    <Verified className="text-slate-900 w-6 h-6" />
                 </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.1em]">Sovereign Certification</p>
                <p className="text-[8px] font-medium text-slate-400 italic">OceanExotic Global Integrated Supply Chain</p>
                <div className="flex gap-2 mt-1">
                   <Globe className="w-2.5 h-2.5 text-slate-300" />
                   <Waves className="w-2.5 h-2.5 text-slate-300" />
                   <Activity className="w-2.5 h-2.5 text-slate-300" />
                </div>
              </div>
           </div>

           <div className="text-right space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Timestamp Signature</p>
              <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{new Date().toLocaleDateString()} @ {new Date().toLocaleTimeString()}</p>
              <p className="text-[7px] font-mono text-slate-400">NODE-VER-{id?.toString().slice(-4)}</p>
           </div>
        </div>
      </motion.div>

      {/* ADDITIONAL DOCUMENT ACTIONS */}
      <div className="w-full max-w-3xl mt-4 flex justify-center gap-3 print:hidden">
         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={12} /> DOWNLOAD PDF
         </button>
         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Globe size={12} /> BLOCKCHAIN RECORD
         </button>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          .shadow-3xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  
  );
}
