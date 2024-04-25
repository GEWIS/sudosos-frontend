<template>
    <CardComponent header="Banner overview">
        <DataView :value="displayedBanners" data-key="id"
            paginator :first="props.skip && props.skip-1" :rows="props.take">
            <template #header>
                <div class="flex flex-column md:flex-row align-items-center justify-content-between">
                    <SelectButton v-model="filters" :options="options" multiple/>
                    <Button
                      class="mt-2 md:mt-0"
                      label="Create"
                      icon="pi pi-plus"
                      @click="isCreateDialogVisible = true"
                    />
                </div>
            </template>
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <BannerItemComponent v-for="(item, index) in slotProps.items" :key="index" :index="index"
                        :banner="item" />
                </div>
            </template>
        </DataView>
    </CardComponent>
    <BannerDialogComponent v-model:visible="isCreateDialogVisible" />
</template>
<script setup lang="ts">
import DataView from "primevue/dataview";
import SelectButton from "primevue/selectbutton";

import type {
    BannerResponse,
} from "@sudosos/sudosos-client";
import { computed, ref } from "vue";

import BannerItemComponent from "@/components/BannerItemComponent.vue";
import CardComponent from "@/components/CardComponent.vue";
import BannerDialogComponent from "@/components/BannerDialogComponent.vue";

const props = defineProps<{
    banners: BannerResponse[],
    skip?: number | undefined,
    take?: number | undefined
}>();

const isCreateDialogVisible = ref<boolean>();

const filters = ref<string[]>();

const options = [
    "Filter active",
    "Filter expired"
];

const displayedBanners = computed(() => {
    return props.banners
        .filter(b => {
            // Filters active banners
            if (filters.value?.includes(options[0]) && !b.active) return false;
            // Filters expired banners
            if (filters.value?.includes(options[1])  && Date.parse(b.endDate) <= Date.now()) return false;

            return true;

        })
        .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate));
});

</script>
