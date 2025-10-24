import apiService from "@/services/ApiService"
import { QRCodeResponse } from "@sudosos/sudosos-client";
import { useWebSocketStore } from "@sudosos/sudosos-frontend-common";
import { ref, computed, onMounted } from "vue";

export function useQrAuth() {

    const session = ref<QRCodeResponse | null>(null);
    const webSocketStore = useWebSocketStore();
    let expirationTimeout: NodeJS.Timeout | null = null;

    const isExpired = computed(() => {
        if (!session.value) return false;
        return new Date() >= new Date(session.value.expiresAt);
    });

    const clearExpirationTimeout = () => {
        if (expirationTimeout) {
            clearTimeout(expirationTimeout);
            expirationTimeout = null;
        }
    };

    const setExpirationTimeout = (expiresAt: string) => {
        clearExpirationTimeout();
        const expirationTime = new Date(expiresAt).getTime() - Date.now();
        if (expirationTime > 0) {
            expirationTimeout = setTimeout(() => {
              void generateQrCode();
            }, expirationTime);
        }
    };

    const generateQrCode = async () => {
        const res: QRCodeResponse = (await apiService.authenticate.generateQRCode()).data;
        session.value = res;
        setExpirationTimeout(res.expiresAt);
    }

    const handleConfirmed = () => {
        console.log('QR code confirmed');
    }

    onMounted(() => {
        webSocketStore.getSocket.on('qr-confirmed', handleConfirmed);
    });

    return {
        session,
        generateQrCode,
        isExpired,
    }
}
