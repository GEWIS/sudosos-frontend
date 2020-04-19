<template>
  <div class="container-block">
    <div class="container-head px-3 d-flex" v-on:click="isOpen = !isOpen"
           v-b-toggle="'container_' + container.id">
      <b-input-group class="my-auto" @click.stop="() => {}">
        <b-form-checkbox :id="'checkbox_' + container.id" class="checkbox"
          v-model="checkBoxValue" :disabled="!enabled"/>
          <span v-on:click="isOpen = !isOpen" v-b-toggle="'container_' + container.id">
            {{ container.name }}
          </span>
          <span class="edit-button" v-show="canEdit && enabled">Edit ✎</span>
      </b-input-group>

      <div class="d-inline ml-2 w-100 my-auto">
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
    <b-collapse :id="'container_' + container.id" class="mt-1">
        <b-row class="mx-0">
          <b-col v-for="item in container.products"
                 :key="item.id"
                 class="text-center product-card px-2"
                 cols="6" sm="4" md="3" lg="2">
            <div class="product">
              <img :src="item.picture" :alt="item.name"/>
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

  @Prop()
  enabled: Boolean | undefined;

  isOpen: Boolean = false;

  selected: Boolean = false;

  get checkBoxValue() {
    return this.selected || !this.enabled;
  }

  set checkBoxValue(newValue: Boolean) {
    this.selected = newValue;
  }

  get canEdit() {
    return this.container
      ? this.$store.state.currentUser.organs.includes(this.container.ownerId) : false;
  }
}
</script>

<style scoped lang="scss">
.em-title {
  color: $gewis-red;
  text-transform: uppercase;
}

.input-group {
  flex-wrap: nowrap;
  width: auto;
}

.container-block {
  margin-bottom: 0.5rem;
}

.container-head {
  background-color: $gewis-grey-light;
  cursor: pointer;
  height: 2.5rem;
  span {
      white-space: nowrap;
  }

  .edit-button {
      background-color: $gewis-grey;
      margin-left: 8px;
      border-radius: 4px;
      padding-left: 4px;
      padding-right: 4px;
  }
}

.chec {
  display: inline;
}

.product-card {
  margin: 0.5rem 0;

  .product {
    background-color: $gewis-grey-light;

    > img {
      width: auto;
      height: auto;
      max-height: 5rem;
      background-color: $gewis-grey-light;
    }
  }
}

.product-name {
  background: $gewis-grey-accent;
}

</style>
