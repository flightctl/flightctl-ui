import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['libs/ui-components/src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: [
      { find: /^@flightctl\/types$/, replacement: path.resolve(__dirname, 'libs/types/index.ts') },
      {
        find: /^@flightctl\/types\/imagebuilder$/,
        replacement: path.resolve(__dirname, 'libs/types/imagebuilder/index.ts'),
      },
      {
        find: /^@flightctl\/types\/alpha$/,
        replacement: path.resolve(__dirname, 'libs/types/alpha/index.ts'),
      },
    ],
  },
});
