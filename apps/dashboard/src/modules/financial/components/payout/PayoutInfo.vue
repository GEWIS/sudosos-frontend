<template>
  <div>
    <p>Payout ID: {{ payout }}, {{payoutId}}</p>
  </div>
  <div>
<!--    APPROVE OR DENY BUTTONS-->
    <Button v-if="isCreated" type="submit" icon="pi pi-check"
            sev
            class="p-button-rounded p-button-text p-button-plain" @click="approvePayout"/>
 </div>
</template>

<script setup lang="ts">
import { usePayoutStore } from "@/stores/payout.store";
import { computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";

const toast = useToast();

const payoutStore = usePayoutStore();
const payout = computed(() => payoutStore.getPayout(props.payoutId));
const isCreated = computed(() => payout.value?.status.length === 1);


const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  }
});

onMounted(() => {
  payoutStore.fetchPayout(props.payoutId).catch((err) => {
    handleError(err, toast);
  });
});

</script>

<style scoped lang="scss">

</style>
