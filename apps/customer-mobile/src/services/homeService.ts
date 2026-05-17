import api from "./api";

export interface CmsItem {
  type: string;
  status: string;
  sector?: string;
  title?: string;
  image_url?: string;
}

export interface Territory {
  name: string;
  coordinates: string;
  status: string;
}

export interface TodaysCatchItem {
  catch_id: string;
  product_id: string;
  name: string;
  seller_name: string;
  harbor_node: string;
  remaining_kg: number;
  price_per_kg: number;
  batch_label: "MORNING" | "AFTERNOON" | "EVENING" | string;
  freshness_label: string;
  catch_image_url?: string;
  image_url?: string;
}

export interface CutOption {
  cut_type: string;
  label: string;
  final_price: number;
  is_available?: boolean;
}

export const homeService = {
  fetchCms: async (): Promise<CmsItem[]> => {
    const { data } = await api.get("/system/cms.php");
    if (data.status === "success") return data.content || [];
    return [];
  },

  fetchTerritories: async (): Promise<Territory[]> => {
    const { data } = await api.get("/system/get_territories.php");
    return Array.isArray(data) ? data : [];
  },

  fetchTodaysCatch: async (): Promise<TodaysCatchItem[]> => {
    const { data } = await api.get("/products/todays_catch.php");
    if (data.status === "success") return data.items || [];
    return [];
  },

  fetchCutOptions: async (productId: string): Promise<CutOption[]> => {
    const { data } = await api.get("/products/cut_options.php", {
      params: { product_id: productId },
    });
    if (data.status === "success") return data.cut_options || [];
    return [];
  },
};
