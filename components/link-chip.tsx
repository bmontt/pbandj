// One look for every outbound link: the platform's own icon and name in a
// bordered chip (the founder pages' social buttons, now everywhere).
// Server-rendered; the icon is inline SVG.

import { ICONS } from "@/components/icons";
import { PLATFORM_NAME, platformOf, type Platform } from "@/lib/links";

export default function LinkChip({
  href,
  label,
  platform = platformOf(href),
  className = "",
}: {
  href: string;
  /** visible text; defaults to the platform's name */
  label?: string;
  platform?: Platform;
  className?: string;
}) {
  const Icon = ICONS[platform];
  const external = !href.startsWith("mailto:");
  const name = PLATFORM_NAME[platform];
  const text = label ?? name.toLowerCase();
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-platform={platform}
      className={`flex min-h-11 items-center gap-2 border border-border px-3 font-mono text-xs text-foreground/75 transition-colors hover:border-foreground/30 hover:text-foreground ${className}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {text}
      {label && platform !== "web" && platform !== "email" && <span className="sr-only"> on {name}</span>}
      {external && (
        <>
          <span aria-hidden="true" className="nudge text-foreground/40">
            ↗
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
