<template>
  <q-page>
    <q-table
      class="sticky-header-table"
      selection="multiple"
      :loading="loading"
      v-model:selected="selected"
      :rows="data"
      row-key="id"
      :columns="columns"
      :visible-columns="visibleColumns"
      binary-state-sort
      flat
      square
      :pagination="pagination"
    >
      <!-- search -->
      <template v-slot:top="props">
        <q-toolbar class="no-padding">
          <q-toolbar-title class="row">
            <q-breadcrumbs class="text-subtitle2" separator="/">
              <q-breadcrumbs-el label="Home" to="/" />
              <q-breadcrumbs-el label="Tasks" />
            </q-breadcrumbs>
          </q-toolbar-title>
          <q-space />
        </q-toolbar>
        <q-form class="fit">
          <q-toolbar>
            <q-toolbar-title>
              <span class="text-primary">Tasks </span>
              <span class="text-grey text-subtitle2"
                >(<span v-if="selected.length">{{ selected.length }}/</span
                >{{ data.length }})</span
              >
            </q-toolbar-title>
            <q-btn
              outline
              rounded
              label="View detail"
              class="q-mr-xs"
              no-caps
              color="primary"
              :disable="selected.length !== 1"
              @click="viewDetail"
            />

            <q-btn
              outline
              rounded
              label="Delete"
              class="q-mr-xs"
              no-caps
              color="primary"
              :disable="selected.length === 0"
              @click="deleteSelected"
            />
            <q-btn
              rounded
              label="Export all"
              class="q-mr-xs"
              no-caps
              color="primary"
              @click="exportTable"
            />
            <file-selector
              v-model="files"
              :allowMultiple="false"
              :accept="['.csv']"
            >
            </file-selector>

            <q-separator spaced inset vertical />

            <q-btn icon="settings" flat round>
              <q-menu fit>
                <ColumnsVisible
                  :columns="columns"
                  :visibleColumns="visibleColumns"
                  @update="updateVisibleColumns"
                />
              </q-menu>
            </q-btn>
          </q-toolbar>

          <q-space />

          <q-toolbar>
            <q-toolbar-title class="gt-sm">
              <PropertyFilter
                placeholder="Filter task by text or status..."
                @update="search"
              />
            </q-toolbar-title>

            <q-space />
            <q-btn
              flat
              round
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"
              class="q-ml-md q-mt-xs self-start"
            />
            <q-btn
              flat
              round
              icon="refresh"
              @click="reload"
              class="q-ml-md q-mt-xs self-start"
            />
          </q-toolbar>
        </q-form>
      </template>

      <!-- cell template -->
      <template v-slot:body-cell-status="props">
        <td>
          <q-chip
            :color="
              props.value === 'COMPLETED'
                ? 'green'
                : props.value === 'IN_PROGRESS'
                ? 'orange'
                : 'red'
            "
            :label="props.value"
          />
        </td>
      </template>
      <template v-slot:body-cell-name="props">
        <td>
          <router-link :to="`/work?id=${props.row.id}`">
            {{ props.value }}
          </router-link>
        </td>
      </template>
      <template v-slot:body-cell-startUrls="props">
        <td>
          <div
            v-for="startUrl in props.value"
            :key="startUrl.url"
            style="
              max-width: 300px;
              white-space: normal;
              overflow-wrap: break-word;
            "
          >
            {{ startUrl.url }}
          </div>
        </td>
      </template>

      <!-- pagging -->
      <template v-slot:pagination="scope">
        <q-btn
          v-if="scope.pagesNumber > 2"
          icon="first_page"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isFirstPage"
          @click="scope.firstPage"
        />

        <q-btn
          icon="chevron_left"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isFirstPage"
          @click="scope.prevPage"
        />

        <q-btn
          icon="chevron_right"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isLastPage"
          @click="scope.nextPage"
        />

        <q-btn
          v-if="scope.pagesNumber > 2"
          icon="last_page"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isLastPage"
          @click="scope.lastPage"
        />

        <q-btn
          color="primary"
          icon="check"
          label="Import"
          v-if="importing"
          @click="onImportData"
        />
      </template>
    </q-table>
  </q-page>
</template>

<!-- eslint-disable -->
<script setup>
import PropertyFilter from 'components/PropertyFilter.vue';
import ColumnsVisible from 'components/ColumnsVisible.vue';
import { API, graphqlOperation } from 'aws-amplify';
import { createTask, deleteTask } from 'src/graphql/mutations';

import FileSelector from 'components/FileSelector.vue';
import { ref, watch } from 'vue';

