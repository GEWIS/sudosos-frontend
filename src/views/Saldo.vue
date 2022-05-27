<template>
    <b-container fluid="lg">
      <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('app.Saldo') }}</h1>
      <IncreaseSaldo />
    </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CurrentSaldo from '@/components/CurrentSaldo.vue';
import IncreaseSaldo from '@/components/IncreaseSaldo.vue';

@Component({
  components: {
    IncreaseSaldo, CurrentSaldo,
  },
})
export default class Home extends Vue {
}
</script>
