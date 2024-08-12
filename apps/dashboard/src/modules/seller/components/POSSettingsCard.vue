<template>
  <FormCard :header="$t('c_posInfo.overview')" v-if="pointOfSale" @cancel="updateFieldValues(pointOfSale)"
            @update:modelValue="edit = $event" @save="formSubmit" class="w-7">
    <div class="flex flex-column justify-content-between gap-2">
      <POSSettingsForm :point-of-sale="pointOfSale" :form="form" :edit="edit" @update:edit="edit = $event"/>
    </div>
  </FormCard>

</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onBeforeMount, ref, watch } from "vue";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import { updatePointOfSaleObject } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";
import { usePointOfSaleStore } from "@/stores/pos.store";
import POSSettingsForm from "@/modules/seller/components/POSSettingsForm.vue";

const edit = ref(false);
const posStore = usePointOfSaleStore();
const pointOfSale = ref<PointOfSaleWithContainersResponse>();

const props = defineProps({
  posId: {
    type: Number,
    required: true
  }
});

const form = schemaToForm(updatePointOfSaleObject);

const formSubmit = async () => {
  await form.submit();
};
const updateFieldValues = (p: PointOfSaleWithContainersResponse) => {
  if (!p) return;

  const name = p.name;
  const useAuthentication = p.useAuthentication;
  const containers = p.containers.map(c => c.id);
  const id = p.id;
  const cashierRoleIds = p.cashierRoles.map(c => c.id);

  form.context.resetForm({ values: { name, useAuthentication, id, cashierRoleIds, containers } });
};

watch(() => pointOfSale.value, (newValue) => {
  updateFieldValues(newValue!!);
});

onBeforeMount(async () => {
  pointOfSale.value = await posStore.getPointOfSale(props.posId);
  if (pointOfSale.value) {
    updateFieldValues(pointOfSale.value);
  }
});

</script>

<style scoped lang="scss">

</style>
