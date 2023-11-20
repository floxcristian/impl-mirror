// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Pages
import { PageLoginComponent } from './pages/page-login/page-login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PageDashboardComponent } from './pages/page-dashboard/page-dashboard.component';
import { PageOrdersListComponent } from './pages/page-orders-list/page-orders-list.component';
import { PageInvoicesListComponent } from './pages/page-invoices-list/page-invoices-list.component';
import { PageOvsListComponent } from './pages/page-ovs-list/page-ovs-list.component';
import { PageUsuariosComponent } from './pages/page-usuarios/page-usuarios.component';
import { PageProductsCategoriesComponent } from './pages/page-products-categories/page-products-categories.component';
import { PageNewProductsComponent } from './pages/page-new-products/page-new-products.component';
import { PageAddressesListComponent } from './pages/page-addresses-list/page-addresses-list.component';
import { PageProfileComponent } from './pages/page-profile/page-profile.component';
import { PagePasswordComponent } from './pages/page-password/page-password.component';
import { PagePendingOrdersComponent } from './pages/page-pending-orders/page-pending-orders.component';
import { PageQuotationComponent } from './pages/page-quotation/page-quotation.component';
import { PurchaseRequestComponent } from './pages/purchase-request/purchase-request.component';
import { PagePaymentPortalComponent } from './pages/page-payment-portal/page-payment-portal.component';
import { PageTrackingComponent } from './pages/page-tracking/page-tracking.component';
import { PageSaveCartComponent } from './pages/page-save-cart/page-save-cart.component';
import { PageCargaMasivaProdComponent } from './pages/page-carga-masiva-prod/page-carga-masiva-prod.component';
import { PageListaPreciosComponent } from './pages/page-lista-precios/page-lista-precios.component';
import { PageFlotaComponent } from './pages/page-flota/page-flota.component';
import { PageListasDeProductosComponent } from './pages/page-listas-de-productos/page-listas-de-productos.component';
import { PageCentrosCostoComponent } from './pages/page-centros-costo/page-centros-costo.component';
import { PageGestionUsuarioComponent } from './pages/page-gestion-usuario/page-gestion-usuario.component';
import { PageComprasComponent } from './pages/page-compras/page-compras.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'resumen',
      },
      {
        path: 'resumen',
        component: PageDashboardComponent,
      },
      {
        path: 'mi-perfil',
        component: PageProfileComponent,
      },
      {
        path: 'portal-de-pagos',
        component: PagePaymentPortalComponent,
      },
      {
        path: 'mis-direcciones',
        component: PageAddressesListComponent,
      },
      {
        path: 'historial-de-compras',
        component: PageOrdersListComponent,
      },
      {
        path: 'carga-masiva-prod',
        component: PageCargaMasivaProdComponent,
      },
      {
        path: 'facturacion',
        component: PageInvoicesListComponent,
      },
      {
        path: 'ordenes',
        component: PageOvsListComponent,
      },
      {
        path: 'contraseña',
        component: PagePasswordComponent,
      },
      {
        path: 'pedidos-pendientes',
        component: PagePendingOrdersComponent,
      },
      {
        path: 'cotizaciones',
        component: PageQuotationComponent,
      },
      {
        path: 'usuarios',
        component: PageUsuariosComponent,
      },
      {
        path: 'productos-categorias',
        component: PageProductsCategoriesComponent,
      },
      {
        path: 'productos-nuevos',
        component: PageNewProductsComponent,
      },
      {
        path: 'solicitudes-de-compras',
        component: PurchaseRequestComponent,
      },
      {
        path: 'seguimiento',
        component: PageTrackingComponent,
      },
      {
        path: 'mis-compras',
        component: PageComprasComponent,
      },
      {
        path: 'seguimiento/:ov',
        component: PageTrackingComponent,
      },
      {
        path: 'carros-guardados',
        component: PageSaveCartComponent,
      },

      {
        path: 'lista-precios',
        component: PageListaPreciosComponent,
      },
      {
        path: 'mi-flota',
        component: PageFlotaComponent,
      },
      {
        path: 'listas-de-productos',
        component: PageListasDeProductosComponent,
      },
      {
        path: 'gestion-usuariob2b',
        component: PageGestionUsuarioComponent,
      },
      {
        path: 'mis-centros-costos',
        component: PageCentrosCostoComponent,
      },
    ],
  },
  {
    path: 'login',
    component: PageLoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
