import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents() {},
    specPattern: './**/*.cy.ts',
    supportFile: 'libs/cypress/support/index.ts',
    baseUrl: 'http://localhost:9000',
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 5,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
