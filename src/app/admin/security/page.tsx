"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  Globe, 
  Fingerprint,
  RotateCcw,
  ShieldAlert,
  Eye,
  EyeOff,
  UserCheck,
  Server,
  Zap,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function AdminSecurityPage() {
  const { toast } = useToast(
  );
  const [activeTab, setActiveTab] = useState<"auth" | "keys" | "sessions">("auth"
  );
  const [isRotating, setIsRotating] = useState(false
  );
  const [ipWhitelist, setIpWhitelist] = useState(""
  );
  
  // Security States
  const [mfaMethods, setMfaMethods] = useState([
    { label: "Biometric Handshake", desc: "Require FaceID/TouchID for admin nodes.", active: true },
    { label: "Authenticator App (TOTP)", desc: "Mandatory 6-digit dynamic signal codes.", active: true },
    { label: "SMS Fallback Registry", desc: "Emergency backup via authorized mobile nodes.", active: false },
    { label: "Hardware Security Key", desc: "Support for YubiKey / FIDO2 protocols.", active: false },
  ]
  );

  const [sessions, setSessions] = useState([
    { id: 1, user: "Admiral Morgan", device: "macOS • Chrome v124", ip: "192.168.1.42", location: "Global Fleet HQ", status: "CURRENT" },
    { id: 2, user: "Fleet Master Jin", device: "Windows 11 • Edge v122", ip: "45.12.8.210", location: "Pacific Node", status: "ACTIVE" },
    { id: 3, user: "Sea Scout Sarah", device: "iPhone 15 • Safari Mobile", ip: "103.4.22.15", location: "Mobile Node", status: "ACTIVE" },
  ]
  );

  const toggleMfa = (label: string) => {
    setMfaMethods(prev => prev.map(m => 
      m.label === label ? { ...m, active: !m.active } : m
    )
  );
    toast(`${label} configuration updated.`, "info"
  );
  };

  const handleTerminateSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id)
  );
    toast("Administrative session terminated successfully.", "success"
  );
  };

  const handleRotateKeys = () => {
    setIsRotating(true
  );
    setTimeout(() => {
      setIsRotating(false
  );
      toast("Global encryption keys rotated and re-indexed.", "success"
  );
    }, 2000
  );
  };

  return (

    <>
      <div className="space-y-[10px] md:space-y-12 animate-fade-in pb-32 lg:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
          <div className="space-y-[2px] md:space-y-1 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Sentinel Defense Hub</h2>
            <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing the Encryption and Access Protocols of the Global Maritime Network</p>
          </div>
          <div className="flex bg-bg-secondary p-[4px] md:p-1 rounded-[16px] border border-[var(--foreground)]/5 shadow-premium overflow-x-auto no-scrollbar">
             {[
               { id: "auth", label: "AUTH", icon: <UserCheck className="w-3 md:w-3.5 h-3 md:h-3.5" /> },
               { id: "keys", label: "ENCRYPTION", icon: <Key className="w-3 md:w-3.5 h-3 md:h-3.5" /> },
               { id: "sessions", label: "SESSIONS", icon: <Server className="w-3 md:w-3.5 h-3 md:h-3.5" /> },
             ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3 md:px-6 h-8 md:h-10 rounded-[12px] text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic whitespace-nowrap",
                    activeTab === tab.id ? "bg-primary text-[var(--foreground)] shadow-glow-purple" : "text-text-secondary hover:text-[var(--foreground)]"
                  )}
                >
                   {tab.icon} {tab.label}
                </button>
             ))}
          </div>
        </div>

        {activeTab === "auth" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <Card className="p-[10px] md:p-6 space-y-[10px] md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[40px] shadow-premium">
                 <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-3 md:pb-6">
                    <Fingerprint className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                    <h3 className="text-xs md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Multi-Factor Governance</h3>
                 </div>
                 <div className="space-y-[6px] md:space-y-4">
                    {mfaMethods.map((method) => (
                       <div 
                         key={method.label} 
                         onClick={() => toggleMfa(method.label)}
                         className="flex items-center justify-between p-[10px] md:p-5 rounded-[12px] md:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-primary/20 transition-all group cursor-pointer"
                       >
                          <div className="space-y-[1px] md:space-y-1">
                             <p className="text-[9px] md:text-sm font-black text-[var(--foreground)] tracking-tighter uppercase italic">{method.label}</p>
                             <p className="text-[6px] md:text-[9px] text-text-secondary italic font-black uppercase tracking-widest opacity-60">{method.desc}</p>
                          </div>
                          <div className={cn(
                             "w-8 md:w-12 h-4 md:h-6 rounded-full relative transition-colors",
                             method.active ? "bg-primary shadow-glow-purple" : "bg-[var(--foreground)]/10"
                          )}>
                             <div className={cn(
                                "w-3 md:w-4 h-3 md:h-4 bg-white rounded-full absolute top-[2px] md:top-1 transition-transform",
                                method.active ? "translate-x-4.5 md:translate-x-7" : "translate-x-0.5"
                             )} />
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>

               <Card className="p-[10px] md:p-6 space-y-[15px] md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[40px] shadow-premium">
                 <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-3 md:pb-6">
                    <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                    <h3 className="text-xs md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Access Restrictions</h3>
                 </div>
                 <div className="space-y-[15px] md:space-y-8">
                    <div className="space-y-[4px] md:space-y-2">
                       <label className="text-[7px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">IP Whitelist Registry</label>
                       <div className="relative">
                          <Input 
                            value={ipWhitelist}
                            onChange={(e) => setIpWhitelist(e.target.value)}
                            placeholder="ENTER AUTHORIZED IP ADDRESSES..." 
                            className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[8px] md:text-xs font-black uppercase italic rounded-[8px] md:rounded-xl" 
                          />
                          <Globe className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-primary opacity-40" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                       <div className="space-y-[4px] md:space-y-2">
                          <label className="text-[7px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Session Timeout</label>
                          <select defaultValue="30 MINUTES" className="w-full h-10 md:h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[8px] md:rounded-xl px-3 md:px-4 text-[8px] md:text-xs font-black text-[var(--foreground)] outline-none focus:border-primary/50 uppercase italic">
                             <option>15 MINUTES</option>
                             <option>30 MINUTES</option>
                             <option>1 HOUR</option>
                          </select>
                       </div>
                       <div className="space-y-[4px] md:space-y-2">
                          <label className="text-[7px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-60">Max Login Attempts</label>
                          <select defaultValue="5 ATTEMPTS" className="w-full h-10 md:h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[8px] md:rounded-xl px-3 md:px-4 text-[8px] md:text-xs font-black text-[var(--foreground)] outline-none focus:border-primary/50 uppercase italic">
                             <option>3 ATTEMPTS</option>
                             <option>5 ATTEMPTS</option>
                             <option>10 ATTEMPTS</option>
                          </select>
                       </div>
                    </div>
                    <Button className="w-full h-12 md:h-14 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple italic rounded-[12px] md:rounded-xl" onClick={() => toast("Administrative access protocols synchronized.", "success")}>
                       SAVE SECURITY DIRECTIVES
                    </Button>
                 </div>
              </Card>
          </div>
        )}

        {activeTab === "keys" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="p-[10px] md:p-6 space-y-[10px] md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[40px] shadow-premium">
                 <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-3 md:pb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                       <Key className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                       <h3 className="text-xs md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Encryption Key Management</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleRotateKeys}
                      disabled={isRotating}
                      className="h-8 md:h-10 px-2 md:px-6 text-[7px] md:text-[9px] font-black tracking-widest uppercase border-[var(--foreground)]/10 gap-1.5 md:gap-3 rounded-[8px] md:rounded-xl italic"
                    >
                       <RefreshCw className={cn("w-3 md:w-4 h-3 md:h-4 shadow-glow-purple/20", isRotating && "animate-spin")} /> {isRotating ? "ROTATING..." : "ROTATE KEYS"}
                    </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {[
                      { label: "API SECRET KEY", type: "RSA-4096", status: "ACTIVE", value: "****************************************" },
                      { label: "DATABASE ENCRYPTION KEY", type: "AES-256", status: "ACTIVE", value: "****************************************" },
                      { label: "JWT SIGNING SECRET", type: "HS256", status: "ACTIVE", value: "****************************************" },
                      { label: "BACKUP MASTER KEY", type: "RSA-4096", status: "ROTATION REQUIRED", value: "****************************************" },
                    ].map((key) => (
                       <div key={key.label} className="p-[10px] md:p-5 rounded-[12px] md:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3 md:space-y-6 group hover:border-primary/30 transition-all">
                          <div className="flex justify-between items-start">
                             <div className="space-y-[1px] md:space-y-1">
                                <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{key.label}</p>
                                <p className="text-[6px] md:text-[8px] text-text-secondary font-black uppercase tracking-widest italic opacity-60">{key.type} Registry</p>
                             </div>
                             <Badge variant={key.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[6px] md:text-[8px] italic px-1.5 md:px-2">{key.status}</Badge>
                          </div>
                          <div className="relative">
                             <Input type="password" value={key.value} disabled className="h-9 md:h-10 bg-black/20 border-dashed border-[var(--foreground)]/10 rounded-[6px] md:rounded-lg text-[8px] md:text-xs" />
                             <button className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors">
                                <Eye className="w-3 md:w-4 h-3 md:h-4" />
                             </button>
                          </div>
                          <Button variant="ghost" onClick={handleRotateKeys} className="w-full h-8 md:h-9 text-[7px] md:text-[9px] font-black tracking-widest uppercase text-primary hover:bg-primary/10 rounded-[6px] md:rounded-lg italic">ROTATE THIS KEY</Button>
                       </div>
                    ))}
                 </div>
              </Card>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <Card className="p-1 overflow-hidden bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[40px] shadow-premium">
                 <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                       <Server className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary shadow-glow-purple" />
                       <h3 className="text-xs md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Authorized Administrative Sessions</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSessions(sessions.filter(s => s.status === 'CURRENT')
  );
                        toast("All external administrative sessions terminated.", "success"
  );
                      }}
                      className="h-8 md:h-10 px-2 md:px-6 text-[7px] md:text-[9px] font-black tracking-widest uppercase text-danger border-danger/20 hover:bg-danger hover:text-[var(--foreground)] transition-all rounded-[8px] italic"
                    >
                       TERMINATE OTHERS
                    </Button>
                 </div>
                 <div className="p-[8px] md:p-6 space-y-[6px] md:space-y-4">
                    {sessions.map((session) => (
                       <div key={session.ip} className="flex items-center justify-between p-[10px] md:p-5 rounded-[12px] md:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-3 md:gap-6">
                             <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-glow-purple/10">
                                <Smartphone className="w-4 md:w-6 h-4 md:h-6" />
                             </div>
                             <div className="space-y-[1px] md:space-y-1">
                                <div className="flex items-center gap-2 md:gap-3">
                                   <p className="font-black text-[var(--foreground)] text-[10px] md:text-sm uppercase tracking-tighter italic">{session.user}</p>
                                   {session.status === 'CURRENT' && <Badge variant="success" className="text-[5px] md:text-[7px] px-1 md:px-1.5 italic">THIS SESSION</Badge>}
                                </div>
                                <p className="text-[7px] md:text-[10px] text-text-secondary uppercase tracking-widest font-black italic opacity-60">{session.device} • {session.ip}</p>
                                <p className="text-[6px] md:text-[9px] text-text-secondary italic font-black uppercase tracking-widest opacity-40">Location: {session.location}</p>
                             </div>
                          </div>
                          {session.status !== 'CURRENT' && (
                            <Button 
                              variant="ghost" 
                              onClick={() => handleTerminateSession(session.id)}
                              className="h-7 md:h-9 px-2 md:px-4 text-[7px] md:text-[9px] font-black tracking-widest uppercase text-danger hover:bg-danger/10 rounded-[6px] italic"
                            >
                              TERMINATE
                            </Button>
                          )}
                       </div>
                    ))}
                 </div>
              </Card>
          </div>
        )}

        {/* Global Security Pulse */}
        <div className="flex items-center justify-center gap-10 opacity-30 pt-10">
           <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-success" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">TLS 1.3 PROTOCOL ACTIVE</span>
           </div>
           <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest">REAL-TIME THREAT DETECTION ACTIVE</span>
           </div>
        </div>
      </div>
    </>
  
  );
}
