import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PageFlip, SizeType } from 'page-flip';
import { RootService } from '../../../../shared/services/root.service';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { environment } from '@env/environment';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { CatalogService } from '@core/services-v2/catalog.service';
import {
  IBody,
  ICatalog,
  ILeftSide,
  IRightSide,
} from '@core/models-v2/catalog/catalog-response.interface';
import { MetaTag } from '@core/models-v2/article/article-response.interface';
import { CartService } from '@core/services-v2/cart.service';
import { IConfig } from '@core/config/config.interface';
import { ConfigService } from '@core/config/config.service';

@Component({
  selector: 'app-page-ver-catalogo-flip',
  templateUrl: './page-ver-catalogo-flip.component.html',
  styleUrls: ['./page-ver-catalogo-flip.component.scss'],
})
export class PageVerCatalogoFlipComponent implements OnInit {
  readonly IMAGE_URL: string = environment.imageUrl;
  @ViewChild('demoBookExample') _demoBookExample!: ElementRef<HTMLElement>;
  pageFlip: any;
  pageTotal: number = 0;
  pageOrientation!: string;
  pageCurrent: number = 1;
  pageState: any;
  paginas: Array<any> = [];
  paginasMobile: Array<any> = [];
  articulos: Array<any> = [];
  portada!: string | undefined;
  contraPortada!: string | undefined;
  screenWidth: any;
  screenHeight: any;
  estado: boolean = true;
  cargandoCat = true;
  catalogo: IBody[] = [];
  skus!: Array<any>;
  dispositivo!: string;
  iva = true;
  IVA = environment.IVA;
  paginasTemp: Array<any> = [];
  tipoCatalogo: string = '';
  tags: any[] = [];
  rutCatalogo: string = '';
  Generico = false;
  nombreCliente: string | null = '';
  folio: any;
  propuesta: any;
  isLoadPrecio = false;
  config: IConfig;
  constructor(
    private localS: LocalStorageService,
    private router: Router,
    private toast: ToastrService,
    public root: RootService,
    private responsive: BreakpointObserver,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    public cart: CartService,
    private readonly sessionService: SessionService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly catalogService: CatalogService,
    public readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
  }

