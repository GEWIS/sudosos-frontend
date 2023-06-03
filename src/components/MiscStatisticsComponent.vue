<template>
<div>
  <h1>Miscellaneous Statistics</h1>
  <p>Amount of products bought: <strong>43000</strong></p>
  <p>Amount of different products bought: <strong>96</strong></p>
  <p>Average price of transaction: <strong>€4.20</strong> </p>
  <p>Amount of alcohol drunk: <strong>123456 mL</strong></p>
</div>
</template>

<script>
import getTransactionsReport from '@/api/statistics';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';

export default {
  name: 'MiscStatisticsComponent',
  async beforeMount() {
    const userState = getModule(UserModule);
    await userState.fetchSelf(true);
    const userID = userState.self.id;
    const data = await getTransactionsReport(userID, {
      fromId: userID,
    });
  },
};

</script>

<style scoped>

</style>
