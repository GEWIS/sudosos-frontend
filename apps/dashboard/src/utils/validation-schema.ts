import * as yup from 'yup';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { BaseUserResponse, BaseVatGroupResponse, ProductCategoryResponse } from '@sudosos/sudosos-client';
import type { DineroObject } from 'dinero.js';
import i18n from './i18nUtils';
import type { ContainerInStore } from '@/stores/container.store';

const t = i18n.global.t;

export const createUserSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email(),
  nickname: yup.string(),
  userType: yup.string().required().default('LOCAL_USER'),
  ofAge: yup.boolean().required().default(false),
  canGoIntoDebt: yup.boolean().required().default(false),
});

export const simpleUserDetailsSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email(),
});

export const editPasswordSchema = yup.object({
  password: yup.string().required(),
  passwordConfirm: yup
    .string()
    .required()
    .oneOf([yup.ref('password')], t('common.validation.password.match')),
});

export const editNFCSchema = yup.object({
  nfcCode: yup.string().required(),
});

export const updateInvoiceSettingsObject = yup.object({
  reference: yup.string().required(),
  date: yup.string().required(),
  description: yup.string().required(),
});

export const updateInvoiceAddressingObject = yup.object({
  addressee: yup.string().required(),
  attention: yup.string(),
  street: yup.string().required(),
  postalCode: yup.string().required(),
  city: yup.string().required(),
  country: yup.string().required(),
});

export const updateInvoiceAmountObject = yup.object({
  amount: yup.number().required().default(0),
});

export const updateUserDetailsObject = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string(),
  email: yup.string().email(),
  nickname: yup.string().nullable(),
  userType: yup.string().required(),
  isActive: yup.boolean().required().default(true),
  ofAge: yup.boolean().required().default(false),
  canGoIntoDebt: yup.boolean().required().default(false),
});

export const editPinSchema = yup.object({
  pin: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, t('common.validation.pin.onlyDigits'))
    .min(4, t('common.validation.string.exact', { len: '4' }))
    .max(4, t('common.validation.string.exact', { len: '4' })),
  pinConfirm: yup
    .string()
    .required()
    .oneOf([yup.ref('pin')], t('common.validation.pin.match')),
});

export const userTypes: Ref<Array<{ name: string; value: string }>> = ref([
  { name: 'MEMBER', value: 'MEMBER' },
  { name: 'ORGAN', value: 'ORGAN' },
  { name: 'VOUCHER', value: 'VOUCHER' },
  { name: 'LOCAL_USER', value: 'LOCAL_USER' },
  { name: 'LOCAL_ADMIN', value: 'LOCAL_ADMIN' },
  { name: 'INVOICE', value: 'INVOICE' },
  { name: 'AUTOMATIC_INVOICE', value: 'AUTOMATIC_INVOICE' },
]);

export const createPayoutSchema = yup.object({
  amount: yup.number().required().default(0),
  bankAccountNumber: yup.string().required(),
  bankAccountName: yup.string().required(),
  user: yup.mixed<BaseUserResponse>().required(),
});

export const createProductSchema = yup.object({
  name: yup.string().required(),
  priceInclVat: yup.number().required().default(0),
  vat: yup.mixed<BaseVatGroupResponse>().required(),
  category: yup.mixed<ProductCategoryResponse>().required(),
  alcoholPercentage: yup.number().required().default(0),
  featured: yup.boolean().default(false),
  preferred: yup.boolean().default(false),
  priceList: yup.boolean().default(false),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const updatePointOfSaleObject = yup.object({
  name: yup.string().required(),
  useAuthentication: yup.boolean().required(),
  containers: yup.mixed<Array<number>>().required(),
  id: yup.number().required(),
  cashierRoleIds: yup.mixed<Array<number>>(),
});

export const createPointOfSaleObject = yup.object({
  name: yup.string().required(),
  useAuthentication: yup.boolean().default(false).required(),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const addContainerObject = yup.object({
  container: yup.mixed<ContainerInStore>().required(),
});

export const containerActionSchema = yup.object({
  name: yup.string().required(),
  public: yup.boolean().required().default(false),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const createSellerPayoutObject = yup.object({
  fromDate: yup.string().required(),
  toDate: yup.string().required(),
  reference: yup.string().required(),
  user: yup.mixed<BaseUserResponse>().required(),
});

export const waiveUserFineSchema = yup.object({
  amount: yup.number().required().default(0),
});

export const createInvoiceObject = yup.object({
  forId: yup.number().required(),
  byId: yup.number(),
  addressee: yup.string().required(),
  description: yup.string().required(),
  reference: yup.string().required(),
  transactionIDs: yup.array().of(yup.number().required()).required(),
  transactionTotal: yup.mixed<DineroObject>().default({ precision: 2, currency: 'EUR', amount: 0 }).required(),
  street: yup.string().required(),
  postalCode: yup.string().required(),
  city: yup.string().required(),
  country: yup.string().required(),
  date: yup.string().required(),
  attention: yup.string(),
});

export const createWriteOffSchema = yup.object({
  user: yup.mixed<BaseUserResponse>().required(),
  balance: yup.number().required().default(0).max(0, t('modules.financial.forms.write-off.negative')),
});
