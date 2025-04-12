<template>
  <Dialog
    v-model:visible="showTopUpWarningDialog"
    header="Please Top-Up your SudoSOS balance"
    :closable="false"
    modal
    :dismissable-mask="false"
    :content-style="{ width: '35rem' }"
    :pt="{
        header: () => ({class: ['dialog-header']})}"
  >
    <Message severity="warn" :closable="false" :icon="undefined">
      You are currently in debt<br>
      Please first Top-Up your balance before continuing.<br>
    </Message>
    <div class="qr-code" style="display: flex; justify-content: center; margin-top: 1rem;">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Rickrolling_QR_code.png"
        alt="QR Code"
        style="max-width: 100%; height: auto;"
      />
    </div>
    <div class="spinner-container" v-if="topUpProgress > 0">
      <ProgressSpinner
        strokeWidth="6"
        style="width: 100px; height: 100px"
        animationDuration="5s"
      />
      <div class="spinner-text">{{ topUpProgress }}</div>
    </div>
    <div v-if="topUpProgress <= 0" class="text-center mt-4">
      <button
        class="c-btn rounder font-medium checkout text-3xl red-button"
        @click="closeDialog">
        I Understand
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import { useCartStore } from "@/stores/cart.store";

const cartStore = useCartStore();

const showTopUpWarning = ref(true);
const showTopUpWarningDialog = computed(() => {
  return checkUserInDebt.value && showTopUpWarning.value;
});

const checkUserInDebt = computed( () => cartStore.checkBuyerInDebt());

const topUpProgress = ref(5);
let topUpInterval: number | undefined;
const showConfirmButton = ref(false);

const startTopUpCountdown = () => {
  showTopUpWarning.value = true;
  topUpProgress.value = 5;
  showConfirmButton.value = false;

  const tickInterval = 1000; // 50ms per 1% step

  topUpInterval = window.setInterval(async () => {
    if (topUpProgress.value > 0) {
      topUpProgress.value -= 1;
    } else {
      clearInterval(topUpInterval);
      showConfirmButton.value = true;
    }
  }, tickInterval);
};

const closeDialog = () => {
  showTopUpWarning.value = false; // Close the dialog
};

onMounted(() => {
  if (checkUserInDebt.value) {
    startTopUpCountdown();
  }
});
</script>

<style scoped lang="scss">
.spinner-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 1rem auto;
}

.spinner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
}

.red-button {
  background-color: red; /* Red background */
  color: white; /* White text */
}

.text-center {
  display: flex;
  justify-content: center;  /* Center horizontally */
  align-items: center;      /* Center vertically */
  height: 100%;             /* Ensure it takes the full height of the parent container */
}
</style>
