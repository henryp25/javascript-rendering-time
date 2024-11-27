import puppeteer from 'puppeteer';

import {PredefinedNetworkConditions} from 'puppeteer';
//  Measure the page load time
const slow3G = PredefinedNetworkConditions['Slow 3G'];
const fast3G = PredefinedNetworkConditions['Fast 3G'];
const slow4g = PredefinedNetworkConditions['Slow 4G'];
const fast4G = PredefinedNetworkConditions['Fast 4G'];

const URLs = [
  'https://www.google.com',
  'https://www.youtube.com'
]

async function  runPerformanceReview(URLs) {
    for (let url of URLs){
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.emulateNetworkConditions(fast3G);
      await page.goto(url);
    
      const cwvMetrics = await page.evaluate(() => {
        console.log('Page has loaded');
        const metricsdata = {
          lcp: null,
          cls: 0,
          inp: null,
        }
        //Gathering Coverage Data

      
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metricsdata.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({type: 'largest-contentful-paint', buffered: true});

        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metricsdata.cls = lastEntry.value
        }
        );
        clsObserver.observe({type: 'layout-shift', buffered: true});

        const inpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metricsData.INP = lastEntry.processingEnd - lastEntry.startTime;
        });
        inpObserver.observe({ type: "long-animation-frame", buffered: true });

        return new Promise((resolve) => {
          setTimeout(async () => {
            // const metricsData = {
            //   js: calculateUsedBytes('js', jsCoverage),
            //   css: calculateUsedBytes('css', cssCoverage),
            // };
            resolve(metricsdata);
          }, 5000);
        });
      });
      
      
      await browser.close();
      console.log(cwvMetrics)
    }
  
    console.log('All done')
  
  }
  
 runPerformanceReview(URLs)