// The live line: next event, latest release, or last event (lib/now.ts).
import Link from "next/link";
import type { NowLine as Line } from "@/lib/now";

export default function NowLine({ line, className = "" }: { line: Line; className?: string }) {
  const dot = (
    <span
      aria-hidden="true"
      className={`mr-2.5 inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full align-middle ${
        line.kind === "next" ? "now-dot bg-j-2-hi" : line.kind === "latest" ? "bg-p-hi" : "bg-foreground/45"
      }`}
    />
  );
  const cls = `inline-block font-mono text-xs text-foreground/70 transition-colors hover:text-foreground ${className}`;
  return line.external ? (
    <a href={line.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {dot}
      {line.text} <span aria-hidden="true">↗</span>
    </a>
  ) : (
    <Link href={line.href} className={cls}>
      {dot}
      {line.text}
    </Link>
  );
}
