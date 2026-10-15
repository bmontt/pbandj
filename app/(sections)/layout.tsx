// The section pages share the top nav and the footer. The route group adds no
// URL segment; the landing (app/page.tsx) sits outside it, with neither.
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function SectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  );
}
