// Angular
import { Component, OnInit } from '@angular/core';
// Models
import { IValueBox } from '@core/models-v2/cms/valueBox-response.interface';
// Services
import { CmsService } from '@core/services-v2/cms.service';

@Component({
  selector: 'app-buttons-slideshow',
  templateUrl: './buttons-slideshow.component.html',
  styleUrls: ['./buttons-slideshow.component.scss'],
})
export class ButtonsSlideshowComponent implements OnInit {
  botones1: IValueBox[] = [];

  options = {
    lazyLoad: true,
    dots: false,
    dragging: false,
    loop: false,
    autoplay: false,
    autoplayHoverPause: true,
    autoplayTimeout: 8000,
    nav: false,
    responsive: {
      0: { items: 1.5, loop: true },
      700: { items: 2.5, loop: true },
    },
    autoplaySpeed: 3000,
  };

  constructor(private readonly cmsService: CmsService) {}

  ngOnInit(): void {
    this.getValueBoxes();
  }

  getValueBoxes(): void {
    this.cmsService.getValueBoxes().subscribe({
      next: (valueBoxes) => (this.botones1 = valueBoxes),
      error: (err) => console.log(err),
    });
  }
}
