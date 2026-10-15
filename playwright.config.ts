import { chromium, defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// e2e against a production build (dev mode isn't representative). By default
// it builds and starts one on E2E_PORT (3200), or reuses a server already
// there; set E2E_BASE_URL to aim it at a running server or a preview
// deployment instead.
//
// Browser: PW_CHROMIUM if set, else the bundled revision, else the newest
// Chromium already in the local Playwright cache (macOS), so a version bump
// doesn't force a download; `npx playwright install chromium` otherwise.
function cachedChromium(): string | undefined {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  if (existsSync(chromium.executablePath())) return undefined;
  const cache = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return undefined;
  const app = "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
  return readdirSync(cache)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
    .flatMap((d) => ["chrome-mac-arm64", "chrome-mac-x64", "chrome-mac"].map((sub) => join(cache, d, sub, app)))
    .find(existsSync);
}

const PORT = Number(process.env.E2E_PORT ?? 3200);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: cachedChromium() },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 300_000,
        // lib/supabase.ts (backend-owned) throws at import without these; the
        // e2e suite never calls Supabase, so placeholders are enough to build
        env: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://e2e.invalid",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "e2e-placeholder",
        },
      },
});
