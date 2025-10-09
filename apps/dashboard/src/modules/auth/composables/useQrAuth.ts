import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useWebSocketStore, useAuthStore } from '@sudosos/sudosos-frontend-common';

import { AuthenticationResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';

export interface QrAuthSession {
  sessionId: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export function useQrAuth() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const webSocketStore = useWebSocketStore();
  const session = ref<QrAuthSession | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isExpired = ref(false);

  const generateQrCode = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Get redirect URL from route params, default to /transaction
      const redirectUrl = (route.query.redirect as string) || '/transaction';

      const response = await fetch('/api/v1/authentication/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUrl: redirectUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      session.value = data;

      // Subscribe to QR session events
      webSocketStore.socket?.emit('subscribe-qr-session', data.sessionId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  };

  const handleQrConfirmed = (data: { sessionId: string; token: AuthenticationResponse }) => {
    if (session.value && data.sessionId === session.value.sessionId) {
      authStore.handleResponse(data.token, apiService);
      // Get redirect URL from route params, default to /transaction
      const redirectUrl = (route.query.redirect as string) || '/transaction';
      // Authentication successful, redirect to specified path
      void router.push(redirectUrl);
    }
  };

  const checkExpiration = () => {
    if (!session.value) return;

    const now = new Date();
    const expiresAt = new Date(session.value.expiresAt);

    if (now >= expiresAt) {
      isExpired.value = true;
    }
  };

  const refreshQrCode = () => {
    isExpired.value = false;
    void generateQrCode();
  };

  onMounted(() => {
    void generateQrCode();

    // Listen for QR authentication events
    webSocketStore.socket?.on('qr-confirmed', handleQrConfirmed);

    // Check expiration periodically
    const expirationCheckInterval = setInterval(checkExpiration, 1000);

    onUnmounted(() => {
      // Clean up event listeners
      webSocketStore.socket?.off('qr-confirmed', handleQrConfirmed);
      clearInterval(expirationCheckInterval);
    });
  });

  return {
    session,
    isLoading,
    error,
    isExpired,
    generateQrCode,
    refreshQrCode,
  };
}
