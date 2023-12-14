// Angular
import {
  Component,
  OnInit,
  Inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// Libs
import { ToastrService } from 'ngx-toastr';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { ProductsService } from '../../services/products.service';
import { RootService } from '../../services/root.service';
import { DirectionService } from '../../services/direction.service';
import { ClientsService } from '../../services/clients.service';
import { LogisticsService } from '../../services/logistics.service';
import { isVacio } from '../../utils/utilidades';
import { SessionService } from '@core/states-v2/session.service';
import { CmsService } from '@core/services-v2/cms.service';
import { AuthStateServiceV2 } from '@core/states-v2/auth-state.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IData } from '@core/models-v2/cms/customHomePage-response.interface';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';

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
  window = window;
  innerWidth: number;
  carouselOptions = {
    items: 5,
    nav: true,
    navText: [
      `<div class="m-arrow__container" ><i class="fa-regular fa-chevron-left"></i></div>`,
      `<div class="m-arrow__container"><i class="fa-regular fa-chevron-right"></i></div>`,
    ],
    slideBy: 'page',
    dots: true,
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    responsive: {
      1100: { items: 5 },
      920: { items: 5 },
      680: { items: 3 },
      500: { items: 2 },
      0: { items: 2 },
    },
    rtl: this.direction.isRTL(),
  };

  constructor(
    private root: RootService,
    private productsService: ProductsService,
    // @Inject(WINDOW) private window: Window,
    public toast: ToastrService,
    private direction: DirectionService,
    private router: Router,
    private clientsService: ClientsService,
    private logisticsService: LogisticsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly cmsService: CmsService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly geolocationStorage: GeolocationStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  sidebarPosition: 'start' | 'end' = 'start';

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

    this.despachoCliente = this.logisticsService.direccionCliente$.subscribe(
      async () => {
        this.customerPreferenceService.getCustomerPreferences().subscribe({
          next: (preferences) => {
            this.preferenciasCliente = preferences;
            this.cargarHome();
          },
        });
      }
    );

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

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  cargarHome() {
    this.cargando = true;
    const rut = this.user?.documentId || '0';
    console.log('getSelectedStore desde ProductSlideshowComponent');
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;
    const localidad = !isVacio(this.preferenciasCliente?.deliveryAddress)
      ? this.preferenciasCliente.deliveryAddress?.city
      : '';
    let localidad_limpia =
      localidad?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
    if (this.user?.documentId !== '0') {
      this.lstProductos = [];
      this.cmsService
        .getCustomHomePage(rut, sucursal, localidad_limpia)
        .subscribe({
          next: (res) => {
            // this.lstProductos = res.data;
            this.lstProductos = this.quitarElementos(res.data);
            this.cargando = false;
          },
          error: (err) => {
            console.log(err);
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
