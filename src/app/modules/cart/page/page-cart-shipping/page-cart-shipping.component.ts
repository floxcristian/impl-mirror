// Angular
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
// Libs
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
// Rxjs
import { Subject, firstValueFrom, lastValueFrom } from 'rxjs';
// Models
import { CartTotal } from '../../../../shared/interfaces/cart-item';
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import {
  ShippingService,
  ShippingDateItem,
} from '../../../../shared/interfaces/address';
import { Banner } from '../../../../shared/interfaces/banner';
// Components
import { TabsetComponent } from 'ngx-bootstrap/tabs';
// Constants
import { ShippingType } from '../../../../core/enums';
import { ModalConfirmDatesComponent } from './components/modal-confirm-dates/modal-confirm-dates.component';
import { map, takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@core/modules/local-storage/local-storage.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { ClientsService } from '@shared/services/clients.service';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '@shared/components/modal/modal.component';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import {
  IShoppingCart,
  IShoppingCartGroup,
  IShoppingCartProduct,
  IShoppingCartTripDate,
} from '@core/models-v2/cart/shopping-cart.interface';
import { CartService } from '@core/services-v2/cart.service';
import { IRemoveGroupRequest } from '@core/models-v2/requests/cart/remove-group.request';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { ReceiveStorageService } from '@core/storage/receive-storage.service';
import { IReceive } from '@core/models-v2/storage/receive.interface';
import { ShoppingCartStorageService } from '@core/storage/shopping-cart-storage.service';
import { AddNotificacionContactRequest } from '@core/models-v2/requests/cart/add-notification-contact.request';
import { GetLogisticPromiseRequest } from '@core/models-v2/requests/cart/logistic-promise-request';
import { GetLogisticPromiseResponse } from '@core/models-v2/responses/logistic-promise-responses';
import { IGuest } from '@core/models-v2/storage/guest.interface';
import { GuestStorageService } from '@core/storage/guest-storage.service';
import { DeliveryType } from '@core/enums/delivery-type.enum';
import { environment } from '@env/environment';
import { ICreateGuest } from '@core/models-v2/customer/create-guest.interface';
import { CustomerService } from '@core/services-v2/customer.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { IError } from '@core/models-v2/error/error.interface';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';
import { CallBackCartLoaded } from '@core/models-v2/cart/callback-cart-loaded.type';
import { UserRoleType } from '@core/enums/user-role-type.enum';
declare let dataLayer: any;

export let browserRefresh = false;
@Component({
  selector: 'app-page-cart-shipping',
  templateUrl: './page-cart-shipping.component.html',
  styleUrls: ['./page-cart-shipping.component.scss'],
  providers: [DatePipe],
})
export class PageCartShippingComponent implements OnInit {
  productCart!: IShoppingCartProduct[];
  @ViewChild('tabsShipping', { static: false }) tabsShipping!: TabsetComponent;

  innerWidth: number;
  loadingSucursal: boolean = true;
  banners: Banner[] = [];
  private destroy$: Subject<void> = new Subject();
  usuarioInvitado: boolean = false;
  invitado!: IGuest;
  direccion: boolean = false;
  usuarioInv!: IGuest;
  recibeType = 'yo';
  recibeOtra: boolean = false;
  recibeOtraname: string = '';
  recibeYoname: string = '';
  showNewAddress: boolean = false;
  showDetalleProductos: boolean = false;
  showresumen: boolean = false;
  tienda!: IStore;
  retiro = '';
  conflictoEntrega: boolean = false;
  //variables para el despachos
  shippingType: string = '';
  tienda_actual: any = null;
  grupos = 0;
  items: any[] = [];

  indexTemp = -1;
  select_grupos: boolean = false;
  confirmar: boolean = false;
  obj_fecha: any = [];
  fecha_actual = moment().startOf('day').toISOString();
  sucursal = null;

  shippingSelected: ShippingService | undefined | null = null;

  userSession!: ISession;
  cartSession!: IShoppingCart; //CartData;
  recidDireccion = 0;
  showMap: boolean = false;

  // retiro
  cardShippingActiveStore = 0;
  selectedShippingIdStore: any;
  tempShippingIdStore: any;
  shippingDaysStore: ShippingDateItem[] = [];
  TiendasCargadas: boolean = false;
  loadingShippingStore = false;
  fecha = new Date();
  // despacho
  cardShippingActive = 0;
  grupoShippingActive: number | null = 0;
  selectedShippingId: any;
  selectedShippingIdLast: any;
  selectedStoreItem = {};
  addresses: (ICustomerAddress & {
    fullAddress: string;
    isDefault: boolean;
  })[] = [];
  shippingDays: ShippingDateItem[] = [];

  loadingShipping = false;
  direccionName: string = '';
  tituloDespacho: string = '';
  tituloRecibe: string = 'Persona que recibe';
  loadingShippingAll = false;
  showAllAddress: boolean = false;
  isLogin!: boolean;
  loadingResumen = false;

  // productos validados
  productsValidate: IShoppingCartProduct[] = [];
  productosSeleccionado: any = [];
  fechas: any = [];
  //generar grupo de carritos
  grupoShippingCart: any = {};
  documentType = 'factura';
  loadingCotizacion = false;
  direccionConfigurada!: ICustomerPreference;

  stores: IStore[] = [];
  config: IConfig;
  userRoleType = UserRoleType;
  addressCustomerSelected!: ICustomerAddress & {
    fullAddress: string;
    isDefault: boolean;
  };

  constructor(
    private toast: ToastrService,
    private datePipe: DatePipe,
    private router: Router,
    private localS: LocalStorageService,
    private modalService: BsModalService,

    private cd: ChangeDetectorRef,
    private readonly gtmService: GoogleTagManagerService,
    private clientsService: ClientsService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    public readonly cart: CartService,
    private readonly guestStorage: GuestStorageService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly geolocationStorage: GeolocationStorageService,
    private readonly customerPreferencesStorage: CustomerPreferencesStorageService,
    private readonly shoppingCartStorage: ShoppingCartStorageService,
    private readonly receiveStorage: ReceiveStorageService,
    private readonly customerService: CustomerService,
    private readonly customerAddressApiService: CustomerAddressApiService,
    public readonly configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.config = this.configService.getConfig();
    this.receiveStorage.set({} as IReceive);
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;

    this.tienda_actual = this.geolocationStorage.get();
  }

  async ngOnInit() {
    this.cartSession = this.shoppingCartStorage.get()!;

    this.invitado = this.guestStorage.get() as IGuest;
    this.tienda_actual = this.geolocationStorage.get();
    this.userSession = this.sessionService.getSession();
    this.addNotificationContact();
    this.obtieneDireccionesCliente();
    this.obtieneTiendas();
    this.direccionConfigurada = this.customerPreferencesStorage.get();
    this.isLogin = this.sessionService.isLoggedIn();

    if (!this.HideResumen()) {
      this.recibeType = 'yo';
    }

    setTimeout(() => {
      this.cart.dropCartActive$.next(false);
    });

    this.subscribeOnLogin();

    this.cart.shippingValidateProducts$.subscribe(
      (r: IShoppingCartProduct[]) => {
        this.productsValidate = r;

        this.invitado = this.guestStorage.get() as IGuest;
        this.userSession = this.sessionService.getSession();
        this.grupoShippingCart.grupo = [];
      }
    );

    this.cart.items$
      .pipe(
        takeUntil(this.destroy$),
        map((ProductCarts) =>
          (ProductCarts || []).map((item) => {
            return {
              ProductCart: item,
              quantity: item.quantity,
            };
          })
        )
      )
      .subscribe((items) => {
        this.items = items;
      });
    //marcaje google tag
    if (isPlatformBrowser(this.platformId)) {
      this.onSelect(null, 'retiro');
      if (
        this.userSession.userRole !== UserRoleType.SUPERVISOR &&
        this.userSession.userRole !== UserRoleType.BUYER
      ) {
        // this.gtmService.pushTag({
        //   event: 'shipping',
        //   pagePath: window.location.href,
        // });
        dataLayer.push({
          event: 'shipping',
          pagePath: window.location.href,
        });
      }
    }
  }

  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }

  async obtieneDireccionesCliente(isDelete: boolean = false) {
    this.loadingShippingAll = true;
    const { documentId } = this.sessionService.getSession();

    if (!this.usuarioInvitado && documentId && documentId !== '0') {
      this.customerAddressApiService
        .getDeliveryAddresses(documentId)
        .subscribe({
          next: (addresses) => {
            this.loadingShippingAll = false;
            if (!isDelete) {
              // Obtener última dirección (id más alto).
              const addressIds = addresses.map((address) =>
                Number(address.id)
              );
              this.selectedShippingId = String(Math.max(...addressIds));
            }

            this.addresses = addresses.map((address) => {
              const isDefault = address.id === this.selectedShippingId;
              // Formatear dirección.
              const startAddress = `${address.street} ${address.number},`;
              const fullAddress = address.departmentHouse
                ? `${startAddress} depto/casa: ${address.departmentHouse}, ${address.city}`
                : `${startAddress} ${address.city}`;
              if (address.id === this.selectedShippingId)
                this.addressCustomerSelected = {
                  ...address,
                  fullAddress,
                  isDefault,
                };
              return { ...address, fullAddress, isDefault };
            });
            if (this.shippingType === 'despacho') this.obtieneDespachos();

            this.showNewAddress = false;
          },
          error: (e) => {
            // this.toast.error(
            //   'Ha ocurrido un error en servicio al obtener las direcciones'
            // );
          },
        });
    }
    this.loadingShippingAll = false;
  }

  /**
   * Obtiene contacto notificaciones.
   */
  async addNotificationContact() {
    let data: AddNotificacionContactRequest = {};

    this.userSession = this.sessionService.getSession();
    this.invitado = this.guestStorage.get() as IGuest;
    if (this.userSession.userRole != 'temp') {
      data.phone = this.userSession.phone;
      data.email = this.userSession.email;
      data.name = this.userSession.firstName + ' ' + this.userSession.lastName;
    } else if (this.userSession.userRole == 'temp' && this.invitado != null) {
      data.phone = this.invitado.phone;
      data.email = this.invitado.email;
      data.name = this.getFullName(this.invitado);
    }
    if (data.name) {
      await this.cart
        .setNotificationContact(this.cartSession._id!.toString(), data)
        .toPromise();
    }
  }

  /**
   * Obtiene despachos a domicilio.
   */
  async obtieneDespachos(removeShipping = true) {
    this.fechas = [];

    const usuario = this.sessionService.getSession();
    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;

    const resultado = this.addresses.find(
      (address) => address.id == this.selectedShippingId
    );

    if (resultado) {
      this.loadingShipping = true;
      const data: GetLogisticPromiseRequest = {
        user: usuario.username,
        deliveryMode: 'delivery',
        destination: `${resultado.city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}|${
          resultado.regionCode ? resultado.regionCode : ''
        }`,
        address: resultado.address,
        addressId: resultado.id,
      };

      this.cardShippingActiveStore = 0;

      if (removeShipping) {
        this.cart.removeTotalShipping();
        this.cart.removeTotalDiscount();
      }

      this.cardShippingActive = 0;
      this.shippingDays = [];

      let i = 0;

      try {
        const response: GetLogisticPromiseResponse = await lastValueFrom(
          this.cart.logisticPromise(data)
        );
        if (response.shoppingCart.groups) {
          this.shippingDays = [];

          response.shoppingCart.groups.forEach((group: IShoppingCartGroup) => {
            let j = 0;
            let dia_despacho: ShippingService[] = [];
            i = i + 1;
            group.tripDates.forEach((item: IShoppingCartTripDate) => {
              let index = j++;
              const obj = {
                index,
                id: group.id,
                diasdemora: item.businessDays,
                fecha: item.requestedDate,
                fechaPicking: item.pickingDate,
                origen: group.warehouse,
                precio: item.price,
                proveedor: item.carrier.description,
                tipoenvio: item.serviceType.code,
                tipopedido: item.serviceType.code,
              };
              dia_despacho.push(obj);
            });

            this.shippingDays.push({
              grupo: group.id,
              productodespacho: group.products,
              fechas: dia_despacho,
            });
          });
        } else {
          this.shippingDays = [];
        }
      } catch (e) {
        console.log(e);
        this.loadingResumen = false;
        this.loadingShipping = false;
      }

      this.loadingResumen = false;
      this.loadingShipping = false;
    } else {
      this.loadingResumen = false;
    }

    this.ver_fechas();
  }

  obtieneTiendas() {
    let usuarioRole = this.userSession.userRole;
    let data_usuario;

    if (
      this.userSession.username &&
      this.userSession.username != this.userSession.email
    )
      data_usuario = this.userSession.username;
    else if (
      this.userSession.username &&
      this.userSession.username == this.userSession.email
    )
      data_usuario = this.userSession.email;
    else data_usuario = this.userSession.email;
    if (usuarioRole === 'temp') {
      data_usuario = this.userSession.email;
    }

    this.geolocationService.stores$.subscribe({
      next: (stores) => {
        this.stores = stores;
        this.TiendasCargadas = true;

        // Poner tienda seleccionada al comienzo de la lista.
        const selectedStore = this.geolocationService.getSelectedStore();
        const tiendaActual = this.stores.find((store) => {
          return store.code === selectedStore.code /*selectedStore.codigo*/;
        });

        // Hacer algo..
        if (tiendaActual) {
          const tiendas = this.stores.filter(
            (store) => store.id != tiendaActual.id
          );
          tiendas.unshift(tiendaActual);
          this.stores = tiendas;
          this.selectedShippingIdStore = tiendaActual.id;
          this.tempShippingIdStore = this.selectedShippingIdStore;
          this.obtieneRetiro(false);
        }
      },
    });
  }

  /**
   * Obtiene retiro en tienda.
   */
  async obtieneRetiro(removeShipping = true) {
    this.loadingShippingStore = true;

    this.fechas = [];

    // this.selectedShippingId = this.selectedShippingIdStore;
    const usuario = this.sessionService.getSession();

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;
    const resultado = this.stores.find(
      (item) => item.id == this.selectedShippingIdStore
    );
    if (!resultado) return;

    this.tienda = resultado;

    this.cambiarTienda(this.tienda, async (_: IShoppingCart) => {
      this.localS.set(StorageKey.tiendaRetiro, resultado);

      let disponible = resultado;
      const data: GetLogisticPromiseRequest = {
        user: usuario.username,
        deliveryMode: 'pickup',
        destination: disponible.code + '|' + disponible.regionCode,
        address: disponible.name,
        addressId: disponible.id,
      };

      /*
      const sucursal = {
        usuario: usuario.username,
        sucursal: disponible.codigo
      };*/

      if (removeShipping) {
        this.shippingSelected = null;
        // reiniciamos las variables del despacho
        this.shippingDays = [];
        this.cardShippingActive = 0;
        this.cardShippingActiveStore = 0;
        this.selectedShippingId = null;
        this.cart.removeTotalShipping();
        this.cart.removeTotalDiscount();
      }
      this.shippingDaysStore = [];
      try {
        const response: GetLogisticPromiseResponse = await lastValueFrom(
          this.cart.logisticPromise(data)
        );
        if (response.shoppingCart.groups) {
          this.shippingDaysStore = [];

          response.shoppingCart.groups.forEach((group: IShoppingCartGroup) => {
            let i = 0;
            let dia_despacho: ShippingService[] = [];

            group.tripDates.forEach((item: IShoppingCartTripDate) => {
              let isSabado = this.valFindeSemana(
                item.requestedDate.toString()
              );
              const obj = {
                index: i++,
                id: group.id,
                diasdemora: item.businessDays,
                fecha: item.requestedDate,
                fechaPicking: item.pickingDate,
                origen: group.warehouse,
                precio: item.price,
                proveedor: item.carrier.description,
                tipoenvio: 'TIENDA',
                tipopedido: 'VEN- RPTDA',
                isSabado: isSabado,
              };

              dia_despacho.push(obj);
            });

            this.shippingDaysStore.push({
              grupo: group.id,
              productodespacho: group.products,
              fechas: dia_despacho,
            });
          });
        }
        if (this.userSession.userRole == 'temp') {
          this.loadingResumen = false;
        }
        this.loadingShippingStore = false;
        this.ver_fechas();
      } catch (e) {
        console.log(e);
        this.loadingShippingStore = false;
        this.shippingDaysStore = [];
      }
      //});
    });
  }

  /**
   * Obtiene el nombre del usuario.
   */
  private getFullName(guest: IGuest | ISession): string {
    const { firstName, lastName } = guest;
    return `${firstName} ${lastName}`;
  }

  /**
   * TODO: juntar con seleccionar despacho.
   */
  //  seleccionaDespachoInvitado(item: ShippingService, pos): void {
  // // invitado solamente <<<<<<<<<<<<<<<

  //   let invitado: any = this.localS.get('invitado');
  //   invitado.tipoEnvio = 'DES';
  //   this.localS.remove('invitado');
  //   this.localS.set('invitado', invitado);
  //   this.usuarioInv = this.localS.get('invitado');
  //   // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //   this.recibeYoname = this.getFullName(invitado);

  //   this.cardShippingActive = item.index;
  //   this.grupoShippingActive = this.shippingDays[pos].grupo;
  //   this.shippingSelected = this.shippingDays[pos].fechas.find(item => item.index === this.cardShippingActive);
  //   this.productosSeleccionado = this.shippingDays[pos].productodespacho;
  //   this.recidDireccion = 0;
  //   const nombre = `Despacho ` + this.datePipe.transform(this.shippingSelected.fecha, 'EEEE dd MMM');

  //   const envio: CartTotal = {
  //     price: this.shippingSelected.precio,
  //     title: nombre,
  //     type: 'shipping'
  //   };

  //   this.cart.addTotalShipping(envio);

  //   // guardamos el despacho y vericamos si tiene descuento o no
  //   this.saveShipping();
  // }

  /**
   *
   */
  // seleccionaDespachoOriginal(item: ShippingService, pos: number): void {
  //   this.obj_fecha[pos] = item; // no esta
  //   this.recibeYoname = this.getFullName(this.userSession);

  //   this.cardShippingActive = item.index;
  //   this.grupoShippingActive = this.shippingDays[pos].grupo;
  //   this.shippingSelected = this.shippingDays[pos].fechas.find(item => item.index === this.cardShippingActive);
  //   this.productosSeleccionado = this.shippingDays[pos].productodespacho;
  //   this.recidDireccion = this.selectedShippingId;
  //   const nombre = `Despacho ` + this.datePipe.transform(this.shippingSelected.fecha, 'EEEE dd MMM');
  //   const envio: CartTotal = {
  //     price: this.shippingSelected.precio,
  //     title: nombre,
  //     type: 'shipping'
  //   };

  //   this.cart.addTotalShipping(envio);
  //   // guardamos el despacho y vericamos si tiene descuento o no
  //   this.saveShipping();

  //   // TODO:
  //   this.fechas[pos] = this.shippingSelected.fecha;
  //   this.localS.set('fechas', this.fechas);
  //   this.localS.remove('tiendaRetiro');
  // }

  /* funcion de prueba*/
  seleccionaDespacho(item: ShippingService, pos: number) {
    let invitado: any = null;

    if (this.isLogin) {
      this.recibeYoname = this.getFullName(this.userSession);
      this.recidDireccion = this.selectedShippingId;
      this.obj_fecha[pos] = item;
    }
    if (this.invitado) {
      invitado = this.guestStorage.get();
      this.recibeYoname = this.getFullName(invitado);
      this.recidDireccion = 0;
      this.guestStorage.set(invitado);
      this.usuarioInv = this.guestStorage.get()!;
    }

    this.grupoShippingActive = this.shippingDays[pos].grupo ?? null;
    this.productosSeleccionado = this.shippingDays[pos].productodespacho;

    this.cardShippingActive = item.index;
    this.shippingSelected = (this.shippingDays[pos].fechas || []).find(
      (item) => item.index === this.cardShippingActive
    );

    const nombre =
      `Despacho ` +
      this.datePipe.transform(this.shippingSelected?.fecha, 'EEEE dd MMM');

    const envio: CartTotal = {
      price: this.shippingSelected?.precio,
      title: nombre,
      type: 'shipping',
    };
    this.cart.addTotalShipping(envio);

    // guardamos el despacho y vericamos si tiene descuento o no
    this.saveShipping(pos, item.index);
    this.fechas[pos] = this.shippingSelected?.fecha;
    this.localS.set(StorageKey.fechas, this.fechas);
    this.localS.remove(StorageKey.tiendaRetiro);
  }
  /** */
  /**
   *
   */
  seleccionaRetiro(item: ShippingService, pos: number) {
    this.obj_fecha[pos] = item;
    this.cardShippingActiveStore = item.index;
    this.grupoShippingActive = this.shippingDaysStore[pos].grupo ?? null;
    this.shippingSelected = (this.shippingDaysStore[pos].fechas || []).find(
      (item) => item.index === this.cardShippingActiveStore
    );
    this.recidDireccion = this.selectedShippingIdStore;
    this.fechas[pos] = this.shippingSelected?.fecha;
    const envio: CartTotal = {
      price: this.shippingSelected?.precio,
      title: `Retiro tienda ${this.datePipe.transform(
        this.shippingSelected?.fecha,
        'EEEE dd MMM'
      )}`,
      type: 'shipping',
    };
    this.cart.addTotalShipping(envio);

    // guardamos el despacho y vericamos si tiene descuento o no
    this.saveShipping(pos, item.index);
    this.localS.set(StorageKey.fechas, this.fechas);
  }

  addShipping(data: IShoppingCart) {
    if (data.shipment && data.shipment.discount > 0) {
      const descuentoEnvio: CartTotal = {
        price: data.shipment.discount * -1,
        title: 'Descuento Despacho',
        type: 'discount',
      };
      this.cart.addTotaldiscount(descuentoEnvio);
    }
  }

  next() {
    this.saveShipping(-1, -1, true);
  }

  saveShipping(
    indexGroup: number = -1,
    indexTripDate: number = -1,
    redirect = false
  ) {
    if (!this.loadingResumen) this.loadingResumen = true;
    if (this.shippingSelected?.tipoenvio === 'TIENDA') {
      this.shippingSelected.tipopedido = 'VEN- RPTDA';
    } else if (this.shippingSelected) {
      this.shippingSelected.tipopedido = 'VEN- DPCLI';
    }

    if (indexGroup !== -1 && indexTripDate !== -1) {
      this.cart.updateShipping(indexGroup, indexTripDate).subscribe({
        next: (response: GetLogisticPromiseResponse) => {
          const shoppingCart = response.shoppingCart;
          this.loadingResumen = false;
          if (redirect) {
            this.router.navigate(['/', 'carro-compra', 'forma-de-pago']);
          }
          //this.addShipping(shoppingCart);
        },
        error: () => {
          this.toast.error(
            'Ha ocurrido un error en servicio al actualizar el carro de compra'
          );
          this.loadingResumen = false;
        },
      });
      this.getDireccionName(this.shippingSelected?.tipoenvio || '');
    } else {
      this.loadingResumen = false;
      if (redirect) {
        this.router.navigate(['/', 'carro-compra', 'forma-de-pago']);
      }
    }
  }

  subscribeOnLogin() {
    this.authStateService.session$.subscribe((user) => {
      this.isLogin = this.sessionService.isLoggedIn();
      this.obtieneDireccionesCliente();
      this.addNotificationContact();
    });
  }

  openModal() {
    const modalConfirmDates = this.modalService.show(
      ModalConfirmDatesComponent,
      {
        backdrop: 'static',
        keyboard: false,
        initialState: {
          shippingType: this.shippingType as any,
          confirmar: this.confirmar,
          obj_fecha: this.obj_fecha,
          select_grupos: this.select_grupos,
        },
      }
    );
    modalConfirmDates.content?.select_grupos_change.subscribe((res) => {
      this.select_grupos = res;
    });
    modalConfirmDates.content?.selectTab.subscribe((res) => {
      this.onSelect(null, res);
    });
  }

  // Evento activado cuando se un usuario logeado agrega o cancela la accion de agregar una nueva direccion.
  respuesta(event: any, isDelete: boolean = false) {
    if (event) {
      this.shippingSelected = null;
      if (isDelete) {
        this.obtieneDireccionesCliente(true);
        this.showAllAddress = true;
      } else {
        this.obtieneDireccionesCliente();
        this.showAllAddress = false;
        window.scrollTo({ top: 0 });
      }
    } else {
      this.showNewAddress = false;
      window.scrollTo({ top: 0 });
    }
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  retiroFlag: boolean = false;

  onSelect(event: any, formaEntrega: 'retiro' | 'despacho' | 'sucursal') {
    this.loadingResumen = true;
    this.select_grupos = false;
    this.confirmar = false;
    this.indexTemp = -1;
    this.grupos = 0;
    this.fechas = [];

    this.localS.remove(StorageKey.fechas);
    if (formaEntrega == 'sucursal') {
      this.loadingSucursal = true;
      formaEntrega = 'despacho';
      this.shippingType = formaEntrega;
    } else {
      this.shippingType = formaEntrega;
      this.loadingSucursal = false;
    }
    this.cart.updateShippingType(formaEntrega);

    if (formaEntrega === 'retiro') {
      this.retiroFlag = true;
      // this.recibeType = 'yo';
      this.showAllAddress = false;
      this.showNewAddress = false;
      this.direccion = false;
      this.selectedShippingIdStore = this.tempShippingIdStore;

      if (!this.selectedShippingIdStore) {
        this.shippingDaysStore = [];
        this.loadingResumen = false;
      } else if (this.selectedShippingIdStore) {
        this.obtieneRetiro(false);
      }
    } else if (formaEntrega === 'despacho' && this.isLogin) {
      this.selectedShippingId = null;
      this.retiroFlag = false;
      // if (this.HideResumen()) {
      //   this.recibeType = 'yo';
      // } else {
      //   this.recibeType = 'yo';
      // }
      if (this.selectedShippingIdLast)
        this.selectedShippingId = this.selectedShippingIdLast;
      else this.setDefaultAddress();

      if (this.selectedShippingId) {
        this.obtieneDespachos();
      }
    } else {
      this.retiroFlag = false;
    }

    // let invitado: any = this.localS.get('invitado');
    let invitado = this.guestStorage.get();
    if (invitado != null) {
      invitado.deliveryType = 'RC';
      // this.localS.remove('invitado');
      this.guestStorage.remove();
      // this.localS.set('invitado', invitado);
      this.guestStorage.set(invitado);
      // this.usuarioInv = this.localS.get('invitado');
      this.usuarioInv = this.guestStorage.get()!;

      this.obtieneDespachos();
    }
    //poner RC a cliente
    this.shippingDays = [];
    this.cardShippingActive = 0;
    //this.selectedShippingId = null;
    this.shippingSelected = null;
    this.loadingResumen = false;
  }

  usuarioVisita(invitado: any) {
    this.usuarioInvitado = true;
    invitado.tipoEnvio = '';
    // this.localS.set('invitado', invitado);
    this.guestStorage.set(invitado);

    this.addNotificationContact();
    window.scrollTo({ top: 0 });
  }

  // evento ejecutado cuando un invitado agrega una nueva direccion.
  async direccionVisita(direccion: any, removeShipping = true) {
    this.direccion = true;
    let invitado = this.guestStorage.get() as IGuest;

    invitado.street = direccion.calle;
    invitado.commune = direccion.comuna;
    invitado.completeComune = direccion.comunaCompleta;
    invitado.number = direccion.numero;
    invitado.department = direccion.depto ? direccion.depto : 0;
    this.guestStorage.remove();
    this.guestStorage.set(invitado);
    this.usuarioInv = this.guestStorage.get()!;
    this.loadingShipping = true;
    this.shippingSelected = null;

    // reiniciamos las variables del retiro en tienda
    this.shippingDaysStore = [];
    this.cardShippingActiveStore = 0;
    this.selectedShippingIdStore = null;

    if (removeShipping) {
      this.cart.removeTotalShipping();
      this.cart.removeTotalDiscount();
    }

    this.shippingDays = [];
    this.cardShippingActive = 0;
    let i = 0;

    const documentId = invitado.documentId ?? '';
    const createGuestRequest: ICreateGuest = {
      email: invitado.email ?? '',
      documentId: documentId,
      documentType: environment.country.toUpperCase(),
      firstName: invitado.firstName ?? '',
      lastName: invitado.lastName ?? '',
      phone: invitado.phone ?? '',
      address: {
        location: invitado.completeComune
          ? invitado.completeComune.split('@')[0]
          : 'SAN BERNARDO',
        city: invitado.completeComune
          ? invitado.completeComune.split('@')[0]
          : 'SAN BERNARDO',
        region: invitado.completeComune
          ? invitado.completeComune.split('@')[2]
          : '13',
        province: invitado.completeComune
          ? invitado.completeComune.split('@')[1]
          : '134',
        number: invitado.number ?? '',
        street: invitado.street ?? '',
        departmentOrHouse: direccion.depto ?? '',
        reference: direccion.referencia ?? '',
        latitude: direccion.latitud ?? 0,
        longitude: direccion.longitud ?? 0,
      },
    };

    await firstValueFrom(this.customerService.createGuest(createGuestRequest));

    const addresses = await firstValueFrom(
      this.customerAddressApiService.getDeliveryAddresses(documentId)
    );

    this.addresses = addresses
      .sort((a, b) => Number(b.id) - Number(a.id))
      .map((x, index) => {
        return {
          ...x,
          fullAddress: x.address,
          isDefault: index === 0,
        };
      });

    const address = this.addresses.length ? this.addresses[0] : null;
    let destination = '';
    if (address) {
      destination = address.location;
      if (address.regionCode) {
        destination += '|' + address.regionCode;
      }
    }

    const request: GetLogisticPromiseRequest = {
      shoppingCartId: this.cartSession._id!.toString(),
      user: this.cartSession.user ?? '',
      deliveryMode: DeliveryType.DELIVERY,
      destination: destination,
      addressId: address?.id ?? '',
      address: address?.address ?? '',
    };
    const response = await firstValueFrom(this.cart.logisticPromise(request));
    const shoppingCart = response.shoppingCart;

    if (!response || !shoppingCart) {
      this.shippingDays = [];
    } else {
      if (shoppingCart.groups && shoppingCart.groups.length > 0) {
        this.shippingDays = [];

        shoppingCart.groups.forEach((g) => {
          let j = 0;
          let dia_despacho: ShippingService[] = [];
          i = i + 1;
          g.tripDates.forEach((item) => {
            let index = j++;
            const obj = {
              index,
              id: g.id,
              diasdemora: item.businessDays,
              fecha: item.requestedDate,
              fechaPicking: item.pickingDate,
              origen: g.warehouse,
              precio: item.price,
              proveedor: item.carrier.code,
              tipoenvio: item.serviceType.code,
              tipopedido: shoppingCart.groups![0].shipment.deliveryMode,
            };
            dia_despacho.push(obj);
          });

          this.shippingDays.push({
            grupo: g.id,
            productodespacho: g.products,
            fechas: dia_despacho,
          });
        });
      }
    }
    this.loadingResumen = false;
    this.loadingShipping = false;
  }

  setRecibe(type: any) {
    this.recibeType = type;
    this.recibeType == 'otra'
      ? (this.recibeOtra = true)
      : (this.recibeOtra = false);
    this.localS.set(StorageKey.recibe, {});
    this.recibeOtraname = '';
  }

  reciboPedido(recibe: IReceive) {
    this.recibeOtra = false;
    this.recibeOtraname =
      recibe.firstName + ' ' + recibe.lastName + ', Celular: ' + recibe.phone;
    this.localS.set(StorageKey.recibe, recibe);
  }

  removeDespacho() {
    this.cart.removeTotalShipping();
  }

  removeAddressInvitado() {
    this.direccion = false;
    this.shippingSelected = null;
    this.selectedShippingId = null;
    this.shippingDays = [];
  }
  toggleMap() {
    this.showMap = !this.showMap;
  }

  // Funcion encargada de ocultar el resumen de la compra cuando se esta seleccionando direccion de envio.
  HideResumen() {
    if (this.innerWidth <= 800) {
      return true;
    } else {
      return false;
    }
  }

  valshowDetalleProductos() {
    if (
      (this.HideResumen() && this.shippingSelected && this.recibeType != '') ||
      (this.HideResumen() && this.showDetalleProductos === true) ||
      !this.HideResumen()
    ) {
      return true;
    } else {
      return false;
    }
  }

  valshowDetalleDireccion() {
    if (
      this.HideResumen() &&
      this.shippingSelected &&
      this.recibeOtra == false &&
      (this.recibeType == 'yo' || this.recibeType == 'otra')
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Funcion utilizada para verificar y devolver el nombre completo de una direccion, siendo usuario logeado o invitado.
  getDireccionName(tipo: string) {
    var direccion: any;
    if (tipo != 'TIENDA') {
      this.tituloDespacho = 'Dirección de despacho';
      this.tituloRecibe = 'Persona que recibe';
      if (this.isLogin) {
        direccion = this.addresses.find(
          (direccion) => direccion.id === this.selectedShippingId
        );

        if (direccion !== undefined) {
          direccion = direccion.direccionCompleta;
        }
      } else {
        if (this.usuarioInv.department) {
          direccion =
            this.usuarioInv.street +
            ', ' +
            this.usuarioInv.number +
            ', depto/casa: ' +
            this.usuarioInv.department +
            ', ' +
            this.usuarioInv.commune;
        } else {
          direccion =
            this.usuarioInv.street +
            ', ' +
            this.usuarioInv.number +
            ', ' +
            this.usuarioInv.commune;
        }
      }
    } else {
      this.tituloDespacho = 'Retiro en';
      this.tituloRecibe = '';
      direccion = this.stores.find(
        (tienda) => tienda.id === this.selectedShippingIdStore
      );
      if (direccion && direccion.nombre) {
        direccion = direccion.nombre;
      }
    }

    if (direccion) {
      this.direccionName = direccion;
    } else {
      this.direccionName = '';
    }
  }

  setShowDetalleProductos(value: any) {
    this.showDetalleProductos = value;
  }

  // Metodo que permite controlar cuando se muestran todas las direcciones de un usuario logeado.
  viewAllAddress() {
    this.showAllAddress = true;
    this.selectedShippingId = null;
    this.shippingSelected = null;
  }

  changeAddress(recid: any) {
    if (recid.length > 0) {
      this.selectedShippingId = recid;
      this.showAllAddress = false;
      this.showDetalleProductos = false;
      this.obtieneDespachos();
      window.scrollTo({ top: 0 });
      let address = this.addresses.find(
        (address) => address.id == this.selectedShippingId
      );
      if (address) this.addressCustomerSelected = address;
    }
  }

  // permite setear los valores necesarios para modificar la direccion desde el boton de modificar direccion que solo aparece para pantallas mobiles.
  modificarSelectedAddress() {
    this.shippingSelected = null;
    if (this.selectedShippingIdStore == null) {
      this.selectedShippingIdStore = this.tempShippingIdStore;
      this.loadingShippingStore = true;
      this.obtieneTiendas();
    }

    if (this.isLogin) {
      this.setDefaultAddress();
      this.obtieneDespachos();
    } else {
      this.direccion = false; // null;
    }
    this.showDetalleProductos = false;
    this.onSelect(null, 'retiro');
  }

  /***
   * Establecer dirección de despacho por defecto, siendo seleccionada la que tenga el id más alto (última añadida).
   */
  setDefaultAddress(): void {
    if (this.selectedShippingId) return;
    const addressIds = this.addresses.map((address) => Number(address.id));
    this.selectedShippingId = String(Math.max(...addressIds));
  }

  cambiarTienda(
    newStore: IStore,
    callBackCartLoaded: CallBackCartLoaded
  ): void {
    this.geolocationService.setSelectedStore({
      zone: newStore.zone,
      code: newStore.code,
      city: newStore.city,
      callBackCartLoaded: callBackCartLoaded,
    });
  }

  /**
   * @author ignacio zapata  \"2020-11-06\
   * @desc funcion utilizada para verificar si la fecha es un dia sabado.
   * @params fecha en string
   * @return
   */
  valFindeSemana(fecha: string) {
    let isSabado = false;

    let dia =
      fecha && fecha.length > 0
        ? moment(fecha).locale('es').format('dddd')
        : null;
    isSabado = dia && dia === 'sábado' ? true : false;

    return isSabado;
  }

  /**
   * @author Sebastian Aracena  \2021-04-15\
   * @desc funcion utilizada para verificar si la fecha de la semana
   * @params item de grupo
   * @return
   */
  setSeleccionarEnvio(item: any, i: any) {
    if (this.shippingType == 'despacho') {
      if (this.isLogin || this.usuarioInvitado)
        this.seleccionaDespacho(item, i);
      //else if (this.usuarioInvitado) this.seleccionaDespachoInvitado(item, i);
    } else {
      if (this.isLogin || this.usuarioInvitado) this.seleccionaRetiro(item, i);
      //else if () this.seleccionaRetiro(item, i);
    }
  }

  /**
   * Verificar si la fecha de la semana...
   * @params item de grupo
   * @return
   */
  setSeleccionarEnvioMobile(item: any, i: any) {
    if (this.grupos == 0) this.grupos = this.grupos + 1;
    else if (this.grupos != 0 && this.indexTemp != i)
      this.grupos = this.grupos + 1;

    if (this.shippingType == 'despacho') {
      this.seleccionaDespacho(item, i);
      while (this.obj_fecha.length > this.shippingDays.length) {
        this.obj_fecha.splice(this.obj_fecha.length - 1, 1);
      }
      if (this.shippingDays.length == this.grupos) {
        this.confirmar = true;
        this.openModal();
      }
    } else {
      this.seleccionaRetiro(item, i);
      while (this.obj_fecha.length > this.shippingDaysStore.length) {
        this.obj_fecha.splice(this.obj_fecha.length - 1, 1);
      }
      if (this.shippingDaysStore.length == this.grupos) {
        this.confirmar = true;
        this.openModal();
      }
    }

    this.indexTemp = i;
  }

  /**
   * @desc Verificar si la fecha de la semana...
   * @params item de grupo
   * @return
   */
  async eliminarGrupo(index: any) {
    this.loadingShipping = true;
    this.loadingResumen = true;
    const resultado: any = this.addresses.find(
      (address) => address.id == this.selectedShippingId
    );
    const usuario: ISession = this.sessionService.getSession();
    let request: IRemoveGroupRequest = {};
    if (this.shippingType === ShippingType.DESPACHO) {
      request = {
        user: usuario.username,
        id: index,
        branch: resultado.city,
      };
    } else {
      let disponible = this.stores.find(
        (item) => item.id == this.selectedShippingIdStore
      );
      request = {
        user: usuario.username,
        id: index,
        branch: disponible?.code,
      };
    }

    this.cart.removeGroup(request).subscribe((r) => {
      this.cart.load();

      this.shippingDaysStore = [];
      this.shippingDays = [];

      this.obtieneDespachos();
      this.obtieneTiendas();
    });
  }

  ver_fechas() {
    if (this.shippingDaysStore.length) {
      let menor = this.shippingDaysStore[0].fechas?.[0].fecha;
      let menor_fecha: any = new Date(menor);
      this.shippingDaysStore.map((item) => {
        let fecha_comparar: any = new Date(item.fechas?.[0].fecha);
        if (menor_fecha.getTime() >= fecha_comparar.getTime()) {
          menor = item.fechas?.[0].fecha;
          menor_fecha = new Date(menor);
        }
      });

      if (moment(menor).startOf('day').toISOString() === this.fecha_actual) {
        this.retiro = 'Retira Hoy';
      } else {
        if (moment(menor).weekday() == 1) this.retiro = 'Retira el día lunes';
        else if (moment(menor).weekday() == 2)
          this.retiro = 'Retira el día martes';
        else if (moment(menor).weekday() == 3)
          this.retiro = 'Retira el día miercoles';
        else if (moment(menor).weekday() == 4)
          this.retiro = 'Retira el día jueves';
        else if (moment(menor).weekday() == 5)
          this.retiro = 'Retira el día viernes';
        else if (moment(menor).weekday() == 6)
          this.retiro = 'Retira el día  sabado';
        else if (moment(menor).weekday() == 7)
          this.retiro = 'Retira el día  domingo';
      }
    }
  }

  finishQuotation() {
    const shoppingCartId = this.cartSession._id!.toString();
    this.loadingCotizacion = true;

    this.cart
      .generateQuotation({
        shoppingCartId,
      })
      .subscribe({
        next: (r) => {
          this.loadingCotizacion = false;

          const number = r.shoppingCart.salesId;

          this.cart.load();
          this.router.navigate([
            '/carro-compra/comprobante-de-cotizacion',
            number,
          ]);
        },
        error: (e) => {
          console.error(e);
          this.toast.error('Ha ocurrido un error al generar la cotización');
        },
      });
  }

  // Eliminar dirección
  deleteAddress(direccion: any) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> esta direccion?<br><br>
                  Calle: <strong>${direccion.street}</strong><br>
                  Número: <strong>${direccion.number}</strong>`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
      ignoreBackdropClick: true,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res) {
        const documentId = this.userSession.documentId;
        const addressId = direccion.id;
        this.customerAddressApiService
          .deleteAddress(documentId, addressId)
          .subscribe({
            next: (_) => {
              this.toast.success('Dirección eliminada exitosamente.');
              this.respuesta(true, true);
              if (
                this.direccionConfigurada.deliveryAddress?.id === direccion.id
              )
                this.cambioDireccionPreferenciaCliente(direccion.id);
            },
            error: (err: IError) => {
              this.toast.error(err.message);
            },
          });
      }
    });
  }

  /**
   * Se activa si se elimina la dirección preferencia del cliente.
   * @param recid
   */
  cambioDireccionPreferenciaCliente(addressId: string) {
    const preferences = this.customerPreferencesStorage.get();
    let nueva_preferencia =
      this.addresses.find((address) => address.id !== addressId) || null;
    preferences.deliveryAddress = nueva_preferencia;
    this.customerPreferencesStorage.set(preferences);
  }
}
