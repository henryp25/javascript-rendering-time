import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import {ReportGenerator} from 'lighthouse/report/generator/report-generator.js';
import request from 'request';
import util from 'util';
import fs from 'fs';

// Lighthouse script for getting URL JS elements

async function lighthouseFromPuppeteer(url, options, config) {
    let lighthouseReport = []
    let scriptAnalysis = []
    let resourceSummary = []
    // Launch chrome using chrome-launcher
    const chrome = await chromeLauncher.launch(options);
    options.port = chrome.port;
    console.log(url)
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

    // Total Byte Weight
    const totalByteWeight = audits['total-byte-weight'].numericValue;
    // Script Analysis
    const scriptTreemapData = audits['script-treemap-data'].details.nodes;
    for (let i = 0; i < scriptTreemapData.length; i++) {
        const ResourceSize = scriptTreemapData[i].resourceBytes
        const UnusedBytes = scriptTreemapData[i].unusedBytes
        const Name = scriptTreemapData[i].name
        scriptAnalysis.push({
            Name,
            ResourceSize,
            UnusedBytes
        })
    }

    const resourceCollection = audits['resource-summary'].details.items;

    for(let i = 0; i < resourceCollection.length; i++){
        const resourceType = resourceCollection[i].resourceType
        const resourceCount = resourceCollection[i].resourceCount
        const transferSize = resourceCollection[i].transferSize
        resourceSummary.push({
            resourceType,
            resourceCount,
            transferSize
        })
    }


    const diagnostics = audits['diagnostics'].details.items;


    // Pushing lighthouse Data to lighthouseReport
    lighthouseReport.push({
        totalByteWeight,
        scriptAnalysis,
        resourceSummary,
        diagnostics
    });
    fs.writeFile('documents/jsonTests/lighthouse.json', JSON.stringify(lighthouseReport), (err) => {
        if (err) {
            console.error(err);
        }
    }
    );

    // Creating audit variables for file

    return lighthouseReport;

}

export default lighthouseFromPuppeteer;