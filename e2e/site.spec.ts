// ── site e2e ──────────────────────────────────────────────────────────────────
// The release gate for the site shell: every route answers, renders without
// console errors, never scrolls sideways on a phone, shows all of its text
// under reduced motion (and without JavaScript), carries its metadata, and
// the old /artists URLs land on the new pages. The background stage has its
// own suite (e2e/stage.spec.ts, revamp-stage).

import { expect, test, type Page } from "@playwright/test";
import content from "../lib/content.json" with { type: "json" };

const SECTIONS = ["/", "/events", "/music", "/about", "/join"];
const FOUNDERS = content.founders.map((f) => `/about/${f.slug}`);
const EVENTS = content.events.map((e) => `/events/${e.slug}`);
const PAGES = [...SECTIONS, ...FOUNDERS, ...EVENTS];
// the pages that differ in layout; every event page shares one template
const SAMPLE = [...SECTIONS, ...FOUNDERS, EVENTS[0], "/events/bonnaroo-renegade-stage-2025-06"];

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

/** wheel through the whole page so every one-shot reveal fires */
async function scrollThrough(page: Page) {
  const { h, total } = await page.evaluate(() => ({ h: window.innerHeight, total: document.documentElement.scrollHeight }));
  for (let y = 0; y < total; y += h * 0.8) {
    await page.mouse.wheel(0, h * 0.8);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(600);
}

/** text in <main> that isn't fully shown: an ancestor at opacity < 1 or
 *  visibility hidden (what entrances and reveals use). display: none is left
 *  out on purpose: that's a responsive variant (a date shown only on phones). */
const hiddenText = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    const main = document.querySelector("main");
    if (!main) return ["no <main>"];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent?.trim();
      if (!text) continue;
      let el = n.parentElement;
      if (el?.closest(".sr-only, [aria-hidden='true'], script, style, video")) continue;
      while (el && el !== document.body) {
        const s = getComputedStyle(el);
        if (s.display === "none") break;
        if (s.visibility === "hidden" || Number(s.opacity) < 1) {
          out.push(`${text.slice(0, 40)} (${el.tagName.toLowerCase()} opacity ${s.opacity}, ${s.visibility})`);
          break;
        }
        el = el.parentElement;
      }
    }
    return out;
  });

test.describe("routes", () => {
  for (const path of [...PAGES, "/llms.txt", "/robots.txt", "/sitemap.xml", "/opengraph-image", "/icon.png", "/favicon.ico"]) {
    test(`${path} answers 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
    });
  }

  test("an unknown page is a 404", async ({ request }) => {
    expect((await request.get("/no-such-page")).status()).toBe(404);
    expect((await request.get("/events/no-such-night")).status()).toBe(404);
  });

  for (const [from, to] of [["/artists/p", "/about/peter"], ["/artists/b", "/about/brody"], ["/artists/j", "/about/jack"], ["/artists", "/about"], ["/sounds", "/music"], ["/collective", "/about"], ["/collective/peter", "/about/peter"]]) {
    test(`${from} redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to);
    });
  }

  test("every media file named in content.json is served", async ({ request }) => {
    const srcs = new Set<string>([
      ...content.events.flatMap((e) => e.media.map((m) => m.src)),
      ...content.founders.map((f) => f.image),
      ...content.collective.moments.map((m) => m.src),
      ...content.supportArtists.map((a) => a.logo),
    ]);
    const bad: string[] = [];
    await Promise.all(
      [...srcs].map(async (src) => {
        const res = await request.head(encodeURI(src));
        if (res.status() !== 200) bad.push(`${src} → ${res.status()}`);
      }),
    );
    expect(bad).toEqual([]);
  });
});

test.describe("pages", () => {
  for (const path of SAMPLE) {
    test(`${path} renders without console errors`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await scrollThrough(page);
      expect(errors).toEqual([]);
    });
  }

  test("every page carries its metadata", async ({ request }) => {
    for (const path of PAGES) {
      const html = await (await request.get(path)).text();
      const meta = (re: RegExp) => html.match(re)?.[1];
      expect(meta(/<title>([^<]+)<\/title>/), `${path} title`).toBeTruthy();
      expect(meta(/<meta name="description" content="([^"]+)"/), `${path} description`).toBeTruthy();
      expect(meta(/<link rel="canonical" href="([^"]+)"/), `${path} canonical`).toBe(`https://${content.site.domain}${path === "/" ? "" : path}`);
      expect(meta(/<meta property="og:image" content="([^"]+)"/), `${path} og:image`).toMatch(/opengraph-image/);
      expect(html, `${path} text alternate`).toContain('type="text/plain" href="https://pbandjsounds.com/llms.txt"');
      for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)) JSON.parse(json);
    }
  });

  test("each event page has MusicEvent JSON-LD; each founder page a Person", async ({ request }) => {
    const ld = async (path: string) =>
      [...(await (await request.get(path)).text()).matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].flatMap(([, j]) => [JSON.parse(j)].flat());
    expect((await ld(EVENTS[0])).some((x) => x["@type"] === "MusicEvent" && x.startDate)).toBe(true);
    expect((await ld(FOUNDERS[0])).some((x) => x["@type"] === "Person")).toBe(true);
    expect((await ld("/")).some((x) => [x["@type"]].flat().includes("MusicGroup"))).toBe(true);
  });

  test("/llms.txt is plain text in llmstxt.org shape", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body).toMatch(/^# PB&J Sounds\n\n> /);
    expect(body).toContain("## Founders");
    expect(body).toContain("## Events played");
  });

  test("every page wrapper names its stage scene; founder pages their artist", async ({ page }) => {
    const scenes: Record<string, string> = { "/": "landing", "/events": "events", "/music": "music", "/about": "about", "/join": "join" };
    for (const [path, scene] of Object.entries(scenes)) {
      await page.goto(path);
      await expect(page.locator(`main[data-stage-scene="${scene}"]`)).toHaveCount(1);
      expect(await page.locator("main [data-stage-anchor]").count()).toBeGreaterThan(0);
    }
    await page.goto(EVENTS[0]);
    await expect(page.locator('main[data-stage-scene="event"]')).toHaveCount(1);
    for (const f of content.founders) {
      await page.goto(`/about/${f.slug}`);
      await expect(page.locator(`main[data-stage-scene="artist"][data-stage-artist="${f.id}"]`)).toHaveCount(1);
    }
  });

  test("videos never autoplay and wait behind a poster", async ({ page }) => {
    await page.goto("/events/bonnaroo-renegade-stage-2025-06");
    const videos = page.locator("main video");
    expect(await videos.count()).toBeGreaterThan(0);
    for (const v of await videos.all()) {
      await expect(v).not.toHaveAttribute("autoplay");
      await expect(v).toHaveAttribute("preload", "none");
      await expect(v).toHaveAttribute("poster", /.+/);
      expect(await v.evaluate((el: HTMLVideoElement) => el.muted && el.paused)).toBe(true);
    }
    await expect(page.locator("iframe")).toHaveCount(0);
  });
});

