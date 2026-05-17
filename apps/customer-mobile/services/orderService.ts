import api from './api';

export const orderService = {
  // Ledger Retrieval: Fetch customer missions
  getCustomerOrders: async (userId: string) => {
    try {
      const response = await api.get(`/orders/customer_orders.php?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  // Directive Details: Fetch specific mission status
  getOrderDetails: async (orderId: string) => {
    const response = await api.get(`/orders/detail.php?orderId=${orderId}`);
    return response.data;
  },

  // Realtime Tracking: Fetch telemetry for a mission
  getOrderTracking: async (orderId: string) => {
    const response = await api.get(`/orders/tracking.php?orderId=${orderId}`);
    return response.data;
  }
};
