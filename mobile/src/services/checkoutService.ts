import api from "./api";

export interface SavedAddress {
  id: string | number;
  user_id: string;
  label: string;
  type: string;          // alias of label, formatted by API
  hotel_name: string;
  room_no?: string;
  jetty: string;
  address: string;       // alias of address_line1, formatted by API
  address_line1?: string;
  phone: string;
  is_default: boolean | number;
}

export interface PlaceOrderPayload {
  userId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  address: string;       // formatted delivery string
  phone: string;
  paymentMethod: "COD";
}

export interface PlaceOrderResponse {
  status: "success" | "error";
  orderId?: number;
  message?: string;
}

export const checkoutService = {
  /** Fetch address vault for a user from PHP bridge */
  fetchAddresses: async (userId: string): Promise<SavedAddress[]> => {
    const { data } = await api.get(`/user/addresses.php?userId=${userId}`);
    return Array.isArray(data) ? data : [];
  },

  /** POST new coordinate node to PHP bridge */
  addAddress: async (address: Omit<SavedAddress, "id" | "type" | "address" | "label"> & { address: string; type: string }): Promise<any> => {
    const { data } = await api.post("/user/addresses.php", address);
    return data;
  },

  /** DELETE decommissioned coordinate node from PHP bridge */
  deleteAddress: async (id: string | number): Promise<any> => {
    const { data } = await api.delete(`/user/addresses.php?id=${id}`);
    return data;
  },

  /** POST order to marketplace/checkout.php */
  placeOrder: async (payload: PlaceOrderPayload): Promise<PlaceOrderResponse> => {
    const { data } = await api.post("/marketplace/checkout.php", payload);
    return data;
  },
};