// eslint-disable-next-line no-unused-vars
import { Task, TaskStatus } from 'src/models';
import Papa from 'papaparse';
import { useRouter } from 'vue-router';
import { useTasksStore } from 'stores/tasks';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// eslint-disable-next-line no-unused-vars
const taskStore = useTasksStore();
const router = useRouter();
const loading = ref(false);
const selected = ref([]);
const data = ref([]);
const pagination = ref({
  page: 1,
  rowsPerPage: 20
});
const files = ref([]);
const importing = ref(false);

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    sortable: true
  },
  {
    name: 'startUrls',
    label: 'Start URLs',
    field: 'startUrls',
    align: 'left',
    sortable: true,
    display: (val) => val.map((v) => v.url).join(', ')
  },
  {
    name: 'assignedTo',
    label: 'Assigned To',
    field: 'assigneeEmail',
    align: 'left',
    sortable: true,
    display: (val) => val.map((v) => v.url).join(', ')
  },
  {
    name: 'createdAt',
    label: 'Created At',
    field: 'createdAt',
    align: 'left',
    sortable: true
  },
  {
    name: 'updatedAt',
    label: 'Updated At',
    field: 'updatedAt',
    align: 'left',
    sortable: true
  }
];

const visibleColumns = ref(
  $q.localStorage.getItem('visibleColumns') || columns.map((c) => c.name)
);

// eslint-disable-next-line no-unused-vars
const search = ($event) => {
  // update search value
  // console.log('search', $event);
  let conditions = { ...$event };
  conditions = Object.values(conditions).map((k) => k);

  const statusKeys = conditions
    .filter((k) => k.startsWith('status='))
    .map((k) => k.replace('status=', ''));
  const searchKeys = conditions.filter((k) => !k.startsWith('status='));

  selected.value = [];
  data.value = taskStore.tasks.filter((task) => {
    const statusMatch = statusKeys.length
      ? statusKeys.includes(task.status)
      : true;
    const searchMatch = searchKeys.length
      ? searchKeys.some(
          (k) =>
            task.id.includes(k) ||
            task.name.includes(k) ||
            task.status.includes(k) ||
            task.startUrls.some((u) => u.url.includes(k)) ||
            task.assigneeEmail?.includes(k)
        )
      : true;
    return statusMatch && searchMatch;
  });
};

const reload = async () => {
  selected.value = [];
  data.value = [];
  loading.value = true;
  await taskStore.loadTasks();
  data.value = taskStore.tasks;
  loading.value = false;
};

// watch files for changes
watch(
  () => [files.value],
  async () => {
    importing.value = false;
    selected.value = [];

    // latest file
    const file = files.value[files.value.length - 1];
    if (file) {
      // print file name
      console.log('file', file.name);
      // parse csv file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // print parsed data
          const records = results.data;
          // group by id
          const grouped = records.reduce((acc, record) => {
            const { domain, slug } = record;
            const id = `${domain}-${slug}`;
            if (!acc[id] || !acc[id].startUrls) {
              acc[id] = {
                startUrls: [],
                id,
                name: record.name,
                topPageUrl: record.topPage
              };
            }
            acc[id].startUrls.push({
              categories: record.categories,
              url: record.startUrl,
              linkSelector: record.linkSelector
            });
            return acc;
          }, {});

          // update data
          data.value = Object.values(grouped).map((d) => ({
            ...d,
            status: TaskStatus.NOT_STARTED
          }));
          importing.value = true;
        }
      });
    }
  }
);

const onImportData = async () => {
  loading.value = true;
  const tasks = data.value.map(
    (d) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      API.graphql(
        graphqlOperation(createTask, {
          input: {
            id: d.id,
            name: d.name,
            topPageUrl: d.topPageUrl,
            startUrls: d.startUrls,
            status: TaskStatus.NOT_STARTED
          }
        })
      )
    // eslint-disable-next-line function-paren-newline
  );

  await Promise.allSettled(tasks);

  loading.value = false;
  $q.notify({
    message: 'Imported successfully',
    color: 'positive',
    position: 'top'
  });

  reload();
};

const deleteSelected = async () => {
  loading.value = true;
  const tasks = selected.value.map(
    (d) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      API.graphql(
        graphqlOperation(deleteTask, {
          input: {
            id: d.id
          }
        })
      )
    // eslint-disable-next-line function-paren-newline
  );
  await Promise.allSettled(tasks);

  loading.value = false;
  $q.notify({
    message: 'Deleted successfully',
    color: 'positive',
    position: 'top'
  });

  reload();
};

const viewDetail = (task) => {
  router.push({ name: 'work', params: { id: task.id } });
};

const updateVisibleColumns = (val) => {
  visibleColumns.value = val;
  $q.localStorage.set('visibleColumns', val);
};

const exportTable = () => {
  const records = [];

  Object.values(data.value).forEach((d) => {
    d.startUrls.forEach((u) => {
      records.push({
        id: d.id,
        name: d.name,
        topPage: d.topPageUrl,
        categories: u.categories,
        startUrl: u.url,
        linkSelector: (u.linkSelector || []).join(', ')
      });
    });
  });

  const csv = Papa.unparse(records);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'tasks.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// init data from store
data.value = taskStore.tasks;
</script>

<style lang="scss" scoped></style>
<style lang="sass">
.sticky-header-table
  /* height or max-height is important */
  // max-height: 310px
  height: calc( 100vh - 52px )

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $teal-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
