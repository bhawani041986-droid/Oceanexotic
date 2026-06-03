"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  FileText, 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  Terminal, 
  Lock, 
  Unlock, 
  User, 
  Activity, 
  Globe, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  Eye,
  Radar,
  Bug,
  Database,
  X,
  Code,
  Cpu,
  Clock,
  History
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const MOCK_LOGS = [
  { id: "LOG-10293", timestamp: "2026-05-10 00:15:22", actor: "Admin (Bhawani)", action: "CREDENTIAL_OVERRIDE", resource: "USR-001", status: "AUTHORIZED", severity: "HIGH", ip: "192.168.1.42" },
  { id: "LOG-10292", timestamp: "2026-05-10 00:12:45", actor: "System Node", action: "SECURITY_DISRUPTION_RECOVERY", resource: "ERROR_BOUNDARY", status: "RESOLVED", severity: "CRITICAL", ip: "INTERNAL" },
  { id: "LOG-10291", timestamp: "2026-05-10 00:10:10", actor: "Fleet Merchant", action: "HARVEST_COMMISSION", resource: "PRD-9982", status: "SUCCESS", severity: "INFO", ip: "103.21.54.12" },
  { id: "LOG-10290", timestamp: "2026-05-10 00:08:55", actor: "Unknown Actor", action: "UNAUTHORIZED_ACCESS_ATTEMPT", resource: "/admin/settings", status: "DENIED", severity: "CRITICAL", ip: "45.122.33.101" },
  { id: "LOG-10289", timestamp: "2026-05-10 00:05:30", actor: "Admin (Bhawani)", action: "IDENTITY_COMMISSION", resource: "USR-005", status: "AUTHORIZED", severity: "MEDIUM", ip: "192.168.1.42" },
];

