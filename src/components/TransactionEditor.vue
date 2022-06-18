<template>
  <div>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Total') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ totalTransactionPrice.toFormat() }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Point of sale') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.pointOfSale.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Bought by') }}</p>
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
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Put in by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.createdBy.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Products') }}</p>
      </b-col>
      <b-col cols="12" sm="8" class="total-price">
        <b-row
          v-for="(subTransaction, subTransIndex) in transactionEdits"
          v-bind:key="`subtransaction_${subTransIndex}`"
          :class="subTransIndex < transactionEdits.length - 1 ? 'mb-3' : ''"
        >
          <b-col class="mb-3 text-truncate" cols="9">
            {{ $t("c_transactionEditor.Product container") }}: {{ subTransaction.container.name }}
          </b-col>
          <b-col cols="3" class="mb-3 text-right">
            <b-button
              @click="deleteTransactionEdit(subTransIndex)"
              variant="danger"
              size="sm"
            >
              {{ $t("c_transactionEditor.Delete product") }}
            </b-button>
          </b-col>
          <b-col cols="9" class="mb-2">
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
                  <img :src="`/static/products/${product.picture}`" alt="product image">
                  {{ product.product.name }}
                </template>
                <template v-else>
                  <img :src="`/static/products/${product.picture}`">
                  {{ product.name }}
                </template>
              </template>
              <template v-slot:option="{ group, product }">
                <template v-if="group !== null" class="product-opt-group">
                  {{ group }}
                </template>
                <template v-else>
                  <img :src="`/static/products/${product.picture}`" alt="product image">
                  {{ product.name }}
                </template>
              </template>
            </v-select>
          </b-col>
          <b-col cols="3" class="mb-2">
            <input
              type="number"
              class="product-amount-input"
              min="1"
              v-model="subTransaction.amount"
              @input="updateTransactionEdit($event, subTransIndex)"
            >
          </b-col>
          <b-col
            v-if="subTransaction.product.price !== undefined"
            cols="12"
            sm="12"
            class="text-right product-price"
          >
              {{ `( ${subTransaction.amount} x ${ subTransaction.product.price.toFormat() } ) ` +
            `= ${ subTransaction.totalPrice.toFormat()}` }}
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            <b-button @click="addTransactionEdit" variant="success">
              {{ $t("c_transactionEditor.Add product") }}
            </b-button>
          </b-col>
        </b-row>
        <hr>
        <b-row>
          <b-col cols="12" class="text-right">
            <p>
              <i class="mr-1">{{ $t('c_transactionEditor.Total') }} </i>
              {{ totalTransactionPrice.toFormat() }}</p>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-button :disabled="!canSaveTransaction" class="mr-3 mt-2" variant="success">
      {{ $t("c_transactionEditor.Save") }}
    </b-button>
    <b-button class="mr-3 mt-2" variant="danger">
      {{ $t("c_transactionEditor.Delete") }}
    </b-button>
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

@Component
export default class TransactionEditor extends Vue {
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

  /**
   * Combines containers and products into one list such that we have "subgroups" in the product
   * overview per container (makes everything looks nice)
   */
  createProductList() {
    [...this.containerState.containerMapping.values(),
      ...this.containerState.publicContainers].forEach(
      (container: Container) => {
        if (container.products.length > 0) {
          const group = {
            group: container.name,
            product: {} as Product,
            container: null as any,
          };
          this.posProducts.push(group);

          container.products.forEach((product) => {
            const prod = {
              product,
              container,
              group: null as any,
            };
            this.posProducts.push(prod);
          });
        }
      },
    );
  }

  /**
   * Add a new transaction
   */
  addTransactionEdit() {
    this.transactionEdits.push({
      product: {} as Product,
      container: {} as Container,
      amount: 1,
      totalPrice: {},
    } as TransactionEdit);
  }

  /**
   * Delete a transaction and remove it's price from the total
   */
  deleteTransactionEdit(index: number) {
    const editTrans = this.transactionEdits.splice(index, 1);
    if (Object.keys(editTrans[0].totalPrice).length > 0) {
      let totalTransAmount = this.totalTransactionPrice.getAmount();
      totalTransAmount -= editTrans[0].totalPrice.getAmount();
      this.totalTransactionPrice = Dinero({ amount: totalTransAmount, currency: 'EUR' });
    }
  }

  /**
   * Updates the editTransaction with a new product or new amount, if a new product is selected the
   * respective container is also updated.
   *
   * @param event event that triggers the update, either contains a product or an input event
   * @param {number} subTransIndex the index of the current subtransaction we are editing
   */
  updateTransactionEdit(event: any, subTransIndex: number) {
    const currentTransaction = this.transactionEdits[subTransIndex];

    let totalTransAmount = this.totalTransactionPrice.getAmount();
    let previousAmount = 0;
    let amount = 0;

    // If an existing product is begin editted simply add the total amount otherwise add for the
    // new product
    if (Object.keys(currentTransaction.totalPrice).length > 0) {
      previousAmount = currentTransaction.totalPrice.getAmount();
      amount = currentTransaction.product.price.getAmount() * currentTransaction.amount;
      totalTransAmount = totalTransAmount - previousAmount + amount;
    } else {
      totalTransAmount += event.price.getAmount();
      amount = event.price.getAmount();
    }

    this.totalTransactionPrice = Dinero({ amount: totalTransAmount, currency: 'EUR' });
    currentTransaction.totalPrice = Dinero({ amount });

    if (event.type !== 'input') {
      const newTransaction = this.posProducts.find((trans) => trans.product === event);
      if (newTransaction !== undefined) {
        currentTransaction.container = newTransaction.container as Container;
      }
    }

    this.transactionEdits.splice(subTransIndex, 1, currentTransaction);
  }

  /**
   * Checks if there are any rows in transactionEdits and if each row has a product set
   *
   * @return {boolean} true if you can save the products in current setup
   */
  get canSaveTransaction() {
    let allProductSet = true;

    this.transactionEdits.forEach((trans) => {
      if (Object.keys(trans.product).length === 0) {
        allProductSet = false;
      }
    });

    return this.transactionEdits.length > 0 && allProductSet;
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

.product-price {
  line-height: 30px;
}

.product-amount-input {
  border: 1px solid rgba(60,60,60,.26);
  border-radius: 4px;
  padding: 0 .5rem;
  height: 100%;
  width: 100%;
}
</style>
