<template>
  <div>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('transactionDetails.Total') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.price.toFormat() }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('transactionDetails.Point of sale') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.pointOfSale.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('transactionDetails.Bought by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left mb-3">
        <v-select
          v-model="transaction.from.id"
          :options="userState.allUsers"
          :getOptionLabel="user => user.name"
          :reduce="user => user.id"
        />
      </b-col>
    </b-row>
    <b-row v-if="Object.keys(transaction.createdBy).length !== 0">
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('transactionDetails.Put in by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.createdBy.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="4">
        <p class="font-weight-bold">{{ $t('transactionDetails.Products') }}</p>
      </b-col>
      <b-col cols="12" sm="8" class="total-price">
        <b-row
          v-for="(subTransaction, subTransIndex) in transactionEdits"
          v-bind:key="`subtransaction_${subTransIndex}`"
        >
          <p>{{ subTransaction.container.name }}</p>
          <b-col cols="5" sm="6">
          <input
            type="number"
            v-model="subTransaction.amount"
            @input="updateTransactionEdit($event, subTransIndex)"
          >
          <v-select
            :options="posProducts"
            :selectable="posProduct => posProduct.group === null"
            v-model="subTransaction.product"
            :getOptionLabel="posProduct => posProduct.product"
            :reduce="posProduct => posProduct.product"
            @input="updateTransactionEdit($event, subTransIndex)"
          >
            <template v-slot:selected-option="product">
              <template v-if="product.hasOwnProperty('product')">
                <img :src="product.product.picture" alt="product image">
                {{ product.product.name }}
              </template>
              <template v-else>
                <img :src="product.picture" alt="product image">
                {{ product.name }}
              </template>
            </template>
            <template v-slot:option="{ group, product }">
              <template v-if="group !== null" class="product-opt-group">
                {{ group }}
              </template>
              <template v-else>
                <img :src="product.picture" alt="product image">
                {{ product.name }}
              </template>
            </template>
          </v-select>
        </b-col>
          <b-col cols="7" sm="6" class="text-right">
            <p>
              {{ `( ${ subTransaction.product.price.toFormat() } ) ` +
            `= ${ subTransaction.totalPrice.toFormat()}` }}
            </p>
          </b-col>
        </b-row>
        <hr>
        <b-row>
          <b-col cols="12" class="text-right">
            <p>
              <i class="mr-1">{{ $t('transactionDetails.Total') }} </i>
              {{ totalTransactionPrice.toFormat() }}</p>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-button class="mr-3 mt-2" variant="success">Save</b-button>
    <b-button class="mr-3 mt-2" variant="danger">Delete</b-button>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import Dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import ProductsModule from '@/store/modules/products';
import ContainerModule from '@/store/modules/containers';
import { TransactionEdit, parseTransaction } from '@/entities/TransactionEdit';
import { Product } from '@/entities/Product';
import { Container } from '@/entities/Container';

// TODO: Fix that the containers are actually the containers from the POS revision
// TODO: Fix that the products are actually products that are in the selected container

/** TODO: Fix container not being updated when TransactionEdit is updated from v-select, the
  * container should be updated as well but that is currently not being done.
  */

@Component
export default class EditTransaction extends Vue {
  @Prop() transaction!: Transaction;

  userState = getModule(UserModule);

  productState = getModule(ProductsModule);

  containerState = getModule(ContainerModule);

  transactionEdits: TransactionEdit[] = [];

  posProducts: {
      product: Product | null,
      group: string | null,
      container: Container | null
    }[] = [];

  totalTransactionPrice: any;

  beforeMount() {
    this.userState.fetchAllUsers();
    this.productState.fetchProducts();
    this.containerState.fetchContainers();
    this.containerState.fetchPublicContainers();
    this.transactionEdits = parseTransaction(this.transaction);

    // TODO: Make sure that these are the products from all the containers in the POS
    this.totalTransactionPrice = this.transaction.price;
    this.createProductList();
  }

  createProductList() {
    [...this.containerState.containers, ...this.containerState.publicContainers].forEach(
      (container) => {
        if (container.products.length > 0) {
          const group = {
            group: container.name,
            product: {} as Product,
            container: null,
          };
          this.posProducts.push(group);

          container.products.forEach((product) => {
            const prod = {
              product,
              container,
              group: null,
            };
            this.posProducts.push(prod);
          });
        }
      },
    );
  }

  updateTransactionEdit(event: any, subTransIndex: number) {
    const editTrans = this.transactionEdits[subTransIndex];
    const previousAmount = editTrans.totalPrice.getAmount();
    const amount = editTrans.product.price.getAmount() * editTrans.amount;
    let totalTransAmount = this.totalTransactionPrice.getAmount();
    editTrans.totalPrice = Dinero({ amount });
    this.transactionEdits.splice(subTransIndex, 1, editTrans);

    console.log(JSON.stringify(editTrans));

    totalTransAmount = totalTransAmount - previousAmount + amount;
    this.totalTransactionPrice = Dinero({ amount: totalTransAmount, currency: 'EUR' });
  }
}
</script>

<style scoped lang="scss">
.v-select {
  img {
    max-height: 20px;
    max-width: 20px;
    width: auto;
    height: auto;
    margin-right: 1rem;
  }
}
</style>
