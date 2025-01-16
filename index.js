import puppeteer from 'puppeteer';
import {PredefinedNetworkConditions} from 'puppeteer';
import fs from 'fs';
import { parse } from 'csv-parse';
// Lighthouse script for getting URL JS elements
import lighthouseFromPuppeteer from './config/lighthouse-audit.js';
import runPerformanceReview from './config/puppteerRuntime.js';

//  Measure the page load time
const slow3G = PredefinedNetworkConditions['Slow 3G'];
const fast3G = PredefinedNetworkConditions['Fast 3G'];
const slow4g = PredefinedNetworkConditions['Slow 4G'];
const fast4G = PredefinedNetworkConditions['Fast 4G'];


// Device to emulate
const device = 'mobile';

// Lighthouse conditions
const perfConfig = {
    extends: 'lighthouse:default',
    settings: {
      throttlingMethod: 'devtools',
      emulatedFormFactor:{device},
      onlyCategories: ['performance'],
    },
  };

const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: [
    '--disable-mobile-emulation',
    '--headless'
  ],
};



( () => {
  try{
    const urls = []
    const performanceResults = [];
    fs.createReadStream('documents/list_urls.csv')
      .pipe(parse({ delimiter: ',' }))
      .on('data', async (row) => {
        urls.push(row[0]);
        console.log('URLs collected:', urls);
      })
      .on('end', async () => {
        for (let i = 0; i < urls.length; i++) {
          if (urls[i] === '') {
            console.log('No URL provided');
            continue
          }
          const url = urls[i];
          console.log("Running Performance Testing");
          const performanceTesting = await Promise.all([
            lighthouseFromPuppeteer(url, options, perfConfig),
            runPerformanceReview(url),
          ]);
          const performanceTest = {
            lighthouse: performanceTesting[0],
            consolePerformance: performanceTesting[1]
          }
          console.log('Performance Testing Complete');
          performanceResults.push(performanceTest);
          fs.writeFile('documents/jsonTests/performance.json', JSON.stringify(performanceResults), (err) => {
            if (err) {
                console.error(err);
            }
        });
        } 
        console.log(performanceResults)
        const results = '/lighthouse.json'
        console.log(results)
        const csv = performanceResults.map((row) => {
            return [
              row.lighthouse.totalByteWeight,
              row.lighthouse.scriptTreemapData,
              row.lighthouse.resourceSummary,
              row.lighthouse.diagnostics,
              row.consolePerformance.lcp,
              row.consolePerformance.cls,
              row.consolePerformance.inp,
            ];

        }
        ).join('\n');
   
        fs.writeFile('documents/performance.csv', csv, (err) => {
          if (err) {
            console.error(err);
          }
        });

      })

    // console.log(performanceResults)
    // const data = [
    //   ['URL', 'Load Time', 'Bytes Used'],
    //   ['https://www.example.com', '100ms', '50%'],
    // ];
    
  
  }catch(err){
    console.error(err);
  }

})();
