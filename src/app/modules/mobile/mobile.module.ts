// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Libs
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BadgeModule } from 'primeng/badge';
// Modules
import { SharedModule } from '../../shared/shared.module';
import { HeaderModule } from '../header/header.module';
// Components
import { MobileHeaderComponent } from './components/mobile-header/mobile-header.component';
import { MobileHeaderAccountComponent } from './components/mobile-header-account/mobile-header-account.component';
import { TopbarMobileComponent } from '../header/components/topbar-mobile/topbar-mobile.component';

@NgModule({
  declarations: [
    MobileHeaderComponent,
    MobileHeaderAccountComponent,
    TopbarMobileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    BadgeModule,
  ],
  exports: [MobileHeaderComponent],
})
export class MobileModule {}
