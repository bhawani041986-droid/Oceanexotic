"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  Share2, 
  Zap, 
  Gift, 
  Copy, 
  Check, 
  ArrowLeft, 
  ShoppingBag, 
  Globe,
  Twitter,
  Facebook,
  Mail,
  Smartphone,
  ShieldCheck,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function ReferPage() {
  const router = useRouter(
  );
  const { toast } = useToast(
  );
  const [mounted, setMounted] = React.useState(false
  );
  const [copied, setCopied] = React.useState(false
  );
  
  const referralCode = "FLEET-VIKRAM-9021";

  React.useEffect(() => {
    setMounted(true
  );
  }, []
  );

  if (!mounted) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode
  );
    setCopied(true
  );
    toast("Referral Code Synchronized to Clipboard.", "success"
  );
    setTimeout(() => setCopied(false), 2000
  );
  };

  const referralStats = [
    { label: "Successful Handshakes", value: "12", icon: <Users className="w-5 h-5" />, color: "text-primary" },
    { label: "Rewards Accrued", value: "₹4,500", icon: <Gift className="w-5 h-5" />, color: "text-success" },
    { label: "Network Grade", value: "Fleet Ambassador", icon: <Star className="w-5 h-5" />, color: "text-warning" },
  ];

  return (

    <div className="bg-[#0B1120] min-h-screen text-white font-inter selection:bg-primary/30 pb-20">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      {/* 1. NAVIGATION HUB */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 bg-[#0B1120]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 px-6">
        <div className="container mx-auto h-full flex items-center justify-between">
           <button 
             onClick={() => router.back()}
             className="flex items-center gap-3 text-text-secondary hover:text-[var(--foreground)] transition-colors group"
           >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest italic">Maritime Hub</span>
           </button>
           <Link href="/customer" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg rotate-12 flex items-center justify-center shadow-glow-purple group-hover:rotate-0 transition-transform"><ShoppingBag className="w-5 h-5 text-white" /></div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic hidden md:block">OceanExotic Global</h1>
           </Link>
           <div className="w-10 md:w-40" />
        </div>
      </header>

      <main className="pt-32 container mx-auto px-6 relative z-10">
         <div className="max-w-5xl mx-auto space-y-16">
            
            {/* 2. HERO REGISTRY */}
            <section className="text-center space-y-8">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6"
               >
                  <Badge className="bg-primary/20 text-primary border-primary/20 px-6 py-2.5 rounded-full text-[12px] font-black uppercase italic tracking-[0.3em] shadow-glow-purple/20">Growth Node Protocol</Badge>
                  <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85]">Propagate The <br /><span className="text-primary">Maritime</span> Network</h1>
                  <p className="text-xl text-text-secondary font-medium italic max-w-2xl mx-auto">Authorize a referral handshake and commission ₹500 for every new fleet member who joins our sustainable harvest registry.</p>
               </motion.div>

               {/* Referral Code Hub */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="max-w-xl mx-auto p-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[32px] flex flex-col md:flex-row items-center gap-2 group hover:border-primary/40 transition-all"
               >
                  <div className="flex-1 px-8 py-4 text-center md:text-left">
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">YOUR SOVEREIGN CODE</p>
                     <p className="text-2xl font-black text-[var(--foreground)] italic tracking-widest">{referralCode}</p>
                  </div>
                  <Button 
                    onClick={handleCopy}
                    className="w-full md:w-auto h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-xs gap-3 shadow-glow-purple"
                  >
                     {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                     {copied ? "AUTHORIZED" : "COPY CODE"}
                  </Button>
               </motion.div>
            </section>

            {/* 3. TELEMETRY STATS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {referralStats.map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + i * 0.1 }}
                 >
                    <Card className="p-10 bg-[#172033]/60 backdrop-blur-3xl border-[var(--foreground)]/5 rounded-[48px] text-center space-y-6 group hover:border-primary/20 transition-all">
                       <div className={cn("w-16 h-16 rounded-3xl bg-[var(--foreground)]/5 flex items-center justify-center mx-auto transition-transform group-hover:scale-110", stat.color)}>
                          {stat.icon}
                       </div>
                       <div>
                          <p className="text-4xl font-black text-[var(--foreground)] italic">{stat.value}</p>
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">{stat.label}</p>
                       </div>
                    </Card>
                 </motion.div>
               ))}
            </section>

            {/* 4. DISCOVERY HUB (How it Works) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Propagation <br />Protocol Steps</h2>
                  <div className="space-y-8">
                     {[
                       { step: "01", title: "Share Registry Node", desc: "Propagate your unique code across your social communication nodes.", icon: <Share2 className="w-6 h-6" /> },
                       { step: "02", title: "Handshake Authorized", desc: "Your contact commissions their first maritime harvest of ₹1,500+.", icon: <Zap className="w-6 h-6" /> },
                       { step: "03", title: "Accrue Rewards", desc: "₹500 is instantly commissioned to your loyalty registry vault.", icon: <Gift className="w-6 h-6" /> }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-8 group">
                          <div className="text-4xl font-black text-[var(--foreground)]/10 group-hover:text-primary/40 transition-colors">{item.step}</div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-black uppercase italic text-[var(--foreground)] flex items-center gap-3">
                                {item.icon} {item.title}
                             </h4>
                             <p className="text-sm text-text-secondary italic leading-relaxed">{item.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <Card className="p-10 bg-primary/5 border border-primary/20 rounded-[64px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform"><Globe className="w-64 h-64" /></div>
                  <div className="relative z-10 space-y-8 text-center">
                     <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-glow-purple">🎁</div>
                     <h3 className="text-3xl font-black uppercase italic tracking-tighter">Instant Channel Propagation</h3>
                     <p className="text-sm text-text-secondary italic">Select a node to authorize immediate transmission.</p>
                     <div className="flex justify-center gap-6">
                        {[
                          { icon: <Twitter className="w-6 h-6" />, color: "bg-blue-400" },
                          { icon: <Facebook className="w-6 h-6" />, color: "bg-blue-600" },
                          { icon: <Smartphone className="w-6 h-6" />, color: "bg-green-500" },
                          { icon: <Mail className="w-6 h-6" />, color: "bg-red-500" }
                        ].map((social, i) => (
                          <button key={i} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--foreground)] transition-all hover:scale-110 active:scale-95 shadow-xl", social.color)}>
                             {social.icon}
                          </button>
                        ))}
                     </div>
                  </div>
               </Card>
            </section>

            {/* 5. GOVERNANCE DISCLOSURE */}
            <div className="p-10 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[48px] flex flex-col md:flex-row items-center gap-10">
               <div className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center text-success shrink-0"><ShieldCheck className="w-10 h-10" /></div>
               <div className="flex-1 space-y-2">
                  <h4 className="text-xl font-black uppercase italic">Authority Governance</h4>
                  <p className="text-xs text-text-secondary italic leading-relaxed">Propagation rewards are analyzed by our authority nodes for integrity. All referrals must be unique maritime citizens with verified communication nodes. Rewards have no expiration within the active registry.</p>
               </div>
               <Button variant="outline" className="w-full md:w-auto h-14 px-10 rounded-2xl border-[var(--foreground)]/10 text-[10px] font-black uppercase tracking-widest">READ PROTOCOLS</Button>
            </div>

         </div>
      </main>

    </div>
  
  );
}
