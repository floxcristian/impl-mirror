// Angular
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';

import localeCL from '@angular/common/locales/es-CL';
registerLocaleData(localeCL, 'CLP');
// Libs
import { ToastrModule } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// Components
import { AppComponent } from './app.component';
// Routing
import { AppRoutingModule } from './app-routing.module';
// Modules
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { WidgetsModule } from './modules/widgets/widgets.module';
// Interceptor
import { LocalStorageService } from './core/modules/local-storage/local-storage.service';
import { LocalStorageModule } from './core/modules/local-storage/local-storage.module';
// SSR
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    LocalStorageModule,
    ToastrModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule,
    TooltipModule.forRoot(),
    // modules
    AppRoutingModule,
    SharedModule,
    WidgetsModule,
    NgbModule,
    CoreModule,
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    // { provide: 'googleTagManagerId', useValue: 'GTM-NFMB4X39' },
    { provide: LOCALE_ID, useValue: 'CLP' },

    Title,
    BsModalRef,
    {
      provide: APP_INITIALIZER,
      useFactory: (provider: LocalStorageService) => {
        return () => provider.setPrefix('ImplementosB2B.');
      },
      deps: [LocalStorageService],
      multi: true,
    },
    /*{
      provide: 'Window',
      useValue: window,
    },*/
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
