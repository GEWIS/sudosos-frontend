<template>
  <CardComponent :header="$t('c_invoiceInfo.InvoiceUsers')" class="w-5">
    <DataTable
        :value="invoiceableUsersWithBalance"
    >
      <Column field="user.id" :header="$t('c_invoiceInfo.id')"/>
      <Column :header="$t('c_invoiceInfo.Name')" field="user.firstName">
        <template #body="slotProps">
          {{ `${slotProps.data.user.firstName} ${slotProps.data.user.lastName}` }}
        </template>
      </Column>
      <Column field="balance.amount" :header="$t('c_invoiceInfo.Balance')">
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.balance.amount) }}
        </template>
      </Column>
      <Column :header="$t('c_invoiceInfo.Actions')" style="width: 10%">
        <template #body="slotProps" >
            <Button
                type="button"
                icon="pi pi-file-edit"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => handleCreateInvoice(slotProps.data.user)"
            />
        </template>
      </Column>

    </DataTable>
  </CardComponent>
  <FormDialog v-model="showDialog" :form="form" :header="$t('invoice.CreateInvoice')">
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


// Typing is absolutely fucked in the api but it works
const getInvoiceableBalances = async (skip: number) => {
  //@ts-ignore-next-line
  const response = await apiService.balance.getAllBalance(undefined, undefined, -1, undefined, undefined, undefined, ["INVOICE"], undefined, undefined, false, Number.MAX_SAFE_INTEGER, skip);
  //@ts-ignore-next-line
  balances.value.push(...response.data.records);
  //@ts-ignore-next-line
  if (response.data._pagination.count > response.data.records.length) {
    //@ts-ignore-next-line
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
