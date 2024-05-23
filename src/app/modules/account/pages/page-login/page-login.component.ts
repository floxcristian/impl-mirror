// Angular
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
// Services
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { SessionTokenStorageService } from '@core/storage/session-token-storage.service';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { WishlistStorageService } from '@core/storage/wishlist-storage.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { isPlatformBrowser } from '@angular/common';
import { AuthApiService } from '@core/services-v2/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.scss'],
})
export class PageLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private localS: LocalStorageService,
    // Services V2
    private readonly sessionStorage: SessionStorageService,
    private readonly sessionTokenStorage: SessionTokenStorageService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly customerPreferenceStorage: CustomerPreferencesStorageService,
    private readonly wishlistStorage: WishlistStorageService,
    private readonly authService: AuthApiService,
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
          this.clearSession();
        },
        error: (e) => {
          console.log(e);
          this.clearSession();
        },
      });
    } else {
      this.clearSession();
    }

    this.irAInicio();
  }

  clearSession() {
    this.sessionStorage.remove();
    this.sessionTokenStorage.remove();
    this.customerPreferenceStorage.remove();
    this.localS.remove(StorageKey.ordenCompraCargada);
    this.localS.remove(StorageKey.buscadorB2B);
    this.wishlistStorage.remove();
    this.authStateService.setSession(null);
  }

  irAInicio() {
    this.router.navigate(['/inicio']).then(() => {
      if (isPlatformBrowser(this.platformId)) window.location.reload();
    });
  }
}
