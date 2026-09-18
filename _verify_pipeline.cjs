const { chromium } = require("playwright-core");
const EXECUTABLE = "C:\\Users\\morsh\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe";

const TEST_ITEM_NAME = "E2E Pipeline Test Burger";

async function login(browser, email, password) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/auth/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => url.pathname !== "/auth/login", { timeout: 90000 });
  return { ctx, page };
}

async function main() {
  const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
  const results = {};

  // ---------- STEP 1: vendor adds a real menu item ----------
  console.log("=== STEP 1: Vendor adds a new menu item ===");
  const vendor = await login(browser, "rakib.hasan@foodiegotest.com", "Test@1234");
  await vendor.page.goto("http://localhost:3000/vendor?tab=menu", { waitUntil: "domcontentloaded", timeout: 60000 });
  await vendor.page.waitForSelector('button:has-text("Add New Item")', { timeout: 60000 });
  await vendor.page.waitForTimeout(2000); // let hydration finish before clicking
  await vendor.page.click('button:has-text("Add New Item")');
  await vendor.page.waitForSelector('input[placeholder="e.g. Classic Smash Burger"]', { timeout: 30000 });
  await vendor.page.fill('input[placeholder="e.g. Classic Smash Burger"]', TEST_ITEM_NAME);
  await vendor.page.fill('input[placeholder="e.g. 450"]', "199");
  await vendor.page.click('button:has-text("Create Item")');
  await vendor.page.waitForTimeout(4000);
  const itemInVendorList = await vendor.page.isVisible(`text=${TEST_ITEM_NAME}`);
  results.itemCreatedInVendorDashboard = itemInVendorList;
  console.log("Item visible in vendor's own menu list:", itemInVendorList);

  // ---------- STEP 2: confirm it shows on the public restaurant page ----------
  console.log("\n=== STEP 2: Confirm item shows on public restaurant page ===");
  const publicCtx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const publicPage = await publicCtx.newPage();
  await publicPage.goto("http://localhost:3000/restaurants/spice-garden", { waitUntil: "domcontentloaded", timeout: 60000 });
  await publicPage.waitForSelector('h1:has-text("Spice Garden")', { timeout: 60000 });
  await publicPage.waitForTimeout(3000);
  const itemOnPublicPage = await publicPage.isVisible(`text=${TEST_ITEM_NAME}`);
  results.itemVisibleOnPublicMenu = itemOnPublicPage;
  console.log("Item visible on public restaurant menu page:", itemOnPublicPage);
  await publicCtx.close();

  // ---------- STEP 3: customer places a real order for it ----------
  console.log("\n=== STEP 3: Customer places an order ===");
  const customer = await login(browser, "ayesha.rahman@foodiegotest.com", "Test@1234");
  await customer.page.goto("http://localhost:3000/restaurants/spice-garden", { waitUntil: "domcontentloaded", timeout: 60000 });
  await customer.page.waitForSelector(`text=${TEST_ITEM_NAME}`, { timeout: 60000 });
  await customer.page.waitForTimeout(3000);
  const itemCard = customer.page.locator(`div:has-text("${TEST_ITEM_NAME}")`).locator('button:has-text("Add to Cart")').first();
  await itemCard.click();
  await customer.page.waitForTimeout(1500);

  await customer.page.goto("http://localhost:3000/client/checkout", { waitUntil: "domcontentloaded", timeout: 60000 });
  await customer.page.waitForSelector('input[name="fullName"]', { timeout: 60000 });
  await customer.page.waitForTimeout(1500);
  await customer.page.fill('input[name="fullName"]', "Ayesha Rahman");
  await customer.page.fill('input[name="email"]', "ayesha.rahman@foodiegotest.com");
  await customer.page.fill('input[name="phone"]', "01700000000");
  await customer.page.selectOption('select[name="city"]', "Dhaka");
  await customer.page.fill('input[name="area"]', "Gulshan");
  await customer.page.fill('textarea[name="address"]', "House 99, Road 9");

  let placedOrderId = null;
  customer.page.on("response", (res) => {
    if (res.url().includes("/api/v1/client/orders") && res.request().method() === "POST") {
      res.json().then((j) => { if (j.order?._id) placedOrderId = j.order._id; }).catch(() => {});
    }
  });

  await customer.page.click('button[type="submit"]:has-text("Place order")');
  await customer.page.waitForTimeout(5000);
  const orderSuccess = await customer.page.isVisible('text=Order confirmed').catch(() => false);
  results.orderPlaced = orderSuccess;
  results.placedOrderId = placedOrderId;
  console.log("Order placed successfully:", orderSuccess, "orderId:", placedOrderId);

  // ---------- STEP 4: rider sees it as an available delivery and accepts ----------
  console.log("\n=== STEP 4: Rider accepts the delivery ===");
  const rider = await login(browser, "rahim.uddin@foodiegotest.com", "Test@1234");
  await rider.page.goto("http://localhost:3000/rider", { waitUntil: "domcontentloaded", timeout: 60000 });
  await rider.page.waitForTimeout(8000); // AvailableDeliveries polls on a timer, give it a cycle

  const seesTestOrder = await rider.page.isVisible(`text=${TEST_ITEM_NAME}`).catch(() => false);
  console.log("Rider sees the new order in Available Deliveries:", seesTestOrder);

  let accepted = false;
  const acceptBtn = rider.page.locator('button:has-text("Accept")').first();
  if (await acceptBtn.count() > 0) {
    await acceptBtn.click();
    await rider.page.waitForTimeout(3000);
    accepted = true;
  }
  results.riderAcceptedClick = accepted;

  await browser.close();

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(results, null, 2));

  require("fs").writeFileSync("_pipeline_result.json", JSON.stringify(results, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
