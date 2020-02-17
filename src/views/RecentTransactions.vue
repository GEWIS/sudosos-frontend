<template>
  <div class="RecentTab">
    <RecentTransactions :user="user"/>
  </div>
</template>

<script lang="ts">
import RecentTransactions from '@/components/RecentTransactions.vue';
import { User } from '@/entities/User';

const usar : User = {
  id: '8549',
  firstName: 'Pieter',
  lastName: 'Ebbers',
  saldo: 12.00,
};

export default {
  name: 'recenttransaction',
  components: {
    RecentTransactions,
  },
  data() {
    return {
      user: usar,
    };
  },
  methods: {

  },
};
</script>

<style>

</style>
