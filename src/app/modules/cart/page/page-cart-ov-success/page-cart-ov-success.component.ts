// Angular
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// Rxjs
import { Subscription, firstValueFrom } from 'rxjs';
// Services
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { CartService } from '@core/services-v2/cart.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { IShoppingCart } from '@core/models-v2/cart/shopping-cart.interface';
import { PaymentMethodType } from '@core/enums/payment-method.enum';
import { CartTagService } from '@core/services-v2/cart-tag.service';
import { PaymentMethodService } from '@core/services-v2/payment-method.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';
declare let fbq: any;

@Component({
  selector: 'app-page-cart-ov-success',
  templateUrl: './page-cart-ov-success.component.html',
  styleUrls: ['./page-cart-ov-success.component.scss'],
})
export class PageCartOvSuccessComponent implements OnInit, OnDestroy {
  numero = 0;
  numeroCarro = '';
  proveedorPago = '';
  loadingCart = true;
  cartData?: IShoppingCart;
  documento: any = null;
  SubscriptionQueryParams: Subscription;
  SubscriptionParams: Subscription;
  showFolioMsj: boolean = false;
  carro: any = [];
  total: number = 0;
  usuario!: ISession;
  screenWidth: any;
  fbclid!: string;
  gclid: string = '';

  verifyingPayment = false;
  maxVerifyTries = 30;
  config: IConfig;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  constructor(
    private route: ActivatedRoute,
    private localS: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly gtmService: GoogleTagManagerService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly cartService: CartService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly cartTagService: CartTagService,
    public readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.cartService.load();
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    // cuando hay OV en la url. Generalmente al generar ov desde OC
    this.SubscriptionParams = this.route.params.subscribe((params) => {
      if (params['salesId']) {
        this.numero = params['salesId'];
        this.showFolioMsj = false;
      }
    });

    //Manejar respuesta desde metodos de pago.
    this.SubscriptionQueryParams = this.route.queryParams.subscribe(
      (query) => {
        this.manejaRespuesta(query);
      }
    );
  }

  ngOnInit(): void {
    this.gclid = this.localS.get(StorageKey.gclid);
    this.cartService.load();
  }

  async manejaRespuesta(query: any) {
    let status = query.status
      ? query.status
      : query.payment_status
      ? query.payment_status
      : null;

    this.proveedorPago = query.paymentMethod
      ? query.paymentMethod
      : PaymentMethodType.MERCADOPAGO;

    const action = query.action;
    if (action === 'wait' || action === 'verify') {
      const url = query.verifyUrl;
      await this.verifyPayment(url);
      return;
    }

    if (query.shoppingCartId && status && status == 'approved') {
      this.documento = query.shoppingCartId;
      await this.loadCartData(this.documento);
      this.showFolioMsj = true;
    }
  }

  async verifyPayment(url: string) {
    this.verifyingPayment = true;
    let done = false;
    let count = 0;
    let redirectUrl = '';
    while (!done || count < this.maxVerifyTries) {
      try {
        const result = await firstValueFrom(
          this.paymentMethodService.verifyPayment(url)
        );
        if (result.ok) {
          done = true;
          redirectUrl = result.redirectUrl;
          break;
        }
      } catch (e) {
        console.error(e);
      }
      count++;
      await this.wait(3000);
    }
    this.verifyingPayment = false;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ngOnDestroy(): void {
    this.SubscriptionQueryParams
      ? this.SubscriptionQueryParams.unsubscribe()
      : null;
    this.SubscriptionParams ? this.SubscriptionParams.unsubscribe() : null;
    this.showFolioMsj = false;
    this.numeroCarro = '';
    this.numero = 0;
  }

  async loadCartData(cartId: string) {
    this.loadingCart = true;
    let response = await firstValueFrom(this.cartService.getOneById(cartId));
    this.total = response.total;
    this.cartData = response.shoppingCart;
    this.mostrar_detalle();
    this.numero = this.cartData.cartNumber ? this.cartData.cartNumber : 0;
    this.numeroCarro = this.cartData.cartNumber!.toString();

    if (!this.cartData.tags || !this.cartData.tags.gtag) {
      this.cartTagService.getGTagData(cartId).subscribe({
        next: async (response) => {
          let index = 0;

          await Promise.all(
            response.data.map(async (item) => {
              let tempcarro = response.shoppingCarts[index];
              index = index + 1;

              if (!tempcarro.tags || !tempcarro.tags.gtag) {
                this.gtmService.pushTag({
                  event: 'transaction',
                  ecommerce: item,
                });

                const id = tempcarro._id!.toString();
                this.cartTagService
                  .markGtag({
                    shoppingCartId: id,
                  })
                  .subscribe({
                    next: () => {
                      // console.log('ok gtag');
                    },
                    error: (e) => console.error(e),
                  });
              }
            })
          );
        },
        error: (e) => {
          console.error(e);
        },
      });
    }

    this.addFacebookPixel();
    this.loadingCart = false;
  }

  mostrar_detalle(): void {
    this.usuario = this.sessionService.getSession(); //this.root.getDataSesionUsuario();

    this.usuario.firstName + ' ' + this.usuario.lastName;
  }

  /**
   * Agrega pixel de facebook con el valor de la compra.
   */
  addFacebookPixel(): void {
    this.fbclid = this.localS.get('fbclid');
    if (this.fbclid) {
      fbq('track', 'Purchase', {
        value: this.total,
        currency: 'CLP',
      });
      this.localS.remove('fbclid');
    }
  }
}
