import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['libs/ui-components/src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@flightctl/types': path.resolve(__dirname, 'libs/types'),
      '@flightctl/types/imagebuilder': path.resolve(__dirname, 'libs/types/imagebuilder'),
      '@flightctl/types/alpha': path.resolve(__dirname, 'libs/types/alpha'),
    },
  },
});
