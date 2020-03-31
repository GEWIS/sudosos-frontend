<template>
  <b-container fluid="lg">
    <h1>Profile page</h1>
    <b-row class="profile-items-container">
      <b-col sm="12" md="4">
        <b>Change pin code</b>
        <b-form @submit="changePincode">
          <b-form-group
            id="old-pincode-group"
            label="Old pin code"
            label-for="old-pincode"
            :invalid-feedback="oldPincodeFeedback"
            :state="validateOldPincode"
          >
            <b-form-input
              id="old-pincode"
              v-model="pincode.oldPincode"
              type="text" />
          </b-form-group>
          <b-form-group
            id="new-pincode-group"
            label="New pin code"
            label-for="new-pincode"
            :invalid-feedback="newPincodeFeedback"
            :state="validateNewPincode"
          >
            <b-form-input
              id="new-pincode"
              v-model="pincode.newPincode"
              type="text" />
          </b-form-group>
          <b-form-group
            id="confirm-pincode-group"
            label="Confirm new pin code"
            label-for="confirm-pincode"
            :invalid-feedback="confirmPincodeFeedback"
            :state="validateConfirmPincode"
          >
            <b-form-input
              id="confirm-pincode"
              v-model="pincode.confirmPincode"
              type="text" />
          </b-form-group>
          <b-button type="submit" variant="primary">Change pin code</b-button>
        </b-form>
      </b-col>
      <b-col sm="12" md="4">
        <b>Manage nfc devices</b>
        <b-badge v-for="device in nfcDevices" v-bind:key="device.id" class="nfc-device-badge">
          {{ device.name }} ({{ device.uid }})
          <span @click="removeDevice(device)">✖</span>
          <span @click="editDevice(device)">🖉</span>
        </b-badge>
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
  }

  nfcDevices: NFCDevice[] = [
    {
      id: '1',
      uid: 'aa:aa:aa:aa:aa',
      name: 'Rolstoel Julie de Nooij 👩‍🦼',
      createdAt: new Date(),
    },
    {
      id: '2',
      uid: 'bb:ac:ab:ba:cc',
      name: 'Fontys-pas',
      createdAt: new Date(),
    },
  ]

  changePincode() {
    console.log(this.pincode);
  }

  removeDevice(device: NFCDevice) {
    for (let i = 0; i < this.nfcDevices.length; i += 1) {
      if (device.id === this.nfcDevices[i].id) {
        // TODO: communicate removal with the backend
        this.nfcDevices.splice(i, 1);
      }
    }
  }

  editDevice(device: NFCDevice) {
    console.log(this);
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
    return this.pincode.newPincode.length <= 4
      && this.pincode.newPincode !== this.pincode.oldPincode;
  }

  get newPincodeFeedback() {
    if (this.pincode.newPincode.length > 4) {
      return 'New pin code length must be 4 digits';
    }
    if (this.pincode.newPincode === this.pincode.oldPincode && this.pincode.newPincode !== '') {
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
  .profile-items-container {
    > * {
      background-color: #f8f8f8;
      margin: 16px;
      padding: 16px
    }
    input {
      max-width: 10ch;
    }

    button {
      float: left;
    }

    .nfc-device-badge {
      span {
        cursor: pointer;
      }
    }
  }
</style>
