<template>
  <CardComponent v-if="invoice" :header="t('common.info')">
    <template #topAction>
      <Button
        v-if="notDeleted"
        icon="pi pi-exclamation-triangle"
        :label="t('common.delete')"
        severity="primary"
        @click="visible = true"
      />
    </template>
    <div class="flex flex-col justify-between">
      <InfoSpan :label="t('common.id')" :value="String(invoice.id)" />
      <InfoSpan
        :label="t('common.for')"
        :value="invoice.to.firstName + ' ' + invoice.to.lastName + ' (' + invoice.to.id + ')'"
      />
      <InfoSpan
        :label="t('common.createdAt')"
        :value="formatDateTime(new Date(invoice.createdAt ? invoice.createdAt.toString() : ''))"
      />
      <InfoSpan
        :label="t('common.updatedAt')"
        :value="formatDateTime(new Date(invoice.updatedAt ? invoice.updatedAt.toString() : ''))"
      />
    </div>
    <Dialog
      ref="dialog"
      v-model:visible="visible"
      :close-on-escape="true"
      :draggable="false"
      :header="t('modules.financial.invoice.delete')"
      modal
      @show="openDialog"
    >
      <div class="flex flex-col gap-3 justify-between">
        <div>
          {{ t('modules.financial.invoice.confirmDelete') }}<br />
          {{ t('modules.financial.invoice.creditNoteWarning') }}<br /><br />
          {{ t('modules.financial.invoice.unrecoverable') }}
        </div>
        <div class="items-end flex flex-row gap-3 justify-end">
          <Button severity="secondary" @click="dialog.close()">{{ t('common.cancel') }}</Button>
          <Button @click="deleteInvoice">{{ t('common.delete') }}</Button>
        </div>
      </div>
    </Dialog>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import InfoSpan from '@/components/InfoSpan.vue';
import CardComponent from '@/components/CardComponent.vue';
import { formatDateTime } from '@/utils/formatterUtils';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';
import { useInvoiceCard } from '@/composables/invoiceCard';

const { t } = useI18n();
const toast = useToast();
const props = defineProps<{ invoiceId: number }>();

const { invoice, deleted } = useInvoiceCard(props.invoiceId);
const notDeleted = computed(() => !deleted.value);

const visible = ref(false);
const dialog = ref();

function openDialog() {
  addListenerOnDialogueOverlay(dialog.value);
}

async function deleteInvoice() {
  try {
    await useInvoiceStore()
      .deleteInvoice(props.invoiceId)
      .catch((err) => {
        handleError(err, toast);
      });
    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.invoiceDeleted'),
      severity: 'success',
      life: 3000,
    });
  } finally {
    dialog.value.close();
  }
}
</script>
