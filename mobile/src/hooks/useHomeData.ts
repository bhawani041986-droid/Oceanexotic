import { useQuery } from "@tanstack/react-query";
import { homeService } from "@/services/homeService";

export function useHomeData() {
  const cms = useQuery({
    queryKey: ["cms"],
    queryFn: homeService.fetchCms,
    staleTime: 900_000, // 15 minutes cache stale time
  });

  const territories = useQuery({
    queryKey: ["territories"],
    queryFn: homeService.fetchTerritories,
    staleTime: 1_800_000, // 30 minutes cache stale time
  });

  const todaysCatch = useQuery({
    queryKey: ["todays-catch"],
    queryFn: homeService.fetchTodaysCatch,
    staleTime: 900_000, // 15 minutes cache stale time
  });

  return { cms, territories, todaysCatch };
}
