const { chromium } = require("playwright-core");
const EXECUTABLE = "C:\\Users\\morsh\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe";

async function main() {
  const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

  page.on("console", (msg) => console.log(`[console:${msg.type()}]`, msg.text().slice(0, 300)));
  page.on("pageerror", (err) => console.log("[pageerror]", err.message));
  page.on("requestfailed", (req) => console.log("[requestfailed]", req.method(), req.url(), req.failure()?.errorText));
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/vendor/menu")) {
      res.text().then((t) => console.log("[response]", res.status(), res.request().method(), res.url(), t.slice(0, 400))).catch(() => {});
    }
  });

  console.log("Logging in...");
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill('input[name="email"]', "rakib.hasan@foodiegotest.com");
  await page.fill('input[name="password"]', "Test@1234");
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => url.pathname !== "/auth/login", { timeout: 90000 });
  console.log("Logged in ->", page.url());

  console.log("Navigating to vendor menu tab...");
  await page.goto("http://localhost:3000/vendor?tab=menu", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector('button:has-text("Add New Item")', { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "_debug1_before_click.png" });

  console.log("Clicking Add New Item...");
  await page.click('button:has-text("Add New Item")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "_debug2_after_click.png" });

  const modalOpen = await page.isVisible('input[placeholder="e.g. Classic Smash Burger"]');
  console.log("Modal open:", modalOpen);

  if (modalOpen) {
    await page.fill('input[placeholder="e.g. Classic Smash Burger"]', "Debug Add Item Test");
    await page.fill('input[placeholder="e.g. 450"]', "150");
    await page.screenshot({ path: "_debug3_filled.png" });

    console.log("Clicking Create Item...");
    const createBtn = page.locator('button:has-text("Create Item")');
    console.log("Create button count:", await createBtn.count());
    console.log("Create button disabled?", await createBtn.isDisabled());
    await createBtn.click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: "_debug4_after_submit.png" });

    const errorText = await page.textContent('.text-rose-700').catch(() => null);
    console.log("Error text in modal (if any):", errorText);
    const modalStillOpen = await page.isVisible('input[placeholder="e.g. Classic Smash Burger"]');
    console.log("Modal still open after submit:", modalStillOpen);
  }

  await browser.close();
}
main().catch((e) => { console.error("SCRIPT ERROR:", e); process.exit(1); });
