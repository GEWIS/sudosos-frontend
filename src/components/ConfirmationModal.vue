<template>
  <b-modal
    id="confirmation"
    :title="title"
    size="sm"
    hide-header-close
    centered>
    <p>{{ reason }}</p>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-button
        variant="primary"
        id="confirm-cancel"
        @click="cancel()"
      >{{ $t('confirmationModal.Cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="ok()"
      >{{ $t('confirmationModal.Confirm') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';

@Component
export default class ConfirmationModel extends Vue {
  // Title of the modal
  @Prop({ type: String }) private title!: string;

  // URL that the "confirm" button should redirect to
  @Prop({ type: String }) private url!: string;

  // Message that will be shown in the modal
  @Prop({ type: String }) private reason!: string;

  // Method for sending data (e.g. del, put, etc)
  @Prop({ type: String }) private method!: string;
}
</script>

<style scoped lang="scss">
</style>
