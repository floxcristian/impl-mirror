// Angular
import {
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// Libs
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
// Models
import {
  IElement1,
  IElement2,
} from '@core/models-v2/cms/homePage-response.interface';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product-page-home',
  templateUrl: './product-page-home.component.html',
  styleUrls: ['./product-page-home.component.scss'],
})
export class ProductPageHomeComponent implements OnInit {
  @ViewChild('popoverContent', { static: false }) myPopover!: NgbPopover;

  @Input() set blockElements(value: IElement1[] | IElement2) {
    this._blockElements = value as IElement1[];
  }
  _blockElements: IElement1[] = [];
  layout = 'grid-lg';

  ruta: string = '';
  refresh = false;
  refresh2 = false;
  cargando = true;
  producto_selecionado!: IElement1;
  index_seleccionado = 0;
  sPosition = 0;
  screenWidth: any;
  screenHeight: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.screenHeight = isPlatformBrowser(this.platformId)
      ? window.innerHeight
      : 900;
    this.tamanho_layout();
  }
  carouselOptions: OwlOptions = {
    items: 5,
    nav: false,
    dots: true,
    loop: true,
    autoplay: false,
    lazyLoad: true,
    autoplayTimeout: 4000,
    responsive: {
      920: { items: 4 },
      800: { items: 4 },
      768: { items: 3 },
      500: { items: 3 },
      0: { items: 2 },
    },
  };
  carouselOptions3: OwlOptions = {
    lazyLoad: true,
    nav: false,
    autoWidth: true,
    startPosition: 0,
    loop: false,
    items: 1,
    autoplay: false,
    center: true,
  };

  carouselOptions2: OwlOptions = {
    lazyLoad: false,
    nav: false,
    autoWidth: true,
    loop: true,
    startPosition: 0,
    items: 1.4,
    autoplay: false,
  };

  ngOnInit(): void {
    this.index_seleccionado = this.sPosition;
    this.ruta = this.router.url === '/inicio' ? 'home' : this.router.url;
    this.cargarHome();
  }

  //cargahome
  async cargarHome() {
    this.cargando = true;
    this.producto_selecionado = this._blockElements[0];
    this.index_seleccionado = 0;
    this.cargando = false;
  }

  /**
   * TODO: quitar en algun momento esto.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.screenHeight = isPlatformBrowser(this.platformId)
      ? window.innerHeight
      : 900;
    this.tamanho_layout();
  }

  /**
   * TODO: quitar en algun momento esto.
   */
  tamanho_layout(): void {
    if (this.screenWidth <= 768) {
      this.layout = 'grid-sm';
    } else this.layout = 'grid-lg';
  }

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
  }

  get_precioEscala(event: any) {
    event.popover.open();
  }

  async getData(event: any) {
    let index = event.startPosition;
    if (index >= this._blockElements.length) index = 0;
    this.refresh = true;

    this.carouselOptions2 = { ...this.carouselOptions2, startPosition: index };
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('listo');
      }, 10);
    });
    this.refresh = false;
    this.producto_selecionado = this._blockElements[index];
    this.index_seleccionado = index;
  }

  async getData2(event: any): Promise<void> {
    let index = event.startPosition;
    if (index >= this._blockElements.length) index = 0;
    this.refresh2 = true;
    this.carouselOptions3 = { ...this.carouselOptions3, startPosition: index };
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('listo');
      }, 10);
    });
    this.refresh2 = false;
    this.producto_selecionado = this._blockElements[index];
    this.index_seleccionado = index;
  }

  moveToSlide(index: number): void {
    this.refresh2 = true;
    this.carouselOptions3 = { ...this.carouselOptions3, startPosition: index };
    this.carouselOptions2 = { ...this.carouselOptions2, startPosition: index };
    setTimeout(() => {
      this.refresh2 = false;
      this.producto_selecionado = this._blockElements[index];
      this.index_seleccionado = index;
    }, 10);
  }
}
