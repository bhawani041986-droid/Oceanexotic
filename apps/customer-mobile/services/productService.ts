import api from './api';

export const productService = {
  // Taxonomy Retrieval: Fetch global categories
  getCategories: async () => {
    try {
      // The web app expects /categories/list.php
      // If it fails, we'll extract categories from the products list as a fallback
      try {
        const response = await api.get('/categories/list.php');
        return response.data;
      } catch (e) {
        const products = await productService.getAllProducts();
        const categories = [...new Set(products.map((p: any) => p.category))];
        return categories.map(name => ({ name }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Live Harbor Inventory: Today's Catch
  getTodaysCatch: async () => {
    try {
      const response = await api.get('/products/todays_catch.php');
      // The API returns { status: 'success', items: [...] }
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching today's catch:", error);
      return [];
    }
  },

  getAllProducts: async () => {
    try {
      const response = await api.get('/seller/products.php');
      // This returns an array directly
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
  },

  // Cut Selection Registry: Fetch available cuts for a harvest
  getCutOptions: async (productId: string) => {
    try {
      const response = await api.get(`/products/cut_options.php?product_id=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cut options:', error);
      return [];
    }
  },

  // Precision Retrieval: Fetch a specific harvest node
  getProductById: async (id: string) => {
    const response = await api.get(`/products/detail.php?id=${id}`);
    return response.data;
  },
};
