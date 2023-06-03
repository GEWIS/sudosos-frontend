import APIHelper from '@/mixins/APIHelper';

export default function getTransactionsReport(userId: number,
  payload: {fromId?: number, toId?: number, fromDate?: string, tillDate?: string}) {
  return APIHelper.getResource(`users/${userId}/transactions/report`, payload).then((response) => response);
}

export async function getDatasets(timeScale: string, userId: number) {
  let elapsedTime = 0;
  let totalQueries = 0;
  const date = new Date();
  const colors = ['#D30000', '#8AC45E', '#F7B538', '#B084CC'];
  const datasets: any[] = [];
  const categories = await getTransactionsReport(userId, {
    fromId: userId,
  }).then((response) => response.data.categories);
  switch (timeScale) {
    default:

      for (let j:number = 0; j < categories.length; j++) {
        const data: {
          label: string;
          backgroundColor: string;
          data: number[];
        } = {
          label: categories[j].category.name,
          backgroundColor: colors[j],
          data: [],
        };
        const dataset:number[] = [];
        for (let i:number = 0; i < 12; i++) {
          const fromDate = new Date(date.getFullYear(), i, 1).toString();
          const tillDate = new Date(date.getFullYear(), i + 1, 1).toString();

          const startTime = new Date();
          // eslint-disable-next-line no-await-in-loop
          await getTransactionsReport(userId, {
            fromId: userId,
            fromDate,
            tillDate,
            // eslint-disable-next-line no-loop-func
          }).then((response) => {
            const endTime = new Date(); // Get the end time
            elapsedTime += endTime.getTime() - startTime.getTime();
            totalQueries++;
            if (response.data.categories.length === 0) {
              return dataset.push(0);
            }
            return dataset.push(response.data.categories[j].totalInclVat.amount ?? 0);
          });
        }
        data.data = dataset;
        datasets.push(data);
      }

      break;
    case 'month':
      // eslint-disable-next-line no-case-declarations
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      for (let j:number = 0; j < categories.length; j++) {
        const data: {
          label: string;
          backgroundColor: string;
          data: number[];
        } = {
          label: categories[j].category.name,
          backgroundColor: colors[j],
          data: [],
        };
        const dataset:number[] = [];
        for (let i: number = 1; i <= lastDayOfMonth; i++) {
          const fromDate = new Date(date.getFullYear(), date.getMonth(), i).toString();
          const tillDate = new Date(date.getFullYear(), date.getMonth(), i + 1).toString();
          const startTime = new Date();
          // eslint-disable-next-line no-await-in-loop
          await getTransactionsReport(userId, {
            fromId: userId,
            fromDate,
            tillDate,
            // eslint-disable-next-line no-loop-func
          }).then((response) => {
            const endTime = new Date(); // Get the end time
            elapsedTime += endTime.getTime() - startTime.getTime();
            totalQueries++;
            if (response.data.categories[j] === undefined) {
              return dataset.push(0);
            }
            return dataset.push(response.data.categories[j].totalInclVat.amount ?? 0);
          });
        }
        data.data = dataset;
        datasets.push(data);
      }

      break;
    case 'week':
      // eslint-disable-next-line no-case-declarations
      const firstDayOfWeek = new Date(date.getFullYear(), date.getMonth(),
        date.getDate() - date.getDay() + 1);
      for (let j:number = 0; j < categories.length; j++) {
        const data: {
          label: string;
          backgroundColor: string;
          data: number[];
        } = {
          label: categories[j].category.name,
          backgroundColor: colors[j],
          data: [],
        };
        const dataset:number[] = [];
        for (let i: number = 0; i < 7; i++) {
          const fromDate = new Date(firstDayOfWeek.getTime() + i * (1000 * 60 * 60 * 24))
            .toString();
          const tillDate = new Date(firstDayOfWeek.getTime() + (i + 1) * (1000 * 60 * 60 * 24))
            .toString();
          const startTime = new Date();
          // eslint-disable-next-line no-await-in-loop
          await getTransactionsReport(userId, {
            fromId: userId,
            fromDate,
            tillDate,
            // eslint-disable-next-line no-loop-func
          }).then((response) => {
            const endTime = new Date(); // Get the end time
            elapsedTime += endTime.getTime() - startTime.getTime();
            totalQueries++;
            if (response.data.categories[j] === undefined) {
              return dataset.push(0);
            }
            return dataset.push(response.data.categories[j].totalInclVat.amount ?? 0);
          });
        }
        data.data = dataset;
        datasets.push(data);
      }
      break;
  }
  console.log(`Elapsed time for total query: ${elapsedTime}ms`);
  console.log(`Total amount of queries: ${totalQueries}`);
  return datasets;
}
