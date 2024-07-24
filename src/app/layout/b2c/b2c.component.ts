// Angular
import { Component, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Title } from '@angular/platform-browser';
// Env
import { environment } from '@env/environment';
// Services
import { RootService } from '../../shared/services/root.service';
import { CanonicalService } from '../../shared/services/canonical.service';
@Component({
  selector: 'app-b2c',
  templateUrl: './b2c.component.html',
})
export class B2cComponent implements AfterViewInit {
  loadingPage = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public root: RootService,
    public router: Router,
    public route: ActivatedRoute,
    private titleService: Title,
    private canonicalService: CanonicalService
  ) {
    this.root.path = this.router
      .createUrlTree(['./'], { relativeTo: route })
      .toString();
    this.titleService.setTitle(
      'Implementos - Repuestos para Camiones, Buses y Remolques'
    );

    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(location.href);
    }

    if (isPlatformServer(this.platformId)) {
      this.canonicalService.setCanonicalURL(
        environment.canonical + this.router.url
      );
    }
  }

  ngAfterViewInit() {
    this.removeLoading();
  }

  removeLoading() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadingPage = false;
      }, 1000);
    } else {
      this.loadingPage = false;
    }
  }
}
