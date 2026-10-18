// The live line: next event, latest release, or last event (lib/now.ts).
import Link from "next/link";
import { ICONS } from "@/components/icons";
import { PLATFORM_NAME, platformOf } from "@/lib/links";
import type { NowLine as Line } from "@/lib/now";

export default function NowLine({ line, className = "" }: { line: Line; className?: string }) {
  const dot = (
    <span
      aria-hidden="true"
      className={`mr-2.5 inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full align-middle ${
        line.kind === "next" ? "now-dot bg-foreground" : line.kind === "latest" ? "bg-foreground/70" : "bg-foreground/45"
      }`}
    />
  );
  const cls = `inline-block font-mono text-xs text-foreground/70 transition-colors hover:text-foreground ${className}`;
  const platform = platformOf(line.href);
  const Icon = ICONS[platform];
  return line.external ? (
    <a href={line.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {dot}
      {line.text}{" "}
      <Icon aria-hidden="true" className="ml-1 inline h-3.5 w-3.5 -translate-y-px" />
      <span className="sr-only"> on {PLATFORM_NAME[platform]} (opens in a new tab)</span> <span aria-hidden="true" className="nudge">↗</span>
    </a>
  ) : (
    <Link href={line.href} className={cls}>
      {dot}
      {line.text}
    </Link>
  );
}
