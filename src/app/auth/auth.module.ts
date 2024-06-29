// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
// Libs
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// Routing
import { AuthRoutingModule } from './auth-routing.module';
// Modules
import { BlocksModule } from '../modules/blocks/blocks.module';
import { HeaderModule } from '../modules/header/header.module';
import { HeaderB2bModule } from '../modules/account/components/header/header-b2b.module';
import { MobileModule } from '../modules/mobile/mobile.module';
import { SharedModule } from '../shared/shared.module';
import { CatalogoModule } from '../modules/catalogo/catalogo.module';
import { WidgetsModule } from '../modules/widgets/widgets.module';
// Components
import { PageHomeOneComponent } from '../pages/page-home-one/page-home-one.component';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';
import { PageSpecialsComponent } from '../pages/page-specials/page-specials.component';
import { LayoutComponent } from '../layout/layout.component';
import { B2cComponent } from '../layout/b2c/b2c.component';
import { PageDevolucionesComponent } from '../pages/page-devoluciones/page-devoluciones.component';
import { DevolucionOkModalComponent } from '../pages/components/devolucion-ok-modal/devolucion-ok-modal.component';
// Modules
import { FooterB2cModule } from '../modules/footer-b2c/footer-b2c.module';
import { PageHomeCmsModule } from '../modules/page-home-cms/page-home-cms.module';
import { PageMesDelCamioneroComponent } from '../pages/page-mes-del-camionero/page-mes-del-camionero.component';

@NgModule({
  declarations: [
    // pages
    PageHomeOneComponent,
    PageNotFoundComponent,
    PageSpecialsComponent,

    B2cComponent,
    LayoutComponent,
    PageDevolucionesComponent,
    DevolucionOkModalComponent,
    PageMesDelCamioneroComponent
  ],
  imports: [
    AuthRoutingModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // modules (third-party)
    ToastrModule.forRoot(),
    // modules
    BlocksModule,
    HeaderModule,
    HeaderB2bModule,
    FooterB2cModule,
    MobileModule,
    CatalogoModule,
    WidgetsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    ModalModule,
    TooltipModule.forRoot(),
    PageHomeCmsModule,
    SharedModule,
  ],
})
export class AuthModule {}
