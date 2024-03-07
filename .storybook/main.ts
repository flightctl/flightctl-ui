// https://storybook.js.org/blog/storybook-for-webpack-5/
module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },

  stories: ['./*.stories.tsx'],

  addons: [
    '@storybook/addon-knobs',
  ],

  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript'
  },

  docs: {
    autodocs: true
  }
};