test.describe("links and players", () => {
  test("no third-party player loads until someone presses play", async ({ page }) => {
    const thirdParty: string[] = [];
    page.on("request", (r) => {
      if (/w\.soundcloud\.com|open\.spotify\.com\/embed|youtube-nocookie\.com/.test(r.url())) thirdParty.push(r.url());
    });
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator("iframe")).toHaveCount(0);
    }
    expect(thirdParty).toEqual([]);
  });

  test("pressing play on a founder's player loads the official player in place", async ({ page }) => {
    // Brody has a Spotify artist page in content.json, so his page always has a player
    await page.route(/open\.spotify\.com\/embed/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" }));
    await page.goto("/about/brody");
    const facade = page.locator("[data-embed-facade]");
    await expect(facade).toHaveCount(1);
    // the player sits in a section that fades in on scroll; scroll to it like a reader
    await facade.scrollIntoViewIfNeeded();
    await expect(facade).toHaveAccessibleName("Play Monty on Spotify");
    await expect(facade).toHaveAttribute("href", /open\.spotify\.com\/artist\//);
    const size = async () => {
      const b = await page.locator("[data-embed]").boundingBox();
      return b && { width: Math.round(b.width), height: Math.round(b.height) };
    };
    const before = await size();
    await facade.click();
    const frame = page.locator('[data-embed] iframe[src^="https://open.spotify.com/embed/artist/"]');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("title", "Monty on Spotify");
    // the player takes the poster's box: nothing around it moves
    expect(await size()).toEqual(before);
    await expect(page).toHaveURL(/\/about\/brody$/);
  });

  test("every outbound link shows an icon and has a name", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      for (const a of await page.locator('a[target="_blank"], a[href^="mailto:"]').all()) {
        const href = await a.getAttribute("href");
        expect(await a.locator("svg").count(), `${path}: ${href} has an icon`).toBeGreaterThan(0);
        expect((await a.evaluate((el) => (el.getAttribute("aria-label") ?? el.textContent ?? "").trim())).length, `${path}: ${href} has a name`).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("phone width", () => {
  for (const width of [320, 390]) {
    test(`no horizontal scroll at ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const wide: string[] = [];
      for (const path of SAMPLE) {
        await page.goto(path, { waitUntil: "networkidle" });
        await scrollThrough(page);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 0) wide.push(`${path} +${over}px`);
      }
      expect(wide).toEqual([]);
      await ctx.close();
    });
  }

  test("the nav is visible on a phone", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto("/events");
    for (const label of ["events", "music", "about", "join"]) {
      await expect(page.getByRole("navigation", { name: "site" }).getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await ctx.close();
  });
});

test.describe("reduced motion and no JavaScript", () => {
  test("reduced motion: every word is visible without scrolling into it", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    for (const path of SAMPLE) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      expect(await hiddenText(page), path).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.dataset.lenis), `${path} lenis off`).toBeUndefined();
    }
    await ctx.close();
  });

  test("without JavaScript every page still reads in full", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    for (const path of SAMPLE) {
      await page.goto(path);
      expect(await page.locator("main h1").count(), path).toBe(1);
      expect(await hiddenText(page), path).toEqual([]);
    }
    await ctx.close();
  });

  test("with motion on, reveals below the fold end fully shown", async ({ page }) => {
    for (const path of ["/events", "/about/brody"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await scrollThrough(page);
      await page.waitForTimeout(1200);
      expect(await hiddenText(page), path).toEqual([]);
    }
  });
});

test("no layout shift on the landing or /events", async ({ page }) => {
  for (const path of ["/", "/events"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let sum = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) sum += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(sum), 300);
        }),
    );
    expect(cls, path).toBeLessThan(0.01);
  }
});
