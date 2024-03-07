const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const appConfig = require('../webpack.config').default;

module.exports = ({ config, mode }) => {
  config.module.rules = [];
  // TODO does it need the other rules?
  config.module.rules.push(appConfig.module.rules[0]);
  config.module.rules.push({
    test: /\.css$/,
    include: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, '../node_modules/@storybook'),
      path.resolve(__dirname, '../node_modules/patternfly'),
      path.resolve(__dirname, '../node_modules/@patternfly/patternfly'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-styles/css'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-core/dist/styles/base.css'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
      path.resolve(__dirname, '../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css')
    ],
    use: ["style-loader", "css-loader"]
  });
  config.module.rules.push({
    test: /\.tsx?$/,
    include: path.resolve(__dirname, '../src'),
    use: [
      require.resolve('react-docgen-typescript-loader'),
    ],
  })
  config.resolve.plugins = [
    new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, "../tsconfig.json")
    })
  ];
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
