import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage, mailtoSupport } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { data: settings } = usePublicSettings();
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-3 text-sm">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
            >
              <img src={whatsappIcon} alt="" className="h-4 w-4" width={16} height={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : null}
          <a href={mailtoSupport()} className="text-secondary hover:text-foreground hidden sm:inline">
            Email
          </a>
          <Link to="/contact" className="text-secondary hover:text-foreground">
            Contact
          </Link>
          <Link to="/" className="text-secondary hover:text-foreground whitespace-nowrap">← Home</Link>
        </div>
      </div>
      <div className="flex-1 grid place-items-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-secondary text-sm mt-1.5">{subtitle}</p>
          </div>
          <div className="glass-strong rounded-2xl p-6 sm:p-7 shadow-[var(--shadow-card)]">
            {children}
          </div>
          <div className="text-center text-sm text-secondary mt-5">{footer}</div>
        </div>
      </div>
    </div>
  );
}
