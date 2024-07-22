// Angular
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
// Env
import { environment } from '@env/environment';

@Component({
  selector: 'app-footer-b2c',
  templateUrl: './footer-b2c.component.html',
  styleUrls: ['./footer-b2c.component.scss'],
})
export class FooterB2cComponent implements OnInit {
  logoSrc = environment.logoSrcFooter;

  constructor(public router: Router, private renderer: Renderer2) {}

  async ngOnInit() {
    const body_e = this.renderer.selectRootElement('body', true); // safari
    this.renderer.setProperty(body_e, 'scrollTop', 0);
    const html_e = this.renderer.selectRootElement('html', true); //other
    this.renderer.setProperty(html_e, 'scrollTop', 0);
  }

  // Funcion utilizada para ocultar footer para dispositivos mobiles en las pantallas de seleccion de despacho y pago.
  HideFooter(): boolean {
    if (
      this.router.url.includes('/inicio') ||
      this.router.url.includes('/productos/ficha/') ||
      this.router.url.includes('/especial/') ||
      this.router.url.includes('/not-found')
    ) {
      return false;
    } else {
      return true;
    }
  }
}
