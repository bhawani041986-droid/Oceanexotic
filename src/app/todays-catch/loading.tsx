import { TodaysCatchSkeleton } from '@/components/marketplace/TodaysCatchSection';

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="h-64 border-b border-[var(--foreground)]/5 animate-pulse bg-[var(--foreground)]/[0.02]" />
      <TodaysCatchSkeleton />
    </div>
  );
}
