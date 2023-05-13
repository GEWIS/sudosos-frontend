import APIHelper from '@/mixins/APIHelper';

export default function getTransactionsReport(userId: number,
  payload: {fromId?: number, toId?: number, fromDate?: string, tillDate?: string}) {
  return APIHelper.getResource(`users/${userId}/transactions/report`, payload).then((response) => {
    console.error(response);
  });
}
