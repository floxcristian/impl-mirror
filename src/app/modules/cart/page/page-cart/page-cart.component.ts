// Angular
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
// Rxjs
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
// Env
import { environment } from '@env/environment';
// Libs
import { ToastrService } from 'ngx-toastr';
// Services
import { RootService } from '../../../../shared/services/root.service';
import { Banner } from '../../../../shared/interfaces/banner';

import { isVacio } from '../../../../shared/utils/utilidades';

//import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { ISession } from '@core/models-v2/auth/session.interface';
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { CartService } from '@core/services-v2/cart.service';
import { CustomerPreferenceStorageService } from '@core/storage/customer-preference-storage.service';
import { IPreference } from '@core/models-v2/customer/customer-preference.interface';
import { ShoppingCartStorageService } from '@core/storage/shopping-cart-storage.service';
import {
  IShoppingCart,
  IShoppingCartProduct,
} from '@core/models-v2/cart/shopping-cart.interface';
import { ArticleService } from '@core/services-v2/article.service';
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { GuestStorageService } from '@core/storage/guest-storage.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';
import { GtmService } from '@core/utils-v2/gtm/gtm.service';
import { IProductCart } from './product-cart.interface';
declare let dataLayer: any;

@Component({
  selector: 'app-cart',
  templateUrl: './page-cart.component.html',
  styleUrls: ['./page-cart.component.scss'],
})
export class PageCartComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();

  sendedToGtm!: boolean;

  removedItems: IShoppingCart[] = [];
  items: IProductCart[] = [];
  updating: boolean = false;
  saveTimer: any;
  innerWidth: number;
  banners: Banner[] = [];
  paso1!: boolean;
  showresumen = false;
  IVA = environment.IVA;
  isVacio = isVacio;
  relleno: any[] = [1, 2, 3, 4, 5, 6];

  recommendedProducts: IArticle[] = [];
  user!: ISession;
  SumaTotal = 0;
  carouselOptions = {
    items: 6,
    nav: false,
    dots: true,
    loop: true,
    autoplay: true,
    margin: 10,
    autoplayTimeout: 4000,
    responsive: {
      1366: { items: 6 },
      1100: { items: 6 },
      920: { items: 6 },
      680: { items: 3 },
      500: { items: 3 },
      0: { items: 2 },
    },
  };
  /*
  carrouselOptionsMobile = {
    items: 6,
    nav: false,
    dots: true,
    slideBy: 'page',
    merge: true,
    margin: 10,
    responsive: {
      1366: { items: 6 },
      1100: { items: 6 },
      920: { items: 6 },
      680: { items: 3 },
      500: { items: 3 },
      0: { items: 5, nav: false, mergeFit: true },
    },
  };*/
  preferenciaCliente!: IPreference;
  config: IConfig;

  constructor(
    private router: Router,
    public root: RootService,
    private toast: ToastrService,
    //private readonly gtmService: GoogleTagManagerService,
    private readonly _gtmService: GtmService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly articleService: ArticleService,
    private readonly guestStorage: GuestStorageService,
    public readonly shoppingCartService: CartService,
    private readonly customerPreferenceStorage: CustomerPreferenceStorageService,
    private readonly shoppingCartStorage: ShoppingCartStorageService,
    private readonly geolocationService: GeolocationServiceV2,
    public readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.preferenciaCliente =
      this.customerPreferenceStorage.get() as IPreference;
  }

  ngOnInit(): void {
    const _this = this;
    this.updateStep();
    this.user = this.sessionService.getSession();
    this.shoppingCartService.items$
      .pipe(
        takeUntil(this.destroy$),
        map((ProductCarts) =>
          (ProductCarts || []).map((item): IProductCart => {
            return {
              ProductCart: item,
              quantity: item.quantity,
              quantityControl: new FormControl(
                item.quantity,
                Validators.required
              ),
            };
          })
        )
      )
      .subscribe((items) => {
        this.items = items;
        if (items.length && !this.sendedToGtm) {
          this.gtmViewCart();
        }
        this.getRecommendedProductsList();
      });

    setTimeout(() => {
      this.shoppingCartService.dropCartActive$.next(false);
    });
    if (isPlatformBrowser(this.platformId)) {
      _this.shoppingCartService.calc(true);
    }
  }

  updateStep() {
    let cartSession: IShoppingCart =
      this.shoppingCartStorage.get() as IShoppingCart;
    if (cartSession._id)
      this.shoppingCartService.saveStep(cartSession._id, 1).subscribe();
  }

  gtmViewCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    // this.gtmService.pushTag({
    //   event: 'cart',
    //   pagePath: window.location.href,
    // });}
    /*dataLayer.push({
        event: 'cart',
        pagePath: window.location.href,
      });*/
    this._gtmService.viewCart(dataLayer, this.items);
    this.sendedToGtm = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    setTimeout(() => {
      this.shoppingCartService.dropCartActive$.next(true);
    });
  }

  needUpdate(): boolean {
    let needUpdate = false;
    return needUpdate;
  }

  async updateCart(quantity: number, item: IProductCart) {
    if (quantity < 1) {
      quantity = 1;
      this.toast.error('No se permiten números negativos en la cantidad');
    }

    item.ProductCart.quantity = quantity;

    const productos: IShoppingCartProduct[] = [];
    this.items.map((r: IProductCart) => {
      productos.push(r.ProductCart);
    });

    this.shoppingCartService.saveCart(productos).subscribe((r) => {
      for (const el of r.products) {
        if (el.sku == item.ProductCart.sku) {
          item.ProductCart.deliveryConflict = el.deliveryConflict;
          item.ProductCart.delivery = el.delivery;
          item.ProductCart.price = el.price;
        }
      }
      this.shoppingCartService.updateCart(productos);
    });
  }

  remove(product: IShoppingCartProduct): void {
    this.shoppingCartService.remove(product);
    this.gtmRemoveFromCart(product);
  }

  // saveCart() {
  //   clearTimeout(this.saveTimer);
  //   this.saveTimer = setTimeout(() => {
  //     const productos = this.items.map((item: Item) => {
  //       return {
  //         sku: item.ProductCart.sku,
  //         cantidad: item.quantity,
  //       };
  //     });
  //     this.shoppingCartService.saveCart(productos).subscribe((r) => {});
  //   }, 1000);
  // }

  limpiarInvitado() {
    // this.localS.remove('invitado');
    this.guestStorage.remove();
  }

  async setSaveCart() {
    let cartSession: IShoppingCart =
      this.shoppingCartStorage.get() as IShoppingCart;

    let respuesta: any = await this.shoppingCartService
      .setSaveCart(cartSession._id, 'saved')
      .toPromise();
    this.shoppingCartService.load();
    if (!respuesta.error) {
      this.toast.success('Carro guardado exitosamente');
      this.router.navigate(['/', 'inicio']);
    }
  }

  getRecommendedProductsList() {
    if (this.items.length > 0) {
      const tiendaSeleccionada = this.geolocationService.getSelectedStore();
      this.preferenciaCliente =
        this.customerPreferenceStorage.get() as IPreference;

      let listaSku: string[] = [];
      let rut = '';
      let localidad = '';
      this.items.forEach((item) => {
        listaSku.push(item.ProductCart.sku);
      });
      if (this.user) {
        rut = this.user.documentId;
      }
      if (this.preferenciaCliente && this.preferenciaCliente.deliveryAddress)
        localidad = this.preferenciaCliente.deliveryAddress.city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      this.articleService
        .getArticleSuggestions({
          skus: listaSku,
          documentId: rut,
          branchCode: tiendaSeleccionada.code,
          quantityToSuggest: 6,
          location: localidad,
        })
        .subscribe(
          (r: IArticleResponse[]) => {
            this.recommendedProducts = r;
          },
          (error) => {
            this.toast.error(
              'Error de conexión, para obtener los productos recomendados '
            );
          }
        );
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  gtmRemoveFromCart(product: IShoppingCartProduct) {
    this._gtmService.removeFromCart(dataLayer, product);
  }
}
