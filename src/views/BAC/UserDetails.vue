<template>
  <b-container fluid="lg">

    <ConfirmationModal
      :title="$t('userDetails.Confirm deletion')"
      :reason="$t('userDetails.Are you sure')"
      @modalConfirmed="removeNFCDevice">
    </ConfirmationModal>

    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('userDetails.profile', { name: firstname })}}</h1>
    <b-row class="mb-4">
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card class="h-100">
          <b-card-title>
            {{ $t('userDetails.Edit info') }}
          </b-card-title>
          <b-card-body>
            <p v-if="!isLocal">
              {{ $t('userDetails.Not local') }}
            </p>
            <b-form @submit="updateUserInformation">
              <b-form-group
                id="user-firstname-group"
                :label="$t('userDetails.First name')"
                label-for="new-firstname"
                :invalid-feedback="firstNameFeedback"
                :state="validateFirstname"
              >
                <b-form-input id="new-firstname"
                              v-model="firstname" type="text" :disabled="!isLocal"/>
              </b-form-group>

              <b-form-group
                id="user-lastname-group"
                :label="$t('userDetails.Last name')"
                label-for="new-lastname"
              >
                <b-form-input id="new-lastname"
                              v-model="lastname" type="text" :disabled="!isLocal"/>
              </b-form-group>

              <b-form-group
                id="user-email-group"
                :label="$t('userDetails.Email address')"
                label-for="new-email"
                :invalid-feedback="emailFeedback"
                :state="validateEmail"
              >
                <b-form-input id="new-email" v-model="email" type="text" :disabled="!isLocal"/>
              </b-form-group>
              <b-form-group
                id="user-active-group"
                :label="$t('userDetails.Active')"
                label-for="user-active"
              >
                <b-form-checkbox
                  id="user-active"
                  v-model="active"
                  name="user-active"
                  :value="true"
                  :unchecked-value="false"
                >
                  {{  $t("userDetails.user is active") }}
                </b-form-checkbox>
              </b-form-group>
              <b-button variant="primary" :disabled="userUpdate.busy"
                      type="submit">
                <b-spinner v-if="userUpdate.busy" small></b-spinner>
                {{ $t('userDetails.Update user information')}}
              </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col sm="12" md="6">
        <b-card class="h-100" v-if="isLocal">
          <b-card-title>
            {{ $t('userDetails.Reset password') }}
          </b-card-title>
          <b-card-body>
            <b-form>
              <p> A reset password link will be sent to {{ user.email }} </p>
              <b-button variant="primary" :disabled="passwordReset.busy"
                        @click="requestPasswordReset">
                <b-spinner v-if="passwordReset.busy" small></b-spinner>
                {{ $t('userDetails.Request reset')}}
              </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="nfcDevices.length > 0" sm="12" md="6">
        <b-card class="h-100">
          <b-card-title>{{ $t('userDetails.Manage NFC devices')}}</b-card-title>
          <b-card-body>
            <b-row
              v-for="device in nfcDevices"
              v-bind:key="device.id"
              class="nfc-device-badge mb-2">
              <span
                v-show="device.id !== editDevice.id"
                @click="editDevice = device"
                class="mx-2 information">
                {{ device.name }}
              </span>
              <b-form-input
                type="text" class="edit-devicename mx-2"
                v-on:keypress.enter="updateDevice(device)"
                @blur="updateDevice(device)"
                v-show="device.id === editDevice.id"
                v-model="editDevice.name"/>
              <span class="information mx-2 mx-sm-0">({{ device.address }})</span>
              <span
                v-b-modal.confirmation
                @click="removeDevice = device"
                class="ml-auto mr-2 icon">
              <font-awesome-icon icon="times-circle"></font-awesome-icon>
            </span>
              <span
                v-show="editDevice.id !== device.id"
                @click="editDevice = device"
                class="mr-2 icon">
              <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
            </span>
              <span
                v-show="editDevice.id === device.id"
                @click="updateDevice(device)"
                class="mr-2 icon">
              <font-awesome-icon icon="check-circle"></font-awesome-icon>
            </span>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <transactions-table :user="this.user" :show-admin-options="true" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
// TODO: Fix methods for data validation + update translations + update user store

