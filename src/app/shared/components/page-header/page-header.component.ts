import {
  Component,
  HostListener,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { Link } from '../../interfaces/link';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() header!: string;
  @Input() headerSubtitle!: string;
  @Input() textLast!: string;
  @Input() class!: string;
  @Input() totalRegistros!: number;
  @Input() breadcrumbs: Link[] = [];
  @Input() returnUrl = '';
  @Input() textToSearch = '';
  url: string;
  innerWidth: number;
  constructor(
    private route: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.url = isPlatformBrowser(this.platformId) ? window.location.href : '';
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit() {}
  ngonChanges() {
    if (isPlatformBrowser(this.platformId)) this.url = window.location.href;
  }
  // Funcion que esconde el label "mostrando resultado...." dentro de la ficha de un item y la pagina de contactos.
  HideOnFicha() {
    if (
      this.route.url.lastIndexOf('/inicio/productos/ficha/') == -1 &&
      this.route.url.lastIndexOf('/sitio/contacto') == -1
    ) {
      return false;
    } else {
      return true;
    }
  }

  decodedUrl(cadena: string) {
    return decodeURIComponent(cadena);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }
}
