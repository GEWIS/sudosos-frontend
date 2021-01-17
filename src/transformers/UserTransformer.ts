import { BaseUser, User } from '@/entities/User';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeUser(data: any) : BaseUser | User {
    if (!Object.keys(data).includes('active')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        name: data.name,
      } as BaseUser;
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      gewisID: data.gewisID,
      email: data.email,
      active: data.active,
      type: data.type,
    } as User;
  },
};
