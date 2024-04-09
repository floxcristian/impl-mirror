// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Libs
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DataTablesModule } from 'angular-datatables';
// Modules
import { SharedModule } from '../../shared/shared.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { BlocksModule } from '../blocks/blocks.module';
// Components
import { AccountComponent } from './components/account/account.component';

import { DropcartComponent } from './components/dropcart/dropcart.component';
import { HeaderComponent } from './header.component';
import { MenuComponent } from './components/menu/menu.component';
import { MenuCategoriasB2cComponent } from './components/menu-categorias-b2c/menu-categorias-b2c.component';
import { Nivel2Component } from './components/menu-categorias-b2c/components/nivel2/nivel2.component';
import { Nivel3Component } from './components/menu-categorias-b2c/components/nivel3/nivel3.component';
import { MenuCategoriaB2cMobileComponent } from './components/menu-categorias-b2c/menu-categoria-b2c-mobile/menu-categoria-b2c-mobile.component';
import { MobileSearchComponent } from './components/mobile-search/mobile-search.component';
import { ModalStoresComponent } from './components/modal-stores/modal-stores.component';
import { SearchComponent } from './components/search/search.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

//B2B
import { DireccionDespachoComponent } from './components/search-vin-b2b/components/direccion-despacho/direccion-despacho.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalVehicleComponent } from './components/modal-vehicle/modal-vehicle.component';
//PRIMENG
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    // components
    DropcartComponent,
    HeaderComponent,
    MenuComponent,
    SearchComponent,
    TopbarComponent,
    ModalStoresComponent,
    ModalVehicleComponent,
    AccountComponent,
    MobileSearchComponent,
    DireccionDespachoComponent,
    MenuCategoriasB2cComponent,
    MenuCategoriaB2cMobileComponent,
    Nivel2Component,
    Nivel3Component,
  ],
  imports: [
    // modules (angular)
    CommonModule,
    RouterModule,
    // modules
    SharedModule,
    FormsModule,
    BlocksModule,
    WidgetsModule,
    NgSelectModule,
    DataTablesModule,
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ReactiveFormsModule,
    ModalModule,
    DropdownModule,
    AutoCompleteModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule
  ],
  exports: [
    // components
    HeaderComponent,
    MenuComponent,
    ModalStoresComponent,
    ModalVehicleComponent,
    MobileSearchComponent,
    TopbarComponent,
    SearchComponent,
    DropcartComponent,
    MenuCategoriasB2cComponent,
    MenuCategoriaB2cMobileComponent,
  ],
  providers: [NgbActiveModal],
})
export class HeaderModule {}
