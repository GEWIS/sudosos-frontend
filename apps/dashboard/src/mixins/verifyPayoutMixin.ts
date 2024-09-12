import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { formatPrice } from "@/utils/formatterUtils";
import ApiService from "@/services/ApiService";
import { useI18n } from "vue-i18n";

export const verifyPayoutMixin = {
  setup() {
    const verifying = ref<boolean>(false);
    const verifySuccess = ref<boolean | null>(null);
    const toast = useToast();
    const { t } = useI18n();

    const verifyPayout = async (payout: any) => {
      if (!payout) return;

      verifying.value = true;
      verifySuccess.value = null;

      try {
        const startDate = new Date(payout.startDate);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(payout.endDate);
        endDate.setUTCHours(23, 59, 59, 999);

        const result = await ApiService.user.getUsersSalesReport(
          payout.requestedBy.id,
          startDate.toISOString(),
          endDate.toISOString()
        );

        if (result.data.totalInclVat.amount === payout.amount.amount) {
          verifySuccess.value = true;
          toast.add({
            severity: 'success',
            summary: 'Verification Success',
            detail: 'Payout is verified.',
            life: 3000,
          });
        } else {
          verifySuccess.value = false;
          toast.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: `Payout amount does not match the amount of purchases. ${formatPrice(
              result.data.totalInclVat
            )} vs. ${formatPrice(payout.amount)}`,
            life: 3000,
          });
        }
      } catch (error) {
        verifySuccess.value = false;
        toast.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: 'Unable to verify the payout.',
          life: 3000,
        });
      } finally {
        verifying.value = false;
      }
    };

    const verifyButtonLabel = computed(() => {
      if (verifying.value) return '';
      return verifySuccess.value === true ? t('common.verified') : verifySuccess.value === false ?
        t('common.failed') : t('common.verify');
    });

    const verifyButtonIcon = computed(() => {
      if (verifying.value) return 'pi pi-spin pi-spinner';
      return verifySuccess.value === true ? 'pi pi-check' : verifySuccess.value === false ?
        'pi pi-times' : 'pi pi-check';
    });

    const verifyButtonSeverity = computed(() => {
      return verifySuccess.value === true ? 'success' : verifySuccess.value === false ?
        'danger' : 'info';
    });

    const verifyButtonClass = computed(() => {
      return verifySuccess.value === false ? 'p-button-danger' : verifySuccess.value === true ?
        'p-button-success' : 'p-button-info';
    });

    return {
      verifyPayout,
      verifying,
      verifySuccess,
      verifyButtonLabel,
      verifyButtonIcon,
      verifyButtonSeverity,
      verifyButtonClass,
    };
  },
};
