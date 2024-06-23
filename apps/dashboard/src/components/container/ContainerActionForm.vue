<template>
  <form id="createForm" class="flex flex-column gap-3">
    <div class="flex flex-row flex-wrap justify-content-between align-items-center">
      <label for="name" class="mr-8">{{ $t('c_productContainerOperations.Name') }}</label>
      <div class="relative">
        <InputText id="name" class="w-18rem" v-model="form.model.name.value.value"
                   type="text" v-bind="form.model.name.attr.value"/>
        <error-span :error="form.context.errors.value.name"/>
      </div>
    </div>
    <div class="flex flex-row flex-wrap justify-content-between align-items-center">
      <label for="owner" class="mr-8">
        {{ $t('c_POSCreate.Owner') }}
        <i class="pi pi-exclamation-circle text-red-500 cursor-pointer"
           v-tooltip.top="$t('tooltip.owner_revenue')"/>
      </label>
      <div class="flex flex-column flex-end relative">
        <div v-if="state.create">
          <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organs" optionLabel="firstName"
                    v-model="form.model.owner.value.value" class="w-18rem" id="owner"
                    v-bind="form.model.owner.attr.value"/>
          <error-span :error="form.context.errors.value.owner"/>
        </div>
        <div v-else-if="container">
          <p class="my-0">{{ container.owner.firstName + ' ' + container.owner.lastName }}</p>
        </div>
      </div>
    </div>
    <div class="flex flex-row flex-wrap justify-content-between align-items-center">
      <label for="name" class="mr-8">{{ $t('c_containerEditModal.Public') }}</label>
      <div class="relative">
        <Checkbox v-model="form.model.public.value.value" v-bind="form.model.public.attr.value"
                  inputId="publicContainer"
                  name="public" value="public" :binary="true"/>
        <error-span :error="form.context.errors.value.public"/>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { type Form } from "@/utils/formUtil";
import { createContainerSpec } from "@/utils/validation-schema";
import InputText from "primevue/inputtext";
import ErrorSpan from "@/components/ErrorSpan.vue";
import Dropdown from "primevue/dropdown";
import { computed, type PropType, ref, type Ref } from "vue";
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as Form<typeof createContainerSpec>,
    required: true,
  },
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: false,
  },
});

const { organs } = storeToRefs(useAuthStore());

const state = computed(() => {
  return {
    create: props.container == undefined,
    edit: props.container != undefined,
  };
});

</script>

<style scoped lang="scss">

</style>
