"use client";

// ── site nav ──────────────────────────────────────────────────────────────────
// The section pages' top bar: the mark home on the left, the four sections on
// the right. One row at every width (it fits 320px), so it never hides on
// phones. The landing has no nav: it is the nav.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import mark from "@/assets/pbj-mark.webp";
import { SECTIONS } from "@/lib/sections";

export default function SiteNav() {
  const path = usePathname();
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-linear-to-b from-background via-background/85 to-transparent px-4 pb-6 sm:px-6 md:px-12">
      <nav aria-label="site" className="mx-auto flex max-w-6xl items-center justify-between gap-2">
        <Link href="/" aria-label="PB&J Sounds, home" className="-ml-1 flex min-h-11 items-center px-1">
          <Image src={mark} alt="" priority className="h-5 w-auto sm:h-6" sizes="48px" />
        </Link>
        <ul className="flex items-center gap-3 font-mono text-2xs sm:gap-6 sm:text-xs">
          {SECTIONS.map((s) => {
            const active = path === s.href || path.startsWith(`${s.href}/`);
            return (
              <li key={s.id}>
                <Link
                  href={s.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center transition-colors duration-200 ${
                    active
                      ? "text-foreground underline decoration-foreground/40 decoration-1 underline-offset-[6px]"
                      : "text-foreground/55 hover:text-foreground/90"
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
