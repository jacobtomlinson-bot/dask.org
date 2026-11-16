import { chromium } from '@playwright/test';
export async function referenceBrowser() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route('**/*', async (route) => {
    if (!['GET', 'HEAD'].includes(route.request().method()))
      return route.abort();
    try {
      const r = await fetch(route.request().url(), {
        signal: AbortSignal.timeout(15000),
      });
      await route.fulfill({
        status: r.status,
        headers: Object.fromEntries(
          [...r.headers].filter(
            ([k]) => !['content-encoding', 'content-length'].includes(k),
          ),
        ),
        body: Buffer.from(await r.arrayBuffer()),
      });
    } catch {
      await route.abort();
    }
  });
  return { browser, context };
}
