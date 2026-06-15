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
          return {
            ...apiProd,
            original_price: registryProd.originalPrice || apiProd.price,
            discount_percent: registryProd.originalPrice 
              ? Math.round(((registryProd.originalPrice - apiProd.price) / registryProd.originalPrice) * 100)
              : undefined,
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
        return {
          ...registryProd,
          ...data,
          original_price: registryProd.originalPrice || data.price,
          discount_percent: registryProd.originalPrice 
            ? Math.round(((registryProd.originalPrice - data.price) / registryProd.originalPrice) * 100)
            : undefined,
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
