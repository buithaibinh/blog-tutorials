<template>
  <q-page padding>
    <div class="col q-gutter-sm">
      <q-input v-model="url" dense outlined>
        <template #before>
          <q-select
            v-model="method"
            :options="methods"
            dense
            outlined
            style="width: 100px"
          />
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
const method = ref('POST');

const methods = ref(['POST', 'GET', 'PUT', 'DELETE']);

const url = ref(
  'https://jg7xfcg55g.execute-api.ap-southeast-1.amazonaws.com/dev/events'
);

const payload = ref({
  user_id: 'binhbv',
  item_id: '111',
  event_type: 'click',
  event_value: '2222',
  xx: 'xcxcsa'
});

const config = ref({
  headers: {
    'Content-Type': 'application/json'
  }
});

const onClick = async () => {
  loading.value = true;
  data.value = {};
  try {
    const { data: response } = await api.request(
      {
        url: url.value,
        method: method.value,
        data: payload.value
      },
      {
        headers: config.value.headers
      }
    );
    data.value = response;
  } catch (error) {
    data.value = error;
  } finally {
    loading.value = false;
  }
};
</script>
