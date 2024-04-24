import { defineStore } from 'pinia';
import { type BannerRequest, type BannerResponse } from '@sudosos/sudosos-client';
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
        },
        /**
         * Updates the banner information, excluding the image
         * 
         * @param bannerid Id of the banner
         * @param banner The content of the banner
         */
        async updateBanner(bannerid: number, banner: BannerRequest) {
            return await apiService.banner.update(bannerid, banner);
        },
        /**
         * Updates the image of the banner.
         * 
         * @param bannerid The banner id
         * @param image The image file
         */
        async updateBannerImage(bannerid: number, image: File) {

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