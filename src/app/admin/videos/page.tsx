"use client";

import React, { useState, useEffect } from "react";
import { supabaseFrontend as supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Plus, Video, Trash2, Link as LinkIcon, RefreshCw } from "lucide-react";

export default function AdminVideosPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [isUploading, setIsUploading] = useState(false);
  const [productId, setProductId] = useState("");
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all products to link videos to via the secure server API (Bypasses RLS)
      const res = await fetch('/api/seller/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);

      // Get all uploaded videos
      const { data: vidData } = await supabase.from('product_videos').select('*').order('created_at', { ascending: false });
      if (vidData) setVideos(vidData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !productId) {
      toast("Please select a video file and attach it to a product.", "error");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product_videos')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('product_videos')
        .getPublicUrl(filePath);

      // 3. Insert into Database
      const { error: dbError } = await supabase
        .from('product_videos')
        .insert({
          product_id: productId,
          video_url: urlData.publicUrl,
          title: title || "Product Showcase",
          is_active: 1
        });

      if (dbError) throw dbError;

      toast("Video uploaded and published successfully!", "success");
      setVideoFile(null);
      setTitle("");
      setProductId("");
      fetchData();
    } catch (err: any) {
      console.error("Upload failed", err);
      toast(`Upload failed: ${err.message}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this video showcase?")) return;
    try {
      await supabase.from('product_videos').delete().eq('id', id);
      toast("Video deleted.", "success");
      fetchData();
    } catch (e) {
      toast("Failed to delete video.", "error");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Video className="w-8 h-8 text-primary" /> Ocean Reels Management
          </h1>
          <p className="text-sm text-text-secondary">Upload engaging vertical videos to be showcased on the customer homepage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleUpload} className="bg-bg-card border border-[var(--foreground)]/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-[var(--foreground)]/10 pb-4">Upload New Video</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Select Product</label>
              <select 
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl px-4 text-sm focus:border-primary outline-none"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Video Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Fresh Tuna Catch"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Video File (MP4/WebM)</label>
              <input 
                type="file" 
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
              />
            </div>

            <Button type="submit" disabled={isUploading} className="w-full h-12">
              {isUploading ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> UPLOADING...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> PUBLISH REEL</>
              )}
            </Button>
          </form>
        </div>

        {/* Video Feed */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              <p className="text-text-secondary">Loading videos...</p>
            ) : videos.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[var(--foreground)]/20 rounded-2xl bg-[var(--foreground)]/5">
                <Video className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold">No Videos Uploaded</h3>
                <p className="text-sm text-text-secondary">Upload your first showcase video to see it here.</p>
              </div>
            ) : (
              videos.map((vid) => (
                <div key={vid.id} className="bg-bg-card border border-[var(--foreground)]/10 rounded-2xl overflow-hidden group">
                  <div className="aspect-[9/16] bg-black relative">
                    <video src={vid.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" controls />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded">ACTIVE</span>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm truncate">{vid.title}</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-1 mt-1">
                        <LinkIcon className="w-3 h-3" /> {products.find(p => p.id === vid.product_id)?.name || vid.product_id}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(vid.id)} className="p-2 text-danger/70 hover:text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
