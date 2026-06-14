import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";
import { loadSavedLanguage } from "@/lib/i18n";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 2, staleTime: 30_000 },
          mutations: { retry: 0 },
        },
      })
  );

  // Load saved language on app startup — once at root level
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
