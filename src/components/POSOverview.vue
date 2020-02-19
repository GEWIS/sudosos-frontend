<template>
    <div>
        <h1>Overview</h1>
        <div class="componentBox">
            <div class="ownPos">
                <h2>My Points of Sale</h2>
            </div>
            <div class="requestPos">
                <h2>Requested Points of Sale</h2>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class POSOverview extends Vue {
    @Prop() private msg!: string;
}
</script>

<style scoped lang="scss">
</style>
