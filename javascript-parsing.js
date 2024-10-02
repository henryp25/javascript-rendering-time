const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the webpage you want to test
  await page.goto('https://example.com');

  // Measure the page load time
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
  console.log(`Page load time: ${loadTime} ms`);

  await browser.close();
})();
