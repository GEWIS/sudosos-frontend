<template>
  <div>
    <!--TODO: change colors to GEWIS-color, which is now set to warning-->
    <b-card
      style="width: 18rem;"
      class="text-left"
      border-variant="warning"
      >
      <b-card-title style="color:#D40026;">
        Your Balance
      </b-card-title>
      <b-card-text>
        <h5>&euro;{{ currentBalance.toString().replace('.', ',') }}</h5>
      </b-card-text>
      <b-button href="#" class="card-link" variant="warning">
        Increase balance online
      </b-button>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentBalance: 152.78,
    };
  },
  name: 'CurrentSaldo',
};
</script>

<style scoped>

</style>
