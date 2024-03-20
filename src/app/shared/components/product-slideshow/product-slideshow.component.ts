// Angular
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// Libs
import { ToastrService } from 'ngx-toastr';
// Rxjs
import { Subscription } from 'rxjs';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IData } from '@core/models-v2/cms/customHomePage-response.interface';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
// Services
import { isVacio } from '../../utils/utilidades';
import { SessionService } from '@core/services-v2/session/session.service';
import { CmsService } from '@core/services-v2/cms.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product-slideshow',
  templateUrl: './product-slideshow.component.html',
  styleUrls: ['./product-slideshow.component.scss'],
})
export class ProductSlideshowComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  user!: ISession | null;
  isB2B!: boolean;
  cargando: boolean = false;
  lstProductos: IData[] = [];
  relleno: any[] = [1, 2, 3, 4, 5];
  ruta: string = '';
  preferenciasCliente!: ICustomerPreference;
  despachoCliente!: Subscription;
  layout = 'grid-lg';
  carouselOptions = {
    lazyLoad: true,
    items: 6,
    nav: true,
    navText: [
      `<i class="fas fa-chevron-left"></i>`,
      `<i class="fas fa-chevron-right"></i>`,
    ],
    dots: true,
    loop: true,
    slideBy: 'page',
    // autoplay: true,
    // autoplayTimeout: 4000,
    responsive: {
      1366: { items: 6 },
      1100: { items: 6 },
      920: { items: 6 },
      680: { items: 3 },
      500: { items: 3 },
      0: { items: 2 },
    },
  };
  // carouselOptions: OwlOptions = {
  //   lazyLoad: true,
  //   items: 5,
  //   nav: true,
  //   navText: [
  //     `<div class="m-arrow__container" ><i class="fa-regular fa-chevron-left"></i></div>`,
  //     `<div class="m-arrow__container"><i class="fa-regular fa-chevron-right"></i></div>`,
  //   ],
  //   slideBy: 'page',
  //   dots: true,
  //   loop: true,
  //   autoplay: true,
  //   autoplayTimeout: 4000,
  //   responsive: {
  //     1100: { items: 5 },
  //     920: { items: 5 },
  //     680: { items: 3 },
  //     500: { items: 2 },
  //     0: { items: 2 },
  //   },
  // };

  lastCustomHomepageKey = '';

  constructor(
    public toast: ToastrService,
    private router: Router,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly cmsService: CmsService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly geolocationStorage: GeolocationStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService
  ) {}

  ngOnInit() {
    this.ruta = this.router.url === '/inicio' ? 'home' : this.router.url;
    this.user = this.sessionService.getSession();
    this.isB2B = this.sessionService.isB2B();
  }

  ngAfterViewInit() {
    const geo = this.geolocationStorage.get();
    if (geo && this.user?.documentId !== '0') {
      this.customerPreferenceService.getCustomerPreferences().subscribe({
        next: (preferences) => {
          this.preferenciasCliente = preferences;
          this.cargarHome();
        },
      });
    }

    this.geolocationService.selectedStore$.subscribe({
      next: () => {
        if (this.user?.documentId !== '0') {
          this.customerPreferenceService.getCustomerPreferences().subscribe({
            next: (preferences) => {
              this.preferenciasCliente = preferences;
              this.cargarHome();
            },
          });
        } else {
          this.cargarHome();
        }
      },
    });

    this.despachoCliente =
      this.customerAddressService.customerAddress$.subscribe(() => {
        this.customerPreferenceService.getCustomerPreferences().subscribe({
          next: (preferences) => {
            this.preferenciasCliente = preferences;
            this.cargarHome();
          },
        });
      });

    // cuando se inicia sesion
    this.authStateService.session$.subscribe((user) => {
      this.user = user;
      this.customerPreferenceService.getCustomerPreferences().subscribe({
        next: (preferences) => {
          this.preferenciasCliente = preferences;
          this.cargarHome();
        },
      });
    });
  }

  ngOnDestroy(): void {
    if (!isVacio(this.despachoCliente)) {
      this.despachoCliente.unsubscribe();
    }
  }

  cargarHome() {
    this.cargando = true;
    const rut = this.user?.documentId || '0';
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;
    const localidad = !isVacio(this.preferenciasCliente?.deliveryAddress)
      ? this.preferenciasCliente.deliveryAddress?.city
      : '';
    let localidad_limpia =
      localidad?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

    const customHomepageKey = [rut, sucursal, localidad_limpia].join('-');
    if (
      this.user?.documentId !== '0' &&
      this.lastCustomHomepageKey !== customHomepageKey
    ) {
      this.lastCustomHomepageKey = customHomepageKey;
      this.lstProductos = [];
      this.cmsService
        .getCustomHomePage(rut, sucursal, localidad_limpia)
        .subscribe({
          next: (res) => {
            this.lstProductos = this.quitarElementos(res.data);
            this.cargando = false;
          },
          error: (err) => {
            console.log(err);
            this.lastCustomHomepageKey = '';
            this.cargando = false;
          },
        });
    } else {
      this.cargando = false;
    }
  }

  quitarElementos(data: any) {
    let lst_limpios: any[] = [];
    let valores = ['Mis productos recurrentes', 'últimos productos vistos'];
    data.forEach((element: any) => {
      if (!valores.includes(element.title)) lst_limpios.push(element);
    });
    return lst_limpios;
  }

  delay(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  over(event: any) {
    let el: any = event.target.parentNode;
    let clase: any = el.classList;
    while (!clase.contains('owl-item')) {
      el = el.parentNode;
      clase = el.classList;
    }

    el.style['box-shadow'] = '0 4px 4px 0 rgb(0 0 0 / 50%)';
  }

  leave(event: any) {
    let el: any = event.target.parentNode;
    let clase: any = el.classList;
    while (!clase.contains('owl-item')) {
      el = el.parentNode;
      clase = el.classList;
    }

    el.style['box-shadow'] = 'none';
  }
}
