// Angular
import {
  Component,
  ElementRef,
  //Renderer2,
  ViewChild,
  //HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
// Env
import { environment } from '@env/environment';
// Models
import { BuscadorB2B } from '../../shared/interfaces/buscadorB2B';
// Services
//import { isVacio } from '../../shared/utils/utilidades';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { StorageKey } from '@core/storage/storage-keys.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  logoSrc = environment.logoSrc;
  @ViewChild('sticky_header_b2c') sticky_b2c!: ElementRef;
  @ViewChild('sticky_header_b2c_nav') sticky_b2c_nav!: ElementRef;

  constructor(
    private route: Router,
    private localS: LocalStorageService //private renderer: Renderer2
  ) {
    const buscadorB2B = this.localS.get(StorageKey.buscadorB2B);
    if (!buscadorB2B) {
      const data: BuscadorB2B = {
        indicadores: null,
        collapsed: null,
        vinBuscado: null,
      };
      this.localS.set(StorageKey.buscadorB2B, data);
    }
  }
  // @HostListener('window:scroll', [])
  /*onWindowScroll() {
    if (!isVacio(this.sticky_b2c) && !isVacio(this.sticky_b2c_nav)) {
      const sticky = this.sticky_b2c.nativeElement.offsetTop;
      if (window.pageYOffset > sticky) {
        this.renderer.addClass(this.sticky_b2c.nativeElement, 'sticky');
        this.renderer.addClass(
          this.sticky_b2c_nav.nativeElement,
          'sticky_nav'
        );
      } else {
        this.renderer.removeClass(this.sticky_b2c.nativeElement, 'sticky');
        this.renderer.removeClass(
          this.sticky_b2c_nav.nativeElement,
          'sticky_nav'
        );
      }
    }
  }*/
  Hidebar() {
    let url = this.route.url;
    if (this.route.url.split('?')[0] != undefined) {
      url = '' + this.route.url.split('?')[0];
    }
    if (url.includes('/CO-')) {
      url = '' + this.route.url.split('/CO-')[0];
    }

    return ![
      '/carro-compra/metodo-de-envio',
      '/carro-compra/forma-de-pago',
      '/carro-compra/omni-forma-de-pago',
      '/carro-compra/resumen',
      '/carro-compra/gracias-por-tu-compra',
      '/carro-compra/downloadpdf',
      '/carro-compra/omni-gracias-por-tu-compra',
      '/carro-compra/confirmar-orden-oc',
      '/carro-compra/comprobante-de-cotizacion',
    ].includes(url);
  }

  getDesde() {
    let url = this.route.url;
    if (this.route.url.split('?')[0] != undefined) {
      url = '' + this.route.url.split('?')[0];
    }
    if (
      [
        '/carro-compra/omni-forma-de-pago',
        '/carro-compra/omni-gracias-por-tu-compra',
      ].includes(url)
    ) {
      return 'omni';
    } else {
      return '';
    }
  }
}
