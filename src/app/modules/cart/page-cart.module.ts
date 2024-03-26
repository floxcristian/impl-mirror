// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Libs
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// Routing
import { CartRoutingModule } from './page-cart-routing.module';
// Modules
import { BlocksModule } from '../blocks/blocks.module';
import { SharedModule } from '../../shared/shared.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { HeaderModule } from '../header/header.module';
// Pages
import { PageCartComponent } from './page/page-cart/page-cart.component';
import { PageCartShippingComponent } from '../cart/page/page-cart-shipping/page-cart-shipping.component';
import { PageCartPaymentMethodComponent } from '../cart/page/page-cart-payment-method/page-cart-payment-method.component';
import { PageCartOvSuccessComponent } from '../cart/page/page-cart-ov-success/page-cart-ov-success.component';
import { PageCartCoSuccessComponent } from './page/page-cart-co-success/page-cart-co-success.component';
import { PageCartRequestSuccessComponent } from './page/page-cart-request-success/page-cart-request-success.component';
import { PageCartHomeComponent } from './page/page-cart-home/page-cart-home.component';
import { PageCartChilexpressComponent } from './page/page-cart-chilexpress/page-cart-chilexpress.component';
import { PageOmniCartOvSuccessComponent } from './page/page-omni-cart-ov-success/page-omni-cart-ov-success.component';
import { PagesCartPaymentOcComponent } from './page/pages-cart-payment-oc/pages-cart-payment-oc.component';
import { PageDownloadpdfComponent } from './page/page-downloadpdf/page-downloadpdf.component';
import { ModalConfirmDatesComponent } from './page/page-cart-shipping/components/modal-confirm-dates/modal-confirm-dates.component';
import { PageOmniCartPaymentMethodComponent } from './page/page-omni-cart-payment-method/page-omni-cart-payment-method.component';
// Components
import { DetalleCarroProductosComponent } from './components/detalle-carro-productos/detalle-carro-productos.component';
import { ProductsListSummaryCartComponent } from './components/products-list-sumarry-cart/products-list-summary-cart.component';
import { AddAddressComponent } from '../../shared/components/add-address/add-address.component';
import { GuidedStepsComponent } from '../../shared/components/guided-steps/guided-steps.component';
import { LoginRegisterComponent } from '../../shared/components/login-register/login-register.component';
import { RegisterVisitComponent } from '../../shared/components/register-visit/register-visit.component';
import { RegisterReceptionComponent } from '../../shared/components/register-reception/register-reception.component';
import { GrupoDetalleFechasComponent } from './components/grupo-detalle-fechas/grupo-detalle-fechas.component';
import { GrupoDetalleProductosComponent } from './components/grupo-detalle-productos/grupo-detalle-productos.component';
import { GrupoDetalleFechaMobileComponent } from './components/grupo-detalle-fecha-mobile/grupo-detalle-fecha-mobile.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';
import { BancoslistComponent } from './components/bancoslist/bancoslist.component';
import { MapChilexpressComponent } from './components/map-chilexpress/map-chilexpress.component';
import { SucursalesComponent } from './components/sucursales/sucursales.component';
import { AgregarCentroCostoComponent } from './components/agregar-centro-costo/agregar-centro-costo.component';
import { ResumenRetiroComponent } from './components/resumen-retiro/resumen-retiro.component';
import { ListaPagoComponent } from './components/lista-pago/lista-pago.component';
import { CodigoOcComponent } from './components/codigo-oc/codigo-oc.component';
import { DetalleCarroProductosOcComponent } from './components/detalle-carro-productos-oc/detalle-carro-productos-oc.component';
import { CardProductCardComponent } from './components/card-product-card/card-product-card.component';

@NgModule({
  declarations: [
    PageCartComponent,
    PageCartShippingComponent,
    PageCartPaymentMethodComponent,
    PageCartOvSuccessComponent,
    DetalleCarroProductosComponent,
    PageCartCoSuccessComponent,
    PageCartRequestSuccessComponent,
    ProductsListSummaryCartComponent,
    PageOmniCartPaymentMethodComponent,
    ListaPagoComponent,
    ResumenRetiroComponent,
    AddAddressComponent,
    GuidedStepsComponent,
    LoginRegisterComponent,
    RegisterReceptionComponent,
    RegisterVisitComponent,
    PageCartHomeComponent,
    GrupoDetalleProductosComponent,
    GrupoDetalleFechasComponent,
    CardProductCardComponent,
    GrupoDetalleFechaMobileComponent,
    ModalConfirmComponent,
    BancoslistComponent,
    PageCartChilexpressComponent,
    MapChilexpressComponent,
    SucursalesComponent,
    PageDownloadpdfComponent,
    ModalConfirmDatesComponent,
    AgregarCentroCostoComponent,
    PageOmniCartOvSuccessComponent,
    CodigoOcComponent,
    PagesCartPaymentOcComponent,
    DetalleCarroProductosOcComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlocksModule,
    SharedModule,
    CartRoutingModule,
    WidgetsModule,
    NgSelectModule,
    HeaderModule,
    BsDropdownModule,
  ],
})
export class ShopModule {}
