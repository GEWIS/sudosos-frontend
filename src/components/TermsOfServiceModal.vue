<template>
  <div>
    <b-link v-b-modal.terms-of-service-modal
    >{{$t('termsOfService.termsOfService')}}</b-link>

    <b-modal
      id="terms-of-service-modal" :title="$t('termsOfService.modalHeader')"
      ok-only
      :ok-title="$t('termsOfService.ok')"
      size="xl"
    >
      <terms-of-service-text />
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import TermsOfServiceText from '@/components/TermsOfServiceText.vue';

@Component({
  components: { TermsOfServiceText },
})
export default class TermsOfServiceModal extends Vue {}
</script>

<style scoped>

</style>
