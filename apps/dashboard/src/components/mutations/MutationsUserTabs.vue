<template>
        <TabView class="w-full">
            <TabPanel header="PH-Balance mutations">
                <MutationsBalanceCard
                    :paginator="paginator"
                    :getMutations="props.getBalanceMutations"
                />
            </TabPanel>
            <TabPanel header="PH-Created transactions">
                <MutationsSellerCard
                    :paginator="paginator"
                    :getMutations="props.getSellerMutations"
                />
            </TabPanel>
        </TabView>
</template>
<script lang="ts" setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import MutationsBalanceCard from '@/components/mutations/MutationsBalanceCard.vue';
import MutationsSellerCard from '@/components/mutations/MutationsSellerCard.vue';

const props = defineProps({
    paginator: {
        type: Boolean,
        required: true
    },
    getBalanceMutations: {
        type: Function,
        required: true
    },
    getSellerMutations: {
        type: Function,
        required: true
    }
});



</script>
<style lang="scss" scoped></style>