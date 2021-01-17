import { BaseEntity } from '@/entities/BaseEntity';

export default {
  makeBaseEntity(data: any) {
    return {
      id: data.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as BaseEntity;
  },
};
