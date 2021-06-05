<template>
  <b-container fluid="lg">

    <ConfirmationModal
      :title="$t('profile.Confirm deletion')"
      :reason="$t('profile.Are you sure')"
      @modalConfirmed="removeNFCDevice">
    </ConfirmationModal>

    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('profile.My profile')}}</h1>
    <b-row class="mb-4">
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card class="h-100">
          <b-card-title>
            {{ $t('profile.Edit info') }}
          </b-card-title>
          <b-card-body>
            <b-form @submit="updateUserInformation">
              <b-form-group
                id="user-firstname-group"
                :label="$t('profile.First name')"
                label-for="new-firstname"
                :invalid-feedback="firstNameFeedback"
                :state="validateFirstname"
              >
                <b-form-input id="new-firstname" v-model="firstname" type="text" />
              </b-form-group>

              <b-form-group
                id="user-lastname-group"
                :label="$t('profile.Last name')"
                label-for="new-lastname"
              >
                <b-form-input id="new-lastname" v-model="lastname" type="text" />
              </b-form-group>

              <b-form-group
                id="user-email-group"
                :label="$t('profile.Email address')"
                label-for="new-email"
                :invalid-feedback="emailFeedback"
                :state="validateEmail"
              >
                <b-form-input id="new-email" v-model="email" type="text" />
              </b-form-group>
              <b-button type="submit" variant="primary">
                {{ $t('profile.Update user information')}}
              </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col sm="12" md="6">
        <b-card class="h-100">
          <b-card-title>
            {{ $t('profile.Change password') }}
          </b-card-title>
          <b-card-body>
            <b-form @submit="updatePassword">
              <b-form-group
                id="user-password-group"
                :label="$t('profile.Password')"
                label-for="new-password"
                :invalid-feedback="passwordFeedback"
                :state="validatePassword"
              >
                <b-form-input id="new-password" v-model="password" type="password" />
              </b-form-group>

              <b-form-group
                id="user-password-confirm-group"
                :label="$t('profile.Confirm password')"
                label-for="new-password-confirm"
                :invalid-feedback="confirmPasswordFeedback"
                :state="validateConfirmPassword"
              >
                <b-form-input id="new-password-confirm" v-model="confirmPassword" type="password" />
              </b-form-group>
              <b-button type="submit" variant="primary">
                {{ $t('profile.Update password')}}
              </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card class="h-100">
          <b-card-title>
            {{ $t('profile.Change pin code') }}
          </b-card-title>
          <b-card-body>
            <b-form @submit="changePincode">
              <b-form-group
                id="new-pincode-group"
                :label="$t('profile.New pin code')"
                label-for="new-pincode"
                :invalid-feedback="newPincodeFeedback"
                :state="validateNewPincode"
              >
                <b-form-input id="new-pincode" v-model="pincode.newPincode" type="text" />
              </b-form-group>
              <b-form-group
                id="confirm-pincode-group"
                :label="$t('profile.Confirm new pin code')"
                label-for="confirm-pincode"
                :invalid-feedback="confirmPincodeFeedback"
                :state="validateConfirmPincode"
              >
                <b-form-input id="confirm-pincode" v-model="pincode.confirmPincode" type="text" />
              </b-form-group>
              <b-button type="submit" variant="primary">
                {{ $t('profile.Change pin code')}}
              </b-button>
            </b-form>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col sm="12" md="6">
        <b-card class="h-100">
          <b-card-title>{{ $t('profile.Manage NFC devices')}}</b-card-title>
          <b-card-body>
            <b-row
              v-for="device in userState.user.nfcDevices"
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
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import UserModule from '@/store/modules/user';
import { NFCDevice } from '@/entities/NFCDevice';

@Component({
  components: {
    ConfirmationModal,
  },
})
export default class Profile extends Vue {
  private userState = getModule(UserModule);

  editDevice: NFCDevice = {} as NFCDevice;

  removeDevice: NFCDevice = {} as NFCDevice;

  firstname: string = '';

  lastname: string = '';

  email: string | null = null;

  password: string | null = null;

  confirmPassword: string | null = null;

  pincode: any = {
    newPincode: null,
    confirmPincode: null,
  };

  /**
   * Fetch all the user info that is needed for the profile
   */
  beforeMount() {
    this.userState.fetchUser();
    this.firstname = this.userState.user.firstname;
    this.lastname = this.userState.user.lastname;
    this.email = this.userState.user.email || '';
  }

  /**
   * Change a users pincode
   */
  changePincode(event: Event) {
    event.preventDefault();
    if (this.validateNewPincode && this.validateConfirmPincode) {
      this.userState.updatePinCode(this.pincode);
      this.pincode.newPincode = null;
      this.pincode.confirmPincode = null;
    }
  }

  /**
   * If all the info the user inputted is correct we submit the new values to the server
   */
  updateUserInformation(event: Event) {
    event.preventDefault();
    if (this.validateEmail && this.validateFirstname) {
      this.userState.updateUserInformation({
        id: this.userState.user.id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email || '',
      });
    }
  }

  updatePassword(event: Event) {
    event.preventDefault();
    if (this.validatePassword && this.validateConfirmPassword) {
      this.userState.updatePassword({
        id: this.userState.user.id,
        password: this.password || '',
      });
      this.password = null;
      this.confirmPassword = null;
    }
  }

  /**
   * Updates a users NFC device
   *
   * @param {NFCDevice} device: The new NFC device
   */
  updateDevice(device: NFCDevice) {
    this.userState.updateNFCDevice(device);
    this.editDevice = {} as NFCDevice;
  }

  /**
   * If the deletion of an NFC device is confirmed this will remove it.
   */
  removeNFCDevice() {
    this.userState.removeNFCDevice(this.removeDevice);
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
