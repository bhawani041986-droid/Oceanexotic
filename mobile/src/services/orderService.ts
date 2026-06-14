import api from "./api";

export interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
  tracking?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  qty: number;
  quantity?: number;
  image?: string;
  sellerId?: string;
  seller_id?: string;
}

export interface OrderDetail {
  id: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  address: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  items: OrderItem[];
}

export const orderService = {
  getCustomerOrders: async (userId: string): Promise<CustomerOrder[]> => {
    const { data } = await api.get<CustomerOrder[]>(
      `/orders/customer_history?userId=${encodeURIComponent(userId)}`
    );
    return Array.isArray(data) ? data : [];
  },

  getUserOrderDetails: async (orderId: string): Promise<OrderDetail | null> => {
    try {
      const { data } = await api.get<any>(
        `/user/orders/details?id=${encodeURIComponent(orderId)}`
      );
      if (!data || data.status === "error") return null;

      const raw = Array.isArray(data) ? data[0] : data;
      if (!raw) return null;

      const subtotal = parseFloat(raw.subtotal ?? raw.total_amount ?? 0);
      const shipping = parseFloat(raw.shipping ?? raw.delivery_fee ?? 0);
      const tax = parseFloat(raw.tax ?? 0);
      const total = parseFloat(raw.total_amount ?? raw.total ?? subtotal + shipping + tax);

      const items: OrderItem[] = (raw.items || []).map((item: any) => ({
        id: item.id ?? item.product_id,
        product_id: item.product_id,
        name: item.product_name ?? item.name ?? item.product_id,
        price: parseFloat(item.price) || 0,
        qty: parseFloat(item.quantity ?? item.qty ?? 1),
        image: item.image_url ?? item.image ?? "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
        sellerId: item.seller_id ?? item.sellerId ?? "1",
      }));

      return {
        id: raw.id,
        date: raw.created_at
          ? new Date(raw.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })
          : raw.date ?? "",
        status: (raw.status ?? "").toUpperCase(),
        total,
        subtotal,
        shipping,
        tax,
        address: {
          name: raw.customer_name ?? "Customer",
          line1: raw.delivery_address ?? "",
          city: raw.delivery_area ?? "Port Blair",
          state: "Andaman & Nicobar",
          zip: "",
        },
        items,
      };
    } catch {
      return null;
    }
  },
};
