<template>
  <div
    v-if="!hasPosToken"
    class="absolute top-0 left-0 w-full h-full flex text-white justify-center items-center z-10 bg-red-700"
  >
    <main>
      <div class="block mx-auto mb-5 max-h-[25rem] w-64 h-64 flex items-center justify-center">
        <div v-if="session" class="w-full h-full flex items-center justify-center">
          <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="w-full h-full object-contain" />
          <div v-else class="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4">
            <div class="text-4xl mb-2">📱</div>
            <p class="text-sm text-gray-600 mb-2">Something went wrong</p>
          </div>
        </div>
        <img v-else alt="logo" class="w-full h-full object-contain" src="../assets/bier_grayscale.png" />
      </div>
      <div class="font-bold text-3xl text-center mb-4">No POS has been configured!</div>
      <div class="flex justify-center">
        <Button class="bg-white text-red-600 border-0 px-6 py-3 text-xl font-semibold" @click="handleConfigure">
          {{ session && !isExpired ? 'Refresh' : 'Configure' }}
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { toDataURL } from 'qrcode';
import { usePosToken } from '@/composables/usePosToken';
import { useQrAuth } from '@/composables/useQrAuth';
import Button from 'primevue/button';

const { hasPosToken } = usePosToken();
const { session, generateQrCode, isExpired } = useQrAuth();
const qrCodeDataUrl = ref<string>('');

const handleConfigure = () => {
  generateQrCode();
};

const generateQrCodeImage = async () => {
  if (!session.value) return;
  try {
    const qrCodeUrl = session.value.qrCodeUrl;
    qrCodeDataUrl.value = await toDataURL(qrCodeUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    qrCodeDataUrl.value = '';
  }
};

onMounted(async () => {
  await nextTick();
  if (session.value) {
    void generateQrCodeImage();
  }
});

watch(
  session,
  async () => {
    await nextTick();
    if (session.value) {
      void generateQrCodeImage();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss"></style>
