import { BaseEntity } from '@/entities/BaseEntity';

export default {
  makeBaseEntity(data: any) {
    const base: BaseEntity = {} as BaseEntity;

    base.id = Number(data.id);

    if ('createdAt' in data) {
      base.createdAt = new Date(data.createdAt);
    }

    if ('updatedAt' in data) {
      base.updatedAt = new Date(data.updatedAt);
    }

    return base;
  },
};
