<template>
  <div>
    <q-select
      v-model="filter"
      use-input
      multiple
      use-chips
      input-debounce="0"
      :options="props.filteringProperties"
      :placeholder="props.placeholder"
      new-value-mode="add-unique"
      outlined
      hide-dropdown-icon
      dense
      emit-value
      clearable
      @update:model-value="updateFilter"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// props
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Filter task by text or status...'
  },
  filteringProperties: {
    type: Array,
    default: () => [
      {
        value: 'status=COMPLETED',
        label: 'Completed'
      },
      {
        value: 'status=IN_PROGRESS',
        label: 'Started'
      },
      {
        value: 'status=NOT_STARTED',
        label: 'Not Completed'
      }
    ]
  }
});

const emit = defineEmits(['update']);

const filter = ref(null);

const updateFilter = () => {
  emit('update', filter.value);
};
</script>

<style lang="scss" scoped></style>
