import {
  VuexModule, Module, Mutation, Action,
} from 'vuex-module-decorators';
import { User } from '@/entities/User';

@Module({ namespaced: true, name: 'CurrentUser' })
class CurrentUser extends VuexModule implements User {
  id: String = '1';

  firstName: String = 'Ruben';

  lastName: String = 'Brinkman';

  saldo: Number = 3838;

  organs: String[] = ['1', '4', '8'];

  @Mutation
  public setId(newId: String): void {
    this.id = newId;
  }

  @Mutation
  public setFirstName(newFirstName: String): void {
    this.firstName = newFirstName;
  }

  @Mutation
  public setLastName(newLastName: String): void {
    this.lastName = newLastName;
  }

  @Mutation
  public setSaldo(newSaldo: Number): void {
    this.saldo = newSaldo;
  }

  @Mutation
  public addOrgan(organToAdd: String): void {
    this.organs.concat(...organToAdd);
  }

  @Mutation
  public removeOrgan(organToRemove: String): void {
    if (this.organs.indexOf(organToRemove) > 0) {
      this.organs.splice(this.organs.indexOf(organToRemove));
    }
  }
}
export default CurrentUser;
