import { Metadata } from "next";

export const SITE_CONFIG = {
  name: "OceanExotic Global",
  description: "Experience absolute authority in exotic maritime trade. Rare, direct-from-source harvests with cold-chain integrity and global settlement sovereignty.",
  url: "https://oceanexotic.com",
  ogImage: "https://oceanexotic.com/og-image.jpg",
  keywords: ["seafood", "exotic fish", "maritime trade", "bluefin tuna", "oceanexotic", "premium seafood", "andaman fish"],
};

export function generateSeoMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title 
    ? `${title} | ${SITE_CONFIG.name}` 
    : `${SITE_CONFIG.name} | Elite Maritime Marketplace`;
    
  const fullDescription = description || SITE_CONFIG.description;
  const fullUrl = `${SITE_CONFIG.url}${path}`;
  const fullImage = image || SITE_CONFIG.ogImage;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: SITE_CONFIG.keywords,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
    },
  };
}
