async function  runPerformanceReview(URLs) {

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
  
      await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage(),
      ]);
  
      //Gathering Coverage Data
      const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
      ]);
      const calculateUsedBytes = (type, coverage) =>
        coverage.map(({url, ranges, text}) => {
          let usedBytes = 0;
    
          ranges.forEach((range) => (usedBytes += range.end - range.start - 1));
    
          return {
            url,
            type,
            usedBytes,
            totalBytes: text.length,
            percentUsed: `${(usedBytes / text.length * 100).toFixed(2)}%`
          };
        });
      const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
      console.log(`Page load time: ${loadTime} ms`);
      metrics.push(loadTime)
      await browser.close();
    }
  
    console.log('All done')
  
  }
  