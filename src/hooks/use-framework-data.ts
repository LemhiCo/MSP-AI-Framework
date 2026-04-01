import { useQuery } from "@tanstack/react-query";
import { loadControls, type Control } from "@/lib/csv-loader";

export function useControls() {
  return useQuery<Control[]>({
    queryKey: ["controls"],
    queryFn: loadControls,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
