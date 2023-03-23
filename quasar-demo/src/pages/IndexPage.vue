<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />

    <q-btn color="primary" icon="check" label="OK" @click="onClick" />
  </q-page>
</template>

<script setup>
import { api } from 'boot/axios';

const onClick = async () => {
  console.log('OK');

  const { data } = await api.post(
    '/extractors/wagyu',
    {
      id: '125114460671'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'zG2B29bbmfaKrRoOdJRoq3GpyCbZ4WkW7h8ujK64'
      }
    }
  );

  console.log(data);
};
</script>
