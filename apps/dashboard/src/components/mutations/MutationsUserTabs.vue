<template>
        <TabView class="w-full">
            <TabPanel :header="$t('transactions.balanceMutations')">
                    <MutationsBalance
                        :paginator="paginator"
                        :getMutations="props.getBalanceMutations"
                    />
            </TabPanel>
            <TabPanel :header="$t('transactions.createdTransactions')">
                    <MutationsSeller
                        :paginator="paginator"
                        :getMutations="props.getSellerMutations"
                    />
            </TabPanel>
        </TabView>
</template>
<script lang="ts" setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import MutationsSeller from '@/components/mutations/MutationsSeller.vue';
import CardComponent from "@/components/CardComponent.vue";

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