import { createI18n } from "vue-i18n";
import admin from "../locales/en/modules/admin.json";
import common from "../locales/en/common/common.json";
import mutations from "../locales/en/components/mutations.json";
import auth from "../locales/en/modules/auth.json";
import user from "../locales/en/modules/user.json";
import seller from "../locales/en/modules/seller.json";
import financial from "../locales/en/modules/financial.json";
import { setLocale } from "yup";


const i18n = createI18n({
    locale: localStorage.getItem('locale') || 'en',
    fallbackLocale: 'en',
    legacy: false,
    globalInjection: true,
    messages: {
        en: {
            ...common,
            ...mutations,
            modules: {
                ...auth.modules,
                ...user.modules,
                ...seller.modules,
                ...financial.modules,
                ...admin.modules,
            }
        },
    },
});

setLocale({
    mixed: {
        required: ({ path }) => i18n.global.t('validation.required',
          { path: i18n.global.t(`validation.fieldNames.${path}`) }),
    },
    string: {
        min: ({ path, min }) => i18n.global.t('validation.string.min',
          { path: i18n.global.t(`validation.fieldNames.${path}`), min }),
        max: ({ path, max }) => i18n.global.t('validation.string.max',
          { path: i18n.global.t(`validation.fieldNames.${path}`), max }),
    },
    number: {
        min: ({ path, min }) => i18n.global.t('validation.number.min',
          { path: i18n.global.t(`validation.fieldNames.${path}`), min }),
    },
});

export default i18n;


