// Angular
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
// Libs
import * as moment from 'moment';
// Services
import { CurrencyService } from './shared/services/currency.service';
import { SeoService } from './shared/services/seo/seo.service';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { CartService } from '@core/services-v2/cart.service';
// Models
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';
// Components
import { AlertCartMinComponent } from './shared/components/alert-cart-min/alert-cart-min.component';
@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-alert-cart-min [product]="productCard" />
  `,
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild(AlertCartMinComponent, {
    read: AlertCartMinComponent,
    static: false,
  })
  alert!: AlertCartMinComponent;
  productCard!: IShoppingCartProduct;
  s: any;
  node: any;
  isOmni!: boolean;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private zone: NgZone,
    private scroller: ViewportScroller,
    private currency: CurrencyService,
    private seoService: SeoService,
    // Services V2
    private readonly sessionStorage: SessionStorageService,
    private readonly sessionService: SessionService,
    private readonly shoppingCartService: CartService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly renderer: Renderer2
  ) {}

  private setLastSession(): void {
    if (!this.sessionService.isB2B()) return;
    const user = this.sessionService.getSession();
    user.ultimoCierre = moment();
    this.sessionStorage.set(user);
  }

  private deleteLastSession(): void {
    if (!this.sessionService.isB2B()) return;
    const user = this.sessionService.getSession();
    delete user.ultimoCierre;
    this.sessionStorage.set(user);
  }

  ngOnInit(): void {
    this.currency.options = {
      code: 'CLP',
      // display: 'symbol',
      digitsInfo: '1.0-0',
      // locale: 'en-US'
      // locale: 'CLP'
    };
    this.seoService.generarMetaTag({});

    this.deleteLastSession();
    if (isPlatformBrowser(this.platformId)) {
      window.onbeforeunload = () => {
        this.setLastSession();
      };
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/carro-compra')) {
          this.updateClasses('carrito');
        } else if (event.url.includes('/catalogos')) {
          this.updateClasses();
        } else if (event.url.includes('/categoria')) {
          this.updateClasses('categoria');
        } else if (this.sessionService.isB2B()) {
          this.updateClasses();
        } else if (event.url.includes('/ficha')) {
          this.updateClasses('pdp');
        } else if (event.url.includes('/especial/')) {
          this.updateClasses('home');
        } else {
          this.updateClasses('home');
        }
        if (event.url.includes('/omni-forma-de-pago')) {
          this.isOmni = true;
        }

        this.scroller.scrollToPosition([0, 0]);
      }
    });

    this.shoppingCartService.onAdding$.subscribe(
      (product: IShoppingCartProduct) => {
        this.productCard = product;
        this.showAlertCart();
      }
    );
  }

  private onChangeStore(): void {
    // if (this.isOmni) return;
    this.geolocationService.selectedStore$.subscribe({
      next: (geolocation) => {
        if(!this.isOmni){
          const callBackCartLoaded = geolocation?.callBackCartLoaded;
          this.shoppingCartService.load({
            callBackCartLoaded,
          });
        }
      },
    });
  }

  private updateClasses(nameClass?: string) {
    let arr = ['home', 'categoria', 'carrito', 'pdp'];
    const body = this.renderer.selectRootElement('body', true);
    //quitar clases
    arr.forEach((x: string) => {
      this.renderer.removeClass(body, x);
    });
    //agregar clase
    if (nameClass) this.renderer.addClass(body, nameClass);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.geolocationService.initGeolocation();
      this.preloader();
      this.onChangeStore();
    } else {
      // Esto se carga en el movil.
      // FIXME: tiene dependencia de stores que no se cargan en este caso.
      this.geolocationService.setDefaultLocation();
    }
  }

  private preloader() {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const preloader = document.querySelector('.site-preloader');
        if (preloader) {
          preloader.addEventListener('transitionend', (event: any) => {
            if (event.propertyName === 'opacity') {
              preloader.remove();
            }
          });
          preloader.classList.add('site-preloader__fade');
        }
      }, 400);
    });
  }

  /**
   * Muestra una alerta indicando que se añadió un nuevo producto al carro.
   */
  private showAlertCart(): void {
    this.alert.hide();
    this.alert.show();
  }
}
