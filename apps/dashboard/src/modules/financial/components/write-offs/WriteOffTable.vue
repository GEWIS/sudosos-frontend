<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="writeOffs"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :total-records="totalRecords"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex flex-row align-items-center justify-content-between">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"> </InputIcon>
            <InputText v-model="idQuery" :placeholder="t('common.id')"
                     @keyup.enter="searchId()" @focusout="searchId()" />
          </IconField>
          <Button :label="t('common.create')" icon="pi pi-plus" @click="showDialog = true" />
        </div>
      </template>
      <Column field="id" :header="t('common.id')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.id }}</span>
        </template>
      </Column>
      <Column field="date" :header="t('common.date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column :header="t('common.name')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ getName(slotProps.data) }}</span>
        </template>
      </Column>
      <Column field="amount" :header="t('common.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else class="flex flex-row align-items-center">
            <Button
                v-tooltip.top="t('common.delete')"
                type="button"
                icon="pi pi-times"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => showWarning()"
            />
            <Button
                v-tooltip.top="t('common.downloadPdf')"
                type="button"
                icon="pi pi-file-export"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => downloadPdf(slotProps.data.id)"
            />
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog
      modal
      ref="dialog"
      @show="addListenerOnDialogueOverlay(dialog)"
      v-model:visible="showWarningModal"
      :draggable="false"
      class="w-auto flex w-9 md:w-4"
      :header="t('modules.financial.write-offs.delete')"
  >
    {{ t('modules.financial.write-offs.delete.not-possible') }}
  </Dialog>
  <FormDialog v-model="showDialog" :form="form" :header="t('modules.financial.write-off.create')" :is-editable="true">
    <template #form="slotProps">
      <WriteOffCreateForm :form="slotProps.form" @submit:success="showDialog = false"/>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { useWriteOffStore } from "@/stores/writeoff.store";
import { onMounted, type Ref, ref, watch } from "vue";
import type { PaginatedWriteOffResponse, WriteOffResponse } from "@sudosos/sudosos-client";
import type { DataTablePageEvent } from "primevue/datatable";
import { formatDateFromString, formatPrice } from "@/utils/formatterUtils";
import Column from "primevue/column";
import { useI18n } from "vue-i18n";
import Button from "primevue/button";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { useToast } from "primevue/usetoast";
import FormDialog from "@/components/FormDialog.vue";
import PayoutCreateForm from "@/modules/financial/components/payout/forms/PayoutCreateForm.vue";
import { schemaToForm } from "@/utils/formUtils";
import { createWriteOffSchema } from "@/utils/validation-schema";
import WriteOffCreateForm from "@/modules/financial/components/write-offs/forms/WriteOffCreateForm.vue";

const { t } = useI18n();
const toast = useToast();

const writeOffStore = useWriteOffStore();

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const rows = ref<number>(5);
const paginator = ref<boolean>(true);
const page = ref<number>(0);
const writeOffs = ref();

const showWarningModal: Ref<boolean> = ref(false);
const dialog = ref();
const showWarning = () => {
  showWarningModal.value = true;
};

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createWriteOffSchema);

const idQuery = ref<string>('');

onMounted(async () => {
  await loadWriteOffs();
});

async function loadWriteOffs() {
  isLoading.value = true;
  const response: PaginatedWriteOffResponse = await writeOffStore.fetchWriteOffs(rows.value, page.value);
  if (response) {
    writeOffs.value = response.records;
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  page.value = event.first;
  await loadWriteOffs();
}

watch(() => writeOffStore.getUpdatedAt, () => {
  loadWriteOffs().then(() => console.error('loaded', writeOffs.value));
});

const searchId = () => {
  const queryNumber = parseInt(idQuery.value);
  const isNan = isNaN(queryNumber);
  if (isNan) {
    loadWriteOffs();
    return;
  }

  writeOffStore.fetchWriteOff(queryNumber).then((res) => {
    writeOffs.value = [res];
  }).catch(() => {
    writeOffs.value = [];
  });
};

const getName = (writeOff: WriteOffResponse) => {
  return writeOff.to.firstName + ' ' + writeOff.to.lastName;
};

const downloadPdf = async (id: number) => {
  toast.add({
    severity: 'warn',
    summary: t('common.toast.info.unsupported'),
    detail: t('modules.financial.write-offs.downloadPdf.not-possible'),
    life: 3000,
  });
};

</script>

<style scoped lang="scss">
</style>
