import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000, // 5 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
