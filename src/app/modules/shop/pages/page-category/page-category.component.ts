// Angular
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PLATFORM_ID, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// Environment
import { environment } from '@env/environment';
// Models
import { ProductFilterCategory } from '../../../../shared/interfaces/product-filter';
import { ISession } from '@core/models-v2/auth/session.interface';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { ICategory } from './models/category.interface';
import { Link } from '@shared/interfaces/link';
import { ICategoryParams } from '../page-product/models/category-params.interface';
import {
  IArticleResponse,
  IBanner,
  ICategoriesTree,
  IElasticSearch,
  IFilters,
  ISearchResponse,
} from '@core/models-v2/article/article-response.interface';
import {
  IProductFilter,
  IProductFilterCheckbox,
} from '@core/models-v2/article/product-filter.interface';
import { StorageKey } from '@core/storage/storage-keys.enum';
// Constants
import { CATEGORIES_METADATA } from './constants/categories-metadata';
// Pipes
import { CapitalizeFirstPipe } from '../../../../shared/pipes/capitalize.pipe';
// Services
import { SeoService } from '../../../../shared/services/seo/seo.service';
import { CanonicalService } from '../../../../shared/services/canonical.service';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { ArticleService } from '@core/services-v2/article.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';
import {
  cleanFilterSearchParams,
  getOriginUrl,
  getValidFilters,
} from './utils/util.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';

import { VehicleService } from '@core/services-v2/vehicle/vehicle.service';
import { Subscription } from 'rxjs';
import { CustomerService } from '@core/services-v2/customer.service';

@Component({
  selector: 'app-grid',
  templateUrl: './page-category.component.html',
  styleUrls: ['./page-category.component.scss'],
})
export class PageCategoryComponent implements OnInit, OnDestroy {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  session: ISession;
  preferences!: ICustomerPreference;

  // Examinando params...
  products: IArticleResponse[] = [];
  filters: IProductFilter[] = [];
  filterQuery: any;
  removableFilters: Params = [];
  removableCategory: ICategory[] = [];
  breadcrumbs: Link[] = [];
  productosTemp: string[] = [];
  // Paginacion
  totalPaginas: number = 0;
  PagDesde: number = 0;
  PagHasta: number = 0;
  PagTotalRegistros: number = 0;
  pageSize: number = 12;
  isInitialLoading: boolean;
  isScrollLoading!: boolean;
  currentPage: number = 1;

  // Filtro
  parametrosBusqueda!: IElasticSearch;
  textToSearch: string = '';
  levelCategories: ICategoriesTree[] = [];
  level: number = 0;
  marca_tienda: string = '';
  paramsCategory: ICategoryParams;

  visibleFilter!: boolean;
  filtrosOculto: boolean = true;
  scrollPosition!: number;
  innerWidth: number;
  origen: string[] = [];
  banners!: IBanner | null;
  config: IConfig;
  // filter vehicle
  patentVehicle: string = '';
  siiCodeVehicle: string = '';

  routeSubscription!: Subscription;
  routeSubscriptionQuery!: Subscription;

  // Variables for filter chain
  viewFilterChain: boolean = false;
  category_chain = 'cadenas-para-nieve';
  select_ancho: any = null;
  select_perfil: any = null;
  select_aro: any = null;

  ancho_attribute = 'CADENA ANCHO';
  values_anchos: string[] = [];
  aplicacion_cadenas: string[] = [];
  values_perfiles: any[] = [];
  values_aros: string[] = [];
  isActiveFilterAplicacionCadena: boolean = false;
  viewImage: boolean = false;

  //ancho
  anchos = [
    '10',
    '11',
    '11.2',
    '12',
    '12.5',
    '13',
    '14',
    '155',
    '165',
    '17.5',
    '175',
    '185',
    '19.5',
    '195',
    '20.5',
    '205',
    '215',
    '225',
    '23.5',
    '235',
    '240',
    '245',
    '250',
    '255',
    '265',
    '275',
    '28',
    '285',
    '29',
    '295',
    '3',
    '30',
    '300',
    '305',
    '31',
    '315',
    '32',
    '33',
    '335',
    '365',
    '6.5',
    '7',
    '7.5',
    '8',
    '8.2',
    '8.25',
    '8.5',
    '8.75',
    '9.5',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private localS: LocalStorageService,
    private capitalize: CapitalizeFirstPipe,
    private titleService: Title,
    private seoService: SeoService,
    private canonicalService: CanonicalService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly articleService: ArticleService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly customerPreferenceStorage: CustomerPreferencesStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService,
    private readonly customerService: CustomerService,
    private readonly configService: ConfigService,
    private readonly vehicleService: VehicleService
  ) {
    this.isInitialLoading = true;
    this.config = this.configService.getConfig();
    this.session = this.sessionService.getSession();
    this.preferences = this.customerPreferenceStorage.get();
    this.paramsCategory = {
      firstCategory: '',
      secondCategory: '',
      thirdCategory: '',
    };
    /**
     * TODO: eliminar lo de abajo en algun momento.
     */
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    if (this.innerWidth < 1025) {
      this.pageSize = 12;
    } else {
      this.pageSize = 25;
    }
  }

