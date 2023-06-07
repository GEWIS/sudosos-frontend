<template>
  <b-modal
    :id="this.id"
    :title="title"
    size="md"
    hide-header-close
    centered>
    <p>{{ reason }}</p>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-button
        variant="primary"
        id="confirm-cancel"
        @click="cancel"
      >{{ $t('c_confirmationModal.Cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="ok"
      >{{ $t('c_confirmationModal.Confirm') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class ConfirmationModal extends Vue {
  // Title of the modal
  @Prop({ type: String }) private title!: string;

  // Message that will be shown in the modal
  @Prop({ type: String }) private reason!: string;

  @Prop({ type: String }) private id: string;

  // Once the modal is closed check if the OK action was used and proceed with method
  mounted() {
    this.$root.$on('bv::modal::hide', (bvEvent: any, modalId: string) => {
      if (Object.keys(bvEvent).indexOf('trigger') !== -1
        && bvEvent.trigger === 'ok'
        && modalId === this.id) {
        this.$emit('confirmed');
      }
    });
  }
}
</script>

<style scoped lang="scss">
</style>
