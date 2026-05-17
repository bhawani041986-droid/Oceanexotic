<?php
// OceanFresh Global Sovereign Gateway
// This node bridges the XAMPP environment with the Next.js High-Fidelity App.

$node_port = 3000;
$app_url = "http://localhost:" . $node_port;
?>
<!DOCTYPE html>
<html lang="en" className="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OceanFresh | Global Sovereign Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { 
            background: #0F172A; 
            color: #F8FAFC; 
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        .shadow-glow-purple { box-shadow: 0 0 40px rgba(124, 58, 237, 0.15); }
        .shadow-glow-red { box-shadow: 0 0 40px rgba(239, 68, 68, 0.15); }
        .glass { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
    </style>
</head>
<body className="antialiased">
    <div class="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Atmosphere */}
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent_70%)]"></div>
        
        {/* Top Command Bar */}
        <header class="h-20 glass flex items-center justify-between px-10 relative z-50">
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 bg-purple-600 rounded-lg rotate-45 shadow-glow-purple"></div>
                <div class="font-black text-xl tracking-tighter uppercase">OceanFresh <span class="text-purple-500 opacity-50 font-medium">| GATEWAY</span></div>
            </div>
            <div id="status-node" class="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-2 rounded-full">
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-[10px] font-black uppercase tracking-widest text-red-500">Node Offline</span>
            </div>
        </header>

        {/* Global Access Hub */}
        <div class="flex-1 flex items-center justify-center p-10 relative z-10">
            <div class="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-10">
                    <div class="space-y-4">
                        <h1 class="text-6xl font-black tracking-tighter uppercase leading-none">Absolute <br/><span class="text-purple-600">App Access.</span></h1>
                        <p class="text-lg text-slate-400 font-medium italic max-w-md">The global maritime registry is now fully operational. Select your node to commission your session.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <a href="<?php echo $app_url; ?>/customer" target="_blank" class="glass p-8 rounded-[24px] hover:border-purple-500/40 transition-all group">
                            <div class="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">NAVIGATOR</div>
                            <div class="text-xl font-bold uppercase mb-4">Marketplace</div>
                            <div class="text-xs text-slate-500 italic">Browse premium harvests.</div>
                        </a>
                        <a href="<?php echo $app_url; ?>/seller/dashboard" target="_blank" class="glass p-8 rounded-[24px] hover:border-green-500/40 transition-all group">
                            <div class="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">MERCHANT</div>
                            <div class="text-xl font-bold uppercase mb-4">Command</div>
                            <div class="text-xs text-slate-500 italic">Manage your fleet yields.</div>
                        </a>
                        <a href="<?php echo $app_url; ?>/admin/dashboard" target="_blank" class="glass p-8 rounded-[24px] hover:border-amber-500/40 transition-all group">
                            <div class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">ADMIRAL</div>
                            <div class="text-xl font-bold uppercase mb-4">Authority</div>
                            <div class="text-xs text-slate-500 italic">System governance.</div>
                        </a>
                        <a href="<?php echo $app_url; ?>/onboarding" target="_blank" class="glass p-8 rounded-[24px] hover:border-blue-500/40 transition-all group">
                            <div class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">REGISTRY</div>
                            <div class="text-xl font-bold uppercase mb-4">Onboarding</div>
                            <div class="text-xs text-slate-500 italic">Commission identity.</div>
                        </a>
                    </div>
                </div>

                <div class="relative">
                    <div class="glass rounded-[32px] overflow-hidden aspect-video shadow-glow-purple border-purple-500/20 relative group">
                        <iframe id="live-node" src="<?php echo $app_url; ?>" class="w-full h-full border-none opacity-0 transition-opacity duration-1000"></iframe>
                        
                        {/* Offline Fallback */}
                        <div id="offline-node" class="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div class="w-20 h-20 rounded-[24px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-glow-red">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-xl font-black uppercase tracking-tight">Signal Interrupted.</h3>
                                <p class="text-sm text-slate-400 font-medium italic">Please activate the development node by running <code class="bg-slate-800 px-3 py-1 rounded text-purple-400 font-bold">npm run dev</code> in the project terminal.</p>
                            </div>
                            <button onclick="location.reload()" class="h-14 px-10 bg-purple-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-glow-purple hover:bg-purple-700 transition-all">Retry Handshake</button>
                        </div>

                        {/* Direct Access Override */}
                        <div id="direct-access" class="absolute bottom-4 right-4 z-50 hidden">
                           <a href="<?php echo $app_url; ?>" target="_blank" class="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-glow-purple animate-bounce">
                               OPEN DIRECT <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                           </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Footer */}
        <footer class="h-20 glass flex items-center justify-center relative z-50 border-t border-white/5">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">OceanFresh Global Integration Protocol Active | Node Access: Absolute</p>
        </footer>
    </div>

    <script>
        const frame = document.getElementById('live-node');
        const offline = document.getElementById('offline-node');
        const statusNode = document.getElementById('status-node');
        const directAccess = document.getElementById('direct-access');
        
        // High-Fidelity Signal Test
        fetch('<?php echo $app_url; ?>', { mode: 'no-cors' })
            .then(() => {
                // Node Online
                statusNode.className = "flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-2 rounded-full";
                statusNode.innerHTML = '<div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#10b981]"></div><span class="text-[10px] font-black uppercase tracking-widest text-green-500">Node Online</span>';
                offline.classList.add('hidden');
                frame.classList.remove('opacity-0');
                directAccess.classList.remove('hidden');
            })
            .catch(() => {
                // Node Offline
                console.warn("Registry Node Not Found. Ensure 'npm run dev' is active.");
            });
    </script>
</body>
</html>
