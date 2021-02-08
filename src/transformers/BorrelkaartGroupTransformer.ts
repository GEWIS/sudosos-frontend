import BaseTransformer from '@/transformers/BaseTransformer';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import UserTransformer from '@/transformers/UserTransformer';

export default {
  makeBorrelkaartGroup(data: any) {
    const borrelkaarten = data.borrelkaarten.map((brlkrt: any) => UserTransformer.makeUser(brlkrt));
    let validDates;

    if ('validDates' in data
      && 'activeStartDate' in data.validDates
      && 'activeEndDate' in data.validDates) {
      validDates = {
        activeStartDate: new Date(data.validDates.activeStartDate),
        activeEndDate: new Date(data.validDates.activeEndDate),
      };
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      validDates,
      borrelkaarten,
    } as BorrelkaartGroup;
  },
};
