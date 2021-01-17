import { Banner } from '@/entities/Banner';

export default {
  makeBanner(data: any) : Banner {
    return {
      id: data.id,
      name: data.name,
      duration: data.duration,
      active: data.active,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    } as Banner;
  },
};
