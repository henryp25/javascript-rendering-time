const puppeteer = require('puppeteer');
import {PredefinedNetworkConditions} from 'puppeteer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { parse } from 'csv-parse';
// Lighthouse script for getting URL JS elements
import lighthouseFromPuppeteer from './config/lighthouse-audit.js';
// LightHouse Options
import perfConfig  from './config/perf-config.js';


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


//Emulating conditions
const emulatedConditions = {
  offline: false,
  latency: 40,
  downloadThroughput: 1.5 * 1024 * 1024 / 8,
  uploadThroughput: 750 * 1024 / 8,
  cpuSlowdown: 4,
  deviceSpeed: [
    {
      'slow3g':slow3G,
      'fast3g':fast3G,
      'slow4g':slow4g,
      'fast4g':fast4G
    }
  ]
      };



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
            // runPerformanceReview(url),
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
