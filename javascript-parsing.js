const puppeteer = require('puppeteer');
import {PredefinedNetworkConditions} from 'puppeteer';

//  Measure the page load time
const slow3G = PredefinedNetworkConditions['Slow 3G'];
const fast3G = PredefinedNetworkConditions['Fast 3G'];
const slow4g = PredefinedNetworkConditions['Slow 4G'];
const fast4G = PredefinedNetworkConditions['Fast 4G'];

const URLs = [
  'https://example.com',
  'https://example.com',
  'https://example.com'
]

(async () => {

  let metrics = []
  for (let url of URLs){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.emulateNetworkConditions(fast3G);
    page.evaluateOnNewDocument(runMetricTest)
    await page.goto(url);
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    console.log(`Page load time: ${loadTime} ms`);
    metrics.push(loadTime)
    await browser.close();
  }
  buildCoreWebVitalReport(metrics)
  console.log('All done')

})();



async function buildCoreWebVitalReport(){
  const metrics = await runBrowserTest(url)
  console.log(metrics)
}