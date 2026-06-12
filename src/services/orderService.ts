import api from "./api";
import { authService } from "./authService";

export const orderService = {
  // Trade Commitment: Commit a new settlement directive
  createOrder: async (orderData: any) => {
    const response = await api.post("/admin/orders", {
      ...orderData,
      userId: authService.getCurrentUser()?.id || "1"
    });
    return response.data;
  },

  // System Ledger: Fetch customer's trade history
  getCustomerOrders: async (userId?: string) => {
    const id = userId || authService.getCurrentUser()?.id || "1";
    const response = await api.get(`/user/orders?userId=${id}`);
    return response.data;
  },

  // Fleet Ledger: Fetch merchant's fulfillment history
  getSellerOrders: async () => {
    const response = await api.get("/seller/orders");
    return response.data;
  },

  // System Ledger Detail: Fetch specific order with items
  getUserOrderDetails: async (id: string) => {
    const response = await api.get(`/user/orders/details?id=${id}`);
    return response.data;
  },

  // Fleet Performance: Fetch high-fidelity merchant stats
  getSellerStats: async () => {
    const response = await api.get("/seller/stats");
    return response.data;
  },

  // Logistics Monitoring: Fetch specific order and fleet status
  getOrderDetails: async (id: string) => {
    const response = await api.get(`/admin/orders?id=${id}`);
    return response.data;
  },

  // Logistics Directives: Update order status (Sellers/Admins)
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.post(`/admin/orders?id=${id}`, { status });
    return response.data;
  }
};
