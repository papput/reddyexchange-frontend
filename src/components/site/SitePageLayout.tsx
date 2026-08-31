export function SitePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-page">
      <div className="site-page-glow" aria-hidden />
      {children}
    </div>
  );
}
