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
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';

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
  carouselOptions = {
    lazyLoad: true,
    items: 5,
    nav: true,
    navText: [
      `<div class="m-arrow__container" ><i class="fa-regular fa-chevron-left"></i></div>`,
      `<div class="m-arrow__container"><i class="fa-regular fa-chevron-right"></i></div>`,
    ],
    slideBy: 'page',
    dots: true,
    loop: true,
    responsiveClass: true,
    autoplay: false,
    autoplayTimeout: 4000,
    margin: 10,
    responsive: {
      1100: { items: 5 },
      920: { items: 5 },
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
  user!: ISession;
  cargar: boolean = false;
  title = 'Arrastre lista de elemento';
  subtitle!: string;
  screenWidth: any;
  screenHeight: any;
  isVacio = isVacio;
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService
  ) {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.screenHeight = isPlatformBrowser(this.platformId)
      ? window.innerHeight
      : 900;
  }

  ngOnInit(): void {
    this.ruta = this.router.url === '/inicio' ? 'home' : this.router.url;
    this.user = this.sessionService.getSession();
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
    this.screenHeight = isPlatformBrowser(this.platformId)
      ? window.innerHeight
      : 900;
    if (this.screenWidth <= 770) {
      this.layout = 'grid-sm';
    }
  }

  /*
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
  }*/
}
