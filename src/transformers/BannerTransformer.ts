import { Banner } from '@/entities/Banner';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeBanner(data: any) : Banner {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      duration: data.duration,
      active: data.active,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    } as Banner;
  },
};
