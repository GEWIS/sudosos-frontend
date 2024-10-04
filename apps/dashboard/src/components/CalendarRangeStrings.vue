<template>
  <Calendar
      v-if="type === 'daterange'"
      :placeholder="placeholder"
      v-model="internalDates"
      v-bind="attributes"
      :disabled="disabled"
      @input="updateStringValue"
      selectionMode="range"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Calendar from 'primevue/calendar';

// Define the component's props
const props = defineProps({
  modelValue: {
    type: Array<string>,
    default: []
  },
  placeholder: {
    type: String,
    default: ''
  },
  attributes: {
    type: Object,
    default: () => ({})
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'date'
  },
  dateFormat: {
    type: String,
    default: 'yyyy-MM-dd'
  }
});

// Define the component's events
const emit = defineEmits(['update:modelValue']);

// Reactive reference to hold the internal date as a Date object
const internalDates = ref<(Date | null)[] | null>(stringsToDates(props.modelValue));

// Watch for changes in modelValue and update internalDate accordingly
watch(
    () => props.modelValue,
    (newValue) => {
      const newDates = stringsToDates(newValue);
      if (JSON.stringify(newDates) !== JSON.stringify(internalDates.value)) {
        internalDates.value = newDates;
      }
    },
    { deep: true }
);

// Watch for changes in internalDates and emit updates to modelValue
watch(
    internalDates,
    (newDate) => {
      const newStringValues = datesToStrings(newDate);
      if (JSON.stringify(newStringValues) !== JSON.stringify(props.modelValue)) {
        emit('update:modelValue', newStringValues);
      }
    },
    { deep: true }
);

// Helper functions for date conversion
function stringsToDates(dateStrings: string[]): (Date | null)[] | null {
  if (!dateStrings || dateStrings.length === 0) return null;
  return dateStrings.map(stringToDate);
}

function datesToStrings(dates: (Date | null)[] | null): string[] {
  if (!dates || dates.length === 0) return [];
  return dates.map(date => (date ? dateToString(date) : ''));
}

function stringToDate(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

function dateToString(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-padding
  const day = String(date.getDate()).padStart(2, '0'); // Zero-padding
  return `${year}-${month}-${day}`;
}

// Function to emit the updated string representation of the date
function updateStringValue(newDate: any) {
  const newString = datesToStrings(newDate);
  emit('update:modelValue', newString); // Emit the string representation
}
</script>
