import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 ocean-gradient" />
          <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Fresh from the <br />
              <span className="bg-gradient-to-r from-primary-aqua to-primary-blue bg-clip-text text-transparent">
                Deep Ocean
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The world's premium seafood marketplace. Freshness guaranteed, 
              delivered directly from local fishermen to your kitchen.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full md:w-auto">
                Shop Fresh Harvest
              </Button>
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                Meet Our Sellers
              </Button>
            </div>
          </div>
          
          {/* Abstract Ocean Shapes (Framer Motion would go here) */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-purple/10 blur-[120px] rounded-full" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-blue/10 blur-[120px] rounded-full" />
        </section>

        {/* Categories Section */}
        <section className="py-24 container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Featured Categories</h2>
              <p className="text-muted-foreground">Explore our wide selection of ocean treasures.</p>
            </div>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Fresh Fish', 'Shellfish', 'Crustaceans', 'Exotic'].map((cat) => (
              <Card key={cat} className="group cursor-pointer overflow-hidden border-white/5">
                <CardHeader className="p-0 relative h-48">
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                    {cat}
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">200+ Products</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-background-section">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Fresh Arrivals</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Newest</Button>
                <Button variant="outline" size="sm">Best Sellers</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((id) => (
                <Card key={id} className="border-white/5 group">
                  <div className="aspect-square bg-white/5 rounded-t-[20px] relative overflow-hidden">
                    <div className="absolute top-4 left-4 bg-success text-[10px] font-bold px-2 py-1 rounded-full">
                      FRESH TODAY
                    </div>
                    {/* Image placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl">
                      🐟
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Bluefin Tuna Saku</CardTitle>
                        <CardDescription className="text-xs">Premium Grade A+</CardDescription>
                      </div>
                      <div className="font-bold text-primary-aqua">$45.00</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10" />
                      <span className="text-[10px] text-muted-foreground">Atlantic Traders</span>
                    </div>
                    <Button size="sm" variant="glass">Add</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-y border-white/5">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: 'Fresh Catch', desc: 'Daily harvest' },
              { title: 'Express Delivery', desc: 'Same day arrival' },
              { title: 'Local Sellers', desc: 'Support local' },
              { title: 'Eco Friendly', desc: 'Sustainable fishing' }
            ].map((badge) => (
              <div key={badge.title} className="text-center space-y-2">
                <div className="font-bold text-sm">{badge.title}</div>
                <div className="text-xs text-muted-foreground">{badge.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
