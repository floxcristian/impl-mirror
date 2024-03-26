import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CarouselConfig } from 'ngx-bootstrap/carousel';

@Component({
  selector: 'app-caja-concepto',
  templateUrl: './caja-concepto.component.html',
  providers: [
    {
      provide: CarouselConfig,
      useValue: { interval: 5500, noPause: false, showIndicators: true },
    },
  ],
  styleUrls: ['./caja-concepto.component.scss'],
})
export class CajaConceptoComponent implements OnInit, OnDestroy {
  concepto: any;
  carouselOptions = {
    items: 1,
    nav: false,
    dots: true,
    lazyLoad: true,
    loop: true,
    responsiveClass: true,
    autoplay: false,
    autoplayTimeout: 4000,
  };
  grid_layout: any[] = [];
  concepto_array: any[] = [];
  row: any;

  @Input() set caja_concepto(value: any) {
    this.concepto = value;
  }

  ngOnInit(): void {
    this.buildGridStyles();
  }

  ngOnDestroy(): void {
    this.grid_layout.splice(0, this.grid_layout.length);
    this.concepto_array.splice(0, this.concepto_array.length);
  }

  buildGridStyles(): void {
    // let h = 0;
    let y_array: any = [
      ...new Set(this.concepto.element.data.layout.map((item: any) => item.y)),
    ];

    y_array.forEach((itemy: any) => {
      this.row = this.concepto.element.data.layout.filter(
        (item: any) => item.y == itemy
      );

      this.row.forEach((element: any, index: number) => {
        const grid = this.getGridStyleById(element.id);
        this.grid_layout.push(grid);
        this.concepto_array.push(element);
      });
    });
  }
  gridStyles: any = {
    '0': {
      'grid-column-start': 5,
      'grid-column-end': 6,
      'grid-row-start': 4,
      'grid-row-end': 7,
    },
    '2': {
      'grid-column-start': 9,
      'grid-column-end': 10,
      'grid-row-start': 4,
      'grid-row-end': 7,
    },
    '7': {
      'grid-column-start': 7,
      'grid-column-end': 8,
      'grid-row-start': 4,
      'grid-row-end': 7,
    },
    '1': {
      'grid-column-start': 1,
      'grid-column-end': 3,
      'grid-row-start': 1,
      'grid-row-end': 8,
    },
    '4': {
      'grid-column-start': 9,
      'grid-column-end': 10,
      'grid-row-start': 1,
      'grid-row-end': 4,
    },
    '6': {
      'grid-column-start': 5,
      'grid-column-end': 7,
      'grid-row-start': 1,
      'grid-row-end': 4,
    },
  };

  getGridStyleById(id: number) {
    return this.gridStyles[id] || {};
  }
}
