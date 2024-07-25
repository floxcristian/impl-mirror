import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { isVacio } from '../../../../shared/utils/utilidades';
import { isPlatformBrowser } from '@angular/common';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-lista_producto',
  templateUrl: './lista_producto.component.html',
  styleUrls: ['./lista_producto.component.scss'],
})
export class Lista_productoComponent implements OnInit {
  ruta: string = '';
  layout: any = 'grid-lg';
  @Input() url: any[] = [];
  @Input() lstProductos: any[] = [];
  @Input() set elemento(value: any) {
    this.productData = value;

    if (this.productData) {
      if (this.productData.element) {
        this.product_list = this.productData.element;
      } else this.product_list = this.productData.data;

      this.productList = this.product_list.articles;
      this.title = this.product_list.title;
      this.subtitle = this.product_list.subtitle;
    }
  }
  carouselOptions: OwlOptions = {
    items: 5,
    nav: true,
    navText: [
      `<div class="m-arrow__container" ><i class="fa-regular fa-chevron-left"></i></div>`,
      `<div class="m-arrow__container"><i class="fa-regular fa-chevron-right"></i></div>`,
    ],
    dots: true,
    loop: true,
    autoplay: false,
    autoplayTimeout: 4000,
    /*slideBy: 'page',*/
    margin: 10,
    responsive: {
      1100: { items: 6 },
      920: { items: 6 },
      768: { items: 3 },
      680: { items: 3 },
      500: { items: 3 },
      0: { items: 2 },
    },
  };
  productData: any;
  @Output() elementoEvent: EventEmitter<any> = new EventEmitter();
  @Input() id = '-1';
  product_list: any;
  productList: any;
  products: any;
  cargar: boolean = false;
  title: string = '';
  subtitle!: string;
  screenWidth: any;
  isVacio = isVacio;
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit(): void {
    this.ruta = this.router.url === '/inicio' ? 'home' : this.router.url;
    this.get_productos();
  }

  async get_productos() {
    this.cargar = true;
    await this.match_listaProducto();
  }
  async match_listaProducto() {
    // let filtro_sku: any = this.lstProductos.filter(
    //   (lstprod) => lstprod.nombre === this.product_list.title
    // );
    // let filtro_url: any = this.url.filter(
    //   (link) => link.nombre === this.product_list.title
    // );

    // if (filtro_sku.length > 0) {
    //   this.product_list.skus = filtro_sku[0].skus;
    //   this.product_list.url = filtro_url[0].url;
    // }

    this.cargar = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    if (this.screenWidth <= 770) {
      this.layout = 'grid-sm';
    }
  }
}
