<template>
  <b-modal
    id="create-user"
    :ok-title="$t('c_bannerTable.save')"
    :cancel-title="$t('c_bannerTable.cancel')"
    title="NEW USER"
    size="lg"
    hide-header-close
    centered>
    <div id="add-modal-input">
      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        label="Firstname"
        :state="nameState"
        label-align="left"
        label-for="name"
      >
        <b-form-input
          v-model="firstname"
          id="name"
          name="name"
          type="text"
        />
      </b-form-group>
      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        label="Lastname"
        :state="nameState"
        label-align="left"
        label-for="name"
      >
        <b-form-input
          v-model="lastname"
          id="name"
          name="name"
          type="text"
        />
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        label="Type"
        label-align="left"
        label-for="name">
        <b-form-select :options="userTypes" v-model="userType"/>
      </b-form-group>

      <b-form-group
        id="user-email-group"
        label="Email"
        label-for="new-email"
        label-cols="12"
        label-cols-sm="3"
        :invalid-feedback="emailFeedback"
        :state="validateEmail"
      >
        <b-form-input id="new-email" v-model="email" type="text" />
      </b-form-group>
    </div>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-button
        variant="primary"
        class="btn-empty"
        @click="cancel()"
      >{{ $t('c_bannerTable.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="save">
        {{ $t('c_bannerTable.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { UserType } from '@/entities/User';
import Validators from '@/mixins/Validators';
import { getModule } from 'vuex-module-decorators';
import UserModule, { CreateUserRequest } from '@/store/modules/user';

@Component
export default class UserCreationModal extends Vue {
  private userState = getModule(UserModule);

  firstname: string = null;

  lastname: string = null;

  email: string = null;

  userType: number = null;

  private userTypes: {value: number, text: string}[] = [
    { value: 4, text: 'Local account' },
    { value: 6, text: 'Invoice account' },
    { value: 7, text: 'Automatic Invoice account' },
  ];

  get validateFirstname() {
    return Validators.firstName(this.firstname);
  }

  get firstNameFeedback() {
    if (!this.validateFirstname) {
      return this.$t('profile.First name should contain at least 1 character').toString();
    }

    return '';
  }

  get nameState(): boolean | null {
    return this.firstname === null ? null : this.firstname.length > 0;
  }

  get validateEmail() {
    return Validators.email(this.email);
  }

  get emailFeedback() {
    if (!this.validateEmail) {
      return this.$t('profile.Email should be correct').toString();
    }
    return '';
  }

  save(): void {
    const userRequest: CreateUserRequest = {
      active: true,
      email: this.email,
      firstName: this.firstname,
      lastName: this.lastname,
      type: this.userType,
    };
    this.userState.createUser(userRequest).then((user) => {
      this.$router.push({ name: 'userDetails', params: { id: String(user.id) } });
    });
  }
}

</script>

<style scoped>

</style>
