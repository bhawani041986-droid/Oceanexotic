import api from "./api";
import { MASTER_PRODUCT_REGISTRY } from "../constants/products";

export interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  image_url?: string;
  images?: string[];
  image?: string;
  seller_id?: string;
  sellerId?: string;
  seller_name?: string;
  stock?: number;
  status?: string;
  rating?: number;
  description?: string;
  unit?: string;
}

export interface SearchProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  seller: string;
  is_live: boolean;
  harbor?: string;
  stock?: number;
  batch?: string;
  tag: string;
}

export const productService = {
  fetchAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/seller/products");
    if (Array.isArray(data)) {
      return data.map((apiProd) => {
        const registryProd = MASTER_PRODUCT_REGISTRY.find(p => p.id === apiProd.id);
        if (registryProd) {
          const discountPercent = apiProd.discount_percent !== undefined && apiProd.discount_percent !== null && (apiProd.discount_percent ?? 0) > 0
            ? Number(apiProd.discount_percent)
            : (registryProd.originalPrice > apiProd.price
              ? Math.round(((registryProd.originalPrice - apiProd.price) / registryProd.originalPrice) * 100)
              : 0);

          const originalPrice = registryProd.originalPrice
            ? ((apiProd.discount_percent ?? 0) > 0
              ? Math.round((apiProd.price * 100) / (100 - (apiProd.discount_percent ?? 0)))
              : registryProd.originalPrice)
            : (discountPercent > 0
              ? Math.round((apiProd.price * 100) / (100 - discountPercent))
              : apiProd.price);

          return {
            ...apiProd,
            original_price: originalPrice,
            discount_percent: discountPercent > 0 ? discountPercent : undefined,
            badge: registryProd.badge,
            rating: registryProd.rating || apiProd.rating,
            description: apiProd.description || registryProd.description,
            unit: registryProd.weight || apiProd.unit || "1kg",
          };
        }
        return apiProd;
      });
    }
    return [];
  },

  fetchById: async (id: string, area = "") => {
    const { data } = await api.get(`/products/detail`, { params: { id, area } });
    if (data) {
      const registryProd = MASTER_PRODUCT_REGISTRY.find(p => p.id === id);
      if (registryProd) {
        const discountPercent = data.discount_percent !== undefined && data.discount_percent !== null && data.discount_percent > 0
          ? Number(data.discount_percent)
          : (registryProd.originalPrice > data.price
            ? Math.round(((registryProd.originalPrice - data.price) / registryProd.originalPrice) * 100)
            : 0);

        const originalPrice = registryProd.originalPrice
          ? (data.discount_percent > 0
            ? Math.round((data.price * 100) / (100 - data.discount_percent))
            : registryProd.originalPrice)
          : (discountPercent > 0
            ? Math.round((data.price * 100) / (100 - discountPercent))
            : data.price);

        return {
          ...registryProd,
          ...data,
          original_price: originalPrice,
          originalPrice: originalPrice,
          discount_percent: discountPercent,
          nutrition: data.nutrition || registryProd.nutrition,
          variants: data.variants || registryProd.variants,
          addons: data.addons || registryProd.addons,
          cutTypes: data.cutTypes || registryProd.cutTypes,
        };
      }
    }
    return data;
  },

  search: async (q = "", category = "") => {
    const { data } = await api.get<{
      status: string;
      results: SearchProduct[];
    }>("/products/search", {
      params: { q, category },
    });
    if (data.status === "success") return data.results;
    return [];
  },
};
