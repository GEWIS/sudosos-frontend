<template>
    <CardComponent header="Banner overview">
        <DataView :value="props.banners.sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))" data-key="id"
            paginator :first="props.skip && props.skip-1" :rows="props.take">
            <template #list="slotProps">
                <div class="grid grid-nogutter">
                    <BannerItemComponent v-for="(item, index) in slotProps.items" :key="index" :index="index"
                        :banner="item" />
                </div>
            </template>
        </DataView>
    </CardComponent>

</template>
<script setup lang="ts">
import type { 
    BannerResponse,
    PaginatedBannerResponse
} from "@sudosos/sudosos-client";
import { computed, type PropType } from "vue";
import BannerItemComponent from "@/components/BannerItemComponent.vue";
import DataView from "primevue/dataview";
import DataTable from "primevue/datatable";
import CardComponent from "./CardComponent.vue";

const props = defineProps<{
    banners: BannerResponse[],
    skip?: number | undefined,
    take?: number | undefined
}>();

</script>