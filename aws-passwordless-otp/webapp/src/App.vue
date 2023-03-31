<template>
  <router-view />
</template>

<script>
// app global css in SCSS form
import '@aws-amplify/ui-vue/styles.css';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
});
</script>
