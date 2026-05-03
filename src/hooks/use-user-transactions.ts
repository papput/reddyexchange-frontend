import { useQuery } from "@tanstack/react-query";
import { apiFetchTransactions } from "@/lib/api";
import { mapMergedApiTxn, useAuth, type Txn } from "@/lib/store";

const QK = ["user-transactions"] as const;

export function useUserTransactions() {
  const auth = useAuth();
  return useQuery<Txn[]>({
    queryKey: [...QK, auth?.token ?? ""],
    queryFn: async () => {
      const res = await apiFetchTransactions(1, 100);
      const body = res.data;
      if (!body?.success || !Array.isArray(body.data)) return [];
      const rows = body.data
        .map((item) => mapMergedApiTxn(item as Record<string, unknown>))
        .filter((x): x is Txn => x != null);
      return rows;
    },
    enabled: !!auth?.token,
    staleTime: 15_000,
  });
}
