<template>
  <Dialog
    v-model:visible="visible"
    class="w-[25rem]"
    :closable="false"
    :dismissable-mask="false"
    :draggable="false"
    modal
  >
    <div class="flex flex-col justify-center items-center mt-4 gap-4">
      <img alt="SudoSOS QR Code" class="h-72" src="@/assets/aprilfools.png" />

      <h1 class="text-2xl font-bold">Steekproef</h1>

      <div class="w-[60%] text-center mb-2">
        <p>Thank you for your understanding, an employee will come by to check if everything was done correctly.</p>
      </div>

      <!--The button is temporary and will be replaced with something more annoying-->
      <Button v-if="buttonVisible" class="text-xl px-6 py-3 continue-button" @click="close"
        >Continue to Checkout</Button
      >
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:show', 'closed']);

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const buttonVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    buttonVisible.value = true;
  }, 5000);
});

const close = () => {
  visible.value = false;
  emit('closed');
};
</script>

<style scoped lang="scss">
.continue-button {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-primary-inverse-color);
}
</style>
