<template>
    <Dialog v-model:visible="visible" modal :header="
            banner != undefined
            ? 'Edit banner'
            : 'Create banner'
        " 
        ref="dialog" @show="addListenerOnDialogueOverlay(dialog)">
        <Image preview class="w-full" v-if="banner?.image" :src="getBannerImageSrc(banner)"
            :pt:image:alt="banner.name" :pt="{
                image: 'w-full'
            }" />
        <div v-else class="px-3 py-5 text-xl surface-hover text-center">
            No banner found, please upload one!
        </div>
        <Divider />
        <div class="py-2">
            Name: <br>
            <InputText v-model="name" />
        </div>
        <div class="py-2">
            Duration: <br>
            <InputNumber v-model="duration" suffix=" seconds" :maxFractionDigits="3" />
        </div>
        <div class="py-2">
            Timespan: <br>
            <Calendar v-model="startDate" showTime hourFormat="24" />
            till
            <Calendar v-model="endDate" showTime hourFormat="24" />
        </div>
        <div class="py-2">
            Active:<br>
            <InputSwitch v-model="active" />
        </div>
        <div class="flex flex-column justify-content-end align-items-end">
            <Button @click="onSubmit">Submit</Button>
        </div>
    </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Image from 'primevue/image';

import { getBannerImageSrc } from '@/utils/imageUtils';

import type { BannerRequest, BannerResponse } from '@sudosos/sudosos-client';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';

import { onMounted, ref, defineProps, watch } from 'vue'
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useBannersStore } from '@/stores/banner.store';


const dialog = ref(); // For addListenerOnDialogueOverlay

const visible = defineModel<boolean>('visible')
// If Banner is undefined we are creating, otherwise editing.
const banner = defineModel<BannerResponse | undefined>('banner')


// Banner schema and validation
// TODO: Actual validation and errors
const bannerSchema = toTypedSchema(
    yup.object({
        'Name': yup.string().required().default(banner.value?.name),
        'Duration': yup.number().required().default(banner.value && banner.value?.duration/1000),
        'Start date': yup.date().required().default(banner.value && new Date(banner.value?.startDate)),
        'End date': yup.date().required().default(banner.value && new Date(banner.value?.endDate)),
        'Active': yup.boolean().required().default(banner.value?.active),
    })
);

const {
    values,
    errors,
    defineField,
    meta,
    setFieldValue,
    setTouched,
    handleSubmit
} = useForm({
    validationSchema: bannerSchema
})

const [ name ] = defineField('Name');
const [ duration ] = defineField('Duration');
const [ startDate ] = defineField('Start date');
const [ endDate ] = defineField('End date');
const [ active ] = defineField('Active');


const bannersStore = useBannersStore();

const onSubmit = handleSubmit(async (values) => {
    if(banner.value != undefined) {
        // Edit existing banner
        const bannerRequest: BannerRequest = {
            name: values['Name'],
            duration: values['Duration']*1000,
            active: values['Active'],
            startDate: values['Start date'].toISOString(),
            endDate: values['End date'].toISOString()
        }

        const res = await bannersStore.updateBanner(banner.value.id, bannerRequest)

        banner.value = res.data

        visible.value = false;
    } else { 
        // Create new banner

        // TODO
    }
})
</script>