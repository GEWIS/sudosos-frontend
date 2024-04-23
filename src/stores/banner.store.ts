import { defineStore } from 'pinia';
import { type BannerResponse } from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import apiService from "@/services/ApiService";

export const useBannersStore = defineStore('banners', {
    state: () => ({
        banners: [] as BannerResponse[]
    }),
    actions: {
        async fetchBanners() {
            this.banners = await fetchAllPages<BannerResponse>(0, 100, (take, skip) =>
                // @ts-ignore
                apiService.openBanner.getAllOpenBanners(take, skip)
            );
        }
    },
    getters: {
        activeBanners(): BannerResponse[] {
            // Filter banners that are currently active based on their start and end dates
            const now = new Date().toISOString();
            return this.banners.filter(
                (banner) => banner.active || (banner.startDate <= now && banner.endDate >= now)
            );
        }
    }
});