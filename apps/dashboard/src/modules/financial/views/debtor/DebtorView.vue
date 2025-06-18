<template>
  <div class="flex flex-col page-container-wide">
    <div class="content-wrapper flex flex-col gap-5">
      <DebtorTable />
      <DebtorHandouts />
    </div>
  </div>
</template>
<script setup lang="ts">
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';
</script>

<style scoped lang="scss"></style>
