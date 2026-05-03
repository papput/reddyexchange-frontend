import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings, type PublicSettingsData } from "@/lib/api";

const QK = ["public-settings"] as const;

export function usePublicSettings() {
  return useQuery<PublicSettingsData>({
    queryKey: QK,
    queryFn: fetchPublicSettings,
    staleTime: 60_000,
  });
}