import { Component, Prop, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import UserModule from '@/store/modules/user';
import { NFCDevice } from '@/entities/NFCDevice';
import { LOCAL_USER_TYPES, User } from '@/entities/User';
import { requestPasswordReset } from '@/api/users';
import eventBus from '@/eventbus';
import TransactionsTable from '@/components/TransactionsTable.vue';

@Component({
  components: {
    TransactionsTable,
    ConfirmationModal,
  },
})
export default class UserDetails extends Vue {
  @Prop() id!: number;

  private userState = getModule(UserModule);

  nfcDevices: NFCDevice[] = [];

  editDevice: NFCDevice = {} as NFCDevice;

  removeDevice: NFCDevice = {} as NFCDevice;

  firstname: string = '';

  lastname: string = '';

  email: string | null = null;

  active: boolean = false;

  password: string | null = null;

  confirmPassword: string | null = null;

  isLocal: boolean = false;

  user: User = null;

  pincode: any = {
    newPincode: null,
    confirmPincode: null,
  };

  /**
   * Fetch all the user info that is needed for the profile
   */
  async beforeMount() {
    this.user = await this.userState.fetchUser(Number(this.id)) as User;
    this.firstname = this.user.firstname;
    this.lastname = this.user.lastname;
    this.email = this.user.email || '';
    this.active = this.user.active;
    this.nfcDevices = this.user.nfcDevices;
    if (LOCAL_USER_TYPES.includes(this.user.type)) this.isLocal = true;
  }

  /**
   * If all the info the user inputted is correct we submit the new values to the server
   */
  updateUserInformation(event: Event) {
    event.preventDefault();
    this.userUpdate.busy = true;
    if (this.validateEmail && this.validateFirstname) {
      const user = {
        firstName: this.firstname,
        lastName: this.lastname,
        email: this.email,
        active: this.active,
      };
      this.userState.updateUserInformation({ id: Number(this.id), user }).then((u) => {
        this.user = u as User;
        this.userUpdate.busy = false;
        eventBus.$emit('success', {
          message: String(this.$t('userDetails.Updated user information')),
          title: 'Success',
        });
      });
    }
  }

  userUpdate = {
    busy: false,
  }

  passwordReset = {
    busy: false,
  }

  requestPasswordReset(event: Event) {
    event.preventDefault();
    this.passwordReset.busy = true;
    requestPasswordReset(this.email).then(() => {
      this.passwordReset.busy = false;
      eventBus.$emit('success', {
        message: String(this.$t('userDetails.Request reset sent')),
        title: 'Success',
      });
    });
  }

  /**
   * Updates a users NFC device
   *
   * @param {NFCDevice} device: The new NFC device
   */
  updateDevice(device: NFCDevice) {
    // this.userState.updateUsersNFCDevice({ userID: Number(this.id), id: device.id });
    this.editDevice = {} as NFCDevice;
  }

  /**
   * If the deletion of an NFC device is confirmed this will remove it.
   */
  // eslint-disable-next-line class-methods-use-this
  removeNFCDevice() {
    // this.userState.removeUsersNFCDevice({ userID: Number(this.id), id: this.removeDevice.id });
  }

  /**
   * Check if the first name has a length longer than 1
   */
  get validateFirstname() {
    return this.firstname.length > 0;
  }

  /**
   * Display an error if the first name field is incorrect
   */
  get firstNameFeedback() {
    if (!this.validateFirstname) {
      return this.$t('profile.First name should contain at least 1 character').toString();
    }

    return '';
  }

  /**
   * Check if the email is not null, there is an actual email being inputted and this email
   * address is of correct form
   */
  get validateEmail() {
    return this.email === null || this.email.length === 0 || /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email);
  }

  /**
   * If an email is being inputted that is of incorrect form make sure we let the user know.
   */
  get emailFeedback() {
    if (!this.validateEmail) {
      return this.$t('profile.Email should be correct').toString();
    }

    return '';
  }

  /**
   * Check if the new password is longer than 8 characters
   */
  get validatePassword() {
    return this.password === null || this.password.length >= 8;
  }

  /**
   * If the password is < 8 characters display an error message
   */
  get passwordFeedback() {
    if (!this.validatePassword) {
      return this.$t('profile.Password should').toString();
    }

    return '';
  }

  /**
   * Check if passwords match (given that both have an input)
   */
  get validateConfirmPassword() {
    return (
      this.confirmPassword === null
      || this.password === null
      || (this.password === this.confirmPassword && this.validatePassword)
    );
  }

  /**
   * Show an error if the passwords do not match
   */
  get confirmPasswordFeedback() {
    if (!this.validateConfirmPassword) {
      return this.$t('profile.The passwords to not match up').toString();
    }

    return '';
  }

  /**
   * Check if the new pincode is of length 4
   */
  get validateNewPincode() {
    return this.pincode.newPincode === null || this.pincode.newPincode.length !== 4;
  }

  /**
   * Display a correct error message if the new pincode does not match the criteria
   */
  get newPincodeFeedback() {
    if (this.pincode.newPincode !== null && this.pincode.newPincode.length !== 4) {
      return this.$t('profile.New pin code length must be 4 digits').toString();
    }

    return '';
  }

  /**
   * Check if both pincodes match if a pincode has been inputted
   */
  get validateConfirmPincode() {
    return (
      this.pincode.confirmPincode === null
      || this.pincode.newPincode === null
      || this.pincode.newPincode === this.pincode.confirmPincode
    );
  }

  /**
   * Display error message if both pincodes do not match
   */
  get confirmPincodeFeedback() {
    if (!this.validateConfirmPincode) {
      return this.$t('profile.Confirmation does not match pin code').toString();
    }
    return '';
  }
}
</script>

<style scoped lang="scss">
@import '~bootstrap/scss/bootstrap';
@import './src/styles/Card.scss';

input#new-pincode,
input#confirm-pincode {
  max-width: 10ch;
}

button {
  float: left !important;
}

.nfc-device-badge {
  background-color: #e8e8e8;
  padding: 8px;
  margin: 0;
  border-radius: 4px;
  font-weight: 600;
  display: flex;

  > * {
    margin-top: auto;
    margin-bottom: auto;
  }

  span:first-of-type,
  .icon {
    cursor: pointer;
  }

  .edit-devicename {
    min-width: 15ch;
    width: 100%;
  }
}

@include media-breakpoint-down(xs) {
  .nfc-device-badge {
    span.information,
    input {
      width: 100%;
    }
  }
}
</style>