  getTags() {
    return this.localS.get('tags');
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.responsive
        .observe([
          Breakpoints.TabletPortrait,
          Breakpoints.HandsetPortrait,
          Breakpoints.WebPortrait,
          Breakpoints.WebLandscape,
          Breakpoints.Web,
        ])
        .subscribe((result) => {
          this.pageTotal = 0;
          this.paginas = [];
          this.paginasMobile = [];
          this.pageFlip = null;
          const breakpoints = result.breakpoints;
          if (breakpoints[Breakpoints.TabletPortrait]) {
            this.dispositivo = 'tablet';
          } else if (breakpoints[Breakpoints.HandsetPortrait]) {
            this.dispositivo = 'smartphone';
          } else if (
            breakpoints[Breakpoints.WebLandscape] ||
            breakpoints[Breakpoints.WebPortrait] ||
            breakpoints[Breakpoints.Web]
          ) {
            this.dispositivo = 'web';
          } else {
            this.dispositivo = 'tablet';
          }
        });
      this.validarParametros();
      this.screenWidth = isPlatformBrowser(this.platformId)
        ? window.innerWidth
        : 900;
      this.screenHeight = isPlatformBrowser(this.platformId)
        ? window.innerHeight
        : 900;
    }
  }

  async validarParametros() {
    let objeto: ICatalog | null = null;
    let id = null;
    let url = this.router.parseUrl(this.router.url);
    id = url.queryParams['id'];

    if (id) {
      this.catalogService.getCatalog(id).subscribe({
        next: async (res) => {
          if (res.data.proposalNumber != 0)
            this.propuesta = await this.catalogService.getProposal(
              res.data.proposalNumber
            );
          this.tipoCatalogo = res.data.catalogType;
          this.folio = res.data.proposalNumber;
          this.nombreCliente = res.data.name;

          if (this.nombreCliente === 'Catalogo para ') {
            this.Generico = true;
            this.nombreCliente = null;
          }
          if (this.tipoCatalogo === 'Automatico') {
            this.rutCatalogo = res.data.customerDocumentId;
          }
          if (res.data.netPrice) this.iva = !res.data.netPrice;
          this.skus = res.data.skus;
          this.catalogo = res.data.body;
          await this.establecerPrecio();
          await this.cargarMarcas(res.data);
          setTimeout(() => {
            this.loadFlip();
            this.cargandoCat = false;
            if (this.dispositivo === 'smartphone') {
              this.buscaTagsSmartphone(this.paginasMobile);
            } else {
              this.buscaTags(res.data?.body || []);
            }
          }, 1300);
        },
        error: (err) => {
          this.toast.error('Error, el catalogo no se encuentra disponible');
          this.router.navigate(['/', 'catalogos']);
          return;
        },
      });
    } else {
      objeto = this.localS.get(StorageKey.catalogo);
      if (!objeto) {
        this.toast.error('Error, el catalogo no se encuentra disponible');
        this.router.navigate(['/', 'catalogos']);
        return;
      } else {
        if (objeto.proposalNumber != 0)
          this.propuesta = await this.catalogService.getProposal(
            objeto.proposalNumber
          );
        this.tipoCatalogo = objeto.catalogType;
        this.folio = objeto.proposalNumber;
        this.nombreCliente = objeto.name;
        if (this.nombreCliente === 'Catalogo para ') {
          this.Generico = true;
          this.nombreCliente = null;
        }
        if (this.tipoCatalogo === 'Automatico') {
          this.rutCatalogo = objeto.customerDocumentId;
        }
        if (objeto.netPrice) this.iva = !objeto.netPrice;
        this.skus = objeto.skus;
        this.catalogo = objeto.body;
        await this.establecerPrecio();
        await this.cargarMarcas(objeto);
        setTimeout(() => {
          this.loadFlip();
          this.cargandoCat = false;
          if (this.dispositivo === 'smartphone') {
            this.buscaTagsSmartphone(this.paginasMobile);
          } else {
            this.buscaTags(objeto?.body || []);
          }
        }, 1300);
      }
    }
  }
  generateTag(tags: MetaTag[] | undefined, code: string) {
    if (tags) {
      let index = tags.findIndex((tag: MetaTag) => tag.code === code);
      if (index === -1) {
        return 0;
      } else {
        return this.isNumber(tags[index].value);
      }
    } else {
      return 0;
    }
  }

  isNumber(value: number | string) {
    if (typeof value === 'number') return value;
    else return 0;
  }
  async establecerPrecio() {
    let user = this.sessionService.getSession();
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();

    let params: any;
    if (this.tipoCatalogo == 'Automatico') {
      params = {
        branchCode: tiendaSeleccionada.code,
        documentId: this.rutCatalogo,
        skus: this.skus,
      };
    } else {
      params = {
        branchCode: tiendaSeleccionada.code,
        documentId: user.documentId,
        skus: this.skus,
      };
    }
    if (!this.propuesta) {
      this.catalogService.getCatalogsProductPrices(params).subscribe({
        next: (res) => {
          res.map((precio) => {
            this.catalogo.map((objeto: IBody) => {
              for (let objA of objeto.leftSide || []) {
                if (objA.products.type == 'producto') {
                  if (this.tipoCatalogo == 'Automatico') {
                    objA.products.rut = this.rutCatalogo;
                    if (
                      objA.products.product == precio.sku &&
                      this.rutCatalogo != '0'
                    ) {
                      objA.products.precioEsp = precio.priceInfo.customerPrice;
                      objA.products.precio = precio.priceInfo.commonPrice;
                    } else if (
                      objA.products.product == precio.sku &&
                      this.rutCatalogo == '0'
                    ) {
                      objA.products.precioEsp = precio.priceInfo.customerPrice;
                      objA.products.precio = precio.priceInfo.commonPrice;
                    }
                    if (objA.products.product == precio.sku) {
                      objA.products.precioEscala =
                        precio.priceInfo.hasScalePrice;
                      objA.products.preciosScal = precio.priceInfo.scalePrice;
                      objA.products.cyber = this.generateTag(
                        precio.metaTags,
                        'cyber'
                      );
                      objA.products.cyberMonday = this.generateTag(
                        precio.metaTags,
                        'cyberMonday'
                      );
                    }
                  } else {
                    objA.products.rut = user.documentId;
                    if (
                      objA.products.product == precio.sku &&
                      user.documentId != '0'
                    ) {
                      objA.products.precioEsp = precio.priceInfo.customerPrice;
                      objA.products.precio = precio.priceInfo.commonPrice;
                    } else if (
                      objA.products.product == precio.sku &&
                      user.documentId == '0'
                    ) {
                      objA.products.precioEsp = precio.priceInfo.customerPrice;
                      objA.products.precio = precio.priceInfo.commonPrice;
                    }
                    if (objA.products.product == precio.sku) {
                      objA.products.precioEscala =
                        precio.priceInfo.hasScalePrice;
                      objA.products.preciosScal = precio.priceInfo.scalePrice;
                      objA.products.cyber = this.generateTag(
                        precio.metaTags,
                        'cyber'
                      );
                      objA.products.cyberMonday = this.generateTag(
                        precio.metaTags,
                        'cyberMonday'
                      );
                    }
                  }
                }
              }
              for (let objB of objeto.rightSide || []) {
                if (objB.products.type == 'producto') {
                  if (this.tipoCatalogo == 'Automatico') {
                    objB.products.rut = this.rutCatalogo;
                    if (
                      objB.products.product == precio.sku &&
                      this.rutCatalogo != '0'
                    ) {
                      objB.products.precioEsp = precio.priceInfo.customerPrice;
                      objB.products.precio = precio.priceInfo.commonPrice;
                    } else if (
                      objB.products.product == precio.sku &&
                      this.rutCatalogo == '0'
                    ) {
                      objB.products.precioEsp = precio.priceInfo.customerPrice;
                      objB.products.precio = precio.priceInfo.commonPrice;
                    }
                    if (objB.products.product == precio.sku) {
                      objB.products.precioEscala =
                        precio.priceInfo.hasScalePrice;
                      objB.products.preciosScal = precio.priceInfo.scalePrice;
                      objB.products.cyber = this.generateTag(
                        precio.metaTags,
                        'cyber'
                      );
                      objB.products.cyberMonday = this.generateTag(
                        precio.metaTags,
                        'cyberMonday'
                      );
                    }
                  } else {
                    objB.products.rut = user.documentId;
                    if (
                      objB.products.product == precio.sku &&
                      user.documentId != '0'
                    ) {
                      objB.products.precioEsp = precio.priceInfo.customerPrice;
                      objB.products.precio = precio.priceInfo.commonPrice;
                    } else if (
                      objB.products.product == precio.sku &&
                      user.documentId == '0'
                    ) {
                      objB.products.precioEsp = precio.priceInfo.customerPrice;
                      objB.products.precio = precio.priceInfo.commonPrice;
                    }
                    if (objB.products.product == precio.sku) {
                      objB.products.precioEscala =
                        precio.priceInfo.hasScalePrice;
                      objB.products.preciosScal = precio.priceInfo.scalePrice;
                      objB.products.cyber = this.generateTag(
                        precio.metaTags,
                        'cyber'
                      );
                      objB.products.cyberMonday = this.generateTag(
                        precio.metaTags,
                        'cyberMonday'
                      );
                    }
                  }
                }
              }
            });
          });
          this.armaCatalogo();
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.catalogo.map((objeto: IBody) => {
        for (let objA of objeto.leftSide || []) {
          let propuestaPrecio = this.propuesta.data.articles.find(
            (x: any) => x.sku == objA.products.product
          );
          if (propuestaPrecio) {
            objA.products.precioEsp = propuestaPrecio.price.customerPrice;
            objA.products.precio = propuestaPrecio.price.price;
            if (propuestaPrecio.agreement)
              objA.products.cantidad =
                propuestaPrecio.agreement.minimumQuantity;
          }
        }
        for (let objB of objeto.rightSide || []) {
          let propuestaPrecio = this.propuesta.data.articles.find(
            (x: any) => x.sku == objB.products.product
          );
          if (propuestaPrecio) {
            objB.products.precioEsp = propuestaPrecio.price.customerPrice;
            objB.products.precio = propuestaPrecio.price.price;
            if (propuestaPrecio.agreement)
              objB.products.cantidad =
                propuestaPrecio.agreement.minimumQuantity;
          }
        }
      });
      this.armaCatalogo();
    }
  }

  armaCatalogo() {
    this.catalogo.map((pagina: IBody) => {
      //LADO A
      if (pagina.leftSide && pagina.leftSide[0]) {
        if (pagina.leftSide[0].type != 'portada') {
          // pagina.leftSide.tituloA = pagina.leftTitle; //revisar
          this.paginas.push(pagina.leftSide);
          this.paginasTemp.push(pagina.leftSide);
        }
      } else {
        if (pagina.leftSide) {
          pagina.leftSide[0] = {
            products: {
              type: 'dinamico',
              attributes: [],
              precio: 0,
              precioEsp: 0,
            },
            type: 'dinamico',
            //FIXME: Revisar
            // titulo: undefined,
            tituloA: '',
          };
          this.paginas.push(pagina.leftSide);
        }
      }
      //LADO B
      if (pagina.rightSide && pagina.rightSide[0]) {
        if (pagina.rightSide[0].type != 'portada') {
          // pagina.rightSide.tituloB = pagina.rightTitle; //revisar
          this.paginas.push(pagina.rightSide);
          this.paginasTemp.push(pagina.rightSide);
        }
      } else {
        if (pagina.rightSide) {
          pagina.rightSide[0] = {
            products: {
              type: 'dinamico',
              attributes: [],
              precio: 0,
              precioEsp: 0,
            },
            type: 'dinamico',
            //FIXME:  Revisar
            // titulo: undefined,
            tituloB: '',
          };
          this.paginas.push(pagina.rightSide);
        }
      }
      //OBTENER PORTADA Y CONTRAPORTADA (INDEPENDIENTE DEL ORDEN)
      if (
        pagina.leftSide &&
        pagina.leftSide[0].type === 'portada' &&
        pagina.leftSide[0].products.type === 'portadaImg'
      )
        this.portada = pagina.leftSide[0].products.url;
      if (
        pagina.leftSide &&
        pagina.leftSide[0].type === 'portada' &&
        pagina.leftSide[0].products.type === 'contraPortadaImg'
      )
        this.contraPortada = pagina.leftSide[0].products.url;
    });

    if (this.dispositivo === 'smartphone') {
      // OBTENGO TODOS LOS ARTICULOS
      for (let i = 0; i < this.paginasTemp.length; i++) {
        for (let x = 0; x < this.paginasTemp[i].length; x++) {
          if (this.paginasTemp[i][x].products) {
            let titulo = '';
            this.paginasTemp[i].leftTitle
              ? (titulo = this.paginasTemp[i].leftTitle)
              : (titulo = this.paginasTemp[i].rightTitle);
            this.paginasTemp[i][x].titulo = titulo;
            this.articulos.push(this.paginasTemp[i][x]);
          }
        }
      }
      // 8 ARTICULOS X PAGINA
      this.paginasMobile = this.agrupar(this.articulos, 8);
      this.paginasMobile.length > 0
        ? (this.pageTotal = this.paginasMobile.length + 2)
        : (this.pageTotal = 0);
    }
    if (this.dispositivo === 'tablet' || this.dispositivo === 'web') {
      this.paginas.length > 0
        ? (this.pageTotal = this.paginas.length + 2)
        : (this.pageTotal = 0);
    }
    this.isLoadPrecio = true;
  }

  agrupar(array: any, chunkSize: any) {
    const output = [],
      arrayLength = array.length;
    let arrayIndex = 0;
    while (arrayIndex < arrayLength) {
      output.push(array.slice(arrayIndex, (arrayIndex += chunkSize)));
    }
    return output;
  }
  //FIXME:REVISAR NUEVAMENTE !!!
  async cargarMarcas(objeto: any) {
    //LISTA DE MARCAS POR PÁGINA
    for (let i = 0; i < objeto.body.length; i++) {
      let marcas = [];
      // LADO A
      for (
        let x = 0;
        x < (objeto.body[i]?.leftSide as ILeftSide[]).length;
        x++
      ) {
        if (objeto.body[i].leftSide[x].type != 'portada') {
          if (objeto.body[i].leftSide[x].products?.attributes.length) {
            if (objeto.body[i].leftSide[x].products.attributes[5].value) {
              let marca =
                objeto.body[i].leftSide[x].products.attributes[5].value;
              let existeEnArray = marcas.indexOf(marca);
              if (existeEnArray == -1)
                marcas.push(
                  objeto.body[i].leftSide[x].products.attributes[5].value
                );
            }
          }
        }
      }
      // LADO B
      for (
        let z = 0;
        z < (objeto.body[i].rightSide as IRightSide[]).length;
        z++
      ) {
        if (objeto.body[i].rightSide[z].type != 'portada') {
          if (objeto.body[i].rightSide[z].products?.attributes.length) {
            if (objeto.body[i].rightSide[z].products.attributes[5].value) {
              let marca =
                objeto.body[i].rightSide[z].products.attributes[5].value;
              let existeEnArray = marcas.indexOf(marca);
              if (existeEnArray == -1)
                marcas.push(
                  objeto.body[i].rightSide[z].products.attributes[5].value
                );
            }
          }
        }
      }
      //SI ARRAY MARCAS TIENE MENOS DE 6 ITEMS LO COMPLETO
      if (marcas.length < 6 && marcas.length > 0) {
        for (let i = 0; i < 6; i++) {
          marcas.push(marcas[i]);
          if (marcas.length == 6) break;
        }
      }
      //ASIGNO MISMAS MARCAS A LAS DOS CARAS
      objeto.body[i].leftSide['marcas'] = marcas;
      objeto.body[i].rightSide['marcas'] = marcas;
    }
  }

  minimo: boolean = false;
  medio: boolean = false;
  loadFlip() {
    if (this.dispositivo === 'smartphone') {
      let porcentaje = 1.9;
      if (this.screenWidth > 400 && this.screenWidth < 420) porcentaje = 5.4; //ok
      if (this.screenWidth < 400 && this.screenWidth > 360) porcentaje = 5.9; //ok
      if (this.screenWidth <= 360 && this.screenWidth > 320) porcentaje = 6.2; //ok
      if (this.screenWidth <= 320 && this.screenWidth > 300) porcentaje = 7.0;
      let height = this.screenWidth * porcentaje;
      this.pageFlip = new PageFlip(this._demoBookExample.nativeElement, {
        width: this.screenWidth,
        height: height,
        maxWidth: this.screenWidth,
        maxHeight: height * 1.1,
        size: 'fixed' as SizeType,
        minWidth: 315,
        minHeight: 680,
        maxShadowOpacity: 0.5,
        disableFlipByClick: true,
        flippingTime: 800,
        clickEventForward: true,
        showCover: true,
        showPageCorners: true,
        startZIndex: 5,
        useMouseEvents: false,
      });
    }
    if (this.dispositivo === 'web') {
      let numero;
      if (this.screenWidth > 1440 && this.screenWidth < 1540) {
        numero = 600;
        this.medio = true;
      } else if (this.screenWidth > 1540) {
        numero = 650;
      } else {
        numero = 450;
        this.minimo = true;
      }

      this.pageFlip = new PageFlip(this._demoBookExample.nativeElement, {
        width: numero,
        height: 950,
        maxHeight: 940,
        maxWidth: 650,
        size: 'fixed' as SizeType,
        minWidth: 315, //315
        minHeight: 420, //420
        maxShadowOpacity: 0.5,
        disableFlipByClick: true,
        useMouseEvents: true,
        flippingTime: 800,
        clickEventForward: true,
        showCover: true,
        showPageCorners: true,
        startZIndex: 5,
      });
    }
    if (this.dispositivo === 'tablet') {
      this.pageFlip = new PageFlip(this._demoBookExample.nativeElement, {
        width: 650, //740
        height: 950, //940
        maxWidth: 650,
        maxHeight: 950,
        size: 'fixed' as SizeType,
        minWidth: 650,
        minHeight: 950,
        maxShadowOpacity: 0.5,
        disableFlipByClick: true,
        flippingTime: 800,
        clickEventForward: true,
        showCover: true,
        showPageCorners: true,
        startZIndex: 5,
        useMouseEvents: false,
      });
    }
    this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    this.pageFlip.on('flip', (e: any) => {
      this.pageCurrent = e.data + 1;
    });
    this.pageFlip.on('changeState', (e: any) => {
      this.pageState = e.data;
    });
    this.pageFlip.on('changeOrientation', (e: any) => {
      this.ngOnInit();
    });
  }

  nextPage() {
    let por = this.pageFlip.getOrientation();
    if (
      this.dispositivo === 'smartphone' ||
      this.dispositivo === 'tablet' ||
      por === 'portrait'
    ) {
      if (this.pageCurrent < this.pageTotal) {
        this.pageFlip.turnToNextPage();
      }
    } else {
      this.pageFlip.flipNext();
    }
  }

  prevPage() {
    let por = this.pageFlip.getOrientation();
    this.dispositivo === 'smartphone' ||
    this.dispositivo === 'tablet' ||
    por === 'portrait'
      ? this.pageFlip.turnToPrevPage()
      : this.pageFlip.flipPrev();
  }

  buscaTags(objeto: any[]) {
    let i = 0;
    this.tags = [
      ...new Set(
        objeto.map((item) => {
          i++;
          if (item.tag !== undefined) {
            return {
              index: i,
              id: item.id,
              tag: item.tag,
            };
          }
          return null;
        })
      ),
    ];
    this.tags = this.tags.filter((item) => item);
    this.localS.set(StorageKey.tags, this.tags);
  }

  buscaTagsSmartphone(objeto: any) {
    let i = 0;
    objeto.map((pagina: any) => {
      i++;
      pagina.map((articulo: any) => {
        if (articulo.titulo !== undefined && articulo.titulo != '') {
          objeto = {
            index: i,
            id: pagina.id,
            tag: articulo.titulo.substring(0, 35),
          };
          const existe = this.tags.find((obj) => {
            return obj.tag === objeto.tag;
          });
          if (!existe) {
            this.tags.push(objeto);
          }
        }
      });
    });
    this.tags = this.tags.filter((item) => item);
    this.localS.set(StorageKey.tags, this.tags);
  }
}
