import { quasar } from '@quasar/vite-plugin';

export default defineNuxtConfig({
  build: {
    transpile: ['quasar']
  },
  css: [
    '@quasar/extras/roboto-font/roboto-font.css',
    '@quasar/extras/material-icons/material-icons.css',
    '@quasar/extras/fontawesome-v6/fontawesome-v6.css',
    '~/assets/styles/quasar.sass',
    '@aws-amplify/ui-vue/styles.css'
  ],
  vite: {
    define: {
      // "process.env.DEBUG": false,
    },
    plugins: [
      quasar({
        sassVariables: 'assets/styles/quasar-variables.sass'
      })
    ],
    resolve: {
      alias: [
        {
          find: './runtimeConfig',
          replacement: './runtimeConfig.browser'
        }
      ]
    }
  },

  app: {
    head: {
      script: [{ src: 'js/polyfills.js' }]
    }
  }
});
