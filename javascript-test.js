import puppeteer from 'puppeteer';
import fs from 'fs';
import { parse } from 'csv-parse';
// Lighthouse script for getting URL JS elements
import lighthouseFromPuppeteer from './config/lighthouse-audit.js';
// LightHouse Options
import perfConfig  from './config/perf-config.js';

const lighthouseOptions = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility'],
    emulatedFormFactor:'desktop',
    output: ['html'],
  },
}
const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: [
    '--disable-mobile-emulation',
    '--headless'
  ],
};
// Lighthouse Conditions
//Emulating conditions
const emulatedConditions = {
  offline: false,
  latency: 40,
  downloadThroughput: 1.5 * 1024 * 1024 / 8,
  uploadThroughput: 750 * 1024 / 8,
  cpuSlowdown: 4,
  deviceSpeed: [
    {
      'slow3g':'Slow 3G',
      'fast3g':'Fast 3G',
      'regular3g':'Regular 3G',
    }
  ]
      };
console.log(emulatedConditions.deviceSpeed.slow3g);







(async () => {
  try{
    const urls = []
    fs.createReadStream('documents/list_urls.csv')
      .pipe(parse({ delimiter: ',' }))
      .on('data', async (row) => {
        console.log(row);
        urls.push(row[0]);
        console.log(urls);

      })
      .on('end', async () => {
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          await Promise.all([
            console.log(`Running Script for URL: ${url}`),
            lighthouseFromPuppeteer(url, options, perfConfig),
            // getPerformanceData(url),
          ]);
        }

      })

    const data = [
      ['URL', 'Load Time', 'Bytes Used'],
      ['https://www.example.com', '100ms', '50%'],
    ];
    const csv = data.map((row) => row.join(',')).join('\n');
    fs.writeFile('documents/performance.csv', csv, (err) => {
      if (err) {
        console.error(err);
      }
    });

  
  }catch(err){
    console.error(err);
  }

})();
