"use client";

import React, { useState, useEffect } from "react";
import { Link2, Plus, Search, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";

export default function SeoLinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase.from('seo_internal_links').select('*').order('created_at', { ascending: false });
    if (data) setLinks(data);
  };

  const handleAddLink = async () => {
    if (!keyword || !url) return toast("Fill all fields", "error");
    
    const { error } = await supabase.from('seo_internal_links').insert([
      { keyword, target_url: url, match_type: 'exact' }
    ]);

    if (!error) {
      toast("Link mapping added successfully", "success");
      setKeyword("");
      setUrl("");
      fetchLinks();
    } else {
      toast("Error saving link", "error");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('seo_internal_links').delete().eq('id', id);
    fetchLinks();
    toast("Link mapped deleted", "info");
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--c-text-primary)] uppercase tracking-tight flex items-center gap-3">
            <Link2 className="w-8 h-8 text-[var(--c-primary)]" />
            Internal Link Strategy
          </h1>
          <p className="text-sm text-[var(--c-text-secondary)] mt-1">Map high-value keywords to product URLs to enforce internal SEO architecture.</p>
        </div>
      </div>

      <Card className="p-6 bg-[var(--c-bg-alt)] border-[var(--foreground)]/10">
        <div className="flex gap-4">
          <Input 
            placeholder="Focus Keyword (e.g., 'Bluefin Tuna')" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <Input 
            placeholder="Target URL (/customer/products/bluefin-tuna)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddLink} className="bg-[var(--c-primary)] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Mapping
          </Button>
        </div>
      </Card>

      <div className="bg-[var(--c-bg-alt)] rounded-xl border border-[var(--foreground)]/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--foreground)]/5 border-b border-[var(--foreground)]/10">
            <tr>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Keyword Match</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Destination URL</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs">Match Type</th>
              <th className="p-4 font-bold text-[var(--c-text-secondary)] uppercase text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-colors">
                <td className="p-4 font-bold text-[var(--foreground)]">{link.keyword}</td>
                <td className="p-4 text-[var(--c-primary)] truncate max-w-xs hover:underline cursor-pointer">
                  <a href={link.target_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    {link.target_url} <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="p-4">
                  <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold uppercase">{link.match_type}</span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleDelete(link.id)} className="border-danger/30 text-danger hover:bg-danger/10">
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
