import { BaseUser, User } from '@/entities/User';

export default {
  makeUser(data: any) : BaseUser | User {
    if (!Object.keys(data).includes('active')) {
      return {
        id: data.id,
        name: data.name,
      } as BaseUser;
    }

    return {
      id: data.id,
      name: data.name,
      gewisID: data.gewisID,
      email: data.email,
      active: data.active,
      type: data.type,
    } as User;
  },
};
