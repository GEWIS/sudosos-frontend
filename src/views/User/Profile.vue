<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('profile.My profile')}}</h1>
    <b-row>
      <b-col sm="12" md="6" class="mb-4 mb-md-0">
        <b-card>
          <b-card-title>
            {{ $t('Change pin code') }}
          </b-card-title>
          <b-card-body>
            <b-form @submit="changePincode">
              <b-form-group
                id="old-pincode-group"
                :label="$t('profile.Old pin code')"
                label-for="old-pincode"
                :invalid-feedback="oldPincodeFeedback"
                :state="validateOldPincode"
              >
                <b-form-input id="old-pincode" v-model="pincode.oldPincode" type="text" />
              </b-form-group>
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
                :label="$t('Confirm new pin code')"
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
              v-for="device in nfcDevices"
              v-bind:key="device.id"
              class="nfc-device-badge mb-2">
              <span v-show="!device.editing"
                    @click="device.editing = true"
                    class="mx-2">{{ device.name }}
              </span >
              <b-form-input type="text" class="edit-devicename mx-2"
                            v-on:keyup="updateDevice(device, $event)"
                            @blur="updateDevice(device)"
                            v-show="device.editing"
                            v-model="device.name"/>
              <span>({{ device.uid }})</span>
              <span @click="removeDevice(device)" class="ml-auto mr-2 icon">
              <font-awesome-icon icon="times-circle"></font-awesome-icon>
            </span>
              <span v-show="!device.editing" @click="device.editing = true" class="mr-2 icon">
              <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
            </span>
              <span v-show="device.editing" @click="device.editing = false" class="mr-2 icon">
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
import { NFCDevice } from '@/entities/NFCDevice';

  @Component({
    components: {},
  })
export default class Profile extends Vue {
    formError: string = '';

    pincode: any = {
      oldPincode: '',
      newPincode: '',
      confirmPincode: '',
    };

    nfcDevices: any[] = [
      {
        id: '1',
        uid: 'aa:aa:aa:aa:aa',
        name: 'OV Chipkaart',
        createdAt: new Date(),
        editing: false,
      },
      {
        id: '2',
        uid: 'bb:ac:ab:ba:cc',
        name: 'Fontys-pas',
        createdAt: new Date(),
        editing: false,
      },
    ];

    changePincode() {
      console.log(this.pincode);
    }

    updateDevice = (device: any, event?: any) => {
      // If there is an event, we are replying to a keypress
      // Otherwise, it is the blur event, and we just need to stop the editing
      if (event) {
        if (event.key === 'Enter') {
          device.editing = false;
          // TODO: Send new data to backend
        }
      } else {
        device.editing = false;
        // TODO: Send new data to backend
      }
    };

    removeDevice(device: NFCDevice) {
      this.$bvModal
        .msgBoxConfirm('Are you sure you want to remove this NFC device?')
        .then((value) => {
          if (value) {
            for (let i = 0; i < this.nfcDevices.length; i += 1) {
              if (device.id === this.nfcDevices[i].id) {
                // TODO: communicate removal with the backend
                this.nfcDevices.splice(i, 1);
              }
            }
          }
        })
        .catch((err) => {
          // An error occurred
        });
    }

    // Validators for the form
    get validateOldPincode() {
      return this.pincode.oldPincode.length <= 4;
    }

    get oldPincodeFeedback() {
      if (this.pincode.oldPincode.length > 4) {
        return 'Pin code must be 4 digits';
      }
      return '';
    }

    get validateNewPincode() {
      return (
        this.pincode.newPincode.length <= 4
        && this.pincode.newPincode !== this.pincode.oldPincode
      );
    }

    get newPincodeFeedback() {
      if (this.pincode.newPincode.length > 4) {
        return 'New pin code length must be 4 digits';
      }
      if (
        this.pincode.newPincode === this.pincode.oldPincode
        && this.pincode.newPincode !== ''
      ) {
        return 'New pin code must be unique from old pin code';
      }
      return '';
    }

    get validateConfirmPincode() {
      return this.pincode.newPincode === this.pincode.confirmPincode;
    }

    get confirmPincodeFeedback() {
      if (this.pincode.confirmPincode.length !== this.pincode.newPincode) {
        return 'Confirmation does not match pin code';
      }
      return '';
    }
}
</script>

<style scoped lang="scss">
  @import './src/styles/Card.scss';

  input {
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
</style>
