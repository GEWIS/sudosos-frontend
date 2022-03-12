import APIHelper from '@/mixins/APIHelper';

export default function getRBAC() {
  return APIHelper.getResource('rbac/roles').then((response) => response);
}
