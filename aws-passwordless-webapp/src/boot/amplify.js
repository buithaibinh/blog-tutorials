import '@aws-amplify/ui-vue/styles.css';

import { boot } from 'quasar/wrappers';

import AmplifyVue from '@aws-amplify/ui-vue';

// eslint-disable-next-line object-curly-newline
import { Amplify, Storage, Auth } from 'aws-amplify';
import awsconfig from 'src/aws-exports';

Amplify.configure(awsconfig);

Auth.configure({
  authenticationFlowType: 'CUSTOM_AUTH'
});

export default boot(({ app }) => {
  app.use(AmplifyVue);
  app.config.globalProperties.$Storage = Storage;
});

export { awsconfig };
