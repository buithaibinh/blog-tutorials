<template>
  <q-page padding>
    <div class="col q-gutter-sm">
      <q-input v-model="url" dense outlined>
        <template #before>
          <q-icon name="link" />
        </template>

        <template #after>
          <q-btn
            flat
            dense
            label="Test API"
            @click="onClick"
            :loading="loading"
          />
        </template>
      </q-input>
      <div>
        <div class="text-body1">Payload</div>
        <JsonEditorVue
          v-model="payload"
          v-bind="{
            /* local props & attrs */
          }"
        />
      </div>

      <div>
        <div class="text-body1">Config</div>
        <JsonEditorVue
          v-model="config"
          v-bind="{
            /* local props & attrs */
          }"
        />
      </div>
    </div>

    <q-separator spaced />
    <div>
      <div class="text-body1">Response</div>
      <json-viewer :value="data" copyable :expand-depth="2" sort />
    </div>
  </q-page>
</template>

<script setup>
import { api } from 'boot/axios';
import { ref } from 'vue';
import JsonEditorVue from 'json-editor-vue';

const loading = ref(false);
const data = ref({});

const url = ref(
  'https://m4d0hygt0l.execute-api.ap-southeast-1.amazonaws.com/dev/wagyu'
);

const payload = ref({
  id: '1251446067'
});

const config = ref({
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'x'
  }
});

const onClick = async () => {
  loading.value = true;
  data.value = {};
  try {
    const { data: response } = await api.post(
      url.value,
      JSON.stringify(payload.value),
      config.value
    );
    data.value = response;
  } catch (error) {
    data.value = error;
  } finally {
    loading.value = false;
  }
};
</script>
