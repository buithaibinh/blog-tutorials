<template>
  <div>
    <button @click="test">xx</button>
  </div>
</template>

<script setup>

import { useFetch } from '@nuxtjs/composition-api'

const { data: count } = await useFetch('/api/count')

const test = () => {
  console.log(count)
}
</script>
