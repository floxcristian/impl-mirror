import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Usuario } from '../../interfaces/login';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { IGuest } from '@core/models-v2/storage/guest.interface';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnInit {
  @Output() outLogin: EventEmitter<any> = new EventEmitter();
  @Output() outInvitado: EventEmitter<any> = new EventEmitter();
  @Input() innerWidth!: number;
  @Input() invitado!: IEcommerceUser | IGuest;

  constructor(
    private readonly gtmService: GoogleTagManagerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.gtmService.pushTag({
        event: 'profile',
        pagePath: window.location.href,
      });
    }
  }
  returnInvitado(invitado: any) {
    this.outInvitado.emit(invitado);
  }
}
