import BaseTransformer from '@/transformers/BaseTransformer';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import UserTransformer from '@/transformers/UserTransformer';

export default {
  makeBorrelkaartGroup(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      activeStartDate: data.activeStartDate,
      activeEndDate: data.activeEndDate,
      borrelkaarten: data.borrelkaarten.map((brlkrt: any) => UserTransformer.makeUser(brlkrt)),
    } as BorrelkaartGroup;
  },
};
