// Angular
import {
  Component,
  PLATFORM_ID,
  Inject,
  OnInit,
  HostListener,
  DestroyRef,
  inject,
  Renderer2,
  ElementRef,
  ViewChild,
  Input,
} from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// Libs
import { ToastrService } from 'ngx-toastr';
import { OwlOptions } from 'ngx-owl-carousel-o';
// Rxjs
import { forkJoin } from 'rxjs';
// Envs
import { environment } from '@env/environment';
// Constants
import {
  CarouselDesktopOptions,
  CarouselMobileOptions,
} from './constants/carousel-config';
// Pipes
import { CapitalizeFirstPipe } from '../../../../shared/pipes/capitalize.pipe';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { IBreadcrumbItem } from './models/breadcrumb.interface';
import { ICategoryParams } from './models/category-params.interface';
import { Product } from '../../../../shared/interfaces/product';
import {
  IComparedAttribute,
  IComparedProduct,
} from '@core/services-v2/product/models/formatted-product-compare-response.interface';
import { IShoppingCartProductOrigin } from '@core/models-v2/cart/shopping-cart.interface';
import { INumberInputAction } from './models/number-input-action.interface';
// Services
import { RootService } from '../../../../shared/services/root.service';
import { SeoService } from '../../../../shared/services/seo/seo.service';
import { CanonicalService } from '../../../../shared/services/canonical.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { ArticleService } from '@core/services-v2/article.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { BreadcrumbUtils } from './services/breadcrumb-utils.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';
import { CartV2Service } from '@core/services-v2/cart/cart.service';
import { ProductPriceApiService } from '@core/services-v2/product-price/product-price.service';
import { IReviewsResponse } from '@core/models-v2/article/review-response.interface';
import { CartService } from '@core/services-v2/cart.service';

declare let fbq: any;

@Component({
  selector: 'app-page-product',
  templateUrl: './page-product.component.html',
  styleUrls: ['./page-product.component.scss'],
})
export class PageProductComponent implements OnInit {
  @ViewChild('ancla') _ancla!: ElementRef;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  product!: IArticleResponse;
  recommendedProducts: IArticleResponse[] = [];
  matrixProducts: IArticleResponse[] = [];
  relatedProducts: IArticleResponse[] = [];
  matriz: IComparedProduct[] = [];
  comparacion: IComparedAttribute[] = [];

  minItems = 5;
  stock: boolean = true;
  session!: ISession;
  isB2B!: boolean;
  origen: string[] = [];
  innerWidth: number;

  private paramsCategory!: ICategoryParams;
  breadcrumbs: IBreadcrumbItem[] = [];

  relleno: any[] = [1, 2, 3, 4, 5, 6];
  carouselOptions: OwlOptions;
  carrouselOptionsMobile: OwlOptions;

  acordion = [
    {
      abierto: false,
    },
    {
      abierto: false,
    },
    {
      abierto: false,
    },
  ];

  puntoQuiebre: number = 576;
  showMobile: boolean = false;

