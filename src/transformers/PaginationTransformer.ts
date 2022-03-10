import { Pagination } from '@/entities/Pagination';

export default {
  makePagination(data: any) {
    console.log(data);

    return {
      take: Number(data.take),
      skip: Number(data.skip),
      count: Number(data.count),
    } as Pagination;
  },
};
