// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Libs
import { DataTablesModule } from 'angular-datatables';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule, PaginationConfig } from 'ngx-bootstrap/pagination';
// Routing
import { AccountRoutingModule } from './account-routing.module';
// Modules
import { SharedModule } from '../../shared/shared.module';
// Pages
import { PageDashboardComponent } from './pages/page-dashboard/page-dashboard.component';
import { PageLoginComponent } from './pages/page-login/page-login.component';
import { PageOrdersListComponent } from './pages/page-orders-list/page-orders-list.component';
import { PageProfileComponent } from './pages/page-profile/page-profile.component';
import { PagePendingOrdersComponent } from './pages/page-pending-orders/page-pending-orders.component';
import { PageQuotationComponent } from './pages/page-quotation/page-quotation.component';
import { PurchaseRequestComponent } from './pages/purchase-request/purchase-request.component';
import { PagePaymentPortalComponent } from './pages/page-payment-portal/page-payment-portal.component';
import { PageTrackingComponent } from './pages/page-tracking/page-tracking.component';
import { PageSaveCartComponent } from './pages/page-save-cart/page-save-cart.component';
import { PageCargaMasivaProdComponent } from './pages/page-carga-masiva-prod/page-carga-masiva-prod.component';
import { DetalleTrakingOvComponent } from './pages/page-detalle-traking-ov/page-detalle-traking-ov.component';
import { PageListaPreciosComponent } from './pages/page-lista-precios/page-lista-precios.component';
import { PageListasDeProductosComponent } from './pages/page-listas-de-productos/page-listas-de-productos.component';
import { PageCentrosCostoComponent } from './pages/page-centros-costo/page-centros-costo.component';
import { AddCentroCostoModalComponent } from './pages/page-centros-costo/components/add-centro-costo-modal/add-centro-costo-modal.component';
import { EditCentroCostoModalComponent } from './pages/page-centros-costo/components/edit-centro-costo-modal/edit-centro-costo-modal.component';
import { Trakingb2cComponent } from './pages/trakingb2c/trakingb2c.component';
import { PageGestionUsuarioComponent } from './pages/page-gestion-usuario/page-gestion-usuario.component';
import { PageComprasComponent } from './pages/page-compras/page-compras.component';
import { PageTrackingOvComponent } from './pages/page-tracking-ov/page-tracking-ov.component';
// Components
import { LayoutComponent } from './components/layout/layout.component';
import { TablaUsuarioComponent } from './components/tabla-usuario/tabla-usuario.component';
import { ModaluserComponent } from './components/modaluser/modaluser.component';
import { FiltroCategoriasComponent } from './components/filtro-categorias/filtro-categorias.component';
import { Modal_reciboComponent } from './components/modal_recibo/modal_recibo/modal_recibo.component';
// Shared components (se deben pasar al account.module ya que solo se usan aquí)
import { CardDashboardHorizontalBarChartComponent } from 'src/app/shared/components/card-dashboard-horizontal-bar-chart/card-dashboard-horizontal-bar-chart.component';
import { CardDashboardLineChartComponent } from 'src/app/shared/components/card-dashboard-line-chart/card-dashboard-line-chart.component';
import { PasswordModalComponent } from 'src/app/shared/components/password-modal/password-modal.component';
import { EditProfileModalComponent } from 'src/app/shared/components/edit-profile-modal/edit-profile-modal.component';
import { TrackingStepsComponent } from 'src/app/shared/components/tracking-steps/tracking-steps.component';
import { AddressModalComponent } from '../../shared/components/address-modal/address-modal.component';
import { CardDashboardComponent } from '../../shared/components/card-dashboard/card-dashboard.component';
import { OrderDetailsComponent } from '../../shared/components/order-details/order-details.component';
import { CardDashboardNoChartComponent } from '../../shared/components/card-dashboard-no-chart/card-dashboard-no-chart.component';
import { PageOvsListComponent } from './pages/page-ovs-list/page-ovs-list.component';
import { PageFlotaComponent } from './pages/page-flota/page-flota.component';
// Primeng
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
@NgModule({
  declarations: [
    LayoutComponent,
    PageDashboardComponent,
    PageLoginComponent,
    PageOrdersListComponent,
    PageProfileComponent,
    PagePendingOrdersComponent,
    PageQuotationComponent,
    PurchaseRequestComponent,
    PagePaymentPortalComponent,
    PageTrackingComponent,
    PageSaveCartComponent,
    AddressModalComponent,
    CardDashboardNoChartComponent,
    CardDashboardComponent,
    EditProfileModalComponent,
    OrderDetailsComponent,
    PasswordModalComponent,
    TrackingStepsComponent,
    PageCargaMasivaProdComponent,
    DetalleTrakingOvComponent,
    PageListaPreciosComponent,
    CardDashboardLineChartComponent,
    CardDashboardHorizontalBarChartComponent,
    PageTrackingOvComponent,
    PageListasDeProductosComponent,
    PageCentrosCostoComponent,
    AddCentroCostoModalComponent,
    EditCentroCostoModalComponent,
    Trakingb2cComponent,
    PageGestionUsuarioComponent,
    TablaUsuarioComponent,
    Modal_reciboComponent,
    ModaluserComponent,
    PageComprasComponent,
    FiltroCategoriasComponent,
    PageOvsListComponent,
    PageFlotaComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    DataTablesModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [PaginationConfig],
})
export class AccountModule {}
