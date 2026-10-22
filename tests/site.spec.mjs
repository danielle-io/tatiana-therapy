import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 600, 768, 820, 1024, 1440]) {
  test(`layout, assets, and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator(".portrait-frame img").scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator(".portrait-frame img").evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.locator(".art-frame img").evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("mobile menu, Escape, and anchor focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(nav).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await menu.click();
  await nav.getByRole("link", { name: "Specialties" }).click();
  await expect(page).toHaveURL(/#specialties$/);
  await expect(nav).toBeHidden();
  await expect(page.locator("#specialties")).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(nav).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(nav).toBeHidden();
});

test("specialty cards and FAQs work with a keyboard", async ({ page }) => {
  await page.goto("/");
  const specialty = page.locator(".specialty-card").first();
  await specialty.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(specialty).toHaveAttribute("open", "");
  await expect(specialty.locator(".card-detail")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(specialty).not.toHaveAttribute("open", "");
  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  await expect(faq.locator("p")).toBeVisible();
});

test("contact routes, anchor targets, and demo safety", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Email Tatiana" })).toHaveAttribute("href", "mailto:tatiana@tatianabtherapy.com?subject=Therapy%20consultation");
  await expect(page.getByRole("link", { name: "Call (858) 215-1824" })).toHaveAttribute("href", "tel:+18582151824");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator("form, input, textarea")).toHaveCount(0);
  const missingTargets = await page.locator('a[href^="#"]').evaluateAll((links) => links.filter((link) => !document.getElementById(link.hash.slice(1))).map((link) => link.hash));
  expect(missingTargets).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("navigation and disclosures remain usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  await expect(faq.locator("p")).toBeVisible();
  await context.close();
});
