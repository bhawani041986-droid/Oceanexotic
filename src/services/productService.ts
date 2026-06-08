import api from "./api";

export const productService = {
  // Global Harvest Discovery: Fetch all marketplace assets
  getAllProducts: async (params?: any) => {
    const response = await api.get("/seller/products", { params });
    return response.data;
  },

  // Precision Retrieval: Fetch a specific harvest node
  getProductById: async (id: string) => {
    const response = await api.get(`/seller/products?id=${id}`);
    return response.data;
  },

  // Taxonomy Retrieval: Fetch global categories
  getCategories: async () => {
    const response = await api.get("/seller/categories");
    return response.data;
  },

  // Merchant Inventory: Fetch assets for a specific merchant node
  getSellerProducts: async (sellerId: string) => {
    const response = await api.get(`/seller/products?seller_id=${sellerId}`);
    return response.data;
  },

  // Asset Commissioning: Create a new harvest (Sellers)
  createProduct: async (productData: any) => {
    const response = await api.post("/seller/products", productData);
    return response.data;
  },

  // Asset Updates: Modify existing harvest directives
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/seller/products`, { id, ...productData });
    return response.data;
  }
};
