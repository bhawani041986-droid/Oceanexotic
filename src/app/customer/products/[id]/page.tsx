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

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": baseline?.name || liveData?.name,
    "image": baseline?.images || [liveData?.image],
    "description": baseline?.description || liveData?.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": liveData?.price || baseline?.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": liveData?.status === 'AVAILABLE' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": "2027-12-31",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN",
          "addressRegion": "Andaman and Nicobar Islands"
        }
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <ProductDetailClient 
        initialProduct={liveData} 
        initialCutOptions={cutOptionsData.cut_options} 
        baseline={baseline}
        productId={id}
      />
    </>
  );
}
