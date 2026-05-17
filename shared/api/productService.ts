import api from "./api";

export const productService = {
  // Global Harvest Discovery: Fetch all marketplace assets
  getAllProducts: async (params?: any) => {
    const response = await api.get("/products/list.php", { params });
    return response.data;
  },

  // Precision Retrieval: Fetch a specific harvest node
  getProductById: async (id: string) => {
    const response = await api.get(`/products/detail.php?id=${id}`);
    return response.data;
  },

  // Taxonomy Retrieval: Fetch global categories
  getCategories: async () => {
    const response = await api.get("/categories/list.php");
    return response.data;
  },

  // Merchant Inventory: Fetch assets for a specific merchant node
  getSellerProducts: async (sellerId: string) => {
    const response = await api.get(`/seller/products.php?seller_id=${sellerId}`);
    return response.data;
  },

  // Asset Commissioning: Create a new harvest (Sellers)
  createProduct: async (productData: any) => {
    const response = await api.post("/products/create.php", productData);
    return response.data;
  },

  // Asset Updates: Modify existing harvest directives
  updateProduct: async (id: string, productData: any) => {
    const response = await api.post(`/products/update.php?id=${id}`, productData);
    return response.data;
  }
};
