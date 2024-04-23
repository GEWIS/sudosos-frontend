<template>
    <div class="col-12">
        <div class="flex flex-column md:flex-row py-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
            <div class="w-full  md:w-5 relative md:pr-2">
                <Image preview class="w-full" v-if="props.banner.image" :src="getBannerImageSrc(props.banner)"
                    :pt:image:alt="props.banner.name" :pt="{
                    image: 'w-full'
                }" />
                <div v-else class="px-3 py-5 text-xl surface-hover text-center">No banner found, please upload one!
                </div>
                <!--
                    Green when active and banner image is present
                    Yellow when active but banner image is not present
                    Red when not active
                -->
                <Tag :value="props.banner.active ? 'Active' : 'Not active'"
                    :severity="props.banner.active 
                        ? props.banner.image 
                            ? 'success'
                            : 'warning'
                        : 'danger'" class="absolute"
                    style="left: 4px; top: 4px" />
            </div>
            <div class="flex flex-row justify-content-between w-full md:w-7">
                <div class="flex flex-column pr-3">
                    <span class="text-xl">{{ props.banner.name }}</span><br>
                    <span class="font-italic">
                        {{ (props.banner.duration/1000).toLocaleString() }}
                        second{{ (props.banner.duration/1000) != 1 ? 's' : ''}}
                    </span>
                </div>
                <div class="flex flex-column justify-content-between align-items-end">
                    <!-- Text will be grey when time is in the past -->
                    <div class="text-right" :class="{ 'text-600 font-italic': isExpired }">
                        <span v-tooltip.top="startDate.toLocaleString()" class="font-semibold">{{
                            formatDateTime(startDate) }}</span>
                        till
                        <span v-tooltip.top="endDate.toLocaleString()" class="font-semibold">
                            {{ formatDateTime(endDate) }}
                        </span>
                    </div>
                    <Button>Edit</Button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type {
    BannerResponse,
    PaginatedBannerResponse
} from "@sudosos/sudosos-client";
import { computed, type PropType } from "vue";
import { getBannerImageSrc } from "@/utils/imageUtils";
import { formatDateTime } from "@/utils/formatterUtils";
import Image from "primevue/image";
import Tag from "primevue/tag";

const props = defineProps<{
    banner: BannerResponse,
    index: number
}>();

const startDate = computed(() => {
    return new Date(props.banner.startDate)
})

const endDate = computed(() => {
    return new Date(props.banner.endDate)
})

const isExpired = computed(() => {
    return (Date.now() > Date.parse(props.banner.endDate))
})


</script>