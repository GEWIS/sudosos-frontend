<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="$t('c_productContainerOperations.Name')"
               :value="form.model.name.value.value"
               :attributes="form.model.name.attr.value"
               @update:value="form.context.setFieldValue('name', $event)"
               :errors="form.context.errors.value.name"
               id="name" placeholder="Product name (TODO)" type="text"
               :disabled="!isEditable"/>

    <InputDropdownSpan
        :label="$t('c_productContainerOperations.Category')"
        :options="productCategories"
        option-label="name"
        :selected-option="form.model.category.value.value"
        @update:selected-option="form.context.setFieldValue('category', $event)"
        :placeholder="$t('c_productContainerOperations.Please select')"
        :disabled="!isEditable"/>

    <InputDropdownSpan
        :label="$t('c_productContainerOperations.VAT')"
        :options="vatGroups"
        option-label="name"
        :selected-option="form.model.vat.value.value"
        @update:selected-option="form.context.setFieldValue('vat', $event)"
        :placeholder="$t('c_productContainerOperations.Please select VAT')"
        :disabled="!isEditable"/>

    <InputSpan :label="$t('c_productContainerOperations.Alcohol Percentage')"
               :value="form.model.alcoholPercentage.value.value"
               :attributes="form.model.alcoholPercentage.attr.value"
               @update:value="form.context.setFieldValue('alcoholPercentage', $event)"
               :errors="form.context.errors.value.alcoholPercentage"
               id="alcoholPercentage" type="percentage"
               :disabled="!isEditable"/>

    <InputSpan :label="$t('c_productContainerOperations.Price')"
               :value="form.model.priceInclVat.value.value"
               :attributes="form.model.priceInclVat.attr.value"
               @update:value="form.context.setFieldValue('priceInclVat', $event)"
               :errors="form.context.errors.value.priceInclVat"
               id="priceInclVat" type="currency"
               :disabled="!isEditable"/>

    <!-- If the organ is not editable, add a fake option menu so the dropdown still renders  -->
    <div class="flex flex-row justify-content-between align-items-center">
      <i class="pi pi-exclamation-circle text-red-500 cursor-pointer"
         v-tooltip.top="$t('tooltip.productOwner')"/>
      <InputOrganSpan :label="$t('c_POSCreate.Owner')"
                      :organs="!isOrganEditable
                        ? [form.model.owner.value.value]
                        : undefined"
                      :organ="form.model.owner.value.value"
                      @update:organ="form.context.setFieldValue('owner', $event)"
                      :errors="form.context.errors.value.owner"
                      :disabled="!isOrganEditable"/>
    </div>

    <div class="flex flex-row justify-content-between gap-1">
      <InputSpan
          :label="$t('c_productContainerOperations.Preferred')"
          :value="form.model.preferred.value.value"
          :attributes="form.model.preferred.attr.value"
          @update:value="form.context.setFieldValue('preferred', $event)"
          :errors="form.context.errors.value.preferred"
          id="preferred" type="boolean"
          :disabled="!isEditable"/>
      <InputSpan
          :label="$t('c_productContainerOperations.Featured')"
          :value="form.model.featured.value.value"
          :attributes="form.model.featured.attr.value"
          @update:value="form.context.setFieldValue('featured', $event)"
          :errors="form.context.errors.value.featured"
          id="featured" type="boolean"
          :disabled="!isEditable"/>
      <InputSpan
          :label="$t('c_productContainerOperations.Pricelist')"
          :value="form.model.priceList.value.value"
          :attributes="form.model.priceList.attr.value"
          @update:value="form.context.setFieldValue('priceList', $event)"
          :errors="form.context.errors.value.priceList"
          id="priceList" type="boolean"
          :disabled="!isEditable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import type { createProductSchema } from "@/utils/validation-schema";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import InputOrganSpan from "@/components/InputOrganSpan.vue";
import InputDropdownSpan from "@/components/InputDropdownSpan.vue";
import type { BaseVatGroupResponse, ProductCategoryResponse } from "@sudosos/sudosos-client";

const props = defineProps<{
  form: Form<yup.InferType<typeof createProductSchema>>,
  productCategories: ProductCategoryResponse[],
  vatGroups: BaseVatGroupResponse[],
  isEditable?: boolean,
  isOrganEditable?: boolean
}>();



</script>


<style scoped lang="scss">

</style>