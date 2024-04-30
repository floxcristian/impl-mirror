import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RootService } from '../../../../shared/services/root.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import {
  IBody,
  ICatalog,
} from '@core/models-v2/catalog/catalog-response.interface';
import { CatalogService } from '@core/services-v2/catalog.service';
import { MetaTag } from '@core/models-v2/article/article-response.interface';
import { CartService } from '@core/services-v2/cart.service';
@Component({
  selector: 'app-page-ver-catalogo',
  templateUrl: './page-ver-catalogo.component.html',
  styleUrls: ['./page-ver-catalogo.component.scss'],
})
export class PageVerCatalogoComponent implements OnInit {
  catalogo: IBody[] = [];
  catalogoMovil: any = [];
  skus!: Array<string>;
  objeto!: any;
  page: number;
  longitud!: number;
  hidden = true;
  innerWidth!: number;
  cargandoCat = true;
  tipoCatalogo!: string;
  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private localS: LocalStorageService,
    public root: RootService,
    private router: Router,
    private toast: ToastrService,
    // Services V2
    public cart: CartService,
    private readonly sessionService: SessionService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly catalogService: CatalogService
  ) {
    this.page = 0;
    this.onResize();
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) await this.validarParametros();
  }
  async validarParametros() {
    let objeto: ICatalog | null = null;
    let id: string | null = null;
    let url = this.router.parseUrl(this.router.url);

    id = url.queryParams['id'];
    if (id) {
      //llamada servicio para obtener catalogo por id
      this.catalogService.getCatalog(id).subscribe({
        next: async (res) => {
          if (res.data.dynamic) {
            this.router.navigate(['/', 'catalogos', 'ver-catalogo-flip'], {
              queryParams: { id: id },
            });
          }
          this.tipoCatalogo = res.data.catalogType;
          this.skus = res.data.skus;
          this.catalogo = res.data.body;
          await this.establecerPrecio();
          this.objeto = this.catalogo[this.page];
          this.longitud = this.catalogo.length;
        },
        error: (err) => {
          console.log(err);
          this.toast.error('Error, el catalogo no se encuentra disponible');
          this.router.navigate(['/', 'catalogos']);
        },
      });
    } else {
      objeto = this.localS.get(StorageKey.catalogo);
      if (!objeto) {
        this.toast.error('Error, el catalogo no se encuentra disponible');
        this.router.navigate(['/', 'catalogos']);
        return;
      }
      this.tipoCatalogo = objeto.catalogType;
      this.skus = objeto.skus;
      this.catalogo = objeto.body;
      await this.establecerPrecio();
      this.objeto = this.catalogo[this.page];
      this.longitud = this.catalogo.length;
    }
  }

  cambiarPagina(valor: any) {
    valor ? (this.page += 1) : (this.page -= 1);
    this.objeto = this.catalogo[this.page];
  }

  Reset(valor: any) {
    valor ? (this.page = 0) : (this.page = this.catalogo.length - 1);
    this.objeto = this.catalogo[this.page];
  }

  async establecerPrecio() {
    let user = this.sessionService.getSession();
    let rut = user.documentId;

    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const params: any = {
      branchCode: tiendaSeleccionada.code,
      documentId: user.documentId,
      skus: this.skus,
    };

    this.catalogService.getCatalogsProductPrices(params).subscribe({
      next: (res) => {
        res.map((precio) => {
          this.cargandoCat = false;
          this.catalogo.map((objeto: any) => {
            if (Array.isArray(objeto.products)) {
              objeto.products.map((producto: any) => {
                producto.rut = rut;
                if (producto.sku == precio.sku) {
                  producto.precioEsp = precio.priceInfo.customerPrice;
                  producto.precio = precio.priceInfo.commonPrice;
                  producto.precioEscala = precio.priceInfo.hasScalePrice;
                  producto.preciosScal = precio.priceInfo.scalePrice;
                  producto.cyber = this.generateTag(precio.metaTags, 'cyber');
                  producto.cyberMonday = this.generateTag(
                    precio.metaTags,
                    'cyberMonday'
                  );
                }
              });
            }
            //revisar despues
            else if (objeto.products) {
              objeto.products.rut = rut;
              if (objeto.productos.sku == precio.sku) {
                objeto.productos.precioEsp = precio.priceInfo.customerPrice;
                objeto.productos.precio = precio.priceInfo.commonPrice;
                objeto.productos.precioEscala = precio.priceInfo.hasScalePrice;
                objeto.productos.preciosScal = precio.priceInfo.scalePrice;
                objeto.cyber = this.generateTag(precio.metaTags, 'cyber');
                objeto.cyberMonday = this.generateTag(
                  precio.metaTags,
                  'cyberMonday'
                );
              }
            }
          });
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  generateTag(tags: MetaTag[] | undefined, code: string) {
    if (tags) {
      let index = tags.findIndex((tag: MetaTag) => tag.code === code);
      if (index === -1) {
        return 0;
      } else {
        return tags[index].value;
      }
    } else {
      return 0;
    }
  }

  objetoMovil() {
    let catalogoMovil = [];
    let arrProd: any[] = [];
    let objetoP = this.catalogo[1];
    let objetoF = this.catalogo[this.catalogo.length - 1];
    this.catalogo.map((objeto: any, indice: any) => {
      indice == 0 && catalogoMovil.push(objeto);
      Array.isArray(objeto.productos)
        ? objeto.productos.map((obj: any) => arrProd.push(obj))
        : objeto.productos
        ? arrProd.push(objeto.productos)
        : null;
    });

    let inicio = 0;
    let final = 2;
    let cantidadProdPagina = 4;
    let cantidadProductos = 0;
    let cantidadPaginas = 0;

    if (arrProd.length > 2) {
      cantidadProductos = arrProd.length;
      cantidadPaginas = Math.round(cantidadProductos / cantidadProdPagina);
    } else {
      cantidadProductos = arrProd.length;
      cantidadPaginas = 0;
      inicio = 0;
      final = arrProd.length;
    }

    for (let index = 0; index < cantidadPaginas; index++) {
      let objetoC = {
        id: 'productosVertical',
        class: 'col-md-10 col-lg-10',
        banner: index == 0 ? objetoP.banner : null,
        header: objetoP.header,
        footer: objetoP.footer,
        productos: arrProd.slice(inicio, final),
      };
      inicio = final;
      final + 4 > arrProd.length ? (final = arrProd.length) : (final += 4);

      catalogoMovil.push(objetoC);
    }
    catalogoMovil.push(objetoF);
    this.catalogoMovil = catalogoMovil;
  }

  onResize() {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.objeto = this.catalogo[this.page];
  }
}
