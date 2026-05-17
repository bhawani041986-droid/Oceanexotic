import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";
import { generateSeoMetadata } from "@/lib/seo";
import ProductDetailClient from "./ProductDetailClient";
import { getProductLiveDetail, getCutOptions } from "@/services/catchService";
import { notFound } from "next/navigation";

// SSR Metadata for Next.js 15
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = MASTER_PRODUCT_REGISTRY.find(p => p.id === id);
  
  if (!product) return generateSeoMetadata({ title: "Product Not Found" });

  return generateSeoMetadata({
    title: `${product.name} (${product.tagline})`,
    description: product.description,
    image: product.images?.[0] || 'https://oceanexotic.com/og-image.jpg',
    path: `/customer/products/${id}`
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Parallel data fetching
  const [liveData, cutOptionsData] = await Promise.all([
    getProductLiveDetail(id),
    getCutOptions(id)
  ]);

  const baseline = MASTER_PRODUCT_REGISTRY.find(p => p.id === id);
  
  // If no baseline and no live data, it doesn't exist
  if (!baseline && (!liveData || liveData.status === 'error')) {
    notFound();
  }

  return (
    <ProductDetailClient 
      initialProduct={liveData} 
      initialCutOptions={cutOptionsData.cut_options} 
      baseline={baseline}
      productId={id}
    />
  );
}
