// Angular
import { Injectable } from '@angular/core';
// Models
import { IUserRole } from '@core/services-v2/auth/models/login-response.interface';
import { IMenuItem } from './menu-item.interface';
// Constants
import { MenuItem } from './menu-items';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  get(profile: IUserRole): IMenuItem[] {
    let menuItems = [];
    if (profile === 'superadmin') {
      menuItems = [
        {
          type: 'link',
          label: 'Órdenes de Venta',
          url: ['/', 'mi-cuenta', 'ordenes'],
          icon: 'far fa-file-alt',
        },
        MenuItem.LOGOUT_ITEM_MENU(),
      ];
    } else if (profile === 'supervisor') {
      menuItems = [
        MenuItem.OVERVIEW_ITEM_MENU(),
        MenuItem.PROFILE_ITEM_MENU(),
        {
          type: 'link',
          label: 'Usuarios',
          url: ['/', 'mi-cuenta', 'gestion-usuariob2b'],
          icon: 'fas fa-users',
        },
        MenuItem.FLOTA_ITEM_MENU(),
        {
          type: 'link',
          label: 'Centros de costo',
          url: ['/', 'mi-cuenta', 'mis-centros-costos'],
          icon: 'fas fa-hand-holding-usd',
        },
        MenuItem.MY_PURCHASE_ITEM_MENU(),
        {
          type: 'link',
          label: 'Listas de productos',
          url: ['/', 'mi-cuenta', 'listas-de-productos'],
          icon: 'fas fa-list-ul',
        },
        {
          type: 'link',
          label: 'Lista de Precios',
          url: ['/', 'mi-cuenta', 'lista-precios'],
          icon: 'fas fa-dollar-sign',
        },
        {
          type: 'link',
          label: 'Carros Guardados',
          url: ['/', 'mi-cuenta', 'carros-guardados'],
          icon: 'fas fa-cart-arrow-down',
        },
        {
          type: 'link',
          label: 'Pague sus facturas aquí',
          url: ['/', 'mi-cuenta', 'portal-de-pagos'],
          icon: 'fas fa-money-check-alt',
        },
        {
          type: 'link',
          label: 'Solicitudes de compras',
          url: ['/', 'mi-cuenta', 'solicitudes-de-compras'],
          icon: 'far fa-thumbs-up',
        },
        {
          type: 'link',
          label: 'Pedidos Pendientes',
          url: ['/', 'mi-cuenta', 'pedidos-pendientes'],
          icon: 'far fa-clock',
        },
        {
          type: 'link',
          label: 'Cotizaciones',
          url: ['/', 'mi-cuenta', 'cotizaciones'],
          icon: 'fas fa-file-invoice',
        },
        {
          type: 'link',
          label: 'Documentos',
          url: ['/', 'mi-cuenta', 'historial-de-compras'],
          icon: 'fas fa-history',
        },

        {
          type: 'link',
          label: 'Carga Masiva Productos',
          url: ['/', 'mi-cuenta', 'carga-masiva-prod'],
          icon: 'fas fa-file-upload',
        },
        MenuItem.TRACKING_ITEM_MENU(),
        MenuItem.LOGOUT_ITEM_MENU(),
      ];
    } else if (profile === 'buyer') {
      menuItems = [
        MenuItem.OVERVIEW_ITEM_MENU(),
        MenuItem.PROFILE_ITEM_MENU(),
        MenuItem.FLOTA_ITEM_MENU(),
        {
          type: 'link',
          label: 'Centros de costo',
          url: ['/', 'mi-cuenta', 'mis-centros-costos'],
          icon: 'fas fa-hand-holding-usd',
        },
        MenuItem.MY_PURCHASE_ITEM_MENU(),
        {
          type: 'link',
          label: 'Listas de productos',
          url: ['/', 'mi-cuenta', 'listas-de-productos'],
          icon: 'fas fa-list-ul',
        },
        {
          type: 'link',
          label: 'Lista de Precios',
          url: ['/', 'mi-cuenta', 'lista-precios'],
          icon: 'fas fa-dollar-sign',
        },
        {
          type: 'link',
          label: 'Carros Guardados',
          url: ['/', 'mi-cuenta', 'carros-guardados'],
          icon: 'fas fa-cart-arrow-down',
        },
        {
          type: 'link',
          label: 'Solicitudes de compras',
          url: ['/', 'mi-cuenta', 'solicitudes-de-compras'],
          icon: 'far fa-thumbs-up',
        },
        {
          type: 'link',
          label: 'Pedidos Pendientes',
          url: ['/', 'mi-cuenta', 'pedidos-pendientes'],
          icon: 'far fa-clock',
        },
        {
          type: 'link',
          label: 'Cotizaciones',
          url: ['/', 'mi-cuenta', 'cotizaciones'],
          icon: 'fas fa-file-invoice',
        },
        MenuItem.PURCHASE_HISTORY_ITEM_MENU(),
        {
          type: 'link',
          label: 'Carga Masiva Productos',
          url: ['/', 'mi-cuenta', 'carga-masiva-prod'],
          icon: 'fas fa-file-upload',
        },
        MenuItem.TRACKING_ITEM_MENU(),
        MenuItem.LOGOUT_ITEM_MENU(),
      ];
    } else if (profile === 'cms') {
      menuItems = [MenuItem.LOGOUT_ITEM_MENU()];
    } else if (profile === 'b2c') {
      menuItems = [
        MenuItem.OVERVIEW_ITEM_MENU(),
        MenuItem.PROFILE_ITEM_MENU(),
        MenuItem.FLOTA_ITEM_MENU(),
        MenuItem.PURCHASE_HISTORY_ITEM_MENU(),
        MenuItem.TRACKING_ITEM_MENU(),
        MenuItem.LOGOUT_ITEM_MENU(),
      ];
    } else {
      menuItems = [MenuItem.TRACKING_ITEM_MENU()];
    }

    return menuItems;
  }
}
