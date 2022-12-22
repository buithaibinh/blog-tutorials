import { Amplify } from '@aws-amplify/core';
import awsExports from '~/aws-exports';

export default defineNuxtPlugin((nuxtApp) => {
  // https://aws.amazon.com/blogs/mobile/ssr-support-for-aws-amplify-javascript-libraries/

  Amplify.configure({ ...awsExports, ssr: true });
});