export default function AdminLogsPage() {
  const { toast } = useToast(
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false
  );
  const [selectedLog, setSelectedLog] = useState<any>(null
  );

  const handleThreatAnalysis = () => {
    setIsAnalyzing(true
  );
    toast("Initializing platform-wide threat analysis telemetry...", "info"
  );
    setTimeout(() => {
      setIsAnalyzing(false
  );
      toast("Threat analysis complete. 1 anomalous signal detected and neutralized.", "success"
  );
    }, 3000
  );
  };

  const handleExport = () => {
    toast("Generating encrypted audit manifest for download...", "info"
  );
    
    // Absolute Export Protocol: Constructing Asset Blob
    const data = JSON.stringify(MOCK_LOGS, null, 2
  );
    const blob = new Blob([data], { type: 'application/json' }
  );
    const url = URL.createObjectURL(blob
  );
    const link = document.createElement('a'
  );
    link.href = url;
    link.download = `OCEAN_FRESH_AUDIT_LOG_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link
  );
    link.click(
  );
    document.body.removeChild(link
  );
    URL.revokeObjectURL(url
  );
    
    setTimeout(() => {
      toast("Audit manifest successfully dispatched to your local terminal.", "success"
  );
    }, 1000
  );
  };

  return (

    <div className="space-y-12 animate-fade-in pb-20 relative">
      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl" onClick={() => setSelectedLog(null)} />
           <Card className="max-w-4xl w-full bg-bg-secondary border-primary/20 shadow-glow-purple relative z-10 overflow-hidden">
              <div className="p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center text-primary">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic">Payload Audit: {selectedLog.id}</h3>
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Deep-Level Technical Event Inspection</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="p-3 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 {/* Event Summary */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                       <div className="flex items-center gap-3 text-primary">
                          <User className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">ACTOR NODE</span>
                       </div>
                       <p className="text-sm font-bold text-[var(--foreground)] uppercase">{selectedLog.actor}</p>
                       <p className="text-[10px] font-black text-text-secondary tracking-widest">{selectedLog.ip}</p>
                    </div>
                    <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                       <div className="flex items-center gap-3 text-primary">
                          <Cpu className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">ACTION PATTERN</span>
                       </div>
                       <p className="text-sm font-bold text-[var(--foreground)] uppercase">{selectedLog.action}</p>
                       <Badge variant="glass" className="text-[8px] font-black">{selectedLog.status}</Badge>
                    </div>
                    <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-2">
                       <div className="flex items-center gap-3 text-primary">
                          <Clock className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">TIMESTAMP</span>
                       </div>
                       <p className="text-sm font-bold text-[var(--foreground)] uppercase">{selectedLog.timestamp}</p>
                       <p className="text-[10px] font-black text-text-secondary tracking-widest">UTC +05:30</p>
                    </div>
                 </div>

                 {/* Technical Telemetry Payload */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                       <Code className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">RAW TECHNICAL PAYLOAD</span>
                    </div>
                    <div className="p-8 rounded-[32px] bg-bg-primary/50 border border-[var(--foreground)]/10 font-mono text-[11px] leading-relaxed text-primary overflow-x-auto">
                       <pre>
{`{
  "event_id": "${selectedLog.id}",
  "timestamp": "${selectedLog.timestamp}",
  "actor_node": {
    "name": "${selectedLog.actor}",
    "ip_address": "${selectedLog.ip}",
    "authority_level": "LEVEL_1"
  },
  "action_telemetry": {
    "type": "${selectedLog.action}",
    "resource_target": "${selectedLog.resource}",
    "status_code": "${selectedLog.status === 'AUTHORIZED' ? '200_OK' : '403_FORBIDDEN'}"
  },
  "encryption_layer": "AES-256-GCM",
  "integrity_pulse": "VERIFIED_0x7782"
}`}
                       </pre>
                    </div>
                 </div>

                 <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <p className="text-[10px] font-medium text-text-secondary leading-relaxed italic">
                       This payload has been digitally signed by the OceanExotic Global Governance Layer. 
                       Integrity check was performed on {selectedLog.timestamp}.
                    </p>
                 </div>
              </div>
              <div className="p-8 border-t border-[var(--foreground)]/5 bg-[var(--foreground)]/5 flex justify-end">
                 <Button onClick={() => setSelectedLog(null)} variant="primary" className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple">CLOSE AUDIT</Button>
              </div>
           </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase italic text-primary flex items-center gap-4">
             <Terminal className="w-8 h-8" /> System Audit Ledger
          </h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Monitoring Platform Activity and Security Integrity Handshakes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Input 
              placeholder="SEARCH AUDIT ID..." 
              className="h-12 pl-12 bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[9px] font-black tracking-widest uppercase" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="h-12 px-8 text-[10px] font-black tracking-widest uppercase flex items-center gap-3 border-[var(--foreground)]/10"
          >
             <Download className="w-4 h-4 text-primary" /> EXPORT MANIFEST
          </Button>
        </div>
      </div>

      {/* Threat Analysis Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 p-10 bg-bg-secondary/40 border-primary/20 relative overflow-hidden group shadow-glow-purple">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Radar className="w-32 h-32 text-primary animate-spin-slow" />
            </div>
            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tight">Threat Analysis Engine</h3>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Real-time Anomaly Detection and Intrusion Monitoring</p>
                  </div>
                  <Button 
                    onClick={handleThreatAnalysis}
                    disabled={isAnalyzing}
                    variant="primary" 
                    className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple gap-3"
                  >
                     {isAnalyzing ? <Zap className="w-4 h-4 animate-pulse" /> : <Radar className="w-4 h-4" />}
                     {isAnalyzing ? "ANALYZING..." : "RUN ANALYSIS"}
                  </Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3">
                     <div className="flex items-center justify-between">
                        <Lock className="w-4 h-4 text-success" />
                        <span className="text-[8px] font-black text-success uppercase">SECURE</span>
                     </div>
                     <p className="text-2xl font-black text-[var(--foreground)] italic">0.02%</p>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ERROR RATE</p>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3">
                     <div className="flex items-center justify-between">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-black text-primary uppercase">ACTIVE</span>
                     </div>
                     <p className="text-2xl font-black text-[var(--foreground)] italic">14.2k</p>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">REQUESTS/SEC</p>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3">
                     <div className="flex items-center justify-between">
                        <Bug className="w-4 h-4 text-warning" />
                        <span className="text-[8px] font-black text-warning uppercase">MODERATE</span>
                     </div>
                     <p className="text-2xl font-black text-[var(--foreground)] italic">03</p>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">ANOMALIES</p>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="p-10 bg-bg-secondary/40 border-[var(--foreground)]/5 flex flex-col justify-between">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest italic">Security Status</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">SSL INTEGRITY</p>
                     <Badge variant="success" className="text-[8px] font-black">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">DDOS SHIELD</p>
                     <Badge variant="success" className="text-[8px] font-black">OPTIMAL</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">IP WHITELISTING</p>
                     <Badge variant="warning" className="text-[8px] font-black">PARTIAL</Badge>
                  </div>
               </div>
            </div>
            <Button variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-widest gap-3">
               <Database className="w-4 h-4" /> REINDEX LOGS
            </Button>
         </Card>
      </div>

      {/* Audit Registry Table */}
      <Card className="p-1 overflow-hidden">
        <div className="p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Macro-Activity Manifest</h3>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Global Administrative and System Event History</p>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" size="sm" className="h-10 px-6 flex items-center gap-3 text-[9px] font-black uppercase border-[var(--foreground)]/10">
                 <Filter className="w-4 h-4" /> FILTERS
              </Button>
           </div>
        </div>
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Actor / IP Node</TableHead>
                <TableHead>Action Pattern</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LOGS.map((log) => (
                <TableRow key={log.id} className="group/row">
                  <TableCell className="font-black text-[var(--foreground)] group-hover/row:text-primary transition-colors tracking-widest">{log.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight italic">{log.actor}</p>
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                         <Globe className="w-2.5 h-2.5 text-primary/40" /> {log.ip}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="glass" className="text-[8px] font-black tracking-widest bg-[var(--foreground)]/5 border-none">
                        {log.action}
                     </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-[var(--foreground)] italic text-xs">{log.resource}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          log.severity === "CRITICAL" ? "bg-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                          log.severity === "HIGH" ? "bg-warning" : "bg-primary"
                        )} />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          log.severity === "CRITICAL" ? "text-danger" : "text-text-secondary"
                        )}>{log.severity}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      log.status === "AUTHORIZED" || log.status === "SUCCESS" || log.status === "RESOLVED" ? "success" : "danger"
                    }>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <button className="p-2.5 rounded-full hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all" onClick={() => setSelectedLog(log)}>
                        <Eye className="w-4 h-4" />
                     </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3 p-4">
          {MOCK_LOGS.map((log) => (
            <div key={log.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="font-black text-[var(--foreground)] italic text-sm tracking-widest">{log.id}</p>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{log.actor}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={log.status === "AUTHORIZED" || log.status === "SUCCESS" || log.status === "RESOLVED" ? "success" : "danger"} className="text-[7px] font-black uppercase tracking-widest px-2">{log.status}</Badge>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", log.severity === "CRITICAL" ? "bg-danger animate-pulse" : log.severity === "HIGH" ? "bg-warning" : "bg-primary")} />
                    <span className={cn("text-[7px] font-black uppercase tracking-widest", log.severity === "CRITICAL" ? "text-danger" : "text-text-secondary opacity-60")}>{log.severity}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Action</p>
                  <p className="text-[9px] font-black text-primary italic uppercase tracking-tight">{log.action}</p>
                </div>
                <button onClick={() => setSelectedLog(log)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all border border-[var(--foreground)]/5">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  
  );
}
