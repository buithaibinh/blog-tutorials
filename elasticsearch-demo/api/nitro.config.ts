import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  storage: {
    db: {
      driver: 'fs',
      base: './data/db'
    }
  }
});
