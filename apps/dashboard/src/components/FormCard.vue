<template>
  <CardComponent :header="header">
    <template #topAction>
      <div v-if="!edit">
        <Button
            severity="primary"
            :label="$t('edit')"
            icon="pi pi-pencil"
            @click="toggleEdit(true)"
        />
      </div>
      <div v-else class="flex flex-row gap-2">
        <Button
            severity="primary"
            :label="$t('save')"
            icon="pi pi-check"
            @click="handleSave"
        />
        <Button
            severity="secondary"
            :label="$t('close')"
            icon="pi pi-times"
            @click="cancel"
        />
      </div>
    </template>
    <slot :edit="edit"></slot>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import CardComponent from "@/components/CardComponent.vue";
import Button from 'primevue/button';

const props = defineProps({
  header: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: false,
  }
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const edit = ref(props.modelValue);

const toggleEdit = (value: boolean) => {
  edit.value = value;
  emit('update:modelValue', value);
};

const cancel = () => {
  emit('cancel');
  toggleEdit(false);
};

const handleSave = () => {
  emit('save');
  toggleEdit(false);
};

</script>

<style scoped lang="scss">
/* Your styles here */
</style>
