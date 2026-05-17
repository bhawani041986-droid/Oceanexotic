import api from "./api";

export interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
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
    const { data } = await api.get<Product[]>("/seller/products.php");
    return Array.isArray(data) ? data : [];
  },

  fetchById: async (id: string) => {
    const { data } = await api.get(`/products/detail.php`, { params: { id } });
    return data;
  },

  search: async (q = "", category = "") => {
    const { data } = await api.get<{
      status: string;
      results: SearchProduct[];
    }>("/products/search.php", {
      params: { q, category },
    });
    if (data.status === "success") return data.results;
    return [];
  },
};
