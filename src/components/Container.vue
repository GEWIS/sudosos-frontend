<template>
  <div class="container-block">
    <div class="container-head px-3 d-flex">
      <b-input-group class="w-auto my-auto">
        <b-form-checkbox :id="'cb_' + container.id" class="cb">
          {{ container.id }}
          <font-awesome-icon icon="pencil-alt" v-show="container.editable"
                             class="ml-1" size="sm">
          </font-awesome-icon>
        </b-form-checkbox>
      </b-input-group>

      <div class="d-inline ml-2 w-100 my-auto"
           v-on:click="isOpen = !isOpen"
           v-b-toggle="container.con_id">
        <font-awesome-icon pull="right"
                           icon="angle-down"
                           v-show="!isOpen"
                           class="mr-3"
                           size="lg"
                            ></font-awesome-icon>
        <font-awesome-icon pull="right"
                           icon="angle-up"
                           v-show="isOpen"
                           class="mr-3"
                           size="lg"
        ></font-awesome-icon>
      </div>
    </div>

    <!-- The container itself -->
    <b-collapse :id="container.con_id" class="mt-1">
        <b-row class="mx-0">
          <b-col v-for="item in container.items"
                 :key="item.id"
                 class="text-center product-card px-2"
                 cols="6" sm="4" md="3" lg="2">
            <div class="product">
              <img src="../assets/img/beugel.png" :alt="item.name"/>
              <p class="w-100 product-name mb-0">{{ item.name }}</p>
            </div>
          </b-col>
        </b-row>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Product } from '@/entities/Product';
import { Storage } from '@/entities/Storage';
@Component({})
export default class Container extends Vue {
  @Prop()
  container: Storage | undefined;

  isOpen: Boolean = false;

  get editable() {
    if (this.container) {
      return this.$store.state.currentUser.organs.includes(this.container.ownerId);
    }
    return false;
  }
}
</script>

<style scoped lang="scss">
  @import "./src/styles/Containers.scss";
</style>
