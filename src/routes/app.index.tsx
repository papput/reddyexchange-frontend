import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useUserTransactions } from "@/hooks/use-user-transactions";
import { DashboardHome } from "@/components/app/DashboardHome";
import { site } from "@/config/site";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: `Home — ${site.siteName}` }] }),
  component: AppHome,
});

function AppHome() {
  const auth = useAuth();
  const { data: settings } = usePublicSettings();
  const rate = settings?.price ?? 91;
  const { data: txns = [], isLoading } = useUserTransactions();

  const balanceUsdt = auth?.user.primeExchUsdtBalance ?? 0;
  const firstName = auth?.user.fullName?.split(" ")[0] ?? "there";

  return (
    <DashboardHome
      firstName={firstName}
      fullName={auth?.user.fullName ?? firstName}
      email={auth?.user.email ?? ""}
      balanceUsdt={balanceUsdt}
      rate={rate}
      txns={txns}
      isLoading={isLoading}
    />
  );
}
