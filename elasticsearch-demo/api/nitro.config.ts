import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  storage: {
    db: {
      driver: 'fs',
      base: './data/db'
    },
  },
  srcDir: 'src/',
  rootDir: '.',
  alias: {
    '@': '~',
    '@helper': '~/helper',
  }
});
