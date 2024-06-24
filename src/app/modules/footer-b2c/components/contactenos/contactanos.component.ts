// Angular
import { Component } from '@angular/core';
import { Router } from '@angular/router';
// Models
import { IConfig } from '@core/config/config.interface';
// Services
import { ConfigService } from '@core/config/config.service';

@Component({
  selector: 'app-contactanos',
  templateUrl: './contactanos.component.html',
  styleUrls: ['./contactanos.component.scss'],
})
export class ContactanosComponent {
  terminos = true;
  config: IConfig;
  constructor(
    private readonly router: Router,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
  }

  Contacto(): void {
    this.router.navigate(['/sitio/contacto']);
  }
}
