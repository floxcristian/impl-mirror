// Angular
import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
// Libs
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// Rxjs
import { Observable, Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  map,
} from 'rxjs/operators';
import { MenuCategoriasB2cService } from '../../../../shared/services/menu-categorias-b2c.service';
import { isVacio } from '../../../../shared/utils/utilidades';
import { SessionService } from '@core/services-v2/session/session.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
// Directives
import { DropdownDirective } from '../../../../shared/directives/dropdown.directive';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import {
  IArticleResponse,
  IBrand,
  ICategorySearch,
  ISuggestion,
} from '@core/models-v2/article/article-response.interface';
import { ArticleService } from '@core/services-v2/article.service';
import { CartService } from '@core/services-v2/cart.service';
import { CustomerPreferenceStorageService } from '@core/storage/customer-preference-storage.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { PathStorageService } from '@core/storage/path-storage.service';
import { DireccionDespachoComponent } from '../search-vin-b2b/components/direccion-despacho/direccion-despacho.component';
import { ModalStoresComponent } from '../modal-stores/modal-stores.component';
import { RootService } from '@shared/services/root.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';
import { VehicleService } from '@core/services-v2/vehicle/vehicle.service';
import { VehicleType } from '@core/services-v2/vehicle/vehicle-type.enum';
import { IVehicle } from '@core/services-v2/vehicle/vehicle-response.interface';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import { IVehicleCustomer } from '@core/services-v2/customer-vehicle/vehicle-customer-response.interface';
import { Message } from 'primeng/api';
// Env
import { environment } from '@env/environment';

