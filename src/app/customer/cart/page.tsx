"use client";

import * as React from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  ShoppingBag, 
  Trash2, 
  Clock, 
  Truck, 
  ShieldCheck,
  Plus,
  Minus
} from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, toggleMarination } = useCartStore();
  const settings = useSettingsStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  const [addons, setAddons] = React.useState<any[]>([]);
  const [loadingAddons, setLoadingAddons] = React.useState(true);

  const subtotal = getTotal();
  const platformFee = (subtotal * settings.commissionRate) / 100;
  const taxes = subtotal * 0.05; // 5% fixed tax
  const grandTotal = subtotal + platformFee + taxes;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const fetchAddons = async () => {
      setLoadingAddons(true);
      try {
        let area = "";
        if (user?.id) {
          const res = await fetch(`/api/user/addresses?userId=${user.id}`);
          if (res.ok) {
            const addrData = await res.json();
            const addresses = Array.isArray(addrData) ? addrData : (addrData.data || []);
            // Find default address or fallback to first one
            const defaultAddr = addresses.find((a: any) => a.is_default || a.primary) || addresses[0];
            if (defaultAddr) {
              area = defaultAddr.jetty || "";
            }
          }
        }
        
        const addonsRes = await fetch(`/api/addons/list.php?area=${encodeURIComponent(area)}`);
        if (addonsRes.ok) {
          const data = await addonsRes.json();
          setAddons(data);
        }
      } catch (err) {
        console.error("Error fetching dynamic addons:", err);
      } finally {
        setLoadingAddons(false);
      }
    };

    if (mounted) {
      fetchAddons();
    }
  }, [mounted, user?.id]);

  if (!mounted) {
    return (
      <MainLayout>
        <div className="bg-[var(--c-bg)] min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--c-primary)]/20 border-t-[var(--c-primary)] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-10 text-center px-6 pb-20">
          <div className="w-32 h-32 bg-[var(--foreground)]/5 rounded-full flex items-center justify-center text-5xl opacity-20 border border-[var(--foreground)]/5 shadow-inner">🛒</div>
          <div className="space-y-4 max-w-sm">
            <h1 className="text-[32px] font-bold tracking-tight text-[var(--c-text-primary)] leading-tight">Your cart is empty</h1>
            <p className="text-[var(--c-text-secondary)] font-medium leading-relaxed italic">It looks like you haven't discovered our fresh harvest yet. Experience the world's finest seafood today.</p>
          </div>
          <Link href="/customer/products">
            <Button size="lg" className="h-16 px-12 text-sm font-black tracking-widest shadow-[var(--c-shadow-glow)] rounded-full bg-[var(--c-primary)] text-[var(--foreground)]">EXPLORE MARKETPLACE</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-10 pb-10 md:pb-32">
        <div className="flex flex-col lg:flex-row gap-[10px] md:gap-16 items-start">
          
          {/* Cart Items List */}
          <div className="flex-1 w-full space-y-[10px] md:space-y-12">
            <div className="space-y-1 md:space-y-3 px-1 md:px-0">
              <h1 className="text-2xl md:text-[40px] font-black uppercase italic text-[var(--c-text-primary)] leading-tight">Shopping Cart</h1>
              <p className="text-[var(--c-text-secondary)] font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
                Total: {items.length} Premium Selection{items.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="w-full space-y-[10px] md:space-y-6">
              {items.map((item) => (
                <Card key={item.id} className="p-2 md:p-6 bg-[var(--foreground)]/5 border-[var(--border)] rounded-[20px] md:rounded-[32px] relative overflow-hidden group">
                  <div className="flex gap-[10px] md:gap-6">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-[16px] md:rounded-[24px] overflow-hidden shrink-0 border border-[var(--foreground)]/10">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm md:text-xl font-black uppercase italic text-[var(--c-text-primary)] group-hover:text-[var(--c-primary)] transition-colors">{item.name}</h3>
                          {item.sellerId !== 'ADDON' && (
                            <div className="mt-2 flex flex-col gap-2">
                              <label className="inline-flex items-center cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={!!item.isMarinated} 
                                  onChange={() => toggleMarination(item.id)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-8 h-4 bg-[var(--foreground)]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--c-primary)]"></div>
                                <span className="ms-2 text-[9px] md:text-[10px] font-black uppercase text-rose-500 tracking-wider">🌶️ Pre-Marinate (+₹150)</span>
                              </label>
                              {item.isMarinated && (
                                <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-black uppercase w-fit">
                                  {item.selectedMarinade || 'Tandoori Island Rub'}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-3.5 h-3.5 md:w-5 md:h-5" /></button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto pt-3">
                        <div className="flex items-center gap-1.5 md:gap-3 bg-[var(--foreground)]/5 rounded-full p-1 border border-[var(--border)]">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-6 h-6 md:w-10 md:h-10 rounded-full hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--c-text-primary)] transition-all active:scale-90"><Minus className="w-3 h-3 md:w-4 md:h-4" /></button>
                          <span className="text-[10px] md:text-sm font-black w-4 md:w-6 text-center text-[var(--c-text-primary)]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 md:w-10 md:h-10 rounded-full hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--c-text-primary)] transition-all active:scale-90"><Plus className="w-3 h-3 md:w-4 md:h-4" /></button>
                        </div>
                        <p className="text-xs md:text-xl font-black text-[var(--c-text-primary)] italic">
                          {settings.currencySymbol}{((item.price + (item.isMarinated ? 150 : 0)) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* RECOMMENDED ADD-ONS SECTION */}
            {addons.length > 0 && (
              <div className="pt-6 md:pt-10 space-y-4 md:space-y-6 animate-fade-in">
                <h2 className="text-lg md:text-2xl font-black uppercase italic text-[var(--c-text-primary)]">Complete Your BBQ & Curry</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {addons.map((addon) => {
                    const alreadyInCart = items.some(i => i.id === addon.id);
                    const fallbackImg = "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=200&q=80";
                    return (
                      <Card key={addon.id} className="p-2 md:p-4 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-[20px] flex flex-col justify-between hover:border-[var(--c-primary)]/40 transition-all group/addon">
                        <div className="space-y-2">
                          <div className="h-20 w-full rounded-lg overflow-hidden border border-[var(--foreground)]/5">
                            <img 
                              src={addon.image_url || fallbackImg} 
                              alt={addon.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/addon:scale-105" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImg;
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="text-[10px] md:text-xs font-black uppercase text-[var(--c-text-primary)] truncate">{addon.name}</h4>
                            <p className="text-[8px] text-[var(--c-text-secondary)] font-medium leading-none truncate">{addon.description || addon.type}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[var(--foreground)]/5">
                          <span className="text-[10px] md:text-xs font-black text-[var(--c-text-primary)]">₹{addon.price}</span>
                          <Button 
                            onClick={() => {
                              if (!alreadyInCart) {
                                useCartStore.getState().addItem({
                                  id: addon.id,
                                  name: addon.name,
                                  price: addon.price,
                                  quantity: 1,
                                  image: addon.image_url || fallbackImg,
                                  sellerId: 'ADDON'
                                });
                              }
                            }}
                            disabled={alreadyInCart}
                            className="h-6 px-3 text-[8px] font-black tracking-wider uppercase rounded-full shadow-glow-purple"
                          >
                            {alreadyInCart ? 'ADDED' : 'ADD'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Summary Sidebar */}
          <aside className="w-full lg:w-[400px] space-y-[10px] md:space-y-8 lg:sticky lg:top-32">
            <Card className="p-4 md:p-10 bg-[var(--c-card)] border-[var(--border)] rounded-[32px] md:rounded-[48px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--c-primary)] to-blue-500" />
              <h2 className="text-sm md:text-2xl font-black uppercase italic mb-4 md:mb-8 text-[var(--c-text-primary)]">Trade Summary</h2>
              
              <div className="space-y-3 md:space-y-6">
                <div className="flex justify-between items-center text-[10px] md:text-sm font-black text-[var(--c-text-secondary)] italic uppercase tracking-wider"><span>Basket Value</span><span className="text-[var(--c-text-primary)]">₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-[10px] md:text-sm font-black text-[var(--c-text-secondary)] italic uppercase tracking-wider"><span>Regulatory Tax (5%)</span><span className="text-[var(--c-text-primary)]">₹{taxes.toLocaleString()}</span></div>
                
                <div className="pt-4 md:pt-8 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-xs md:text-xl font-black uppercase italic text-[var(--c-text-secondary)]">Final Payload</span>
                  <span className="text-lg md:text-[32px] font-black text-[var(--c-primary)] shadow-glow-purple/20 italic">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mt-10">
                <Button 
                  onClick={() => router.push('/customer/checkout')}
                  className="w-full h-16 md:h-20 text-[10px] md:text-sm font-black uppercase tracking-widest shadow-[var(--c-shadow-glow)] rounded-2xl md:rounded-3xl bg-[var(--c-primary)] text-[var(--foreground)] gap-2 md:gap-4 transition-all hover:scale-[1.02] active:scale-95 italic"
                >
                  AUTHORIZE DISPATCH <Truck className="w-4 h-4 md:w-6 md:h-6" />
                </Button>
                <Link href="/customer/products">
                  <Button variant="ghost" className="w-full text-[9px] md:text-[10px] font-black tracking-widest uppercase text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]">CONTINUE SHOPPING</Button>
                </Link>
              </div>

              <div className="p-[10px] md:p-6 rounded-xl md:rounded-[calc(var(--c-radius-card)*0.8)] bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10 flex items-center gap-[10px] md:gap-5 mt-8 relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--c-primary)]/10 flex items-center justify-center text-[var(--c-primary)]"><Clock className="w-5 h-5 md:w-6 md:h-6" /></div>
                <p className="text-[9px] text-[var(--c-text-secondary)] font-black uppercase italic leading-relaxed">
                  Estimated arrival: <span className="text-[var(--c-text-primary)]">60-90 minutes</span>
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3 md:gap-4 px-2">
              <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] italic">
                <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-[var(--c-primary)]" />
                <p className="text-[8px] md:text-[10px] font-black uppercase text-[var(--c-text-secondary)]">Secure Trade</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] italic">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-[var(--c-primary)]" />
                <p className="text-[8px] md:text-[10px] font-black uppercase text-[var(--c-text-secondary)]">Fast Signal</p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </MainLayout>
  );
}
