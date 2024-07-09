// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IConfig } from '@core/config/config.interface';
// Env
import { environment } from '@env/environment';
// Services
import { ConfigService } from '@core/config/config.service';

@Component({
  selector: 'app-topbar-mobile',
  templateUrl: './topbar-mobile.component.html',
  styleUrls: ['./topbar-mobile.component.scss'],
})
export class TopbarMobileComponent implements OnInit {
  logoSrc = environment.logoSrc;
  config: IConfig;
  constructor(
    private readonly router: Router,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit() {
    this.Hide_menub2c();
  }

  Hide_menub2c() {
    if (this.router.url.includes('/carro-compra/')) {
      return false;
    } else {
      return true;
    }
  }

  navegar() {
    this.router.navigate(['/inicio']);
  }
}
