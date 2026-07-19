import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export interface Review {
  id: number;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: string;
}

export function useReviews(productId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/product?product_id=${productId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!productId,
    staleTime: 60_000,
  });
}
