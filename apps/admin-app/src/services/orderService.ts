import api from "./api";

export interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
  tracking?: string;
}

export const orderService = {
  getCustomerOrders: async (userId: string): Promise<CustomerOrder[]> => {
    const { data } = await api.get<CustomerOrder[]>(
      `/orders/customer_history?userId=${encodeURIComponent(userId)}`
    );
    return Array.isArray(data) ? data : [];
  },
};
