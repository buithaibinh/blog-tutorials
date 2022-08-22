// Import these dependencies
const withTranspileModules = require('next-transpile-modules');
const withPlugins = require('next-compose-plugins');

const nextConfig = {
  // ...our app configuration
};

// Here we will add a plugin to our configuration to transpile the CloudScape components into
// components that are compatible with our NextJS app
module.exports = withPlugins(
  [withTranspileModules(['@cloudscape-design/components'])],
  nextConfig
);
