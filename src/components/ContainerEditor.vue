<template>
    <b-modal
      :id="'modal_' + container.id"
      :busy=true
      hide-header-close
    >
      <h5 class="em-title">Container {{ container.name }} aanpassen</h5>
      <b-form-group>
        <b-form-row>
          <b-col><b-form-text>Toegevoegd op:</b-form-text></b-col>
          <b-col><b-form-text>1970-01-01</b-form-text></b-col>
        </b-form-row>
        <b-form-row>
          <b-col><b-form-text>Toegevoegd door:</b-form-text></b-col>
          <b-col><b-form-text>{{container.addedBy}}</b-form-text></b-col>
        </b-form-row>
      </b-form-group>
      <b-form-row>
        <b-col><b-form-text>Naam:</b-form-text></b-col>
        <b-col><b-form-input v-model="container.name"></b-form-input></b-col>
      </b-form-row>
      <b-form-row>
        <b-col><b-form-text>Open van:</b-form-text></b-col>
        <b-col><b-form-input v-model="container.open"></b-form-input></b-col>
      </b-form-row>
      <b-form-row>
        <b-col><b-form-text>Sluit om:</b-form-text></b-col>
        <b-col>
          <b-form-input :placeholder='container.close'>
          </b-form-input>
        </b-col>
      </b-form-row>

      <template v-slot:modal-footer="{ ok, cancel }" class="ce-footer">
        <b-button variant="danger" @click="cancel()">
          Annuleren
        </b-button>
        <b-button variant="success" @click="ok()">
          Opslaan
        </b-button>
      </template>
    </b-modal>
</template>

<script>
export default {
  props: ['container'],
};
</script>

<style scoped>

</style>
