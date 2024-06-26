// Angular
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  EventEmitter,
  TemplateRef,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// Env
import { environment } from '@env/environment';
// Rxjs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { IShoppingCartProductOrigin } from '@core/models-v2/cart/shopping-cart.interface';
// Services
import { RootService } from '../../services/root.service';
import { CurrencyService } from '../../services/currency.service';
import { isVacio } from '../../utils/utilidades';
import { SessionService } from '@core/services-v2/session/session.service';
import { CartService } from '@core/services-v2/cart.service';
import { CartV2Service } from '@core/services-v2/cart/cart.service';
import { MetaTag } from '@core/models-v2/article/article-response.interface';
import { GtmService } from '@core/utils-v2/gtm/gtm.service';
declare let dataLayer: any;

@Component({
  selector: 'app-product-card-b2c-ficha',
  templateUrl: './product-card-b2c-ficha.component.html',
  styleUrls: ['./product-card-b2c-ficha.component.scss'],
})
export class ProductCardB2cFichaComponent implements OnInit {
  readonly IMAGE_URL: string = environment.imageUrl;
  private destroy$: Subject<void> = new Subject();
  @Input() isOnProductPage!: boolean;
  @Input() home: boolean = false;
  @Input() cartClass!: boolean;
  @Input() cartpopver: boolean = false;
  preciosEscalas: any[] | undefined = [];
  @Output() precioEscalaEvent: EventEmitter<any> = new EventEmitter();

  @Input() popoverContent!: any;
  isVacio = isVacio;
  @ViewChild('modalEscala', { static: false }) modalEscala!: TemplateRef<any>;
  modalEscalaRef!: BsModalRef;
  @Input() set product(value: any) {
    this.productData = value;
    this.productData.name = this.root.limpiarNombres(this.productData.name);
    this.generateTags(this.productData.metaTags);
  }

  @Input() layout:
    | 'grid-sm'
    | 'grid-nl'
    | 'grid-lg'
    | 'list'
    | 'horizontal'
    | any
    | null = null;
  @Input() paramsCategory!: any;
  @Input() origen!: string[];
  @Input() tipoOrigen: string = '';
  session: ISession;
  porcentaje = 0;
  addingToCart = false;
  urlImage = environment.urlFotoOmnichannel;
  productData!: IArticle & { url?: SafeUrl; gimage?: SafeUrl };
  today = Date.now();

  cyber: number = 0;
  cyberMonday: number = 0;
  isOfficial: number = 0;
  imageOEM: string = '';

  constructor(
    private cd: ChangeDetectorRef,
    public root: RootService,
    public cart: CartService,
    private route: Router,
    public currency: CurrencyService,
    public sanitizer: DomSanitizer,
    private readonly _gtmService: GtmService,
    // Services V2
    private readonly sessionService: SessionService,
    public readonly cartService: CartV2Service
  ) {
    this.session = this.sessionService.getSession();
    if (this.route.url.includes('/especial/')) this.home = true;
  }

  ngOnInit(): void {
    this.currency.changes$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cd.markForCheck();
    });

    this.cargaPrecio();
    if (this.productData.priceInfo.hasScalePrice)
      this.preciosEscalas = this.productData.priceInfo.scalePrice;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateTags(tags: MetaTag[] | undefined) {
    if (tags) {
      tags.forEach((tag: MetaTag) => {
        if (tag.code === 'cyber')
          this.cyber = typeof tag.value === 'number' ? tag.value : 0;
        // else this.cyber = 0;
        if (tag.code === 'cyberMonday')
          this.cyberMonday = typeof tag.value === 'number' ? tag.value : 0;
        // else this.cyberMonday = 0;
        if (tag.code === 'official_store') {
          this.isOfficial = 1;
          this.imageOEM = typeof tag.value === 'string' ? tag.value : '';
        }
        // else this.isOfficial = 0;
      });
    }
  }

  cargaPrecio() {
    if (this.home) {
      if (
        this.productData.priceInfo.commonPrice ||
        0 > this.productData.priceInfo.price
      ) {
        this.porcentaje_descuento();
      }
      return;
    }

    //calcular porcentaje de descuento
    if (
      (this.productData.priceInfo.commonPrice || 0) >
      this.productData.priceInfo.customerPrice
    ) {
      this.porcentaje_descuento();
    }
    let url: string = this.root.product(
      this.productData.sku,
      this.productData.name,
      false
    );
    const gimage = `${this.IMAGE_URL}/img/watermarked/${this.productData.sku}-watermarked.jpg`;
    this.productData.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.productData.gimage =
      this.sanitizer.bypassSecurityTrustResourceUrl(gimage);
  }

  addToCart(): void {
    if (this.addingToCart) return;

    this._gtmService.addToCart(dataLayer, this.productData as IArticle);

    if (this.origen) {
      // Seteamos el origen de donde se hizo click a add cart.
      const origin: IShoppingCartProductOrigin = {
        origin: this.origen[0] ? this.origen[0] : '',
        subOrigin: this.origen[1] ? this.origen[1] : '',
        section: this.origen[2] ? this.origen[2] : '',
        recommended: this.origen[3],
        sheet: false,
        cyber: this.productData.cyber ? this.productData.cyber : 0,
      };
      this.productData.origin = origin;
    }

    this.addingToCart = true;
    this.cart.add(this.productData, 1).finally(() => {
      this.addingToCart = false;
      this.cd.markForCheck();
    });
  }

  porcentaje_descuento() {
    let descuento =
      (this.productData.priceInfo.commonPrice || 0) -
      this.productData.priceInfo.customerPrice;
    this.porcentaje = Math.round(
      (descuento / (this.productData.priceInfo.commonPrice || 1)) * 100
    );
  }

  verPreciosEscala(popover: NgbPopover) {
    popover.open();
  }
}
