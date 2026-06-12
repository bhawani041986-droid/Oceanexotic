"use client";

import React, { useState, useEffect } from "react";
import { Link2, Plus, Search, Trash2, ExternalLink, Activity, Target, Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";

export default function SeoBacklinksManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState<string | null>(null);
  const { toast } = useToast();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data, error } = await supabase.from('seo_backlinks').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data);
  };

  const handleAddCampaign = async () => {
    if (!domain) return toast("Domain is required", "error");
    
    const { error } = await supabase.from('seo_backlinks').insert([
      { target_domain: domain, contact_email: email, status: 'prospect', domain_authority: 0 }
    ]);

    if (!error) {
      toast("Outreach prospect added", "success");
      setDomain("");
      setEmail("");
      fetchCampaigns();
    } else {
      toast("Error saving prospect", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('seo_backlinks').delete().eq('id', id);
    fetchCampaigns();
    toast("Campaign deleted", "info");
  };

  const handleSendPitch = async (camp: any) => {
    if (!camp.contact_email) {
      return toast("No contact email found for this prospect", "error");
    }
    
    setIsSending(camp.id);
    try {
      const res = await fetch('/api/seo/send-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: camp.id,
          domain: camp.target_domain,
          email: camp.contact_email,
          anchorText: camp.target_anchor_text || "premium seafood online"
        })
      });
      
      if (res.ok) {
        toast("Automated Pitch Dispatched!", "success");
        fetchCampaigns(); // Will refresh and show status as 'contacted'
      } else {
        toast("Failed to send pitch", "error");
      }
    } catch (e) {
      toast("Error sending pitch", "error");
    } finally {
      setIsSending(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'prospect': return 'bg-blue-500/10 text-blue-500';
      case 'contacted': return 'bg-amber-500/10 text-amber-500';
      case 'negotiating': return 'bg-purple-500/10 text-purple-500';
      case 'live': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-danger/10 text-danger';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--c-text-primary)] uppercase tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-[var(--c-primary)]" />
            Backlink Outreach CRM
          </h1>
          <p className="text-sm text-[var(--c-text-secondary)] mt-1">Manage partner relationships, negotiate link placements, and track Domain Authority improvements.</p>
        </div>
        <div className="flex gap-4">
           <div className="text-center bg-[var(--c-primary)]/10 px-4 py-2 rounded-lg border border-[var(--c-primary)]/20">
              <p className="text-[10px] font-black uppercase text-[var(--c-primary)]">Total Prospects</p>
              <p className="text-xl font-black text-[var(--foreground)]">{campaigns.length}</p>
           </div>
           <div className="text-center bg-success/10 px-4 py-2 rounded-lg border border-success/20">
              <p className="text-[10px] font-black uppercase text-success">Live Links</p>
              <p className="text-xl font-black text-[var(--foreground)]">{campaigns.filter(c => c.status === 'live').length}</p>
           </div>
        </div>
      </div>

      <Card className="p-6 bg-[var(--c-bg-alt)] border-[var(--foreground)]/10">
        <div className="flex gap-4">
          <Input 
            placeholder="Target Domain (e.g., 'seafoodmagazine.com')" 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1"
          />
          <Input 
            placeholder="Contact Email (Optional)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddCampaign} className="bg-[var(--c-primary)] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Prospect
          </Button>
        </div>
      </Card>

      <div className="bg-[var(--c-bg-alt)] rounded-xl border border-[var(--foreground)]/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/10">
            <tr>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Target Domain</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Contact</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Status</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">DA Score</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id} className="border-b border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-colors">
                <td className="p-4 font-bold text-[var(--foreground)] flex items-center gap-2">
                   <Activity className="w-3 h-3 text-[var(--c-primary)]" />
                   {camp.target_domain}
                </td>
                <td className="p-4 text-[var(--c-text-secondary)]">{camp.contact_email || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusColor(camp.status)}`}>
                    {camp.status}
                  </span>
                </td>
                <td className="p-4 font-black italic">{camp.domain_authority || 0}/100</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {camp.status === 'prospect' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendPitch(camp)} 
                      disabled={isSending === camp.id}
                      className="border-[var(--c-primary)]/30 text-[var(--c-primary)] hover:bg-[var(--c-primary)]/10"
                    >
                      <Send className={`w-4 h-4 ${isSending === camp.id ? 'animate-pulse' : ''}`} />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(camp.id)} className="border-danger/30 text-danger hover:bg-danger/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
