// Angular
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// Services
import { isVacio } from '../../../../shared/utils/utilidades';
import { CmsService } from '@core/services-v2/cms.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-slide-mundo',
  templateUrl: './slide-mundo.component.html',
  styleUrls: ['./slide-mundo.component.scss'],
})
export class SlideMundoComponent implements OnInit {
  style: any = [];
  isVacio = isVacio;
  carouselOptions = {
    lazyLoad: true,
    nav: false,
    dots: true,
    loop: false,
    autoplay: false,
    responsiveClass: true,
    responsive: {
      0: { items: 3, loop: true },
    },
  };

  carouselOptions2 = {
    lazyLoad: true,
    nav: false,
    dots: true,
    loop: false,
    responsiveClass: true,
    autoplay: false,
    responsive: {
      0: { items: 1, loop: true },
    },
  };
  slides: any[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.Carga_mundo();
    }
  }

  async Carga_mundo() {
    this.slides = [];
    this.cmsService.getWorlds().subscribe({
      next: (res) => {
        this.slides = [...res.data];
        this.slides.forEach((item: any) => {
          this.style.push({
            cursor: 'pointer',
            'background-image': "url('" + item.imageOverlay + "')",
          });
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
