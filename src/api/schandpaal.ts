import { getAllBalances } from '@/api/balance';
import { getUser } from '@/api/users';

export default async function getSchandpaal() {
  const schandpaal = await getAllBalances({
    maxBalance: -5000,
    take: 200,
    orderBy: 'amount',
    orderDirection: 'ASC',
  });
  // @ts-ignore
  return Promise.all(schandpaal.records.map(async (record) => ({
    id: record.id,
    amount: record.amount,
    name: await getUser(record.id)
      .then((response) => response.name),
  })));
}
