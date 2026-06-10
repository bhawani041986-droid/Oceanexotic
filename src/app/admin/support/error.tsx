'use client';
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an external reporting service if available
    console.error(error);
  }, [error]);
 
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0B1120] text-white p-10 font-mono">
      <h2 className="text-2xl font-black text-danger mb-4">CRITICAL SUBSYSTEM FAILURE</h2>
      <div className="bg-black/50 p-6 rounded-xl border border-danger/30 w-full max-w-3xl overflow-auto text-xs whitespace-pre-wrap text-left">
        <p className="text-danger mb-4 font-bold">{error.message || 'Unknown Error'}</p>
        <p className="text-slate-400">{error.stack}</p>
      </div>
      <button
        onClick={() => reset()}
        className="mt-8 px-6 py-3 bg-primary text-black font-black uppercase rounded-xl hover:scale-105 transition-all"
      >
        REBOOT SYSTEM
      </button>
    </div>
  );
}
