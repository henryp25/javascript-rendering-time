import puppeteer from 'puppeteer';
import fs from 'fs';
import { parse } from 'csv-parse';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import {ReportGenerator} from 'lighthouse/report/generator/report-generator.js';
import request from 'request';
import util from 'util';

// Lighthouse script for getting URL JS elements

async function lighthouseFromPuppeteer(url, options, config) {
    let lighthouseReport = []
    // Launch chrome using chrome-launcher
    const chrome = await chromeLauncher.launch(options);
    options.port = chrome.port;

    // Connect chrome-launcher to puppeteer
    const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
    const { webSocketDebuggerUrl } = JSON.parse(resp.body);
    const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

    // Run Lighthouse
    const { lhr } = await lighthouse(url, options, config);
    await browser.disconnect();
    chrome.kill();

    const json = ReportGenerator.generateReport(lhr, 'json');

    const audits = JSON.parse(json).audits; // Lighthouse audits

    //   LightHouse Audits
    const totalByteWeight = audits['total-byte-weight'].displayValue;
    const scriptTreemapData = audits['script-treemap-data'].details.items;
    const resourceSummary = audits['resource-summary'].details.items;
    const diagnostics = audits['diagnostics'].details.items;

    // Pushing lighthouse Data to lighthouseReport
    lighthouseReport.push({
        totalByteWeight,
        scriptTreemapData,
        resourceSummary,
        diagnostics
    });

    // Creating audit variables for file
    

  console.log(lighthouseReport);
}

export default lighthouseFromPuppeteer;