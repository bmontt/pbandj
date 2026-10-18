// Who was behind a night: the founders' stage names, each in their letter's
// family, linking to their page.
import Link from "next/link";
import { founderById, type FounderId } from "@/lib/content";

export default function Crew({ ids, link = false }: { ids: FounderId[]; link?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => {
        const f = founderById(id);
        const inner = (
          <>
            <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-founder align-middle" />
            {f.alias.toLowerCase()}
          </>
        );
        return link ? (
          <Link key={id} href={`/about/${f.slug}`} data-founder={id} className="hover:text-foreground">
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
