/**
 * /todays-catch — SEO-optimized Server Component Page
 * Showcases live today's harbor catch for Port Blair searchers.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTodaysCatch, getLimitedCatch } from '@/services/catchService';
import TodaysCatchSection, { TodaysCatchSkeleton } from '@/components/marketplace/TodaysCatchSection';
import LimitedDailySection from '@/components/marketplace/LimitedDailySection';
import FreshnessIndicator from '@/components/marketplace/FreshnessIndicator';

// Dynamic metadata — date changes daily for SEO freshness
export async function generateMetadata(): Promise<Metadata> {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return {
    title: `Today's Fresh Catch | Port Blair Seafood Market — ${today}`,
    description: `Fresh fish and seafood available today in Port Blair, Andaman. Live harbor inventory from Aberdeen Bazaar, Phoenix Bay, Haddo Wharf and more. Order now for same-day delivery.`,
    keywords: [
      "today's catch Port Blair", "fresh fish Andaman", "live seafood Port Blair",
      "harbor fish market", "Aberdeen Bazaar fish", "Phoenix Bay seafood",
      "fresh surmai Port Blair", "tuna Andaman", "prawns Port Blair"
    ],
    openGraph: {
      title: `Today's Fresh Harbor Catch — Port Blair`,
      description: `Live seafood inventory from Port Blair's finest harbors. Fresh catches updated daily.`,
      type: 'website',
    },
  };
}

// JSON-LD structured data
function TodaysCatchJsonLd() {
  const today = new Date().toISOString().slice(0, 10);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'OceanExotic — Port Blair Seafood Market',
    description: 'Live daily harbor seafood marketplace for Port Blair, Andaman Islands',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Port Blair',
      addressRegion: 'Andaman and Nicobar Islands',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.6234,
      longitude: 92.7265,
    },
    openingHours: 'Mo-Su 05:00-22:00',
    priceRange: '₹180–₹4500/kg',
    servesCuisine: 'Seafood',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Today's Live Harbor Catch — ${today}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function TodaysCatchPage() {
  // Parallel data fetching
  const [catchData, limitedData] = await Promise.all([
    getTodaysCatch(),
    getLimitedCatch(),
  ]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <>
      <TodaysCatchJsonLd />

      <main className="min-h-screen bg-bg-primary">

        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-[var(--foreground)]/5">
          <div className="container mx-auto px-4 md:px-10">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                  Live Harbor Inventory · Updated in Real-time
                </p>
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-[var(--foreground)] tracking-tight uppercase italic leading-none">
                Today&apos;s<br />
                <span className="text-primary">Fresh Catch</span>
              </h1>
              <p className="text-sm md:text-base text-[var(--foreground)]/60 font-medium max-w-xl">
                Fresh fish and seafood directly from Port Blair&apos;s harbors — Aberdeen Bazaar, Phoenix Bay, Haddo Wharf, and more.
                Inventory is live and expires at midnight.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {['Aberdeen Bazaar Jetty', 'Phoenix Bay Harbor', 'Haddo Wharf', 'Junglighat Pier', 'Dollygunj Jetty'].map((node) => (
                  <span key={node} className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/60">
                    🚢 {node}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="border-b border-[var(--foreground)]/5 bg-[var(--foreground)]/[0.02]">
          <div className="container mx-auto px-4 md:px-10 py-4">
            <div className="flex flex-wrap gap-6 md:gap-12">
              <div>
                <p className="text-[8px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Species Today</p>
                <p className="text-lg md:text-2xl font-black text-[var(--foreground)]">{catchData.total}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Selling Fast</p>
                <p className="text-lg md:text-2xl font-black text-orange-400">{limitedData.total}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Date</p>
                <p className="text-sm md:text-base font-black text-[var(--foreground)]">{today}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Harbor Nodes</p>
                <p className="text-lg md:text-2xl font-black text-primary">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Limited / Selling Fast */}
        <LimitedDailySection items={limitedData.items} />

        {/* Full today's catch */}
        <Suspense fallback={<TodaysCatchSkeleton />}>
          <TodaysCatchSection />
        </Suspense>

      </main>
    </>
  );
}
