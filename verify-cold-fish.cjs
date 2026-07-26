const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("http://127.0.0.1:4178/phim0/0/phim.html", { waitUntil: "networkidle" });
  const card = await page.locator(".movie-card--coldfish").count();
  await page.locator(".movie-card--coldfish").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "C:/Users/dangt/AppData/Local/Temp/cold-fish-library.png",
    fullPage: false
  });
  await page.locator(".movie-card--coldfish a").first().click();
  await page.waitForLoadState("networkidle");

  const desktop = {
    title: await page.title(),
    h1: await page.locator("h1").innerText(),
    images: await page.locator("img").count(),
    broken: await page.locator("img").evaluateAll((images) =>
      images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
    ),
    spoilerOpen: await page.locator(".cold-spoiler").getAttribute("open"),
    overflow: await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
  };

  await page.locator(".cold-spoiler summary").click();
  desktop.spoilerAfterClick = await page.locator(".cold-spoiler").getAttribute("open");
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "C:/Users/dangt/AppData/Local/Temp/cold-fish-desktop.png",
    fullPage: false
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4178/phim0/0/cold-fish.html", { waitUntil: "networkidle" });
  const mobile = {
    overflow: await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ),
    menuVisible: await page.locator("[data-menu-button]").isVisible(),
    broken: await page.locator("img").evaluateAll((images) =>
      images.filter((image) => !image.complete || image.naturalWidth === 0).length
    )
  };
  await page.screenshot({
    path: "C:/Users/dangt/AppData/Local/Temp/cold-fish-mobile.png",
    fullPage: false
  });

  console.log(JSON.stringify({ card, desktop, mobile, errors }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
