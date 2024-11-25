async function runMetricTest(){
    const observer = new PerformanceObserver((list) => {
      let coreWebVitals = []
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      entry.forEach(entry => {
        if(entry.name === 'first-contentful-paint'){
          const firstContentfulPaint = {
            name: 'First Contentful Paint',
            time: entry.value,
            duration: entry.duration,
          }
          coreWebVitals.push(firstContentfulPaint)
  
          console.log('First Contentful Paint:', entry.startTime)
        }
        if(entry.name === 'largest-contentful-paint'){
          const largestContentfulPaint = {
            name: 'Largest Contentful Paint',
            time: entry.value,
            duration: entry.duration,
          }
          coreWebVitals.push(largestContentfulPaint)
        }
        if(entry.name === 'layout-shift'){
          for (const entry of list.getEntries()) {
            // Count layout shifts without recent user input only
            if (!entry.hadRecentInput) {
              const cumulativeLayoutShift = {
                name: 'Cumulative Layout Shift',
                value: entry.value,
                duration: entry.duration,
              }
              coreWebVitals.push(cumulativeLayoutShift)
              if (entry.sources) {
                for (const { node, currentRect, previousRect } of entry.sources)
                  console.log("LayoutShift source:", node, {
                    currentRect,
                    previousRect,
                  });
              }
            }
          }
          console.log('Layout Shift:', entry.startTime)
        }
        if(entry.name === 'long-task'){
          const longTask = {
            name: 'Long Task',
            time: entry.value,
            duration: entry.duration,
          }
          coreWebVitals.push(longTask)
  
          console.log('Long Task:', entry.startTime)
        }
        
      });
      
      
    });
    observer.observe({ type: ['first-contentful-paint','largest-contentful-paint', "layout-shift", "long-animation-frame"], buffered: true });
  }
