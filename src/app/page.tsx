/**
 * OceanExotic Homepage — Server Component
 * Integrated Live Harbor Marketplace.
 */

import { Suspense } from 'react';
import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeHero from '@/components/home/HomeHero';
import TodaysCatchSection, { TodaysCatchSkeleton } from '@/components/marketplace/TodaysCatchSection';
import MorningCatchSection from '@/components/marketplace/MorningCatchSection';
import FreshHarborSection from '@/components/marketplace/FreshHarborSection';
import LimitedDailySection from '@/components/marketplace/LimitedDailySection';
import { getLimitedCatch } from '@/services/catchService';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default async function HomePage() {
  const limitedData = await getLimitedCatch();

  return (
    <HomeClientWrapper>
      {/* 1. Hero Section */}
      <HomeHero />

      {/* 2. Morning Catch — High Urgency */}
      <Suspense fallback={<TodaysCatchSkeleton />}>
        <MorningCatchSection />
      </Suspense>

      {/* 3. Today's Full Catch — Main Marketplace */}
      <Suspense fallback={<TodaysCatchSkeleton />}>
        <TodaysCatchSection />
      </Suspense>

      {/* 4. Limited Daily Section — Selling Fast */}
      {limitedData.total > 0 && (
        <LimitedDailySection items={limitedData.items} />
      )}

      {/* 5. Fresh Harbor Section — Node Intelligence */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-[var(--foreground)]/5" />}>
        <FreshHarborSection />
      </Suspense>

      {/* 6. Static / Secondary Sections */}
      <section className="py-24 container mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-[var(--foreground)] uppercase italic leading-none">
              Direct From <br /><span className="text-primary">Source.</span>
            </h2>
            <p className="text-lg text-[var(--foreground)]/60 font-medium italic">
              We eliminate middlemen. Our fleet syncs directly with local fishermen to bring you the freshest catch within hours of arrival.
            </p>
            <div className="flex gap-4">
              <Link href="/customer/products" className="h-14 px-10 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                SHOP ALL SEAFOOD
              </Link>
            </div>
          </div>
          <Card className="aspect-video bg-[var(--foreground)]/5 rounded-[48px] overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover" 
              alt="Fleet" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </Card>
        </div>
      </section>

    </HomeClientWrapper>
  );
}
