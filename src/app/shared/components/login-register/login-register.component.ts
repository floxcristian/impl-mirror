// Angular
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Models
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { IGuest } from '@core/models-v2/storage/guest.interface';
declare let dataLayer: any;

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnInit {
  @Output() outInvitado: EventEmitter<any> = new EventEmitter();
  @Input() innerWidth!: number;
  @Input() invitado!: IEcommerceUser | IGuest;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // this.gtmService.pushTag({
      //   event: 'profile',
      //   pagePath: window.location.href,
      // });
      dataLayer.push({
        event: 'profile',
        pagePath: window.location.href,
      });
    }
  }

  returnInvitado(invitado: any): void {
    this.outInvitado.emit(invitado);
  }
}
