import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/Button";

const FAQS = [
  {
    category: "Marketplace",
    questions: [
      { q: "How is the freshness of the fish guaranteed?", a: "Every seller on OceanExotic Global is required to use our Cold-Chain Tracking system. You can see the real-time temperature log and catch-time for every premium product." },
      { q: "Do you deliver to my area?", a: "We currently operate in all major coastal cities and offer express logistics to inland metro areas." },
    ]
  },
  {
    category: "Selling",
    questions: [
      { q: "How do I become a verified seller?", a: "You can apply through the Seller Portal. We require documentation of your fishing licenses, hygiene certifications, and logistics capabilities." },
      { q: "What are the platform fees?", a: "OceanExotic Global takes a flat 5% commission on every successful transaction. No hidden listing fees." },
    ]
  },
];

export default function FAQPage() {
  return (

      <div className="bg-bg-primary min-h-screen">
        <div className="container mx-auto px-10 py-24 max-w-4xl">
          <div className="text-center space-y-4 mb-20">
            <h1 className="text-5xl font-black tracking-tight">Help Center</h1>
            <p className="text-text-secondary text-lg font-medium">Everything you need to know about the OceanExotic Global ecosystem.</p>
          </div>

          <div className="space-y-16">
            {FAQS.map((group) => (
              <div key={group.category} className="space-y-8">
                <h2 className="text-xs font-black uppercase tracking-[4px] text-primary border-b border-primary/20 pb-4">{group.category}</h2>
                <div className="grid gap-8">
                  {group.questions.map((faq, i) => (
                    <div key={i} className="space-y-3 p-8 rounded-[24px] bg-bg-secondary border border-[var(--foreground)]/5 hover:border-[var(--foreground)]/10 transition-all">
                      <h3 className="text-xl font-bold text-text-primary">Q: {faq.q}</h3>
                      <p className="text-text-secondary leading-relaxed font-medium">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 p-12 rounded-[32px] bg-primary/10 border border-primary/20 text-center space-y-6">
            <h2 className="text-2xl font-black">Still have questions?</h2>
            <p className="text-text-secondary font-medium">Our support team is available 24/7 to help you with your harvest.</p>
            <Button size="lg" className="h-14 px-12 shadow-glow">CONTACT SUPPORT</Button>
          </div>
        </div>
      </div>

  );
}
