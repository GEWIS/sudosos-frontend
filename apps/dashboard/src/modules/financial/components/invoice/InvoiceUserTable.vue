<template>
  <CardComponent header="Invoice Users" class="w-5">
    <DataTable
        :value="invoiceableUsersWithBalance"
    >
      <Column field="user.id" header="ID"/>
      <Column header="Name" field="user.firstName">
        <template #body="slotProps">
          {{ `${slotProps.data.user.firstName} ${slotProps.data.user.lastName}` }}
        </template>
      </Column>
      <Column field="balance.amount" header="Balance">
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.balance.amount) }}
        </template>
      </Column>
      <Column :header="$t('c_invoiceInfo.Actions')" style="width: 10%">
        <template #body="slotProps" >
          <div class="flex flex-row ">
            <Button
                type="button"
                icon="pi pi-file-edit"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => handleCreateInvoice(slotProps.data.user)"
            />
            <Button
                type="button"
                icon="pi pi-external-link"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => console.log(slotProps.data.user.id)"
            />
          </div>
        </template>
      </Column>

    </DataTable>
  </CardComponent>
  <FormDialog v-model="showDialog" :form="form" :header="$t('invoice.Create invoice')">
    <template #form="slotProps">
      <InvoiceCreateForm :form="slotProps.form" @submit:success="showDialog = false"/>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from "vue";
import type { BalanceResponse, UserResponse } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";
import { formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";
import FormDialog from "@/components/FormDialog.vue";
import InvoiceCreateForm from "@/modules/financial/components/invoice/forms/InvoiceCreateForm.vue";
import { schemaToForm } from "@/utils/formUtils";
import { createInvoiceSchema } from "@/utils/validation-schema";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";

interface InvoiceableUserWithBalance {
  user: UserResponse;
  balance: BalanceResponse;
}

const authStore = useAuthStore();
const userStore = useUserStore();
const invoiceableUsers: Ref<UserResponse[]> = ref([]);
const balances: Ref<BalanceResponse[]> = ref([]);
const invoiceableUsersWithBalance: Ref<InvoiceableUserWithBalance[]> = ref([]);
const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createInvoiceSchema);

onMounted(async () => {
  await getAllUsers(0);
  await getInvoiceableBalances(0);
  const usersMap = new Map(
      invoiceableUsers.value.map(user => [user.id, user])
  );

  invoiceableUsersWithBalance.value = balances.value
      .filter(balance => usersMap.has(balance.id))
      .map(balance => ({
        user: usersMap.get(balance.id)!,
        balance: balance
      }));
});

const getAllUsers = async (skip: number) => {
  const response = await apiService.user.getAllUsersOfUserType("INVOICE", Number.MAX_SAFE_INTEGER, skip);
  invoiceableUsers.value.push(...response.data.records);
  if (response.data._pagination.count > response.data.records.length) {
    await getAllUsers(skip + response.data.records.length);
  }
};

const getInvoiceableBalances = async (skip: number) => {
  const response = await apiService.balance.getAllBalance(undefined, undefined, -1, undefined, undefined, undefined, ["INVOICE"], undefined, undefined, false, Number.MAX_SAFE_INTEGER, skip);
  balances.value.push(...response.data.records);
  if (response.data._pagination.count > response.data.records.length) {
    await getInvoiceableBalances(skip + response.data.records.length);
  }
};

const handleCreateInvoice = async (user: UserResponse) => {
  const invoiceUserDefaults = await apiService.invoices.getSingleInvoiceUser(user.id);
  showDialog.value = true;
  const currentUser = userStore.getCurrentUser.user;
  const values = {
    for: user,
    by: currentUser || undefined,
    addressee: '',
    description: '',
    date: '',
    reference: '',
    isCreditInvoice: false,
    street: invoiceUserDefaults.data.street || '',
    postalCode: invoiceUserDefaults.data.postalCode || '',
    city: invoiceUserDefaults.data.city || '',
    country: invoiceUserDefaults.data.country || '',
    attention: '',
  };
  form.context.resetForm({ values });
};

</script>

<style scoped lang="scss">

</style>
