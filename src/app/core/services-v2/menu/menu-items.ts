import { IMenuItem } from './menu-item.interface';

const OVERVIEW_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Resumen',
  url: ['/', 'mi-cuenta', 'resumen'],
  icon: 'fas fa-tachometer-alt',
};

const PROFILE_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Mi perfil',
  url: ['/', 'mi-cuenta', 'mi-perfil'],
  icon: 'fas fa-user',
};

const PURCHASE_HISTORY_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Historial de compras',
  url: ['/', 'mi-cuenta', 'historial-de-compras'],
  icon: 'fas fa-history',
};

const TRACKING_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Seguimiento',
  url: ['/', 'mi-cuenta', 'seguimiento'],
  icon: 'fas fa-truck-moving',
};

const MY_PURCHASE_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Mis Compras',
  url: ['/', 'mi-cuenta', 'mis-compras'],
  icon: 'fa-sharp fa-solid fa-bag-shopping',
};

const LOGOUT_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Cerrar sesión',
  url: ['/', 'mi-cuenta', 'login'],
  icon: 'fas fa-power-off',
};

const FLOTA_ITEM_MENU: IMenuItem = {
  type: 'link',
  label: 'Mi Flota',
  url: ['/', 'mi-cuenta', 'mi-flota'],
  icon: 'fas fa-warehouse',
}

export class MenuItem {
  static OVERVIEW_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(OVERVIEW_ITEM_MENU);
  }

  static PROFILE_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(PROFILE_ITEM_MENU);
  }

  static PURCHASE_HISTORY_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(PURCHASE_HISTORY_ITEM_MENU);
  }

  static TRACKING_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(TRACKING_ITEM_MENU);
  }

  static MY_PURCHASE_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(MY_PURCHASE_ITEM_MENU);
  }

  static LOGOUT_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(LOGOUT_ITEM_MENU);
  }

  static FLOTA_ITEM_MENU(): IMenuItem {
    return MenuItem.copyMenuitem(FLOTA_ITEM_MENU)
  }

  private static copyMenuitem(item: IMenuItem): IMenuItem {
    return {
      icon: item.icon,
      label: item.label,
      type: item.type,
      url: [...item.url],
    };
  }
}
