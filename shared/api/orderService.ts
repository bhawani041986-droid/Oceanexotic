import api from "./api";
import { authService } from "./authService";

export const orderService = {
  // Trade Commitment: Commit a new settlement directive
  createOrder: async (orderData: any) => {
    const response = await api.post("/orders/create.php", {
      ...orderData,
      userId: authService.getCurrentUser()?.id || "1"
    });
    return response.data;
  },

  // Sovereign Ledger: Fetch customer's trade history
  getCustomerOrders: async (userId?: string) => {
    const id = userId || authService.getCurrentUser()?.id || "1";
    const response = await api.get(`/orders/customer_history.php?userId=${id}`);
    return response.data;
  },

  // Fleet Ledger: Fetch merchant's fulfillment history
  getSellerOrders: async () => {
    const response = await api.get("/orders/seller_history.php");
    return response.data;
  },

  // Fleet Performance: Fetch high-fidelity merchant stats
  getSellerStats: async () => {
    const response = await api.get("/orders/seller_stats.php");
    return response.data;
  },

  // Logistics Monitoring: Fetch specific order and fleet status
  getOrderDetails: async (id: string) => {
    const response = await api.get(`/orders/detail.php?id=${id}`);
    return response.data;
  },

  // Logistics Directives: Update order status (Sellers/Admins)
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.post(`/orders/update_status.php?id=${id}`, { status });
    return response.data;
  }
};
