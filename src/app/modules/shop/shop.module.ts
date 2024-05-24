// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Libs
import { NgSelectModule } from '@ng-select/ng-select';
// Routing
import { ShopRoutingModule } from './shop-routing.module';
// Modules
import { BlocksModule } from '../blocks/blocks.module';
import { SharedModule } from '../../shared/shared.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { HeaderModule } from '../header/header.module';
// Pages
import { PageProductComponent } from './pages/page-product/page-product.component';
import { PageCategoryComponent } from './pages/page-category/page-category.component';
// Components
import { ComentariosComponent } from './components/comentarios/comentarios.component';
import { MapaFichasComponent } from './components/despacho/components/mapa-fichas/mapa-fichas.component';
import { DespachoComponent } from './components/despacho/despacho.component';
import { DetalleTecnicosComponent } from './components/detalle-tecnicos/detalle-tecnicos.component';
import { FechasPromesasComponent } from './components/fechas-promesas/fechas-promesas.component';
//shared
import { ProductComponent } from '../../shared/components/product/product.component';
import { ModalDeliveryComponent } from './components/despacho/components/modal-delivery/modal-delivery.component';
import { ModalPickupComponent } from './components/despacho/components/modal-pickup/modal-pickup.component';
import { ModalPickupTodayComponent } from './components/despacho/components/modal-pickup-today/modal-pickup-today.component';
import { GoogleMapsModule } from '@angular/google-maps';
//PRIMENG
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from "primeng/floatlabel"

@NgModule({
  declarations: [
    PageCategoryComponent,
    PageProductComponent,
    ProductComponent,
    DespachoComponent,
    FechasPromesasComponent,
    MapaFichasComponent,
    DetalleTecnicosComponent,
    ComentariosComponent,
    ModalDeliveryComponent,
    ModalPickupComponent,
    ModalPickupTodayComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlocksModule,
    SharedModule,
    ShopRoutingModule,
    WidgetsModule,
    NgSelectModule,
    HeaderModule,
    GoogleMapsModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    FloatLabelModule
  ],
})
export class ShopModule {}
