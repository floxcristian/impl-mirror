// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-b2c',
  templateUrl: './footer-b2c.component.html',
  styleUrls: ['./footer-b2c.component.scss'],
})
export class FooterB2cComponent implements OnInit {
  routesWithFooter: string[] = [
    '/inicio',
    '/productos/ficha/',
    '/especial/',
    '/not-found',
  ];
  isFooterVisible!: boolean;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.isFooterVisible = this.routesWithFooter.some((route) =>
      this.router.url.includes(route)
    );
    this.router.events.subscribe(() => {
      this.isFooterVisible = this.routesWithFooter.some((route) =>
        this.router.url.includes(route)
      );
    });
  }
}
