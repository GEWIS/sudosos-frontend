import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { AthenaPinkBlue, BoomMango, DefiLilac, GrolschGreen, IvvNavy, SudososRed } from '@sudosos/themes';
import { usePreset } from '@primeuix/themes';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useCartStore } from '@/stores/cart.store';
import { useActivityStore } from '@/stores/activity.store';

/**
 * Class to keep all logic regarding switching of the Point of Sale in one place.
 *
 * Watchers that watch PointOfSaleSore.getPos should predominantly consist
 * of function from this class.
 */

export class PointOfSaleSwitchService {
  public static switchTo(target: PointOfSaleResponse) {
    const posStore = usePointOfSaleStore();
    const activityStore = useActivityStore();
    const currentPos = posStore.getPos;

    if (!currentPos || (currentPos && target.id !== currentPos.id)) {
      void posStore.fetchPointOfSale(target.id);

      const cartStore = useCartStore();
      cartStore.setLockedIn(null);

      if (target.useAuthentication) {
        activityStore.resetTimer();
      } else {
        activityStore.disableTimer();
      }

      this.switchColor(target);
    }
  }

  private static switchColor(target: PointOfSaleResponse) {
    // TODO In the future, this should be stored and retrieved from the backend.
    if (target.useAuthentication) {
      usePreset(SudososRed);
      return;
    }

    switch (target.owner?.id) {
      case 18214:
        usePreset(GrolschGreen);
        break;
      //B.O.O.M.
      case 18427:
        usePreset(BoomMango);
        break;
      //Défi
      case 19130:
        usePreset(DefiLilac);
        break;
      //ATHENA
      case 18471:
        usePreset(AthenaPinkBlue);
        break;
      case 18337:
        usePreset(IvvNavy);
        break;

      default:
        usePreset(SudososRed);
        break;
    }
  }
}
