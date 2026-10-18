import Link from "next/link";

export default function NotFound() {
  return (
    <main data-stage-scene="landing" className="relative z-10 flex min-h-svh flex-col items-start justify-center px-5 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="display-hero halo-none text-foreground">404</h1>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-mono text-xs text-foreground/70 hover:text-foreground">
          ← PB&amp;J
        </Link>
      </div>
    </main>
  );
}
