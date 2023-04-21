<template>
  <q-page padding v-if="currentTask">
    <q-form
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      ref="formRef"
      style="margin-top: 50px"
    >
      <q-input
        v-model.trim="currentTask.id"
        label="ID"
        lazy-rules
        readonly
        dense
        outlined
        :rules="[(val) => (val && val.length > 0) || 'Please input a ID']"
      />
      <q-input
        v-model.trim="currentTask.name"
        label="Name"
        lazy-rules
        readonly
        dense
        outlined
        :rules="[(val) => (val && val.length > 0) || 'Please input a URL']"
      />
      <q-input
        v-model="currentTask.topPageUrl"
        label="Top page"
        lazy-rules
        readonly
        dense
        outlined
        :rules="[(val) => (val && val.length > 0) || 'Please input a URL']"
      >
        <template v-slot:append>
          <!-- open in new tab -->
          <q-btn
            flat
            dense
            round
            icon="open_in_new"
            @click="openInNewTab(currentTask.topPageUrl)"
          />
        </template>
      </q-input>

      <StartUrls :urls="currentTask.startUrls" ref="startRef" />
    </q-form>

    <q-page-sticky expand position="top">
      <q-toolbar class="task-header">
        <q-btn
          outline
          dense
          icon="keyboard_backspace"
          to="/tasks"
          v-if="route.query.id"
        />
        <q-toolbar-title class="row">
          <q-breadcrumbs class="text-h6">
            <q-breadcrumbs-el :label="currentTask.name" />
          </q-breadcrumbs>
          <q-chip
            :color="
              currentTask.status === 'COMPLETED'
                ? 'green'
                : currentTask.status === 'IN_PROGRESS'
                ? 'orange'
                : 'red'
            "
            :label="currentTask.status"
          />
        </q-toolbar-title>

        <q-space />
        <q-btn icon="save" label="Save" @click="save" flat class="q-mr-xs" />
        <q-btn
          dense
          icon="check"
          label="Complete"
          @click="complete"
          outline
          padding="sm"
        />
      </q-toolbar>
    </q-page-sticky>
  </q-page>

  <div
    class="absolute-center text-h4 text-primary"
    v-if="!currentTask && !loading"
  >
    All task has been Done. Congratulations!
  </div>

  <q-inner-loading
    :showing="loading"
    label="Loading your task..."
    label-class="text-teal"
    label-style="font-size: 1.1em"
  >
  </q-inner-loading>
</template>
<!-- eslint-disable operator-linebreak -->
<script>
import { useQuasar, openURL } from 'quasar';
import { ref, watch } from 'vue';
import { useTasksStore } from 'stores/tasks';
import StartUrls from 'components/StartUrls.vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventBus } from '@vueuse/core';

export default {
  components: {
    StartUrls
  },
  setup() {
    const $q = useQuasar();

    const bus = useEventBus('tasks');

    // startRef is a ref to the StartUrls component
    const startRef = ref(null);
    const formRef = ref(null);
    let dismiss = null;
    const taskStore = useTasksStore();
    const loading = ref(false);
    const currentTask = ref(null);
    const selfUpdate = ref(false);

    const { getTaskById } = taskStore;

    const route = useRoute();
    const router = useRouter();

    const showNotification = (message, color, timeout = 2000) => {
      if (dismiss) {
        dismiss();
      }
      dismiss = $q.notify({
        message,
        color,
        timeout
      });
    };

    const openInNewTab = (url) => {
      openURL(url);
    };

    const pickupAnotherTask = async () => {
      loading.value = true;
      // get query params from the route
      const { id } = route.query;
      if (id) {
        const task = await getTaskById(id);
        if (task) {
          currentTask.value = task;
        } else {
          currentTask.value = null;
        }
        loading.value = false;
        return;
      }

      const task = await taskStore.loadCurrentTask();
      if (task) {
        currentTask.value = task;
        console.log('loadCurrentTask:', task.id);
        // update status to IN_PROGRESS and assign to current user
        await taskStore.updateTaskStatus(task.id, 'IN_PROGRESS');
        selfUpdate.value = true;
      } else {
        currentTask.value = null;
      }
      loading.value = false;
    };

    const save = async () => {
      // values is an array of the values of the startUrls
      const values = await startRef.value.save();
      const success = await formRef.value.validate();
      if (!values || !success) {
        showNotification('Some errors in the form!', 'negative');
        return;
      }

      $q.loading.show();

      const task = {
        ...currentTask.value,
        startUrls: values
      };
      await taskStore.saveTask(task);
      $q.loading.hide();

      selfUpdate.value = true;

      // save to the server
      showNotification('Saved! You can continue editing later.', 'positive');
    };

    const complete = async () => {
      const values = await startRef.value.save();
      const success = await formRef.value.validate();
      if (!values || !success) {
        showNotification('Some errors in the form!', 'negative');
        return;
      }

      $q.loading.show();

      const task = {
        ...currentTask.value,
        startUrls: values,
        status: 'COMPLETED'
      };
      console.log('saving task', task);
      await taskStore.saveTask(task);
      $q.loading.hide();
      selfUpdate.value = true;
      // save to the server
      showNotification('Completed! Pickup another task...', 'positive');

      // load another task
      await pickupAnotherTask();
    };

    const listener = (event, task) => {
      const { id } = task;
      // if the task was changed is the current task then ask the user to reload
      if (
        currentTask.value &&
        currentTask.value.id === id &&
        !selfUpdate.value
      ) {
        $q.notify({
          message:
            'The task was changed by another user! Please reload the page.',
          color: 'primary',
          actions: [
            {
              label: 'Reload',
              color: 'yellow',
              handler: () => {
                // update current task
                currentTask.value = task;
              }
            },
            {
              label: 'Dismiss',
              color: 'white',
              handler: () => {
                /* ... */
              }
            }
          ],
          timeout: 5000
        });
      }
    };

    // listen to an event
    bus.on(listener);

    // watch route query params for changes
    watch(
      () => route.query.id,
      async (newId) => {
        console.log('watch route query params for changes', newId);
        await pickupAnotherTask();
      },
      {
        immediate: true
      }
    );
    return {
      save,
      complete,
      startRef,
      formRef,
      openInNewTab,
      taskStore,
      loading,
      currentTask,
      router,
      route
    };
  }
};
</script>

<style lang="scss" scoped>
.task-header {
  background-color: $primary;
  border-bottom: 1px solid #000;
  color: #fff;
}
</style>