  /**
   * Cuando un usuario inicia o cierra sesión.
   */
  private onSessionChange(): void {
    this.authStateService.session$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((session) => {
        this.filters = [];
        this.session = session;
        this.parametrosBusqueda.documentId = session.documentId;
        this.customerPreferenceService.getCustomerPreferences().subscribe({
          next: (preferences) => {
            this.preferences = preferences;
            this.cargarCatalogoProductos(this.parametrosBusqueda, '');
          },
        });
      });
  }

  /**
   * Cuando el usuario cambia su dirección de despacho.
   */
  private onCustomerAddressChange(): void {
    this.customerAddressService.customerAddress$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((customerAddress) => {
        this.filters = [];
        this.parametrosBusqueda.location = customerAddress?.city || '';
        this.preferences.deliveryAddress = customerAddress || null;
        this.cargarCatalogoProductos(this.parametrosBusqueda, '');
      });
  }

  /**
   * Cuando cambia la tienda seleccionada.
   */
  private onSelectedStoreChange(): void {
    this.geolocationService.selectedStore$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ code }) => {
        if (!this.route.snapshot.paramMap.get('patent')) {
          this.filters = [];
          this.parametrosBusqueda.branchCode = code || '';
          this.cargarCatalogoProductos(this.parametrosBusqueda, '');
        }
      });
  }

  //private onRouterParamsChange(): void {}

  ngOnInit(): void {
    let metadataCount = 0;

    /****************************************************
     * QUERY PARAMS
     ****************************************************/
    this.routeSubscriptionQuery = this.route.queryParams.subscribe((query) => {
      this.filters = [];
      this.origen = getOriginUrl(this.route.snapshot);

      // 1. Si es tienda oficial
      if (query['tiendaOficial']) {
        this.marca_tienda = query['filter_MARCA'] || '';
        if (this.marca_tienda) {
          const banner_local: any = this.localS.get('bannersMarca');
          if (
            banner_local &&
            banner_local.marca?.toLowerCase() ===
              this.marca_tienda.toLocaleLowerCase()
          )
            this.banners = banner_local;
          else this.banners = null;
        } else this.banners = null;
      } else {
        this.marca_tienda = '';
      }

      // Verificamos si viene la pagina en un queryparams. sino la reseteamos a la pagina 1.
      if (query['_value']?.hasOwnProperty('page')) {
        this.currentPage = query['_value']['page'];
      } else {
        this.currentPage = 1;
      }

      // 01. Marca
      if (query['_value']?.hasOwnProperty('filter_MARCA')) {
        const marca = query['_value']['filter_MARCA'];
        this.seoService.generarMetaTag({
          title: marca,
          description: 'Productos marca "title"',
          keywords: 'repuestos ' + marca,
        });
        metadataCount++;
      }

      this.filterQuery = this.getFiltersQuery(query);
      if (
        typeof this.parametrosBusqueda !== 'undefined' &&
        this.parametrosBusqueda.word === '' &&
        this.route.snapshot.paramMap.get('patent') &&
        this.route.snapshot.paramMap.get('SIICode')
      ) {
        let category = this.route.snapshot.paramMap.get('nombre') || '';
        this.getProductsByVehicle(
          this.route.snapshot.paramMap.get('SIICode') || '',
          this.route.snapshot.paramMap.get('patent') || '',
          category
        );
      }
      if (
        typeof this.parametrosBusqueda !== 'undefined' &&
        (this.parametrosBusqueda.word ===
          this.route.snapshot.paramMap.get('busqueda') ||
          this.route.snapshot.paramMap.get('busqueda') === 'todos')
      ) {
        const params = cleanFilterSearchParams(this.parametrosBusqueda);

        this.removableFilters = this.filterQuery;

        this.parametrosBusqueda = {
          ...params,
          ...this.filterQuery,
        };
        this.parametrosBusqueda.page = this.currentPage;
        this.cargarCatalogoProductos(this.parametrosBusqueda, '');
      }
    });

    /****************************************************
     * ROUTE PARAMS
     ****************************************************/
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.filters = [];

      // 1. Categoría
      if (
        params['busqueda'] &&
        params['metodo'] &&
        params['metodo'] === 'categoria'
      ) {
        // 02. Categoria
        // this.textToSearch = this.decodedUrl(params['busqueda'] === 'todos' ? '' : params['busqueda']);
        this.textToSearch =
          params['busqueda'] === 'todos' ? '' : params['busqueda'];

        let category = params['nombre'];
        this.paramsCategory.firstCategory = category;
        if (params['secondCategory']) {
          category = params['secondCategory'];
          this.paramsCategory.secondCategory = params['secondCategory'];
        }
        if (params['thirdCategory']) {
          category = params['thirdCategory'];
          this.paramsCategory.thirdCategory = params['thirdCategory'];
        }
        if (category === this.category_chain) this.viewFilterChain = true;
        else this.viewFilterChain = false;

        let parametros = {};
        const { code: branchCode } =
          this.geolocationService.getSelectedStore();
        if (this.session.documentId === '0') {
          parametros = {
            branchCode,
            category,
            word: this.textToSearch,
            pageSize: this.pageSize,
            documentId: this.session.documentId,
            showPrice: 1,
          };
        } else {
          parametros = {
            branchCode,
            category,
            word: this.textToSearch,
            location: this.preferences.deliveryAddress?.city
              ? this.preferences.deliveryAddress?.city
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              : '',
            pageSize: this.pageSize,
            documentId: this.session.documentId,
            showPrice: 1,
          };
        }

        this.setBreadcrumbs();
        this.removableFilters = this.filterQuery;
        this.parametrosBusqueda = {
          ...parametros,
          ...this.filterQuery,
        };
        this.parametrosBusqueda.page = this.currentPage;

        this.cargarCatalogoProductos(
          this.parametrosBusqueda,
          this.textToSearch + ' ' + category
        );

        // SEO
        this.getDetalleSeoCategoria(category);
      }

      // 2. Búsqueda
      else if (params['busqueda']) {
        this.textToSearch =
          params['busqueda'] === 'todos' ? '' : params['busqueda'];
        let parametros = {};
        const { code: branchCode } =
          this.geolocationService.getSelectedStore();
        if (this.session.documentId === '0') {
          parametros = {
            branchCode,
            category: '',
            word: this.textToSearch,
            pageSize: this.pageSize,
            documentId: this.session.documentId,
            showPrice: 1,
          };
        } else {
          parametros = {
            branchCode,
            category: '',
            word: this.textToSearch,
            location: this.preferences.deliveryAddress?.city
              ? this.preferences.deliveryAddress?.city
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              : '',
            pageSize: this.pageSize,
            documentId: this.session.documentId,
            showPrice: 1,
          };
        }
        this.removableFilters = this.filterQuery;
        this.parametrosBusqueda = {
          ...parametros,
          ...this.filterQuery,
        };
        this.parametrosBusqueda.page = this.currentPage;

        this.cargarCatalogoProductos(
          this.parametrosBusqueda,
          this.textToSearch
        );

        // SEO
        if (!metadataCount) {
          if (this.textToSearch.trim()) {
            this.titleService.setTitle(
              `Resultados Búsqueda de ${this.textToSearch}`
            );
          } else {
            this.titleService.setTitle(
              `Resultados de Búsqueda - ${this.config.shortUrl}`
            );
          }
          if (isPlatformBrowser(this.platformId)) {
            this.canonicalService.setCanonicalURL(location.href);
          }
          if (isPlatformServer(this.platformId)) {
            this.canonicalService.setCanonicalURL(
              environment.canonical + this.router.url
            );
          }
          const keywords = this.textToSearch.replace(
            /(\b(\w{1,3})\b(\s|$))/g,
            ''
          );
          this.seoService.generarMetaTag({
            keywords,
            title: this.textToSearch,
            description: this.textToSearch,
          });
          metadataCount++;
        }
      }

      // 3. Vehículo
      else if (params['patent'] && params['SIICode']) {
        this.patentVehicle = params['patent'];
        this.siiCodeVehicle = params['SIICode'];
        let category = params['nombre'] || '';
        this.paramsCategory.firstCategory = category;

        if (params['secondCategory']) {
          category = params['secondCategory'];
          this.paramsCategory.secondCategory = params['secondCategory'];
        }
        if (params['thirdCategory']) {
          category = params['thirdCategory'];
          this.paramsCategory.thirdCategory = params['thirdCategory'];
        }

        this.getProductsByVehicle(
          params['SIICode'],
          params['patent'],
          category
        );
      }
    });

    this.onSessionChange();
    this.onSelectedStoreChange();
    this.onCustomerAddressChange();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
    if (this.routeSubscriptionQuery) this.routeSubscriptionQuery.unsubscribe();
  }

  /**
   * Obtener productos.
   * @param parametros parametros
   * @param texto
   * @param scroll
   */
  private cargarCatalogoProductos(
    parametros: IElasticSearch,
    texto: string,
    scroll = false
  ): void {
    //* dejar con string vacio para no ser pescado en el sort
    this.siiCodeVehicle = '';
    this.patentVehicle = '';

    this.removableCategory = [];
    this.filtrosOculto = true;

    if (texto.includes('SKU:')) {
      texto = texto.substring(4, texto.length);
      parametros.word = texto;
      this.productosTemp = texto.split(' ');
    }
    if (this.parametrosBusqueda.category) {
      const category = this.parametrosBusqueda.category.replaceAll(/-/g, ' ');
      this.removableCategory.push({
        value: this.parametrosBusqueda.category,
        text: this.capitalize.transform(category),
      });
      this.filtrosOculto = false;
    }

    this.parametrosBusqueda.documentId = this.session.documentId;
    if (this.preferences?.deliveryAddress) {
      this.parametrosBusqueda.location = this.preferences.deliveryAddress.city
        ? this.preferences.deliveryAddress.city
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        : '';
    }

    if (!scroll) {
      this.parametrosBusqueda.page = 1;
      this.currentPage = 1;
      this.isInitialLoading = true;
    } else {
      this.isScrollLoading = true;
    }

    this.articleService.search(parametros).subscribe({
      next: (res) => {
        if (
          res.categories.length === 1 &&
          !this.router.url.includes('/categoria/')
        ) {
          let rutas = this.router.url.split('?');
          let filters = this.armaQueryParams(this.filterQuery);
          this.router.navigate(
            [rutas[0], 'categoria', res.categories[0].slug],
            { queryParams: filters }
          );
        } else this.SetProductos(res, scroll);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   * Formatear respuesta de productos para reenderizarlas.
   * @param r
   * @param scroll
   */
  private SetProductos(r: ISearchResponse, scroll = false): void {
    this.isInitialLoading = false;
    this.isScrollLoading = false;

    if (scroll) {
      r.articles.forEach((e: any) => {
        if (this.productosTemp.length > 0) {
          this.productosTemp.forEach((item) => {
            if (item == e.sku) this.products.push(e);
          });
        } else {
          this.products.push(e);
        }
      });
    } else {
      this.products = [];
      r.articles.forEach((e: any) => {
        this.productosTemp.forEach((item) => {
          if (item == e.sku) this.products.push(e);
        });
      });
      if (!this.products.length) {
        this.products = r.articles;
      }
    }
    if (!this.products.length) {
      this.breadcrumbs = [];
    }
    this.formatoPaginacion(r);
    this.filters = [];
    this.formatCategories(r.categoriesTree, r.levelFilter);
    this.formatFilters(r.filters);
    this.agregarMatrizProducto(r.articles);
    if (r.banners && r.banners.length) {
      this.banners = r.banners[0];
      this.localS.set(StorageKey.bannersMarca, r.banners[0]);
    } else this.banners = null;
  }

  //Trae productos matriz para cuando hay 1 solo article de resultado en la busqueda
  private agregarMatrizProducto(productos: IArticleResponse[]) {
    if (productos.length === 1) {
      const user = this.sessionService.getSession();
      if (user) {
        const producto: IArticleResponse = productos[0];
        let tienda = this.geolocationService.getSelectedStore();
        let codigo = tienda.code || '';
        let params = {
          sku: producto.sku,
          documentId: user.documentId,
          branchCode: codigo,
          location:
            this.preferences.deliveryAddress != null
              ? this.preferences.deliveryAddress.city
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              : '',
        };
        this.articleService.getMatrixProducts(params).subscribe({
          next: (res) => {
            for (const item of res) {
              this.products.push(item);
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    }
  }

  private formatoPaginacion(r: ISearchResponse): void {
    const pagina = r.page;
    this.PagDesde = pagina === 1 ? 1 : (pagina - 1) * r.pageSize + 1;
    this.PagHasta = pagina * r.pageSize;

    if (this.PagHasta > r.totalResult) {
      this.PagHasta = r.totalResult;
    }

    this.totalPaginas = r.totalPages;
    this.PagTotalRegistros = r.totalResult;
  }

  /**
   * Añade un filtro de categoría a la lista.
   * @param categorias
   * @param levelFilter
   */
  private formatCategories(
    categorias: ICategoriesTree[],
    levelFilter: number
  ): void {
    const productoBuscado =
      this.parametrosBusqueda.word === ''
        ? 'todos'
        : this.parametrosBusqueda.word;
    let collapsed = false;
    if (this.parametrosBusqueda.category !== '') {
      collapsed = false;
    }

    const filtros: ProductFilterCategory = {
      type: 'categories',
      name: 'CATEGORÍAS',
      collapsed,
      options: {
        items: [],
      },
    };
    this.levelCategories = categorias;
    let queryParams = {};
    queryParams = this.armaQueryParams(queryParams);

    this.levelCategories.map((lvl1) => {
      filtros.options.items?.push({
        type: 'parent',
        count: lvl1.count,
        name: lvl1.name,
        url: [
          '/',
          'inicio',
          'productos',
          productoBuscado,
          'categoria',
          lvl1.slug,
        ],
        open: [1, 2, 3].includes(levelFilter),
        children: lvl1.children?.map((lvl2) => {
          return {
            type: 'parent',
            count: lvl2.count,
            name: lvl2.name,
            url: [
              '/',
              'inicio',
              'productos',
              productoBuscado,
              'categoria',
              lvl2.slug,
            ],
            open: levelFilter == 2 || levelFilter == 3,
            children: lvl2.children?.map((lvl3: any) => {
              return {
                type: 'parent',
                count: lvl3.count,
                name: lvl3.name,
                url: [
                  '/',
                  'inicio',
                  'productos',
                  productoBuscado,
                  'categoria',
                  lvl3.slug,
                ],
                open: levelFilter == 3,
                queryParams,
              };
            }),
            queryParams,
          };
        }),
        queryParams,
      });
    });
    this.filters.push(filtros);
  }

  /**
   * Añade un filtro de producto a la lista.
   * @param atr
   */
  private formatFilters(atr: IFilters): void {
    const atributos = getValidFilters(atr);

    atributos.map((r) => {
      r.values = r.values.sort((a, b) => a.localeCompare(b));

      let collapsed = true;
      const field = 'filter_' + r.name;
      // revisamos el filtro de la url y lo expandimos
      const resultado =
        Object.keys(this.filterQuery).find((item) => {
          if (field === item) {
            return true;
          } else {
            return false;
          }
        }) || false;
      if (resultado) {
        collapsed = false;
      }
      const filtro: IProductFilterCheckbox = {
        name: r.name,
        type: 'checkbox',
        collapsed,
        options: {
          items: [],
        },
      };
      r.values.map((value: string) => {
        let checked = false;
        // revisamos el valor para marcarlo
        if (resultado) {
          const valueFilter = this.filterQuery[resultado];
          if (valueFilter === value) {
            checked = true;
          }
        }
        filtro.options.items.push({
          label: value,
          checked,
          count: 10,
          disabled: false,
        });
      });
      this.filters.push(filtro);
      // if(r.name === this.ancho_attribute && !this.filterQuery['filter_APLICACION CADENA']) this.values_anchos = filtro.options.items.map(x => x.label)
      // if(['APLICACION CADENA'].includes(r.name) && !this.filterQuery['filter_APLICACION CADENA']) this.aplicacion_cadenas = filtro.options.items.map(x => x.label)
      if (r.name === this.ancho_attribute) {
        this.values_anchos = filtro.options.items.map((x) => x.label);
        this.orderAnchos();
      }
      if (['APLICACION CADENA'].includes(r.name))
        this.aplicacion_cadenas = filtro.options.items.map((x) => x.label);
      if (
        this.filterQuery['filter_APLICACION CADENA'] &&
        this.viewFilterChain
      ) {
        this.completeFilterChain();
        this.isActiveFilterAplicacionCadena = true;
      } else this.isActiveFilterAplicacionCadena = false;
    });
  }

  /**
   * Obtener query params que solo correspondan a los filtros y no a tienda oficial.
   */
  private getFiltersQuery(params: Params): Params {
    if (!params) return {};
    let clonedParams = { ...params };
    if ('tiendaOficial' in clonedParams) {
      delete clonedParams['tiendaOficial'];
    }
    return clonedParams;
  }

  /**
   * Cargar productos al hacer scroll.
   * @param page
   */
  onInfiniteScroll(page: number): void {
    this.filters = [];
    this.parametrosBusqueda.page = page;
    this.currentPage = page;
    this.cargarCatalogoProductos(this.parametrosBusqueda, '', true);
  }

  updateFilters(filtersObj: any): void {
    let filters = filtersObj.selected;
    // const url = this.router.url.split('?')[0];
    const url = this.decodedUrl(this.router.url.split('?')[0]);
    filters = this.armaQueryParams(filters);
    this.router.navigate([url], { queryParams: filters });
  }

  clearCategory(): void {
    let queryParams = {};
    queryParams = this.armaQueryParams(queryParams);
    if (this.patentVehicle && this.siiCodeVehicle)
      this.router.navigate([
        '/',
        'inicio',
        'productos',
        'vehicle',
        this.patentVehicle,
        this.siiCodeVehicle,
      ]);
    if (!this.textToSearch) {
      this.removableCategory = [];
    } else {
      this.removableCategory = [];
      this.router.navigate(['/', 'inicio', 'productos', this.textToSearch], {
        queryParams,
      });
    }
  }

  clearAll(): void {
    let queryParams = {};
    queryParams = this.armaQueryParams(queryParams);
    if (this.patentVehicle && this.siiCodeVehicle)
      this.router.navigate([
        '/',
        'inicio',
        'productos',
        'vehicle',
        this.patentVehicle,
        this.siiCodeVehicle,
      ]);
    if (!this.textToSearch) {
      this.removableCategory = [];
    } else {
      this.removableCategory = [];
      this.router.navigate(['/', 'inicio', 'productos', this.textToSearch], {
        queryParams,
      });
    }
  }

  private armaQueryParams(queryParams: any) {
    if (this.marca_tienda)
      queryParams = {
        ...queryParams,
        ...{ filter_MARCA: this.marca_tienda, tiendaOficial: 1 },
      };
    return queryParams;
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [];
    if (this.paramsCategory.firstCategory) {
      const category = this.paramsCategory.firstCategory.replaceAll(/-/g, ' ');
      this.breadcrumbs.push({
        label: this.capitalize.transform(category),
        url: [
          '/',
          'inicio',
          'productos',
          this.textToSearch,
          'categoria',
          this.paramsCategory.firstCategory,
        ],
      });
    }

    if (this.paramsCategory.secondCategory) {
      const category = this.paramsCategory.secondCategory.replaceAll(
        /-/g,
        ' '
      );
      this.breadcrumbs.push({
        label: this.capitalize.transform(category),
        url: [
          '/',
          'inicio',
          'productos',
          this.textToSearch,
          'categoria',
          this.paramsCategory.firstCategory,
          this.paramsCategory.secondCategory,
        ],
      });
    }

    if (this.paramsCategory.thirdCategory) {
      const category = this.paramsCategory.thirdCategory.replaceAll(/-/g, ' ');
      this.breadcrumbs.push({
        label: this.capitalize.transform(category),
        url: [
          '/',
          'inicio',
          'productos',
          this.textToSearch,
          'categoria',
          this.paramsCategory.firstCategory,
          this.paramsCategory.secondCategory,
          this.paramsCategory.thirdCategory,
        ],
      });
    }
  }

  setFilteState(state: any): void {
    this.visibleFilter = state;
  }

  positionScroll(event: any): void {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.scrollPosition = event.srcElement.children[0].scrollTop;
  }

  //Definicion de meta Información para optimización del SEO
  private getDetalleSeoCategoria(category: string): void {
    const meta = CATEGORIES_METADATA[category] || {
      title: 'Productos en Categoría ' + category,
      description: 'Productos en Categoría ' + category,
      keywords: category.replace(/(\b(\w{1,3})\b(\s|$))/g, ''),
    };

    this.seoService.generarMetaTag(meta);
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(location.href);
    }
    if (isPlatformServer(this.platformId)) {
      this.canonicalService.setCanonicalURL(
        environment.canonical + this.router.url
      );
    }
  }

  /**
   * Establecer ordenamiento y obtener productos.
   * @param sortType
   */
  setSort(sortType: string): void {
    if (this.siiCodeVehicle !== '' && this.patentVehicle !== '') {
      let category = this.route.snapshot.paramMap.get('nombre') || '';
      this.getProductsByVehicle(
        this.route.snapshot.paramMap.get('SIICode') || '',
        this.route.snapshot.paramMap.get('patent') || '',
        category,
        sortType
      );
    } else {
      this.parametrosBusqueda.order = sortType;
      this.cargarCatalogoProductos(
        this.parametrosBusqueda,
        this.textToSearch,
        false
      );
    }
  }

  decodedUrl(cadena: string) {
    return decodeURIComponent(cadena);
  }

  /**
   * Obtener productos por patente y código SII de vehiculo.
   * @param SIICode
   * @param patent
   */
  getProductsByVehicle(
    SIICode: string,
    patent: string,
    category?: string,
    order?: string
  ): void {
    this.isInitialLoading = true;
    this.vehicleService.getProductsByVehicle(patent, SIICode).subscribe({
      next: (filters) => {
        let skus = filters.reduce((acc, el) => {
          acc.push(...el.skus.filter(Boolean));
          return acc;
        }, [] as string[]);
        skus = [...new Set(skus)];

        const { code: branchCode } =
          this.geolocationService.getSelectedStore();
        const parametros = {
          branchCode,
          category,
          word: this.textToSearch,
          location: this.preferences.deliveryAddress?.city
            ? this.preferences.deliveryAddress?.city
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            : '',
          pageSize: this.pageSize,
          documentId: this.session.documentId,
          showPrice: 1,
        };
        this.removableFilters = this.filterQuery;
        this.parametrosBusqueda = {
          ...parametros,
          ...this.filterQuery,
          skus,
        };
        this.parametrosBusqueda.page = this.currentPage;
        if (order) this.parametrosBusqueda.order = order;
        this.vehicleService
          .searchVehicleFilters(this.parametrosBusqueda)
          .subscribe({
            next: (res: any) => {
              this.removableCategory = [];
              if (this.parametrosBusqueda.category) {
                const category = this.parametrosBusqueda.category.replaceAll(
                  /-/g,
                  ' '
                );
                this.removableCategory.push({
                  value: this.parametrosBusqueda.category,
                  text: this.capitalize.transform(category),
                });
                this.filtrosOculto = false;
              }
              this.isScrollLoading = false;
              this.isInitialLoading = false;
              this.products = res.articles;
              this.PagTotalRegistros = res.totalResult;
              this.filters = [];
              this.formatVehicleCategories(
                res.categoriesTree,
                res.levelFilter
              );
              this.formatFilters(res.filters);
            },
            error: (err) => {
              console.log('gg', err);
            },
          });
      },
      error: (err) => {
        console.log('Ha ocurrido un error al obtener productos: ', err);
      },
    });
  }

  /**
   * Añade un filtro de categoría a la lista de filtro vehiculos.
   * @param categorias
   * @param levelFilter
   */
  private formatVehicleCategories(
    categorias: ICategoriesTree[],
    levelFilter: number
  ): void {
    let collapsed = false;
    if (this.parametrosBusqueda.category !== '') {
      collapsed = false;
    }

    const filtros: ProductFilterCategory = {
      type: 'categories',
      name: 'CATEGORÍAS',
      collapsed,
      options: {
        items: [],
      },
    };
    this.levelCategories = categorias;
    let queryParams = {};
    queryParams = this.armaQueryParams(queryParams);

    this.levelCategories.map((lvl1) => {
      filtros.options.items?.push({
        type: 'parent',
        count: lvl1.count,
        name: lvl1.name,
        url: [
          '/',
          'inicio',
          'productos',
          'vehicle',
          this.patentVehicle,
          this.siiCodeVehicle,
          lvl1.slug,
        ],
        open: [1, 2, 3].includes(levelFilter),
        children: lvl1.children?.map((lvl2) => {
          return {
            type: 'parent',
            count: lvl2.count,
            name: lvl2.name,
            url: [
              '/',
              'inicio',
              'productos',
              'vehicle',
              this.patentVehicle,
              this.siiCodeVehicle,
              lvl2.slug,
            ],
            open: levelFilter == 2 || levelFilter == 3,
            children: lvl2.children?.map((lvl3: any) => {
              return {
                type: 'parent',
                count: lvl3.count,
                name: lvl3.name,
                url: [
                  '/',
                  'inicio',
                  'productos',
                  'vehicle',
                  this.patentVehicle,
                  this.siiCodeVehicle,
                  lvl3.slug,
                ],
                open: levelFilter == 3,
                queryParams,
              };
            }),
            queryParams,
          };
        }),
        queryParams,
      });
    });
    this.filters.push(filtros);
  }

  //* Logica para el filtrador de cadenas 'CADENA ANCHO - CADENA PERFIL - CADENA ARO - APLICACION CADENA'

  orderAnchos() {
    // let anchos_number = this.values_anchos.map(x => Number(x))
    let anchos_number = this.anchos.map((x) => Number(x));
    // this.values_anchos = anchos_number.sort((a,b)=> a - b).map(x => x.toString())
    this.anchos = anchos_number.sort((a, b) => a - b).map((x) => x.toString());
  }

  selectAncho(value: string) {
    this.select_perfil = null;
    this.select_aro = null;
    let valor_electo = value;
    let anchos = [];
    for (let cadena of this.aplicacion_cadenas) {
      let x = cadena.substring(0, valor_electo.length);
      if (x === valor_electo) {
        let existe = anchos.findIndex((y) => y.ancho === valor_electo);
        let resto = cadena.substring(valor_electo.length, cadena.length);
        if (existe === -1) {
          let p: any = {
            ancho: valor_electo,
            perfiles_aux: [],
            perfiles: [],
          };
          p.perfiles_aux.push(resto);
          anchos.push(p);
        } else anchos[existe].perfiles_aux.push(resto);
      }
    }

    for (let ancho of anchos) {
      for (let perfil_aux of ancho.perfiles_aux) {
        let o = perfil_aux.substring(0, 1);
        if (o === '/') {
          let o2 = perfil_aux.substring(1, perfil_aux.length);
          let o2_split = o2.split('R');
          let existe = ancho.perfiles.findIndex(
            (y: any) => y.perfil === o2_split[0]
          );
          if (existe === -1) {
            let pe: any = {
              perfil: o2_split[0],
              aros: [],
            };
            pe.aros.push(o2_split[1]);
            ancho.perfiles.push(pe);
          } else {
            ancho.perfiles[existe].aros.push(o2_split[1]);
          }
        } else {
          let k = perfil_aux.split('R');
          if (k[0] === '') {
            let existe = ancho.perfiles.findIndex(
              (y: any) => y.perfil === 'SIN PERFIL'
            );
            if (existe === -1) {
              let pee: any = {
                perfil: 'SIN PERFIL',
                aros: [],
              };
              pee.aros.push(k[1]);
              ancho.perfiles.push(pee);
            } else {
              ancho.perfiles[existe].aros.push(k[1]);
            }
          }
        }
      }
    }
    if (anchos[0]?.perfiles) this.values_perfiles = anchos[0].perfiles;
  }

  selectPerfil(value: string) {
    this.select_aro = null;
    let select_value = value;
    let index = this.values_perfiles.findIndex(
      (x) => x.perfil === select_value
    );
    if (index != -1) {
      this.values_aros = this.values_perfiles[index].aros;
    }
  }

  filterChain() {
    let filterObj: any = {};
    let params = {
      tireWidth: this.select_ancho,
      tireProfile: this.select_perfil,
      tireHoop: this.select_aro,
    };
    this.customerService
      .registerSearchChainFilter(this.session.documentId, params)
      .subscribe();
    if (this.select_perfil === 'SIN PERFIL') {
      let filter_aplicacion_cadena = `${this.select_ancho}R${this.select_aro}`;
      filterObj.selected = {
        'filter_APLICACION CADENA': filter_aplicacion_cadena,
      };
      this.updateFilters(filterObj);
    } else {
      let filter_aplicacion_cadena = `${this.select_ancho}/${this.select_perfil}R${this.select_aro}`;
      filterObj.selected = {
        'filter_APLICACION CADENA': filter_aplicacion_cadena,
      };
      this.updateFilters(filterObj);
    }
  }

  cleanFilterChain() {
    this.select_ancho = null;
    this.select_perfil = null;
    this.select_aro = null;
    let filterObj: any = {};
    filterObj.selected = {};
    this.updateFilters(filterObj);
  }

  //* completa los campos de filtro cuando ya hay un filtro aplicado de APLICACION_CADENA
  completeFilterChain() {
    let aplicacion_cadena_aux = this.filterQuery['filter_APLICACION CADENA'];
    if (aplicacion_cadena_aux.split('/').length === 1) {
      let perfil_aro = aplicacion_cadena_aux.split('R');
      this.selectAncho(perfil_aro[0]);
      this.select_ancho = perfil_aro[0];
      this.select_perfil = 'SIN PERFIL';
      this.selectPerfil(this.select_perfil);
      this.select_aro = perfil_aro[1];
    } else if (aplicacion_cadena_aux.split('/').length === 2) {
      let ancho_perfil = aplicacion_cadena_aux.split('/');
      let perfil_aro = ancho_perfil[1].split('R');
      this.selectAncho(ancho_perfil[0]);
      this.select_ancho = ancho_perfil[0];
      this.select_perfil = perfil_aro[0];
      this.selectPerfil(this.select_perfil);
      this.select_aro = perfil_aro[1];
    }
  }

  viewImageChain() {
    this.viewImage = true;
  }
}
