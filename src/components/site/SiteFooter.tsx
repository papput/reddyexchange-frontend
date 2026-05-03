import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage, mailtoSupport } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";

export function SiteFooter() {
  const { data: settings } = usePublicSettings();
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-secondary max-w-xs">
            India&apos;s premium gateway to digital assets. Fast, secure, trusted.
          </p>
          <p className="text-xs text-muted-foreground max-w-xs pt-2">
            Never share your password or OTP. {site.siteName} will never ask for them.
          </p>
        </div>
        <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"]]} />
        <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["Refund Policy", "/refund"]]} />
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li>
              <a href={mailtoSupport()} className="hover:text-foreground transition-colors story-link">
                {site.supportEmail}
              </a>
            </li>
            {wa ? (
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground transition-colors story-link"
                >
                  <img src={whatsappIcon} alt="" className="h-4 w-4 shrink-0" width={16} height={16} />
                  WhatsApp
                </a>
              </li>
            ) : null}
            <li>
              <Link to="/contact" className="hover:text-foreground transition-colors story-link">
                All contact options
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {site.siteName}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-secondary">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href} className="hover:text-foreground transition-colors story-link">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
