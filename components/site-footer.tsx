// ── footer ────────────────────────────────────────────────────────────────────
import Link from "next/link";
import { content } from "@/lib/content";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 px-5 pt-16 pb-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-border pt-6 font-mono text-xs text-foreground/55 md:flex-row md:items-baseline md:justify-between">
        <p>
          © {new Date().getFullYear()} {content.site.name}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <Link href="/join" className="hover:text-foreground/90">
              {content.join.heading}
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
