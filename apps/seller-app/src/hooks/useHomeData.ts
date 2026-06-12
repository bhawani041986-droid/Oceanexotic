import { useQuery } from "@tanstack/react-query";
import { homeService } from "@/services/homeService";

export function useHomeData() {
  const cms = useQuery({
    queryKey: ["cms"],
    queryFn: homeService.fetchCms,
    staleTime: 60_000,
  });

  const territories = useQuery({
    queryKey: ["territories"],
    queryFn: homeService.fetchTerritories,
    staleTime: 120_000,
  });

  const todaysCatch = useQuery({
    queryKey: ["todays-catch"],
    queryFn: homeService.fetchTodaysCatch,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return { cms, territories, todaysCatch };
}
