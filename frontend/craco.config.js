module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source map generation completely
      webpackConfig.devtool = false;
      
      // Remove source-map-loader to prevent the error
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        if (rule.enforce === 'pre' && rule.use) {
          return !rule.use.some(use => 
            use.loader && use.loader.includes('source-map-loader')
          );
        }
        return true;
      });
      
      // Ignore source map warnings for react-icons
      webpackConfig.ignoreWarnings = [
        {
          module: /react-icons/,
        },
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];
      
      return webpackConfig;
    },
  },
};
