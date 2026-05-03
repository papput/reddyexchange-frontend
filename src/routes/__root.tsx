import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { FloatingContact } from "@/components/site/FloatingContact";
import { site } from "@/config/site";
import appCss from "../styles.css?url";
import faviconUrl from "@/assets/brand/reddy-exchange-logo.png?url";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-secondary">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium hover-glow">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B0B0F" },
      { title: `${site.siteName} — Buy & Sell USDT Instantly in India` },
      { name: "description", content: "India's premium gateway for instant USDT exchange. Fast, secure, trusted. UPI & bank transfer supported." },
      { property: "og:title", content: `${site.siteName} — Buy & Sell USDT Instantly in India` },
      { property: "og:description", content: "Fast, secure, trusted USDT exchange platform with UPI and bank transfer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: faviconUrl, type: "image/png" },
      { rel: "apple-touch-icon", href: faviconUrl },
    ],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <FloatingContact />
          <Toaster />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
