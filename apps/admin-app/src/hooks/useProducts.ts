import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: productService.fetchAll,
    staleTime: 60_000,
  });
}

export function useProductSearch(q: string, category: string) {
  return useQuery({
    queryKey: ["products-search", q, category],
    queryFn: () => productService.search(q, category),
    staleTime: 30_000,
  });
}
