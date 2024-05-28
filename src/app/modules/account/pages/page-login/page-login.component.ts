// Angular
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// Services
import { isPlatformBrowser } from '@angular/common';
import { AuthApiService } from '@core/services-v2/auth/auth.service';
import { LogoutService } from '@core/services-v2/auth/logout.service';

@Component({
  selector: 'app-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.scss'],
})
export class PageLoginComponent implements OnInit {
  constructor(
    // Services V2
    private readonly authService: AuthApiService,
    private readonly logoutService: LogoutService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit(): Promise<void> {
    await this.logout();
  }

  async logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('LOGOUT');
          this.logoutService.clearSession();
        },
        error: (e) => {
          console.log(e);
          this.logoutService.clearSession();
        },
      });
    } else {
      this.logoutService.clearSession();
    }

    this.logoutService.irAInicio();
  }
}
