<template>
  <div>
    <q-list style="min-width: 200px" dense>
      <q-item-label header>Columns</q-item-label>
      <q-item tag="label" v-ripple v-for="item in options" :key="item.name">
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            color="blue"
            v-model="item.visible"
            :val="item.name"
            :disabled="item.disabled"
            @update:model-value="updateVisibleColumns"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  visibleColumns: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// build a list of columns that are visible from the visibleColumns prop
const options = ref(
  props.columns.map((column) => ({
    ...column,
    disabled: column.required,
    visible: props.visibleColumns.includes(column.name)
  }))
);

const updateVisibleColumns = () => {
  const visibleColumns = options.value
    .filter((option) => option.visible)
    .map((option) => option.name);

  emit('update', visibleColumns);
};
</script>

<style lang="scss" scoped></style>
