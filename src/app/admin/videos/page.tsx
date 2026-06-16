"use client";

import React, { useState, useEffect } from "react";
import { supabaseFrontend as supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Plus, Video, Trash2, Link as LinkIcon, RefreshCw, Edit } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

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
  const [sortOrder, setSortOrder] = useState<number>(3); // Default grid position to 3
  
  // Edit modal state
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProductId, setEditProductId] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(3);
  const [editIsActive, setEditIsActive] = useState<number>(1);
  const [editVideoUrl, setEditVideoUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all products to link videos to via the secure server API (Bypasses RLS)
      try {
        const res = await fetch('/api/seller/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }

      // Get all uploaded videos via secure server API
      const vidRes = await fetch('/api/admin/videos');
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        if (Array.isArray(vidData)) setVideos(vidData);
      } else {
        console.error("Videos API returned non-ok status");
      }
    } catch (e) {
      console.error("fetchData exception:", e);
      toast("Failed to load catalog or videos.", "error");
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

      // 3. Insert into Database and sync products via secure API
      const dbRes = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          video_url: urlData.publicUrl,
          title: title || "Product Showcase",
          sort_order: sortOrder
        })
      });

      if (!dbRes.ok) {
        const errData = await dbRes.json();
        throw new Error(errData.error || "Failed to save video database entry");
      }

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

  const handleToggleActive = async (vid: any) => {
    try {
      const newStatus = vid.is_active === 1 ? 0 : 1;
      
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vid.id,
          is_active: newStatus,
          product_id: vid.product_id,
          video_url: vid.video_url
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update video status");
      }
        
      toast(newStatus === 1 ? "Video turned ON" : "Video turned OFF", "success");
      fetchData();
    } catch (e: any) {
      toast(`Failed to toggle video status: ${e.message}`, "error");
    }
  };

  const handleDelete = async (vid: any) => {
    if (!confirm("Are you sure you want to delete this video showcase?")) return;
    try {
      const res = await fetch(`/api/admin/videos?id=${vid.id}&product_id=${vid.product_id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete video");
      }
      
      toast("Video deleted.", "success");
      fetchData();
    } catch (e: any) {
      toast(`Failed to delete video: ${e.message}`, "error");
    }
  };

  const openEditModal = (vid: any) => {
    setEditingVideo(vid);
    setEditTitle(vid.title || "");
    setEditProductId(vid.product_id || "");
    setEditSortOrder(vid.sort_order || 3);
    setEditIsActive(vid.is_active);
    setEditVideoUrl(vid.video_url || "");
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingVideo.id,
          title: editTitle,
          product_id: editProductId,
          sort_order: editSortOrder,
          is_active: editIsActive,
          video_url: editVideoUrl
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update video");
      }
      toast("Video updated successfully!", "success");
      setEditingVideo(null);
      fetchData();
    } catch (err: any) {
      toast(`Update failed: ${err.message}`, "error");
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
                className="w-full h-12 bg-bg-card border border-[var(--border)] rounded-xl px-4 text-sm focus:border-primary outline-none text-text-primary"
              >
                <option value="" className="bg-bg-card text-text-primary">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-bg-card text-text-primary">{p.name} ({p.id})</option>
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

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Grid Position (e.g. 3)</label>
              <Input 
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="h-12 rounded-xl"
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
                <div key={vid.id} className={`bg-bg-card border ${vid.is_active === 1 ? 'border-[var(--foreground)]/10' : 'border-danger/30 opacity-70'} rounded-2xl overflow-hidden group transition-all`}>
                  <div className="aspect-[9/16] bg-black relative">
                    <video src={vid.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" controls />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {vid.is_active === 1 ? (
                        <span className="bg-green-500/80 text-white text-[10px] font-bold px-2 py-1 rounded">ACTIVE</span>
                      ) : (
                        <span className="bg-danger/80 text-white text-[10px] font-bold px-2 py-1 rounded">OFF</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm truncate">{vid.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> {products.find(p => p.id === vid.product_id)?.name || vid.product_id}
                        </p>
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                          POS: {vid.sort_order || 3}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(vid)}
                        className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-xs font-bold"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleToggleActive(vid)} 
                        className={`p-2 rounded-lg transition-colors text-xs font-bold ${vid.is_active === 1 ? 'text-warning/80 bg-warning/10 hover:bg-warning/20' : 'text-success bg-success/10 hover:bg-success/20'}`}
                      >
                        {vid.is_active === 1 ? 'TURN OFF' : 'TURN ON'}
                      </button>
                      <button onClick={() => handleDelete(vid)} className="p-2 text-danger/70 hover:text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <Modal 
        isOpen={!!editingVideo} 
        onClose={() => setEditingVideo(null)}
        title="Edit Video Showcase"
        description="Modify video details, linked product, and slot placement position."
      >
        <form onSubmit={handleUpdateVideo} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Linked Product</label>
            <select 
              value={editProductId}
              onChange={(e) => setEditProductId(e.target.value)}
              className="w-full h-12 bg-bg-card border border-[var(--border)] rounded-xl px-4 text-sm focus:border-primary outline-none text-text-primary"
            >
              <option value="" className="bg-bg-card text-text-primary">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-bg-card text-text-primary">{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Video Title</label>
            <Input 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="E.g., Fresh Tuna Catch"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Grid Placement Position (e.g. 3)</label>
            <Input 
              type="number"
              min="1"
              value={editSortOrder}
              onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 1)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Video Link URL</label>
            <Input 
              value={editVideoUrl}
              onChange={(e) => setEditVideoUrl(e.target.value)}
              placeholder="https://..."
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Status</label>
            <select
              value={editIsActive}
              onChange={(e) => setEditIsActive(parseInt(e.target.value))}
              className="w-full h-12 bg-bg-card border border-[var(--border)] rounded-xl px-4 text-sm focus:border-primary outline-none text-text-primary"
            >
              <option value={1} className="bg-bg-card text-text-primary">Active (Shown on Home)</option>
              <option value={0} className="bg-bg-card text-text-primary">Inactive (Hidden)</option>
            </select>
          </div>
          <div className="pt-4 flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditingVideo(null)} className="flex-1 h-12 text-[10px] font-black uppercase">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-[10px] font-black uppercase">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
