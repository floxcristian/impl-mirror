import {
  Component,
  OnInit,
  Input,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { CmsService } from '@core/services-v2/cms.service';
import {
  IArticle,
  IBanner,
  ISpecialData,
  ISpecial,
} from '@core/models-v2/cms/special-reponse.interface';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';

export type Layout = 'grid' | 'grid-with-features' | 'list';
export interface ISection {
  nombre: string;
  id: string;
  p: number;
}

export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

@Component({
  selector: 'app-product-slideshow-specials',
  templateUrl: './product-slideshow-specials.component.html',
  styleUrls: ['./product-slideshow-specials.component.scss'],
})
export class ProductSlideshowSpecialsComponent implements OnInit {
  products!: Product[];

  responsiveOptions: any[] | undefined;

  @Input() layout: Layout = 'grid';
  @Input() grid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-4-full' =
    'grid-3-sidebar';
  secciones: ISection[] = [];
  especial!: ISpecial[];
  banners!: IBanner;
  producto_espacial: IArticle[] = [];
  @Input() nombre: string | undefined = undefined;
  user!: ISession;
  documentId!: string;
  cantItem: number = 4;
  innerWidth: number;
  ruta!: any[];
  p: number = 1;
  preferenciaCliente!: ICustomerPreference;
  despachoCliente!: Subscription;
  currentPage = 1;
  totalPages!: number;
  currentIdSeccion!: string;
  cargandoProductos: boolean = false;
  cargandoProductos2: boolean = false;
  prepainv: string = 'prepainv';
  numVisible: number = 7;

  constructor(
    public toast: ToastrService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly cmsService: CmsService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly geolocationStorage: GeolocationStorageService,
    private readonly customerPreferenceStorage: CustomerPreferencesStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;

    this.responsiveOptions = [
      {
        breakpoint: '3840px',
        numVisible: 7,
        numScroll: 7,
      },
      {
        breakpoint: '1800px',
        numVisible: 7,
        numScroll: 7,
      },
      {
        breakpoint: '1399px',
        numVisible: 5,
        numScroll: 5,
      },
      {
        breakpoint: '991px',
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 2,
      },
    ];
    this.updateNumVisible();
  }

  onCarrouselPage(event: any) {
    console.log('onCarrouselPage', event);
  }

  async ngOnInit() {
    let url: string = this.router.url;
    this.ruta = url.split('/');
    this.preferenciaCliente = this.customerPreferenceStorage.get();
    const geo = this.geolocationStorage.get();
    if (geo) {
      this.cargaEspeciales();
    }

    this.geolocationService.selectedStore$.subscribe({
      next: (res) => {
        this.cargaEspeciales();
      },
    });

    // cuando se inicia sesion
    this.authStateService.session$.subscribe(() => {
      this.customerPreferenceService.getCustomerPreferences().subscribe({
        next: (preferences) => {
          this.preferenciaCliente = preferences;
          this.cargaEspeciales();
        },
      });
    });

    //Cuando se cambia de dirección despacho
    this.despachoCliente =
      this.customerAddressService.customerAddress$.subscribe(
        (customerAddress) => {
          this.preferenciaCliente.deliveryAddress = customerAddress;
          this.cargaEspeciales();
        }
      );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;

    this.updateNumVisible();

    if (this.innerWidth < 427) {
      this.cantItem = 4;
    } else if (this.innerWidth > 426) {
      this.cantItem = 10;
    }
  }

  breakpoints: { [key: string]: number } = {
    '3840px': 7,
    '1800px': 7,
    '1399px': 5,
    '991px': 3,
    '767px': 2,
  };

  updateNumVisible() {
    const width = window.innerWidth;
    if (width <= 766) {
      this.numVisible = this.breakpoints['767px'];
    } else if (width <= 990) {
      this.numVisible = this.breakpoints['991px'];
    } else if (width <= 1398) {
      this.numVisible = this.breakpoints['1399px'];
    } else if (width <= 1799) {
      this.numVisible = this.breakpoints['1800px'];
    } else if (width <= 3840) {
      this.numVisible = this.breakpoints['3840px'];
    } else {
      this.numVisible = 7; // Valor por defecto para pantallas grandes
    }
  }

  get showIndicators(): boolean {
    return this.secciones.length > this.numVisible;
  }

  getUrl(id: any) {
    this.nombre = this.secciones.find((x) => x.id == id)?.nombre;
    this.currentIdSeccion = id;
    this.cargaEspecialesArticulos(id);
  }

  async cargaEspeciales() {
    this.secciones = [];
    var especials = this.router.url.split('/').pop() || '';

    //clean tracking vars
    var look = especials?.indexOf('?');
    if ((look || 0) > -1) especials = especials?.substr(0, look);

    this.cmsService.getSpecial(especials).subscribe({
      next: (res) => {
        this.especial = res.specials;
        this.banners = res.banners[0];
        let data: ISpecialData[] = res.data;
        let out: any = [];
        let i = 0;
        data.forEach((x: ISpecialData) => {
          let seccion: ISection = {
            nombre: x.title,
            id: x.id,
            p: i,
          };
          out.push(seccion);
          i++;
        });
        this.secciones = out;

        this.getUrl(this.secciones[0].id);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onPageChange() {
    const page = this.currentPage + 1;

    if (page <= this.totalPages) {
      this.currentPage = page;
      this.cargaEspecialesArticulos(this.currentIdSeccion, true);
    }
  }

  async cargaEspecialesArticulos(idSeccion: string, scroll = false) {
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;
    var especials = this.router.url.split('/').pop() || '';
    let location = '';

    //clean tracking vars
    var look = especials.indexOf('?');
    if (look > -1) especials = especials?.substr(0, look);

    if (this.preferenciaCliente && this.preferenciaCliente.deliveryAddress)
      location = this.preferenciaCliente.deliveryAddress.city
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (!scroll) {
      this.producto_espacial = [];
      this.currentPage = 1;
      this.cargandoProductos = true;
    } else {
      this.cargandoProductos2 = true;
    }

    const { documentId } = this.sessionService.getSession();
    this.cmsService
      .getSpecialArticles(
        idSeccion,
        especials,
        documentId,
        sucursal,
        location,
        this.currentPage
      )
      .subscribe({
        next: (res) => {
          if (scroll) {
            for (const item of res.data) {
              this.producto_espacial.push(item);
            }
          } else {
            this.totalPages = res.lastPage;
            this.producto_espacial = res.data;
          }
          this.cargandoProductos = false;
          this.cargandoProductos2 = false;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  pageChanged(event: any) {
    this.p = event;
    let index = (this.p - 1) * 3;
    this.getUrl(this.secciones[index].id);
  }
}
