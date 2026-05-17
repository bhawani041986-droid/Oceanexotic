/**
 * FreshHarborSection — Server Component
 * Visualizes the harbor nodes and their latest arrivals.
 */

import Link from 'next/link';
import { getTodaysCatch } from '@/services/catchService';
import { MapPin, Anchor, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function FreshHarborSection() {
  const data = await getTodaysCatch();
  
  // Unique harbor nodes from the data
  const harbors = Array.from(new Set(data.items.map(i => i.harbor_node)));
  
  if (data.status === 'error' || harbors.length === 0) return null;

  return (
    <section className="py-16 md:py-24 container mx-auto px-4 md:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
        
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Navigation className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                Maritime Telemetry
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight uppercase italic leading-[0.9]">
              Harbor <br /><span className="text-primary">Intelligence.</span>
            </h2>
            <p className="text-sm md:text-base text-[var(--foreground)]/50 italic leading-relaxed">
              Real-time synchronization with 8 major Port Blair harbor nodes. We track every haul from the moment the nets are pulled.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[24px] bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/5 space-y-1">
              <p className="text-[24px] font-black text-[var(--foreground)] italic">{harbors.length}</p>
              <p className="text-[9px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">Active Nodes</p>
            </div>
            <div className="p-6 rounded-[24px] bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/5 space-y-1">
              <p className="text-[24px] font-black text-primary italic">{data.total}</p>
              <p className="text-[9px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">Live Hauls</p>
            </div>
          </div>
        </div>

        {/* Right: Harbor Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {harbors.map((harbor, i) => {
            const count = data.items.filter(item => item.harbor_node === harbor).length;
            const latest = data.items.find(item => item.harbor_node === harbor);
            
            return (
              <div 
                key={harbor}
                className="group p-6 md:p-8 rounded-[32px] bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500 relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[60px] group-hover:bg-primary/10 transition-colors" />
                <Anchor className="absolute -bottom-4 -right-4 w-24 h-24 text-[var(--foreground)]/5 -rotate-12" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                      NODE 0{i + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] uppercase italic leading-tight">
                      {harbor}
                    </h3>
                    <p className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em] mt-1">
                      {count} {count === 1 ? 'Species' : 'Species'} Available
                    </p>
                  </div>

                  {latest && (
                    <div className="pt-6 border-t border-[var(--foreground)]/5 space-y-3">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">Latest Arrival</p>
                      <div className="flex items-center gap-3">
                         <span className="text-2xl">{latest.catch_image_url ? '📷' : '🐟'}</span>
                         <div>
                            <p className="text-sm font-black text-[var(--foreground)] uppercase italic">{latest.name}</p>
                            <p className="text-[10px] text-[var(--foreground)]/40">Caught {latest.minutes_since_catch}m ago</p>
                         </div>
                      </div>
                    </div>
                  )}

                  <Link 
                    href={`/todays-catch?harbor=${encodeURIComponent(harbor)}`}
                    className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest pt-4 group-hover:gap-3 transition-all"
                  >
                    SCAN NODE INVENTORY →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
