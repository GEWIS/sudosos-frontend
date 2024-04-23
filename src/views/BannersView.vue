<template>
    <div class="page-container">
        <div class="page-title">{{ $t('banner.Banners') }}</div>
        <BannersListComponent :banners="banners" :skip="0" :take="10"/>
    </div>
</template>
<script setup lang="ts">
import BannersListComponent from '@/components/BannersListComponent.vue';
import { type BannerResponse } from '@sudosos/sudosos-client';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { onMounted, watch } from 'vue';
import { useBannersStore } from '@/stores/banner.store';
import { storeToRefs } from 'pinia';

const bannersStore = useBannersStore();

const { banners } = storeToRefs(bannersStore)

onMounted(async () => {
    console.log(1)
    bannersStore.fetchBanners();
})

watch(banners, () => {
    console.log(banners.value)
})

</script>