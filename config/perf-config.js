// Content: Lighthouse performance configuration
const perfConfig = {
    extends: 'lighthouse:default',
    settings: {
      throttlingMethod: 'devtools',
      onlyCategories: ['performance'],
    },
  };
  
  export default perfConfig;