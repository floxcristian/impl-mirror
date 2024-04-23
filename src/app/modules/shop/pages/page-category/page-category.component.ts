// Angular
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
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
import { IGNORED_FILTERS } from './constants/ignored-filters';
// Pipes
import { CapitalizeFirstPipe } from '../../../../shared/pipes/capitalize.pipe';
// Services
import { RootService } from '../../../../shared/services/root.service';
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
import { getOriginUrl } from './utils/util.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';

@Component({
  selector: 'app-grid',
  templateUrl: './page-category.component.html',
  styleUrls: ['./page-category.component.scss'],
})
export class PageCategoryComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  session: ISession;
  preferences!: ICustomerPreference;

  // Examinando params...
  products: IArticleResponse[] = [];
  filters: IProductFilter[] = [];
  filterQuery: any;
  removableFilters: Params = [];
  removableCategory: ICategory[] = [];
  breadcrumbs: any[] = [];
  productosTemp: string[] = [];
  // Paginacion
  totalPaginas: number = 0;
  PagDesde: number = 0;
  PagHasta: number = 0;
  PagTotalRegistros: number = 0;
  pageSize: number = 12;
  cargandoCatalogo: boolean = true;
  cargandoProductos: boolean = false;
  currentPage: number = 1;

  // Filtro
  parametrosBusqueda!: IElasticSearch;
  textToSearch: string = '';
  levelCategories: ICategoriesTree[] = [];
  level: number = 0;
  marca_tienda: string = '';
  paramsCategory = {
    firstCategory: '',
    secondCategory: '',
    thirdCategory: '',
  };

  filtersIgnored = IGNORED_FILTERS;

  visibleFilter!: boolean;
  filtrosOculto: boolean = true;
  scrollPosition!: number;
  innerWidth: number;
  origen: string[] = [];
  banners!: IBanner | null;
  config: IConfig;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private root: RootService,
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
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.session = this.sessionService.getSession();
    this.preferences = this.customerPreferenceStorage.get();
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
    this.authStateService.session$.subscribe((session) => {
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
    this.geolocationService.selectedStore$.subscribe(({ code }) => {
      this.filters = [];
      this.parametrosBusqueda.branchCode = code || '';
      this.cargarCatalogoProductos(this.parametrosBusqueda, '');
    });
  }

  private onRouterParamsChange(): void {}

  ngOnInit(): void {
    let metadataCount = 0;
    this.route.queryParams.subscribe((query) => {
      this.filters = [];
      // Seteamos el origen del buscador
      this.setOrigenes();
      if (query['tiendaOficial']) {
        this.marca_tienda = query['filter_MARCA'] || '';
        if (this.marca_tienda) {
          let banner_local: any = this.localS.get('bannersMarca');
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
        const meta = {
          title: marca,
          description: 'Productos marca "title"',
          keywords: 'repuestos ' + marca,
        };
        this.seoService.generarMetaTag(meta);
        metadataCount++;
      }

      this.filterQuery = this.getFiltersQuery(query);

      if (
        typeof this.parametrosBusqueda !== 'undefined' &&
        (this.parametrosBusqueda.word ===
          this.route.snapshot.paramMap.get('busqueda') ||
          this.route.snapshot.paramMap.get('busqueda') === 'todos')
      ) {
        const params: any = this.cleanFilterSearchParams(
          this.parametrosBusqueda
        );

        this.removableFilters = this.filterQuery;

        this.parametrosBusqueda = {
          ...params,
          ...this.filterQuery,
        };
        this.parametrosBusqueda.page = this.currentPage;
        this.cargarCatalogoProductos(this.parametrosBusqueda, '');
      }
    });

    this.route.params.subscribe((params) => {
      this.filters = [];
      if (
        params['busqueda'] &&
        params['metodo'] &&
        params['metodo'] === 'categoria'
      ) {
        // 02. Categoria
        // this.textToSearch = this.decodedUrl(params['busqueda'] === 'todos' ? '' : params['busqueda']);
        this.textToSearch = params['busqueda'] === 'todos' ? '' : params['busqueda'];

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

        let parametros = {};
        const tiendaSeleccionada = this.geolocationService.getSelectedStore();
        const sucursal = tiendaSeleccionada.code;
        if (this.session.documentId === '0') {
          parametros = {
            category: category,
            word: this.textToSearch,
            branchCode: sucursal,
            pageSize: this.pageSize,
            documentId: this.session.documentId,
            showPrice: 1,
          };
        } else {
          parametros = {
            category: category,
            word: this.textToSearch,
            location: this.preferences.deliveryAddress?.city
              ? this.preferences.deliveryAddress?.city
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              : '',
            branchCode: sucursal,
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
      } else {
        // 03. Búsqueda

        if (params['busqueda']) {
          // this.textToSearch = this.decodedUrl(params['busqueda'] === 'todos' ? '' : params['busqueda']);
          this.textToSearch = params['busqueda'] === 'todos' ? '' : params['busqueda'];
          let parametros = {};
          const tiendaSeleccionada =
            this.geolocationService.getSelectedStore();
          if (this.session.documentId === '0') {
            parametros = {
              category: '',
              word: this.textToSearch,
              branchCode: tiendaSeleccionada.code,
              pageSize: this.pageSize,
              documentId: this.session.documentId,
              showPrice: 1,
            };
          } else {
            parametros = {
              category: '',
              word: this.textToSearch,
              location: this.preferences.deliveryAddress?.city
                ? this.preferences.deliveryAddress?.city
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                : '',
              pageSize: this.pageSize,
              branchCode: tiendaSeleccionada?.code,
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
            if (this.textToSearch.trim() !== '') {
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
            const kwds = this.textToSearch.replace(
              /(\b(\w{1,3})\b(\s|$))/g,
              ''
            );

            const meta = {
              title: this.textToSearch,
              description: this.textToSearch,
              keywords: kwds,
            };
            this.seoService.generarMetaTag(meta);
            metadataCount++;
          }
        }
      }
    });

    this.onSessionChange();
    this.onSelectedStoreChange();
    this.onCustomerAddressChange();
  }

  private cleanFilterSearchParams(params: any) {
    delete params.chassis;
    delete params.marca;
    delete params.modelo;
    delete params.anio;

    const filtered = Object.keys(params)
      .filter((key) => {
        if (key.startsWith('filter_') === false) {
          return true;
        } else {
          return false;
        }
      })
      .reduce((obj: any, key) => {
        obj[key] = params[key];
        return obj;
      }, {});

    return filtered;
  }

  private cargarCatalogoProductos(
    parametros: any,
    texto: string,
    scroll = false
  ): void {
    this.parametrosBusqueda = parametros;
    this.removableCategory = [];
    this.filtrosOculto = true;

    if (texto.includes('SKU:')) {
      texto = texto.substring(4, texto.length);
      parametros.word = texto;
      this.productosTemp = texto.split(' ');
    }
    if (this.parametrosBusqueda.category !== '') {
      const cat = this.root.replaceAll(
        this.parametrosBusqueda?.category,
        /-/g
      );
      this.removableCategory.push({
        value: this.parametrosBusqueda.category,
        text: this.capitalize.transform(cat),
      });
      this.filtrosOculto = false;
    }

    this.parametrosBusqueda.documentId = this.session.documentId;
    if (this.preferences && this.preferences.deliveryAddress) {
      this.parametrosBusqueda.location = this.preferences.deliveryAddress.city
        ? this.preferences.deliveryAddress.city
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        : '';
    }

    if (!scroll) {
      this.parametrosBusqueda.page = 1;
      this.currentPage = 1;
      this.cargandoCatalogo = true;
    } else {
      this.cargandoProductos = true;
    }

    this.articleService.search(parametros).subscribe({
      next: (res) => {
        this.SetProductos(res, scroll);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private SetProductos(r: ISearchResponse, scroll = false): void {
    this.cargandoCatalogo = false;
    this.cargandoProductos = false;

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
      if (this.products.length == 0) this.products = r.articles;
    }
    if (this.products.length == 0) this.breadcrumbs = [];
    this.formatoPaginacion(r);
    this.filters = [];
    this.formatCategories(r.categoriesTree, r.levelFilter);
    this.formatFilters(r.filters);
    this.agregarMatrizProducto(r.articles);
    if (r.banners && r.banners.length > 0) {
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
  private formatFilters(atr: IFilters[]): void {
    const atributos = this.cleanFilters(atr);

    atributos?.map((r) => {
      r.values = (r.values as string[]).sort((a, b) => a.localeCompare(b));

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
    });
  }

  /**
   * Quita los atributos no mostrables.
   * @param atributos
   * @returns
   */
  private cleanFilters(atributos: IFilters[]) {
    const atributos2: any[] = [];
    if (typeof atributos === 'undefined') {
      return;
    }
    for (const key in atributos) {
      if (atributos.hasOwnProperty(key)) {
        const exist = this.filtersIgnored.includes(key.trim());
        const elements = atributos[key];

        if (!exist) {
          const obj = {
            name: key,
            values: elements,
          };
          atributos2.push(obj);
        }
      }
    }
    return atributos2;
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

  paginacionProductos(page: number): void {
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

    if (this.textToSearch === '') {
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

    if (this.textToSearch === '') {
      this.removableCategory = [];
    } else {
      this.removableCategory = [];
      this.router.navigate(['/', 'inicio', 'productos', this.textToSearch], {
        queryParams,
      });
    }
  }

  private armaQueryParams(queryParams: any) {
    if (this.marca_tienda !== '')
      queryParams = {
        ...queryParams,
        ...{ filter_MARCA: this.marca_tienda, tiendaOficial: 1 },
      };
    return queryParams;
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [];
    if (this.paramsCategory.firstCategory !== '') {
      const cat = this.root.replaceAll(
        this.paramsCategory.firstCategory,
        /-/g
      );
      this.breadcrumbs.push({
        label: this.capitalize.transform(cat),
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

    if (this.paramsCategory.secondCategory !== '') {
      const cat = this.root.replaceAll(
        this.paramsCategory.secondCategory,
        /-/g
      );
      this.breadcrumbs.push({
        label: this.capitalize.transform(cat),
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

    if (this.paramsCategory.thirdCategory !== '') {
      const cat = this.root.replaceAll(
        this.paramsCategory.thirdCategory,
        /-/g
      );
      this.breadcrumbs.push({
        label: this.capitalize.transform(cat),
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

  /**
   * Setea origen.
   */
  private setOrigenes(): void {
    let categoria = '';
    // getOriginUrl(this.route.snapshot.url[0], this.route.snapshot.params);
    // Si el Url tiene seteada la categoria, pero su busqueda no es 'todos' (no es Banner)
    if (
      this.route.snapshot.paramMap.get('nombre') &&
      this.route.snapshot.paramMap.get('busqueda') !== 'todos'
    ) {
      categoria = this.route.snapshot.paramMap.get('nombre') as string;
      this.origen = ['buscador', '', categoria, ''];
    } else {
      const urlParams = this.route.snapshot.url[0].path.split('-');
      //Si no existe categoria en la url y se accede desde el 'Ver más'
      if (urlParams[0] == 'HOME') {
        urlParams.splice(0, 1);
        this.origen = ['home', 'ver-mas', urlParams.join(' '), ''];
        //Si viene desde Banner
      } else if (urlParams[0] == 'todos') {
        urlParams.splice(0, 1);
        categoria = this.route.snapshot.paramMap.get('nombre') || '';
        this.origen = ['home', 'banner', categoria, ''];
      } else {
        this.origen = ['buscador', '', 'sinCategoria', ''];
      }
    }
    const origin2 = getOriginUrl(this.route.snapshot);
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

  setSort(event: any): void {
    this.parametrosBusqueda.order = event;
    let parametros: any = this.parametrosBusqueda;
    this.cargarCatalogoProductos(parametros, this.textToSearch, false);
  }

  decodedUrl(cadena: string) {
    return decodeURIComponent(cadena);
  }
}
