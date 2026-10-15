// ── /llms.txt ─────────────────────────────────────────────────────────────────
// llmstxt.org summary for language models, generated from content.json
// (lib/machine.ts). Re-rendered hourly with the pages, so "next up" stays true.
import { llmsText } from "@/lib/machine";

export const revalidate = 3600;

export function GET() {
  return new Response(llmsText(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
