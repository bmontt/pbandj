// ── footer ────────────────────────────────────────────────────────────────────
import Link from "next/link";
import { ICONS } from "@/components/icons";
import { content } from "@/lib/content";

export default function SiteFooter() {
  const { site } = content;
  return (
    <footer className="relative z-10 px-5 pt-16 pb-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-border pt-6 font-mono text-xs text-foreground/55 md:flex-row md:items-baseline md:justify-between">
        <p>
          © {new Date().getFullYear()} pb&amp;j sounds · {site.tagline}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground/90">
              <ICONS.instagram aria-hidden="true" className="h-3.5 w-3.5" />
              instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground/90">
              <ICONS.email aria-hidden="true" className="h-3.5 w-3.5" />
              {site.email}
            </a>
          </li>
          <li>
            <Link href="/join" className="hover:text-foreground/90">
              join
            </Link>
          </li>
          <li>
            <a href="/llms.txt" className="hover:text-foreground/90">
              llms.txt
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
