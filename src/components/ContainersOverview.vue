<template>
  <div>
    <h5 class="ml-lg-3 em-title">{{ $t('Containers') }}</h5>
    <b-form-group>
      <div v-for="container in containersList" :key="container.id">
        <container :container="container"></container>
        <container-editor v-if="container.editable" :container="container"></container-editor>
      </div>
    </b-form-group>
  </div>

</template>

<script lang="ts">
// import Container from '@/components/Container.vue';
import {
  Component, Vue,
} from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import ContainerEditor from '@/components/ContainerEditor.vue';
import { ContainerData } from '@/entities/Container';

export default {
  name: 'Containers',
  components: { Container },
  data() {
    return {
      containers: [
        { con_id: 'a1', editable: false },
        { con_id: 'b2', editable: true },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
@import "./src/styles/Containers.scss";
</style>
