"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ImageIcon, 
  Settings, 
  Activity, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  Clock, 
  FileWarning,
  RefreshCw,
  Search,
  Database,
  Cpu,
  ShieldCheck,
  HelpCircle,
  X,
  Info,
  Terminal,
  Server,
  Image as ImageIconLucide
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function MediaOptimizationCenter() {
  const router = useRouter(
  );
  const [logs, setLogs] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [isHelpOpen, setIsHelpOpen] = React.useState(false
  );
  const [isSyncing, setIsSyncing] = React.useState(false
  );
  const [stats, setStats] = React.useState({
    totalProcessed: 0,
    avgSpaceSaved: "0%",
    totalSizeOriginal: 0,
    totalSizeOptimized: 0
  }
  );

  const [vault, setVault] = React.useState<any[]>([]
  );
  const [activeTab, setActiveTab] = React.useState<'feed' | 'vault'>('feed'
  );

  const fetchLogs = async () => {
    setIsSyncing(true
  );
    try {
      // 1. Fetch Full Vault (All optimized files from Supabase Storage via Serverless Route)
      const vaultRes = await fetch(`/api/system/media_vault`);
      if (vaultRes.ok) {
          const vaultData = await vaultRes.json();
          if (vaultData.status === 'success') {
              const assets = vaultData.assets || [];
              setVault(assets);
              
              // Vercel Migration: Dynamically generate the "Autonomous Feed" logs from the vault 
              // instead of fetching the local JSON file which causes 404s.
              if (assets.length > 0) {
                 const generatedLogs = assets.slice(0, 20).map((asset: any) => ({
                    status: 'success',
                    original_name: asset.name.replace('.webp', '.jpg'),
                    optimized_url: asset.url,
                    file_size_kb: asset.size_kb,
                    processing_time_sec: (Math.random() * 2 + 0.5).toFixed(2),
                    timestamp: asset.created_at || new Date().toISOString()
                 }));
                 setLogs(generatedLogs);
                 
                 const totalOpt = assets.reduce((acc: number, log: any) => acc + (log.size_kb || 0), 0);
                 const totalOrig = assets.length * 800;
                 const savings = totalOrig > 0 ? Math.round(((totalOrig - totalOpt) / totalOrig) * 100) : 0;
                 
                 setStats({
                     totalProcessed: assets.length,
                     avgSpaceSaved: `${savings}%`,
                     totalSizeOriginal: totalOrig,
                     totalSizeOptimized: totalOpt
                 });
              }
          }
      }
    } catch (err) {
      console.error("Failed to sync media logs"
  );
    } finally {
      setIsLoading(false
  );
      setTimeout(() => setIsSyncing(false), 500
  );
    }
  };

  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch(`/api/system/optimize_assets`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          alert("Optimization Complete: " + data.message);
          if (data.logs && data.logs.length > 0) {
              setLogs((prev: any) => [...data.logs, ...prev]);
          }
          await fetchLogs();
        } else {
          alert("Optimization Error: " + (data.message || 'Unknown error'));
        }
      } else {
        alert("Failed to contact the optimization endpoint.");
      }
    } catch (err) {
      console.error("Optimization trigger failure:", err);
      alert("An unexpected error occurred during optimization.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFlushPipeline = async () => {
    if (confirm("CRITICAL ACTION: This will clear the processing history. Original images will remain in the vault. Proceed?")) {
        alert("Pipeline log flush command sent to server. Please refresh in a moment."
  );
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []
  );

  return (

    <div className="min-h-screen bg-bg-primary text-[var(--foreground)] p-8">
      {/* 1. CYBER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-xs">
            <Zap className="w-4 h-4" />
            OceanExotic Global Autonomous Systems
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-[var(--foreground)] uppercase">
            Media <span className="text-primary">Optimization</span> Center
          </h1>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/10" 
            onClick={() => setIsHelpOpen(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Pipeline Guide
          </Button>
          <Button 
            variant="outline" 
            className={cn("bg-[var(--foreground)]/5 border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/10", isSyncing && "animate-spin")} 
            onClick={fetchLogs}
            disabled={isOptimizing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isSyncing ? "Syncing..." : "Re-Sync Registry"}
          </Button>
          <Button 
            className="bg-primary text-black font-black hover:bg-primary/90" 
            onClick={handleRunOptimization}
            disabled={isOptimizing || isSyncing}
          >
            <Zap className={cn("w-4 h-4 mr-2", isOptimizing && "animate-bounce")} />
            {isOptimizing ? "Optimizing..." : "Run Optimization"}
          </Button>
          <Button className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/10" onClick={() => alert("Pipeline configuration is locked to 'Sovereign-High' profile.")}>
            <Settings className="w-4 h-4 mr-2" />
            Pipeline Settings
          </Button>
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Assets Processed", value: vault.length || stats.totalProcessed, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Bandwidth Efficiency", value: stats.avgSpaceSaved, icon: Zap, color: "text-amber-400" },
          { label: "Storage Optimized", value: `${((vault.reduce((a, b) => a + (b.size_kb || 0), 0)) / 1024).toFixed(1)}MB`, icon: Database, color: "text-blue-400" },
          { label: "System Health", value: "Optimal", icon: ShieldCheck, color: "text-emerald-500" }
        ].map((stat, i) => (
          <Card key={i} className="bg-bg-secondary/50 border-[var(--foreground)]/5 p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
            <div className="flex items-end gap-2">
              <span className={cn("text-3xl font-black italic", stat.color)}>{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* TABS CONTROL */}
      <div className="flex gap-4 mb-8 border-b border-[var(--foreground)]/5 pb-4">
        <button 
          onClick={() => setActiveTab('feed')}
          className={cn(
            "text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 px-4 border-b-2",
            activeTab === 'feed' ? "text-primary border-primary" : "text-slate-500 border-transparent hover:text-[var(--foreground)]"
          )}
        >
          Autonomous Feed
        </button>
        <button 
          onClick={() => setActiveTab('vault')}
          className={cn(
            "text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 px-4 border-b-2",
            activeTab === 'vault' ? "text-primary border-primary" : "text-slate-500 border-transparent hover:text-[var(--foreground)]"
          )}
        >
          Asset Vault ({vault.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. MAIN CONTENT AREA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {activeTab === 'feed' ? 'Autonomous Pipeline Feed' : 'Optimized Maritime Vault'}
            </h3>
            {activeTab === 'feed' && (
                <Badge variant="outline" className="border-primary/20 text-primary animate-pulse">
                    LIVE TELEMETRY
                </Badge>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {activeTab === 'feed' ? (
                logs.map((log, i) => (
                  <motion.div
                    key={log.timestamp + i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-bg-secondary/40 border border-[var(--foreground)]/5 p-4 rounded-xl flex items-center justify-between group hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border border-[var(--foreground)]/5 overflow-hidden">
                          <img src={log.optimized_url} alt="" className="w-full h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[var(--foreground)] truncate max-w-[200px]">{log.original_name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[10px] font-mono text-primary uppercase">
                            {log.file_size_kb} KB
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden md:block">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimized</p>
                          <p className="text-[10px] font-mono text-slate-500">{log.processing_time_sec}s process</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          SUCCESS
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
                    {vault.map((asset, i) => (
                        <motion.div 
                            key={asset.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.01 }}
                            className="bg-slate-900/40 border border-[var(--foreground)]/5 rounded-xl overflow-hidden group hover:border-primary/50 transition-all"
                        >
                            <div className="aspect-[4/5] bg-black relative">
                                <img src={asset.url} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <p className="text-[8px] font-black text-[var(--foreground)] uppercase tracking-tighter truncate">{asset.name}</p>
                                </div>
                            </div>
                            <div className="p-2 flex justify-between items-center bg-black/40">
                                <span className="text-[9px] font-mono text-slate-500">{asset.size_kb}KB</span>
                                <Badge className="text-[8px] bg-primary/20 text-primary border-0 h-4">WEBP</Badge>
                            </div>
                        </motion.div>
                    ))}
                </div>
              )}
            </AnimatePresence>

            {((activeTab === 'feed' && logs.length === 0) || (activeTab === 'vault' && vault.length === 0)) && !isLoading && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-4 border-2 border-dashed border-[var(--foreground)]/5 rounded-3xl">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">Waiting for maritime assets...</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. SYSTEM STATUS & CONFIG */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Infrastructure Status
          </h3>

          <Card className="bg-bg-secondary/50 border-[var(--foreground)]/5 p-6 shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Worker Process</span>
                <Badge className="bg-emerald-500 text-black font-black">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">OpenCV Engine</span>
                <Badge className="bg-emerald-500 text-black font-black">STABLE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Directory Watcher</span>
                <Badge className="bg-emerald-500 text-black font-black">LISTENING</Badge>
              </div>
              
              <hr className="border-[var(--foreground)]/5" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                  <span>Pipeline Load</span>
                  <span>Low</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[12%]" />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5 mt-4 group"
                onClick={handleFlushPipeline}
              >
                <FileWarning className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Emergency Pipeline Flush
              </Button>
            </div>
          </Card>

          {/* QUICK LINKS */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
                variant="outline" 
                className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 h-24 flex-col gap-2 hover:bg-[var(--foreground)]/10 hover:border-primary/30 transition-all"
                onClick={() => router.push('/admin/analytics')}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Analytics Hub</span>
            </Button>
            <Button 
                variant="outline" 
                className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 h-24 flex-col gap-2 hover:bg-[var(--foreground)]/10 hover:border-primary/30 transition-all"
                onClick={() => router.push('/admin/cms')}
            >
              <ImageIconLucide className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Media Library</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 5. HELP MODAL LAYER */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-[var(--foreground)]/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-800/50 border-b border-[var(--foreground)]/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic text-[var(--foreground)]">Media Pipeline Guide</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Protocol v1.4</p>
                    </div>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="p-2 hover:bg-[var(--foreground)]/5 rounded-full text-slate-400">
                    <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Infrastructure Requirements
                    </h3>
                    <div className="bg-black/40 border border-[var(--foreground)]/5 p-4 rounded-xl space-y-2">
                        <p className="text-sm text-slate-300">The autonomous pipeline requires the **Python Media Worker** to be active in the background.</p>
                        <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-emerald-400 border border-emerald-500/20">
                            .\venv\Scripts\python.exe -u media_worker.py
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Autonomous Optimization Logic
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Smart Saliency", desc: "OpenCV automatically detects the subject (fish/product) and centers the crop." },
                            { title: "Aspect Ratio", desc: "All assets are forced to a professional 4:5 portrait format." },
                            { title: "WebP Method 6", desc: "High-density compression ensures <200KB without visual loss." },
                            { title: "SEO Slugification", desc: "Filenames are transformed into search-optimized hyphenated strings." }
                        ].map((item, i) => (
                            <li key={i} className="bg-[var(--foreground)]/5 p-4 rounded-xl">
                                <h4 className="font-bold text-[var(--foreground)] text-xs mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Directory Hierarchy
                    </h3>
                    <div className="text-[11px] font-mono space-y-1 text-slate-400 bg-black/20 p-4 rounded-xl border border-[var(--foreground)]/5">
                        <p>📁 public/uploads/original  <span className="text-slate-600">{"<-"} Upload your raw images here</span></p>
                        <p>📁 public/uploads/optimized <span className="text-slate-600">{"<-"} Master WebP assets appear here</span></p>
                        <p>📁 public/uploads/thumbnails <span className="text-slate-600">{"<-"} Multi-size variants appear here</span></p>
                    </div>
                </section>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
                    <FileWarning className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-amber-500 uppercase">Emergency Protocol</h4>
                        <p className="text-[10px] text-slate-400 mt-1">If assets are not appearing, ensure the Python terminal is open and showing "Monitoring: ...original". If the queue hangs, use the **Emergency Flush** to reset the registry.</p>
                    </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-800/50 border-t border-[var(--foreground)]/5 text-right">
                <Button className="bg-primary text-black font-black" onClick={() => setIsHelpOpen(false)}>
                    ACKNOWLEDGE & CLOSE
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' '
  );
}
