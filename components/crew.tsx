// Who was behind an event: the founders' first names, each with a dot in
// their color, linking to their page.
import Link from "next/link";
import { firstName, founderById, type FounderId } from "@/lib/content";

export default function Crew({ ids, link = false }: { ids: FounderId[]; link?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => {
        const f = founderById(id);
        const inner = (
          <>
            <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-founder align-middle" />
            {firstName(f)}
          </>
        );
        return link ? (
          <Link key={id} href={`/collective/${f.slug}`} data-founder={id} className="hover:text-foreground">
            {inner}
          </Link>
        ) : (
          <span key={id} data-founder={id}>
            {inner}
          </span>
        );
      })}
    </span>
  );
}
