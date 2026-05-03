import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactChannels } from "@/components/site/ContactChannels";
import { usePublicSettings } from "@/hooks/use-public-settings";

export function InfoPage({
  title,
  kicker,
  children,
  showHelpStrip = true,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  /** Extra contact cards from admin settings (hidden on full contact page). */
  showHelpStrip?: boolean;
}) {
  const { data: settings } = usePublicSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        {kicker && <div className="text-xs uppercase tracking-widest text-accent mb-3">{kicker}</div>}
        <h1 className="text-4xl font-bold tracking-tight mb-6">{title}</h1>
        <div className="glass rounded-2xl p-6 sm:p-8 prose prose-invert max-w-none text-secondary leading-relaxed [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-2 [&_strong]:text-foreground space-y-4">
          {children}
        </div>
        {showHelpStrip ? (
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Need help?</h2>
            <p className="text-sm text-muted-foreground">
              Reach us via email, WhatsApp, or phone — details are set by your admin.
            </p>
            <ContactChannels
              settings={settings}
              includeContactPageLink={false}
              showPaymentChannels={false}
            />
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