@Component({
  selector: 'app-header-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('menuSearch', { static: false }) listSearch!: DropdownDirective;
  @ViewChild('menuTienda', { static: false }) menuTienda!: DropdownDirective;
  @ViewChild('menuVehiculo', { static: false })
  menuVehiculo!: DropdownDirective;
  @ViewChild(DropdownDirective, { static: false })
  dropdown!: DropdownDirective;
  isSearchVehicleVisible: boolean;

  destroy$: Subject<boolean> = new Subject<boolean>();

  texto: string = '';
  textToSearch: string = '';
  categorias: ICategorySearch[] = [];
  marcas: IBrand[] = [];
  sugerencias: ISuggestion[] = [];
  productosEncontrados: IArticleResponse[] = [];
  mostrarContenido = false;
  mostrarCargando = false;
  linkBusquedaProductos = '#';
  searchControl!: FormControl;
  buscando = true;
  mostrarResultados = false;

  sessionNotStarted = false;
  loadCart = false;

  seleccionado = false;
  isFocusedInput = false;

  direccion!: ICustomerAddress | any;
  despachoClienteRef!: Subscription;
  isVacio = isVacio;
  sessionRef!: Subscription;

  messages: Message[] = [
    {
      severity: 'warn',
      //summary: 'Patente no encontrada',
      detail:
        'Esta funcionalidad esta disponible solo para usuario registrados.',
    },
  ];

  // News
  session!: ISession;
  selectedStore!: ISelectedStore;
  areLoadedStores!: boolean;

  vehicleSearchType: string = 'patente';
  vehicleForm: FormGroup;
  selectedVehicle!: IVehicle | null;
  notVehicleFound!: boolean;

  customerVehiclesFilter!: IVehicleCustomer[];
  customerVehiclesOriginal!: IVehicleCustomer[];
  isLoadingVehicles: boolean = false;
  existInFlota: boolean = false;
  isLoadingCreate: boolean = false;

  isClickedVehicleSearch!: boolean;

  getTypeFilter() {
    return this.vehicleForm.get('type')?.value === 'patent'
      ? this.vehicleForm.get('type')?.value
      : 'codeChasis';
  }

  get searchInput() {
    return this.vehicleForm.get('search');
  }

  quantity$: Observable<string> = of('');

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public menuCategorias: MenuCategoriasB2cService,
    private readonly gtmService: GoogleTagManagerService,
    public readonly root: RootService,
    private readonly fb: FormBuilder,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly pathStorage: PathStorageService,
    private readonly customerPreferenceStorage: CustomerPreferenceStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService,
    private readonly articleService: ArticleService,
    public readonly shoppingCartService: CartService,
    public readonly modalServices: NgbModal,
    private readonly vehicleService: VehicleService,
    private readonly customerVehicleService: CustomerVehicleService
  ) {
    this.isSearchVehicleVisible = environment.isSearchVehicleVisible;
    this.vehicleForm = this.fb.group({
      type: ['patent', Validators.required],
      search: [null],
    });
  }

  ngOnInit(): void {
    this.onChangeSearchInput();
    this.onChangeTypeInput();

    this.quantity$ = this.shoppingCartService.quantity$.pipe(
      map((quantity) => quantity.toString())
    );

    this.geolocationService.stores$
      .pipe(first((stores) => stores.length > 0))
      .subscribe({
        next: () => {
          this.areLoadedStores = true;
          this.searchControl.enable();
          // Obtengo tienda seleccionada,
          // como aun espera a que acepte... se hace un setdefault
          this.selectedStore = this.geolocationService.getSelectedStore();
          this.onChangeStore();
        },
      });

    this.session = this.sessionService.getSession();
    if (this.session.documentId !== '0') {
      this.getCustomerPreferences();
    }

    this.sessionRef = this.authStateService.session$.subscribe((session) => {
      this.session = session;
      if (this.session.documentId !== '0') {
        this.getCustomerPreferences();
      }
    });

    this.despachoClienteRef =
      this.customerAddressService.customerAddress$.subscribe(
        (customerAddress) => {
          this.direccion = customerAddress;
        }
      );
  }

  private getCustomerPreferences(): void {
    this.customerPreferenceService.getCustomerPreferences().subscribe({
      next: ({ deliveryAddress }) => (this.direccion = deliveryAddress),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.despachoClienteRef.unsubscribe();
    this.sessionRef.unsubscribe();
  }

  reset(): void {
    this.buscando = true;
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  buscar(): void {
    this.textToSearch = this.searchControl.value || '';

    this.gtmService.pushTag({
      event: 'search',
      busqueda: this.textToSearch,
    });

    if (this.textToSearch.trim() === '') {
      this.toastr.info('Debe ingresar un texto para buscar', 'Información');
      return;
    }
    let search: string = this.textToSearch.replace('/', '%2F');
    this.router.navigateByUrl('inicio/productos/' + search);
    this.mostrarContenido = true;
    this.mostrarCargando = true;
    this.mostrarResultados = false;

    setTimeout(() => {
      this.dropdown.close();
    }, 500);
  }

  private buscarSelect(): void {
    this.mostrarContenido = true;
    this.mostrarCargando = true;
    this.linkBusquedaProductos = this.textToSearch;
    if (this.textToSearch.length > 3) {
      this.articleService
        .search({
          word: this.textToSearch,
          documentId: this.session.documentId,
          branchCode: this.selectedStore.code,
          showPrice: 1,
        })
        .subscribe({
          next: (res) => {
            if (!this.seleccionado) {
              this.dropdown.open();
            }
            this.mostrarCargando = false;
            this.categorias = res.categories;
            this.marcas = res.brands;
            this.productosEncontrados = res.articles;
            this.sugerencias = res.suggestions;
            if (!this.productosEncontrados.length) {
              this.buscando = false;
            }

            this.categorias.map((item) => {
              item.url = [
                '/',
                'inicio',
                'productos',
                this.textToSearch,
                'categoria',
                item.slug,
              ];
              if (typeof item.name === 'undefined') {
                item.name = 'Sin categorias';
              }
            });

            this.productosEncontrados.map((item) => {
              item.url = ['/', 'inicio', 'productos', item.sku];
            });
          },
          error: (err) => {
            this.toastr.error('Error de conexión con el servidor de Elastic');
            console.error('Error de conexión con el servidor de Elastic');
          },
        });
    }
  }

  async validarCuenta() {
    this.pathStorage.set(['/', 'mi-cuenta', 'seguimiento']);
    this.router.navigate(['/mi-cuenta', 'seguimiento']);
  }

  verificarCarro(template: any) {
    template.toggle();
  }

  focusInput() {
    this.isFocusedInput = true;
  }

  blurInput() {
    this.isFocusedInput = false;
  }

  modificarDireccionDespacho() {
    const bsModalRef: BsModalRef = this.modalService.show(
      DireccionDespachoComponent
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      const direccionDespacho = res;
      this.direccion = direccionDespacho;
      const preferences = this.customerPreferenceStorage.get();
      if (preferences) {
        preferences.deliveryAddress = direccionDespacho;
        this.customerPreferenceStorage.set(preferences);
      }
    });
  }

  /**
   * Abrir modal con las tiendas.
   */
  showStores(): void {
    this.modalServices.open(ModalStoresComponent, { size: 'md' });
  }

  /**
   * Se activa al detectar cambios en el type input.
   */
  onChangeTypeInput(): void {
    this.vehicleForm.get('type')?.valueChanges.subscribe(() => {
      this.notVehicleFound = false;
    });
  }

  /**
   * Se activa al detectar cambios en el search input.
   */
  private onChangeSearchInput(): void {
    this.searchControl = new FormControl({ value: '', disabled: true });
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        if (query.trim()) {
          this.textToSearch = query;
          this.buscarSelect();
        } else {
          this.categorias = [];
          this.productosEncontrados = [];
        }
      });
  }

  // Analizar esto..
  private onChangeStore(): void {
    this.geolocationService.selectedStore$.subscribe({
      next: (selectedStore) => {
        this.selectedStore = selectedStore;
        this.shoppingCartService.calc();
        if (selectedStore.isChangeToNearestStore) {
          setTimeout(() => {
            if (this.menuTienda) this.menuTienda.open();
          }, 700);
        }
      },
    });
  }

  /**
   * Buscar productos.
   */
  searchProducts(): void {
    this.buscar();
    this.listSearch.toggle();
    this.blurInput();
    this.cleanSelectedVehicle();
  }

  /**
   * Buscar vehículo por patente.
   * @param param0
   * @returns
   */
  searchVehicle({ type, search }: { type: VehicleType; search: string }) {
    if (this.session.documentId === '0') {
      this.isClickedVehicleSearch = true;
      return;
    }

    this.isLoadingVehicles = true;
    this.vehicleService
      .getByPatentOrVin({
        type,
        search,
        username: this.session.username || '',
      })
      .subscribe({
        next: (vehicle) => {
          this.isLoadingVehicles = false;
          this.selectedVehicle = vehicle || null;
          this.notVehicleFound = vehicle ? false : true;
          this.existVehicleInFlota(this.selectedVehicle);
        },
        error: (err) => {
          this.isLoadingVehicles = false;
          this.notVehicleFound = true;
          this.existInFlota = false;
        },
      });
  }

  /**
   * Quitar vehículo seleccionado.
   */
  cleanSelectedVehicle(): void {
    this.existInFlota = false;
    this.vehicleForm.get('search')?.setValue(null);
    this.selectedVehicle = null;
    this.customerVehiclesFilter = this.customerVehiclesOriginal;
  }

  /**
   * Ir a la página de artículos para ver productos del vehículo seleccionado.
   */
  goToProductsPage() {
    if (
      this.selectedVehicle?.PLACA_PATENTE &&
      this.selectedVehicle?.codigoSii
    ) {
      this.router.navigateByUrl(
        `inicio/productos/vehicle/${this.selectedVehicle?.PLACA_PATENTE}/${this.selectedVehicle?.codigoSii}`
      );
      //this.searchVehicle(this.vehicleForm.value);
      this.cleanSelectedVehicle();
      this.menuVehiculo.toggle();
    }
  }

  /**
   *  Obtiene vehiculos del cliente logueado
   */
  getAllCustomerVehicle(): void {
    if (this.session.documentId === '0') return;
    this.customerVehicleService.getAll(this.session.documentId).subscribe({
      next: (vehicles) => {
        this.customerVehiclesOriginal = vehicles;
        this.customerVehiclesFilter = vehicles;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   * Filtra los vehiculos
   */
  filterVehicle() {
    let valueSearch = this.vehicleForm.get('search')?.value;
    if (!valueSearch || valueSearch === '')
      this.customerVehiclesFilter = this.customerVehiclesOriginal;
    else {
      let typeFilter = this.getTypeFilter();
      if (typeFilter === 'patent')
        this.customerVehiclesFilter = this.customerVehiclesOriginal.filter(
          (vehicle: any) =>
            vehicle.patent.toUpperCase().includes(valueSearch.toUpperCase())
        );
      else
        this.customerVehiclesFilter = this.customerVehiclesOriginal.filter(
          (vehicle: any) =>
            vehicle.codeChasis
              .toUpperCase()
              .includes(valueSearch.toUpperCase())
        );
    }
  }

  /**
   * Verifica si el vehiculo esta en la flota del cliente
   */
  existVehicleInFlota(vehicleFind: any) {
    if (vehicleFind) {
      let typeFilter = this.getTypeFilter();
      if (typeFilter === 'patent') {
        let existVehicle = this.customerVehiclesOriginal.find(
          (vehicle: any) => vehicleFind.PLACA_PATENTE === vehicle.patent
        );
        if (existVehicle) this.existInFlota = true;
      } else {
        let existVehicle = this.customerVehiclesOriginal.find(
          (vehicle: any) => vehicleFind.COD_CHASIS === vehicle.codeChasis
        );
        if (existVehicle) this.existInFlota = true;
      }
    } else this.existInFlota = false;
  }

  /**
   * Agregar vehiculo a flota
   */
  addMyFlota() {
    if (this.selectedVehicle) {
      let createVehicle = {
        patent: this.selectedVehicle.PLACA_PATENTE,
        brand: this.selectedVehicle.MARCA,
        model: this.selectedVehicle.MODELO,
        typeVehicle: this.selectedVehicle.TIPO_VEHICULO, // TODO: eliminar
        manufactureYear: this.selectedVehicle.ANO_FABRICACION,
        codeMotor: this.selectedVehicle.COD_MOTOR,
        codeChasis: this.selectedVehicle.COD_CHASIS,
        customer: this.selectedVehicle.cliente, // TODO: eliminar
        typeImp: this.selectedVehicle.IMPtipo,
        detail: this.selectedVehicle.detalle,
        codeSii: this.selectedVehicle.codigoSii,
      };
      this.isLoadingCreate = true;
      this.customerVehicleService
        .createCustomerVehicle(this.session.documentId, createVehicle)
        .subscribe({
          next: () => {
            this.isLoadingCreate = false;
            this.toastr.success('Vehiculo Agregado a la flota', '');
          },
          error: (err) => {
            console.log(err);
            this.isLoadingCreate = false;
          },
        });
    }
  }
}
