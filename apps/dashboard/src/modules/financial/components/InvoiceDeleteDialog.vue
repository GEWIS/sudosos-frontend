<template>
  <Dialog
      :visible="visible"
      modal
      :header="t('c_invoiceInfo.DeleteInvoice')"
      class="w-auto flex   w-11 md:w-4"
      @show="openDialog"
      ref="dialog"
  >
    <div class="flex flex-column justify-content-between gap-3">
      <div>
        Are you sure you want to delete this invoice?
        <br>
        This is not the same as creating a credit note.
        <br>
        <br>
        You will not be able to recover this invoice.
      </div>
      <div class="flex gap-3 flex-row justify-content-end align-items-end">
        <Button severity="secondary" @click="dialog.close()">{{ t('c_invoiceInfo.Cancel') }}</Button>
        <Button @click="dialog.close()">{{ t('c_invoiceInfo.Delete') }}</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { type PropType, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const dialog = ref();

const openDialog = () => {
  addListenerOnDialogueOverlay(dialog.value);
};

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
});

</script>

<style scoped lang="scss">

</style>