  tiendaSeleccionada!: ISelectedStore;
  IVA = environment.IVA;
  addingToCart!: boolean;
  preferenciaCliente!: ICustomerPreference;
  showNetPrice!: boolean;
  evaluationSummary!: IReviewsResponse;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public root: RootService,
    private capitalize: CapitalizeFirstPipe,
    private seoService: SeoService,
    private canonicalService: CanonicalService,
    private renderer: Renderer2,
    private el: ElementRef,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly articleService: ArticleService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly customerPreferenceStorage: CustomerPreferencesStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService,
    private readonly productPriceApiService: ProductPriceApiService,
    private readonly cartService: CartV2Service,
    private readonly cartApiService: CartService
  ) {
    this.carouselOptions = CarouselDesktopOptions;
    this.carrouselOptionsMobile = CarouselMobileOptions;
    this.tiendaSeleccionada = this.geolocationService.getSelectedStore();
    this.preferenciaCliente = this.customerPreferenceStorage.get();
    this.session = this.sessionService.getSession();
    this.isB2B = this.sessionService.isB2B();
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.setIsMobile();
  }

  ngOnInit(): void {
    this.setIsMobile();
    this.onRouteParamsChange();
    this.onSelectedStoreChange();
    this.onCustomerAddressChange();
    this.onSessionChange();
  }

  private onSelectedStoreChange(): void {
    this.geolocationService.selectedStore$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (selectedStore) => {
          if (!this.product) return;
          this.tiendaSeleccionada = selectedStore;
          this.refreshProductPrice(this.product);
          this.getMixProducts(this.product.sku);
        },
      });
  }

  private onCustomerAddressChange(): void {
    this.customerAddressService.customerAddress$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((customerAddress) => {
        if (!this.product) return;
        this.preferenciaCliente.deliveryAddress = customerAddress;
        this.refreshProductPrice(this.product);
        this.getMixProducts(this.product.sku);
      });
  }

  private onSessionChange(): void {
    this.authStateService.session$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.session = this.sessionService.getSession();
        this.customerPreferenceService.getCustomerPreferences().subscribe({
          next: (preferences) => {
            if (!this.product) return;
            this.preferenciaCliente = preferences;
            this.refreshProductPrice(this.product);
            this.getMixProducts(this.product.sku);
          },
        });
      });
  }

  private onRouteParamsChange(): void {
    this.route.params.subscribe((params) => {
      // Seteamos el origen del ingreso a la ficha del producto.
      const origenHistory = this.cartService.getProductOrigin();
      this.origen = origenHistory.length ? origenHistory : ['link', ''];

      this.root.hideModalRefBuscador();
      if (params['id']) {
        this.paramsCategory = {
          firstCategory: params['firstCategory'] || '',
          secondCategory: params['secondCategory'] || '',
          thirdCategory: params['thirdCategory'] || '',
        };
        const sku = params['id'].split('-').reverse()[0];
        this.getProductDetail(sku);
        this.getMixProducts(sku);
      } else {
        this.router.navigate(['/inicio/**']);
      }
    });
  }

  setIsMobile(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showMobile = window.innerWidth < this.puntoQuiebre;
    }
  }

  /**
   * Obtener detalle del producto.
   */
  private getProductDetail(sku: string): void {
    const { documentId } = this.sessionService.getSession();
    const selectedStore = this.geolocationService.getSelectedStore();
    if (!selectedStore) {
      this.toastr.error(
        `Ha ocurrido un error al obtener información del producto.`
      );
      return;
    }

    this.articleService
      .getArticleDataSheet({
        sku,
        documentId,
        branchCode: selectedStore.code,
        location:
          this.preferenciaCliente?.deliveryAddress?.location ||
          selectedStore.city,
      })
      .subscribe((productDetail) => {
        if (!productDetail) {
          this.toastr.error(
            `Ha ocurrido un error al obtener información del producto.`
          );
          return;
        }
        // FIXME: corregir esto..
        // productDetail.chassis = productDetail.chassis || '';
        this.product = productDetail;
        this.stock = productDetail.stockSummary.companyStock > 0;
        this.setMetaTag(this.product);
        this.breadcrumbs = BreadcrumbUtils.setBreadcrumbs(
          this.paramsCategory,
          productDetail.name
        );
        // this.productFacebook(this.product);
      });
  }

  /**
   * Establecer metatag para funcionalidades de SEO.
   * @param product
   */
  setMetaTag(product: IArticle): void {
    const slug = this.root.product(product.sku, product.name);
    const image = product.images?.['250']?.length
      ? product.images['250'][0]
      : this.root.returnUrlNoImagen();

    const nombre = this.root.limpiarNombres(product.name);
    const descripcion = this.root.limpiarNombres(product.description);
    const descripcionFull = `${nombre} - ${descripcion}`;

    this.seoService.generarMetaTag({
      title: this.capitalize.transform(nombre),
      description: this.capitalize.transform(descripcionFull),
      image,
      imageAlt: 'La imagen contiene nuestro producto: ' + product.description,
      imageType: 'image/jpeg',
      type: 'product',
      keywords: descripcionFull,
      slug,
    });

    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(location.href);
    }

    if (isPlatformServer(this.platformId)) {
      this.canonicalService.setCanonicalURL(
        environment.canonical + this.router.url
      );
    }
  }

  // activar view content para el producto de facebook
  productFacebook(product: Product): void {
    fbq('track', 'ViewContent', {
      brand: product.marca,
      id: product.sku,
      content_ids: product.sku,
      content_name: this.capitalize.transform(product.nombre),
      content_type: 'product',
      value: product.precioCliente,
      currency: 'CLP',
    });
  }

  /**
   * Obtener sugerencias de productos.
   * @param sku
   */
  private getMixProducts(sku: string): void {
    const selectedStore = this.geolocationService.getSelectedStore();

    const params = {
      sku,
      documentId: this.session.documentId,
      branchCode: selectedStore.code,
      location: this.preferenciaCliente?.deliveryAddress?.location || '',
    };

    forkJoin([
      this.articleService.getMatrixProducts(params),
      this.articleService.getRelatedProducts(params),
      this.articleService.getProductCompareMatrix(params),
      this.articleService.getRecommendedProducts(params),
    ]).subscribe(
      ([
        matrixProducts,
        relatedProducts,
        comparedProducts,
        recommendedProducts,
      ]) => {
        this.matrixProducts = matrixProducts;
        this.relatedProducts = relatedProducts;
        this.recommendedProducts = recommendedProducts;
        this.matriz = comparedProducts.products;
        this.comparacion = comparedProducts.differences;
      }
    );
  }

  abrirTabEvaluacion(): void {
    if (isPlatformBrowser(this.platformId)) {
      // $('#evaluacion').tab('show'); // este falta ver bien
      this.removeClass('detallesTecnicos-tab', 'active');
      this.addClass('evaluacion-tab', 'active');

      this.removeClass('detallesTecnicos', 'active');
      this.removeClass('detallesTecnicos', 'show');
      this.addClass('evaluacion', 'active');
      this.addClass('evaluacion', 'show');
    }
    this.renderer
      .selectRootElement(this._ancla.nativeElement, true)
      .scrollIntoView();
  }

  private removeClass(elementId: string, className: string) {
    const element = this.renderer.selectRootElement(`#${elementId}`, true);
    this.renderer.removeClass(element, className);
  }

  private addClass(elementId: string, className: string) {
    const element = this.renderer.selectRootElement(`#${elementId}`, true);
    this.renderer.addClass(element, className);
  }

  /**
   * Actualiza la información de precio del producto actual.
   * @param product
   */
  private refreshProductPrice(product: IArticleResponse): void {
    this.productPriceApiService
      .getProductPrice({
        documentId: this.session.documentId,
        sku: product.sku,
        branchCode: this.tiendaSeleccionada.code,
      })
      .subscribe({
        next: (priceInfo) => (product.priceInfo = priceInfo),
      });
  }

  /**
   * Actualiza información de precio de un producto comparado en la matríz, según su cantidad actual.
   * @param product
   * @param inputAction
   * @returns
   */
  refreshComparedProductPrice(
    product: IComparedProduct,
    inputAction?: INumberInputAction
  ): void {
    if (!product.quantity) {
      product.quantity = 1;
      return;
    }

    product.quantity =
      inputAction === '+' ? product.quantity + 1 : product.quantity - 1;

    this.productPriceApiService
      .getProductPrice({
        documentId: this.session.documentId,
        sku: product.sku,
        branchCode: this.tiendaSeleccionada.code,
        quantity: product.quantity,
      })
      .subscribe({
        next: (priceInfo) => (product.priceInfo = priceInfo),
      });
  }

  /**
   * Añadir producto de la matriz al carro de compras.
   * @param producto
   * @returns
   */
  addComparedProductToCart(product: IComparedProduct): void {
    if (!this.product || this.addingToCart || !product.quantity) return;
    if (!this.session) {
      this.toastr.warning(
        'Debe iniciar sesion para poder comprar',
        'Información'
      );
      return;
    }

    this.addingToCart = true;
    if (this.origen) {
      const origin: IShoppingCartProductOrigin = {
        origin: this.origen[0] || '',
        subOrigin: this.origen[1] || '',
        section: this.origen[2] || '',
        recommended: this.origen[3] || '',
        sheet: true,
        cyber: this.product.cyber || 0,
      };
      product.origin = origin;
    }
    this.cartApiService.add(product, product.quantity).finally(() => {
      this.addingToCart = false;
    });
  }
  /**
   * Obtiene el resumen de evaluaciones del producto. Desde el componente de comentarios.
   */
  handleEvaluationSummary(value: IReviewsResponse) {
    this.evaluationSummary = value;
  }
}
