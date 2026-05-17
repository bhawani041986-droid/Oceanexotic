import React from 'react';

interface SchemaProps {
  type: 'Product' | 'Organization' | 'BreadcrumbList' | 'WebSite';
  data: any;
}

export const Schema = ({ type, data }: SchemaProps) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseSchema) }}
    />
  );
};

export function generateProductSchema(product: any) {
  return {
    name: product.name,
    description: product.description || `Premium ${product.name} direct from OceanExotic fleet.`,
    image: product.image || 'https://oceanexotic.com/og-image.jpg',
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.seller_name || 'OceanExotic Global Merchant',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
  };
}
