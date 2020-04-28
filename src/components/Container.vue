<template>
  <div class="mb-2">
    <div class="container-head px-3 d-flex" v-on:click="isOpen = !isOpen"
           v-b-toggle="'container_' + container.id">

      <!-- The v-on click is to stop the container from toggling open -->
      <b-input-group class="my-auto"
                     v-on:click.stop="() => {}">
        <b-form-checkbox :id="'checkbox_' + container.id"
                         v-model="selected"
                         :disabled="!enabled"
                         @change="checkBoxChanged"
        />
          <span id="container-name">{{ container.name }}</span>
      </b-input-group>

      <span class="mx-3 my-auto"
            v-show="canEdit && enabled && editable"
            v-on:click.stop="() => {}"
            v-on:click="$emit('input', container)"
            v-b-modal.edit-container>
            <font-awesome-icon icon="pen-alt" />
      </span>

      <div class="d-inline ml-2 w-100 my-auto">
        <font-awesome-icon pull="right"
                           icon="angle-down"
                           v-show="!isOpen"
                           class="mr-3"
                           size="lg"
        />
        <font-awesome-icon pull="right"
                           icon="angle-up"
                           v-show="isOpen"
                           class="mr-3"
                           size="lg"
        />
      </div>
    </div>

    <!-- The container itself -->
    <b-collapse :id="'container_' + container.id" class="mt-1">
        <b-row class="mx-0">
          <b-col v-for="item in container.products"
                 :key="item.id"
                 class="text-center product-card px-2"
                 cols="6" sm="4" md="3" lg="2"
                 v-on:click="$emit('editProduct', container.id, item)"
          >
            <div class="product" :class="{'add': canEdit && enabled && editable}">
              <img :src="item.picture" :alt="item.name"/>
              <p class="w-100 product-name mb-0">{{ item.name }}</p>
            </div>
          </b-col>

          <b-col v-if="canEdit && enabled && editable"
                 class="text-center product-card px-2"
                 cols="6" sm="4" md="3" lg="2"
                 v-on:click="$emit('addProduct', container.id)"
          >
            <div class="product add">
              <div><font-awesome-icon icon="plus" class="h-100" /></div>
              <p class="w-100 product-name mb-0">{{ $t('containerComponent.new')}}</p>
            </div>
          </b-col>
        </b-row>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Storage } from '@/entities/Storage';

@Component({})
export default class Container extends Vue {
  @Prop() container: Storage | undefined;

  @Prop() enabled: Boolean | undefined;

  @Prop({ default: true }) editable!: boolean;

  isOpen: Boolean = false;

  selected: Boolean = false;

  mounted() {
    this.selected = !this.enabled || false;
  }

  checkBoxChanged(event: any) {
    const containerId = this.container ? this.container.id : '0';
    this.$emit('toggled', { id: containerId, state: event });
  }

  get canEdit() {
    return this.container
      ? this.$store.state.currentUser.organs.includes(this.container.ownerId) : false;
  }
}
</script>

<style scoped lang="scss">
.input-group {
  flex-wrap: nowrap;
  width: auto;
}

.container-head {
  background-color: $gewis-grey-light;
  cursor: pointer;
  height: 2.5rem;

  span {
      white-space: nowrap;
  }
}

#container-name {
  cursor: default;
}

.product-card {
  margin: 0.5rem 0;

  > div {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    justify-content: center;
  }

  .product {
    background-color: $gewis-grey-light;

    > img {
      width: auto;
      height: auto;
      max-height: 5rem;
      background-color: $gewis-grey-light;
      max-width: 100%;
    }

    > .product-name {
      background: $gewis-grey-accent;
      margin-top: auto;
    }
  }

  .product.add {
    cursor: pointer;

    > div {
      height: 5rem;
      width: auto;
    }
  }
}

</style>
