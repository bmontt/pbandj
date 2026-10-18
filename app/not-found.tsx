import Link from "next/link";

export default function NotFound() {
  return (
    <main data-stage-scene="landing" className="relative z-10 flex min-h-svh flex-col items-start justify-center px-5 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <p className="label">404</p>
        <h1 className="display-hero halo-none mt-4 text-foreground">not here</h1>
        <p className="copy mt-6">That page doesn&apos;t exist, or moved.</p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-mono text-xs text-foreground/70 hover:text-foreground">
          ← back to the start
        </Link>
      </div>
    </main>
  );
}
