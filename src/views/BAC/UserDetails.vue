<template>
  <b-container fluid="lg">
    <ConfirmationModal
      :title="$t('profile.Confirm deletion')"
      :reason="$t('profile.Are you sure')"
      @modalConfirmed="confirmModal">
    </ConfirmationModal>

    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('profile.My profile')}}</h1>
    <b-row class="mb-4">
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card>
          <b-card-title>
            Pas hier je gegevens aan
          </b-card-title>
          <b-card-body>
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
              :invalid-feedback="lastNameFeedback"
              :state="validateLastname"
            >
              <b-form-input id="new-lastname" v-model="lastname" type="text" />
            </b-form-group>

            <b-form-group
              id="user-email-group"
              :label="$t('profile.Email address')"
              label-for="new-email"
              :invalid-feedback="email"
              :state="validateEmail"
            >
              <b-form-input id="new-email" v-model="email" type="email" />
            </b-form-group>

            <b-form-group
              id="user-active-group"
              :label="$t('profile.Active')"
              label-for="user-active"
            >
              <b-form-checkbox
                id="user-active"
                v-model="active"
                name="user-active"
                value="true"
                unchecked-value="false"
              >
                {{  $t("profile.user is active") }}
              </b-form-checkbox>
            </b-form-group>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col sm="12" md="6">
        <b-card>
          <b-card-title>
              Pas hier nog meer gegevens aan
          </b-card-title>
          <b-card-body>
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
              :invalid-feedback="passwordConfirmFeedback"
              :state="validateConfirmPassword"
            >
              <b-form-input id="new-password-confirm" v-model="confirmPassword" type="password" />
            </b-form-group>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card>
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
        <b-card>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
// eslint-disable-next-line import/no-cycle
import UserModule from '@/store/modules/user';
import { NFCDevice } from '@/entities/NFCDevice';
import { User } from '@/entities/User';

@Component({
  components: {
    ConfirmationModal,
  },
})
export default class UserDetails extends Vue {
  @Prop() id!: number;

  private userState = getModule(UserModule);

  user: User = {} as User;

  firstname: string = '';

  lastname: string = '';

  editDevice: NFCDevice = {} as NFCDevice;

  removeDevice: NFCDevice = {} as NFCDevice;

  pincode: any = {
    newPincode: '',
    confirmPincode: '',
  };

  changePincode() {
    this.userState.updatePinCode(this.pincode);
  }

  updateDevice(device: NFCDevice) {
    this.userState.updateNFCDevice(device);
    this.editDevice = {} as NFCDevice;
  }

  confirmModal() : void {
    this.userState.removeNFCDevice(this.removeDevice);
  }

  get validateNewPincode() {
    return (
      this.pincode.newPincode.length !== 4
    );
  }

  get newPincodeFeedback() {
    if (this.pincode.newPincode.length !== 4) {
      return this.$t('profile.New pin code length must be 4 digits').toString();
    }
    if (
      this.pincode.newPincode !== ''
    ) {
      return this.$t('profile.New pin code must be unique from old pin code').toString();
    }
    return '';
  }

  get validateConfirmPincode() {
    return this.pincode.newPincode === this.pincode.confirmPincode;
  }

  get confirmPincodeFeedback() {
    if (this.pincode.confirmPincode.length !== this.pincode.newPincode) {
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
