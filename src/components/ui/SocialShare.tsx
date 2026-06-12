"use client";

import * as React from "react";
import { Share2, Twitter, Facebook, Link as LinkIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface SocialShareProps {
  url: string;
  title: string;
  text?: string;
}

export function SocialShare({ url, title, text }: SocialShareProps) {
  const { toast } = useToast();
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || `Check out ${title} on OceanExotic!`,
          url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "The product link has been copied to your clipboard.",
      variant: "success"
    });
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleNativeShare} className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary">
        <Share2 className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => window.open(shareUrls.whatsapp, '_blank')} className="rounded-full border-primary/20 hover:bg-[#25D366]/20 hover:text-[#25D366] lg:hidden">
        <Phone className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => window.open(shareUrls.twitter, '_blank')} className="rounded-full border-primary/20 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] hidden lg:inline-flex">
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => window.open(shareUrls.facebook, '_blank')} className="rounded-full border-primary/20 hover:bg-[#4267B2]/20 hover:text-[#4267B2] hidden lg:inline-flex">
        <Facebook className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleCopy} className="rounded-full border-primary/20 hover:bg-white/10 hidden lg:inline-flex">
        <LinkIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
