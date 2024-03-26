import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  UrlTree,
  Params,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '@core/services-v2/cart.service';
import { IThanksForYourPurchase } from '@core/models-v2/cart/thanks-for-your-purchase.interface';

@Injectable({
  providedIn: 'root',
})
export class GraciasPorTuCompraGuard {
  constructor(
    private router: Router,
    // Services V2
    private readonly cartService: CartService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let haveAccess = false;
    const queryParams = route.queryParams;

    return true;

    if (this.isPaymentWait(queryParams)) {
      return true;
    }

    if (this.isPaymentApproved(queryParams)) {
      const shoppingCartId = queryParams['shoppingCartId'];
      return this.cartService.thanksForYourPurchase({ shoppingCartId }).pipe(
        map((r) => {
          if (this.canSeeThanksForYourPurchase(r)) {
            return true;
          } else {
            this.router.parseUrl('/inicio');
            return false;
          }
        })
      );
    } else {
      if (!haveAccess) {
        this.router.parseUrl('/inicio');
        return false;
      }
      return true;
    }
  }

  canSeeThanksForYourPurchase(r: IThanksForYourPurchase): boolean {
    if (r.isFirstVisit) {
      return true;
    }

    const thanksForYourPurchase = r.shoppingCart.thanksForYourPurchaseDate;
    if (!thanksForYourPurchase) {
      return false;
    }

    const now = new Date();

    const threeholdMinutes = 10;
    const fromThreehold = new Date(thanksForYourPurchase);
    fromThreehold.setMinutes(fromThreehold.getMinutes() - threeholdMinutes);

    const toThreehold = new Date(thanksForYourPurchase);
    toThreehold.setMinutes(toThreehold.getMinutes() + threeholdMinutes);

    return (
      fromThreehold.getTime() <= now.getTime() &&
      now.getTime() <= toThreehold.getTime()
    );
  }

  isPaymentApproved(query: Params): boolean {
    let status = query['status']
      ? query['status']
      : query['payment_status']
      ? query['payment_status']
      : null;

    return query['shoppingCartId'] && status && status == 'approved';
  }

  isPaymentWait(query: Params): boolean {
    let action = query['action'] ? query['action'] : null;

    return (
      query['shoppingCartId'] &&
      action &&
      (action == 'wait' || action == 'verify')
    );
  }
}
