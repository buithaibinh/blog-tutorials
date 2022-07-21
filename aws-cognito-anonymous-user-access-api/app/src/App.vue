<template>
  <div>
    <json-viewer
      :value="jsonData"
      expanded
      boxed
      copyable
      expand-depth="4"
    ></json-viewer>
  </div>
</template>

<script>
import axios from 'axios';
import { Auth } from 'aws-amplify';
import sigV4Client from './sigV4Client';
import awsExports from './aws-exports';
// @ts-ignore
import JsonViewer from 'vue-json-viewer';

const api = axios.create({
  baseURL: 'https://3wfsilfr56.execute-api.ap-southeast-1.amazonaws.com',
});

api.interceptors.request.use(async (config) => {
  // // signed request here.
  const cre = await Auth.currentCredentials();
  const signedRequest = sigV4Client
    .newClient({
      accessKey: cre.accessKeyId,
      secretKey: cre.secretAccessKey,
      sessionToken: cre.sessionToken,
      region: awsExports.aws_cognito_region,
      endpoint: config.baseURL,
    })
    .signRequest({
      method: config.method,
      path: config.url,
      body: config.data,
    });

  config.headers = {
    ...config.headers,
    ...signedRequest.headers,
  };

  return config;
});

export default {
  name: 'App',
  components: {
    JsonViewer,
  },
  data() {
    return {
      jsonData: null,
    };
  },

  created() {
    this.load();
  },

  methods: {
    async load() {
      const res = await api.get('/api/test', {});
      // @ts-ignore
      this.jsonData = res.data;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
