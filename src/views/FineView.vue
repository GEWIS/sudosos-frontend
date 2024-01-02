<template>
  <div class="page-container">
    <div class="page-title">{{ t('fine.fineOverview') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="t('fine.eligibleUsers')" class="w-full">
        <DataTable
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        >
          <template #header>
            <form @submit.prevent="handlePickedDates" class="flex flex-row gap-3">
              <span class="p-float-label">
                <Calendar v-model="firstDate" id="firstDate" v-bind="firstDateAttrs" />
                <label for="firstDate">{{ t('fine.firstDate') }}</label>
              </span>
              <span class="p-float-label">
                <Calendar v-model="secondDate" id="firstDate" v-bind="secondDateAttrs" />
                <label for="secondDate">{{ t('fine.secondDate') }}</label>
              </span>
              <Button severity="success" type="submit">{{ t('fine.apply') }}</Button>
            </form>
          </template>
          <Column selectionMode="multiple" />
          <Column field="id" :header="t('fine.gewisId')" />
          <Column field="name" :header="t('fine.name')" />
          <Column field="firstBalance" :header="t('fine.firstBalance')" />
          <Column field="lastBalance" :header="t('fine.lastBalance')" />
        </DataTable>
      </CardComponent>
      <CardComponent :header="t('fine.fineHandoutEvents')" class="w-full">
        <DataTable
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        >
          <Column id="id" :header="t('fine.id')" />
          <Column id="date" :header="t('fine.date')" />
          <Column id="referenceDate" :header="t('fine.referenceDate')" />
          <Column id="count" :header="t('fine.count')" />
          <Column id="info" :header="t('fine.info')" />
        </DataTable>
      </CardComponent>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from "primevue/column";
import CardComponent from "@/components/CardComponent.vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import Calendar from "primevue/calendar";

const { t } = useI18n();

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      firstDate: yup.date().required(),
      secondDate: yup.date(),
    }
  ))
});

const [firstDate, firstDateAttrs] = defineField('firstDate');
const [secondDate, secondDateAttrs] = defineField('secondDate');

const handlePickedDates = handleSubmit(async (values) => {
  console.log(values.firstDate, values.secondDate);
});
</script>

<style scoped>
@import '../styles/BasePage.scss';
</style>
