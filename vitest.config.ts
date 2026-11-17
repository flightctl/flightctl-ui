import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['libs/ui-components/src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@flightctl/types/imagebuilder': path.resolve(__dirname, 'libs/types/imagebuilder/index.ts'),
      '@flightctl/types/alpha': path.resolve(__dirname, 'libs/types/alpha/index.ts'),
      '@flightctl/types': path.resolve(__dirname, 'libs/types/index.ts'),
    },
  },
});
