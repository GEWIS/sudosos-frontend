<template>
    <CardComponent :header="t('modules.admin.banners.list.header')">
        <DataView :value="displayedBanners" data-key="id" paginator :first="props.skip && props.skip-1"
            :rows="props.take">
            <template #header>
                <div class="flex flex-column md:flex-row align-items-center justify-content-between">
                    <SelectButton v-model="filters" :options="options" optionLabel="name" multiple />
                    <Button class="mt-2 md:mt-0" :label="t('common.create')" icon="pi pi-plus"
                        @click="openDialog" />
                </div>
            </template>
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <BannerItem v-for="(item, index) in slotProps.items" :key="index" :index="index"
                        :banner="item"
                    :openDialog="(banner: BannerResponse) => openDialog(banner)"/>
                </div>
            </template>
        </DataView>
    </CardComponent>
  <FormDialog
      :form="form"
      :header="t('modules.admin.forms.banner.headerCreate')"
      v-model:modelValue="showDialog">
    <template #form="slotProps">
      <BannerImageForm
          :image-src="imageSrc"
          @upload="onImageUpload($event)"
          :isEditable="true"
          class="mb-3"
      />
      <Divider />
      <BannerCreateForm
          :form="slotProps.form"
          v-model:isVisible="showDialog"
          @submit:success="closeDialog"

      />
    </template>
  </FormDialog>
</template>
<script setup lang="ts">
import DataView from "primevue/dataview";
import SelectButton from "primevue/selectbutton";
import FormDialog from "@/components/FormDialog.vue";
import BannerCreateForm from "@/modules/admin/components/banners/forms/BannerCreateForm.vue";
import type {
  BannerRequest,
  BannerResponse,
} from "@sudosos/sudosos-client";
import { computed, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import Divider from "primevue/divider";
import BannerItem from "@/modules/admin/components/banners/BannerItem.vue";
import CardComponent from "@/components/CardComponent.vue";
import { schemaToForm, setSubmit } from "@/utils/formUtils";
import { createBannerSchema } from "@/utils/validation-schema";
import BannerImageForm from "@/modules/admin/components/banners/forms/BannerImageForm.vue";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useBannersStore } from "@/stores/banner.store";
import {getBannerImageSrc} from "@/utils/urlUtils";
const { t } = useI18n();
const toast = useToast();
const bannerImage: Ref<File | undefined> = ref();
const imageSrc = ref<string>();
const bannerStore = useBannersStore();

function onImageUpload(image: File) {
    bannerImage.value = image;
    imageSrc.value = URL.createObjectURL(image);
}


const props = defineProps<{
    banners: BannerResponse[],
    skip?: number | undefined,
    take?: number | undefined
}>();

const showDialog = ref<boolean>();
const form = schemaToForm(createBannerSchema);

// Filtering the banners
const filters = ref<FilterOption[]>();

interface FilterOption {
    name: string,
    type: Filter
}

enum Filter {
    ACTIVE,
    EXPIRED
}

const options = [
    {
        name: t('modules.admin.banners.list.filterActive'),
        type: Filter.ACTIVE
    },
    {
        name: t('modules.admin.banners.list.filterNotExpired'),
        type: Filter.EXPIRED
    }
];

const displayedBanners = computed(() => {
    return props.banners
        .filter(b => {
            const appliedFilters = filters.value?.map(f => f.type) || [];

            // Filters active banners
            if (appliedFilters.includes(Filter.ACTIVE) && !b.active) return false;
            // Filters expired banners
            if (appliedFilters.includes(Filter.EXPIRED)  && Date.parse(b.endDate) <= Date.now()) return false;

            return true;

        })
        .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));
});

const openDialog = (banner? : BannerResponse) => {
  if (banner) {
    updateFieldValues(banner);
    if(banner.image) imageSrc.value = getBannerImageSrc(banner);
  }

  showDialog.value = true;
};

const closeDialog = () => {
  form.context.resetForm({
    values: {
      name: '',
      duration: 0,
      active: false,
      daterange: []
    }
  });

  imageSrc.value = '';
  bannerImage.value = undefined;
  showDialog.value = false;
};

setSubmit(form, form.context.handleSubmit(async (values) => {
  const createBannerRequest: BannerRequest = {
    name: values.name,
    duration: values.duration,
    active: values.active,
    startDate: values.daterange[0],
    endDate: values.daterange[1]
  };

  const bannerResponse = await bannerStore.createBanner(createBannerRequest);
  bannerImage.value && await bannerStore.updateBannerImage(bannerResponse.data.id, bannerImage.value)
      .catch((err) => handleError(err, toast));
  await bannerStore.fetchBanners().then(() => {
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.bannerCreated'),
      life: 3000,
    });

    closeDialog();
  });
}));

const updateFieldValues = (b: BannerResponse) => {
  form.context.resetForm({
    values: {
      name: b.name,
      duration: b.duration,
      active: b.active,
      daterange: [b.startDate, b.endDate],
    }
  });
};
</script>
