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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// Rxjs
import { Subject, firstValueFrom, lastValueFrom } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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
import { ModalConfirmDatesComponent } from './components/modal-confirm-dates/modal-confirm-dates.component';
// Constants

// Services
import { ShippingType } from '../../../../core/enums';
import { LocalStorageService } from '@core/modules/local-storage/local-storage.service';
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
import { DateUtils } from './utils/date-utils.service';
import { GtmService } from '@core/utils-v2/gtm/gtm.service';
import { CartShippingUtils } from './utils/cart-shipping-utils.service';
import { SessionUtils } from './utils/session-utils.service';
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
  //loadingSucursal: boolean = true;
  banners: Banner[] = [];
  private destroy$: Subject<void> = new Subject();
  usuarioInvitado: boolean = false;

  // ???
  invitado!: IGuest;
  usuarioInv!: IGuest;

  showAddress: boolean = false;
  recibeType = 'yo';
  recibeOtra: boolean = false;
  recibeOtraname: string = '';
  recibeYoname: string = '';
  showNewAddress: boolean = false;
  showDetalleProductos: boolean = false;
  showresumen: boolean = false;
  tienda!: IStore;
  pickupDescription: string = '';
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
  cartSession!: IShoppingCart;
  recidDireccion = 0;
  showMap: boolean = false;

  // retiro
  cardShippingActiveStore = 0;
  selectedShippingIdStore: any;
  tempShippingIdStore: any;
  shippingDaysStore: ShippingDateItem[] = [];
  wereLoadedStores: boolean = false;
  isLoadingPickupDates!: boolean;
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
  isLoggedIn!: boolean;
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

  hasSendGtmEvent: boolean = false;
  retiroFlag: boolean = false;

  constructor(
    private toast: ToastrService,
    private datePipe: DatePipe,
    private router: Router,
    private localS: LocalStorageService,
    private modalService: BsModalService,
    private cd: ChangeDetectorRef,
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
    private readonly _gmtService: GtmService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.config = this.configService.getConfig();
    this.receiveStorage.set({} as IReceive);
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;

    this.tienda_actual = this.geolocationStorage.get();
    this.userSession = this.sessionService.getSession();
    this.invitado = this.guestStorage.get() as IGuest;
    this.cartSession = this.shoppingCartStorage.get()!;
    this.direccionConfigurada = this.customerPreferencesStorage.get();
  }

  async ngOnInit() {
    this.isLoggedIn = this.sessionService.isLoggedIn();
    this.updateStep()
    this.setNotificationContact();
    this.obtieneDireccionesCliente();
    this.loadStores();

    if (!this.HideResumen()) {
      this.recibeType = 'yo';
    }

    setTimeout(() => {
      this.cart.dropCartActive$.next(false);
    });

    this.onLoginChange();

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
          (ProductCarts || []).map((item) => ({
            ProductCart: item,
            quantity: item.quantity,
          }))
        )
      )
      .subscribe((items) => {
        this.items = items;
      });

    if (isPlatformBrowser(this.platformId)) {
      this.onSelectShippingType(null, 'retiro');
      this._gmtService.beginCheckout(dataLayer, this.cartSession);
    }
  }

  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }

  updateStep(){
    if(this.cartSession._id) this.cart.saveStep(this.cartSession._id,2).subscribe()
  }

  async obtieneDireccionesCliente(isDelete: boolean = false) {
    this.loadingShippingAll = true;
    const { documentId } = this.userSession;

    if (!this.usuarioInvitado && documentId && documentId !== '0') {
      this.customerAddressApiService
        .getDeliveryAddresses(documentId)
        .subscribe({
          next: (addresses) => {
            this.loadingShippingAll = false;
            if (!isDelete) {
              // Obtener última dirección (id más alto).
              const addressesIds = addresses.map((address) =>
                Number(address.id)
              );
              this.selectedShippingId = String(Math.max(...addressesIds));
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
            if (this.shippingType === 'despacho') this.getDeliveries();

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
   * Establecer contacto para notificaciones del carro.
   */
  private setNotificationContact(): void {
    this.invitado = this.guestStorage.get() as IGuest;
    const contact = SessionUtils.getContact(this.userSession, this.invitado);
    if (contact?.name) {
      console.log('odis')
      this.cart.setNotificationContact(
        this.cartSession._id!.toString(),
        contact
      ).subscribe();
    }
  }

  /**
   * Obtener despachos a domicilio.
   */
  async getDeliveries(removeShipping = true): Promise<void> {
    this.fechas = [];

    const usuario = this.sessionService.getSession();
    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;

    const resultado = this.addresses.find(
      (address) => address.id == this.selectedShippingId
    );

    if (resultado) {
      this.loadingShipping = true;
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
          this.cart.logisticPromise({
            user: usuario.username,
            deliveryMode: 'delivery',
            destination: `${resultado.city
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}|${
              resultado.regionCode ? resultado.regionCode : ''
            }`,
            address: resultado.address,
            addressId: resultado.id,
          })
        );
        if (response.shoppingCart.groups) {
          this.shippingDays = [];

          response.shoppingCart.groups.forEach((group: IShoppingCartGroup) => {
            let j = 0;
            let dia_despacho: ShippingService[] = [];
            i = i + 1;
            group.tripDates.forEach((item: IShoppingCartTripDate) => {
              let index = j++;
              dia_despacho.push({
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
              });
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

    this.pickupDescription = CartShippingUtils.getPickupDescription(
      this.shippingDaysStore,
      this.fecha_actual
    );
  }

  /**
   * Cargar tiendas y establecer la tienda seleccionada.
   */
  private loadStores(): void {
    this.wereLoadedStores = false;
    this.geolocationService.stores$.subscribe({
      next: (stores) => {
        const selectedStore = this.geolocationService.getSelectedStore();
        const selectedStoreDetail = stores.find(
          (store) => store.code === selectedStore.code
        );

        if (!selectedStoreDetail) return;

        const filteredStores = stores.filter(
          (store) => store.id != selectedStoreDetail.id
        );
        this.stores = [selectedStoreDetail, ...filteredStores];
        this.selectedShippingIdStore = selectedStoreDetail.id;
        this.tempShippingIdStore = this.selectedShippingIdStore;
        this.wereLoadedStores = true;
        this.getPickup(false);
      },
    });
  }

  /**
   * Obtener fechas para retiro en tienda.
   */
  async getPickup(removeShipping = true) {
    this.isLoadingPickupDates = true;

    this.fechas = [];
    const usuario = this.sessionService.getSession();

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;
    const selectedStore = this.stores.find(
      (item) => item.id == this.selectedShippingIdStore
    );
    if (!selectedStore) return;

    this.tienda = selectedStore;

    this.setSelectedStore(this.tienda, async (_: IShoppingCart) => {
      this.localS.set(StorageKey.tiendaRetiro, selectedStore);

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
          this.cart.logisticPromise({
            user: usuario.username,
            deliveryMode: 'pickup',
            destination: `${selectedStore.code}|${selectedStore.regionCode}`,
            address: selectedStore.name,
            addressId: selectedStore.id,
          })
        );
        if (response.shoppingCart.groups) {
          this.shippingDaysStore = [];

          response.shoppingCart.groups.forEach((group: IShoppingCartGroup) => {
            let i = 0;
            let dia_despacho: ShippingService[] = [];

            group.tripDates.forEach((item: IShoppingCartTripDate) => {
              let isSaturday = DateUtils.isSaturday(
                item.requestedDate.toString()
              );

              dia_despacho.push({
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
                isSabado: isSaturday,
              });
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

        this.pickupDescription = CartShippingUtils.getPickupDescription(
          this.shippingDaysStore,
          this.fecha_actual
        );
        this.isLoadingPickupDates = false;
      } catch (e) {
        console.log(e);
        this.isLoadingPickupDates = false;
        this.shippingDaysStore = [];
      }
      //});
    });
  }

  /**
   *
   * @param item
   * @param pos
   */
  seleccionaDespacho(item: ShippingService, pos: number): void {
    let invitado: any = null;

    if (this.isLoggedIn) {
      this.recibeYoname = SessionUtils.getFullName(this.userSession);
      this.recidDireccion = this.selectedShippingId;
      this.obj_fecha[pos] = item;
    }
    if (this.invitado) {
      invitado = this.guestStorage.get();
      this.recibeYoname = SessionUtils.getFullName(invitado);
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

    this.cart.addTotalShipping({
      price: this.shippingSelected?.precio,
      title: nombre,
      type: 'shipping',
    });

    // guardamos el despacho y vericamos si tiene descuento o no
    this.saveShipping(pos, item.index);
    this.fechas[pos] = this.shippingSelected?.fecha;
    this.localS.set(StorageKey.fechas, this.fechas);
    this.localS.remove(StorageKey.tiendaRetiro);
  }

  seleccionaRetiro(item: ShippingService, pos: number): void {
    this.obj_fecha[pos] = item;
    this.cardShippingActiveStore = item.index;
    // FIXME: shippingDaysStore queda vacio.
    this.grupoShippingActive = this.shippingDaysStore[pos].grupo ?? null;
    this.shippingSelected = (this.shippingDaysStore[pos].fechas || []).find(
      (item) => item.index === this.cardShippingActiveStore
    );
    this.recidDireccion = this.selectedShippingIdStore;
    this.fechas[pos] = this.shippingSelected?.fecha;

    this.cart.addTotalShipping({
      price: this.shippingSelected?.precio,
      title: `Retiro tienda ${this.datePipe.transform(
        this.shippingSelected?.fecha,
        'EEEE dd MMM'
      )}`,
      type: 'shipping',
    });

    // guardamos el despacho y vericamos si tiene descuento o no
    this.saveShipping(pos, item.index);
    this.localS.set(StorageKey.fechas, this.fechas);
  }

  /*
  addShipping(data: IShoppingCart) {
    if (data.shipment && data.shipment.discount > 0) {
      const descuentoEnvio: CartTotal = {
        price: data.shipment.discount * -1,
        title: 'Descuento Despacho',
        type: 'discount',
      };
      this.cart.addTotaldiscount(descuentoEnvio);
    }
  }*/

  /**
   * Ir a la página de selección de pago.
   */
  goToPaymentPage(): void {
    this._gmtService.addShippingInfo(dataLayer, this.cartSession);
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
          //const shoppingCart = response.shoppingCart;
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
      if (redirect)
        this.router.navigate(['/', 'carro-compra', 'forma-de-pago']);
    }
  }

  /**
   *
   */
  private onLoginChange(): void {
    this.authStateService.session$.subscribe(() => {
      this.isLoggedIn = this.sessionService.isLoggedIn();
      this.obtieneDireccionesCliente();
      this.setNotificationContact();
    });
  }

  private openModal(): void {
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
      this.onSelectShippingType(null, res);
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

  /**
   * Al seleccionar el tipo de envío mediante los tabs.
   * @param event
   * @param formaEntrega
   */
  onSelectShippingType(
    event: any,
    formaEntrega: 'retiro' | 'despacho' | 'sucursal'
  ): void {
    this.loadingResumen = true;
    this.select_grupos = false;
    this.confirmar = false;
    this.indexTemp = -1;
    this.grupos = 0;
    this.fechas = [];

    this.localS.remove(StorageKey.fechas);
    if (formaEntrega == 'sucursal') {
      //this.loadingSucursal = true;
      formaEntrega = 'despacho';
      this.shippingType = formaEntrega;
    } else {
      this.shippingType = formaEntrega;
      //this.loadingSucursal = false;
    }
    this.cart.updateShippingType(formaEntrega);

    if (formaEntrega === 'retiro') {
      this.retiroFlag = true;
      // this.recibeType = 'yo';
      this.showAllAddress = false;
      this.showNewAddress = false;
      this.showAddress = false;
      this.selectedShippingIdStore = this.tempShippingIdStore;

      if (!this.selectedShippingIdStore) {
        this.shippingDaysStore = [];
        this.loadingResumen = false;
      } else if (this.selectedShippingIdStore) {
        this.getPickup(false);
      }
    } else if (formaEntrega === 'despacho' && this.isLoggedIn) {
      this.selectedShippingId = null;
      this.retiroFlag = false;
      if (this.selectedShippingIdLast)
        this.selectedShippingId = this.selectedShippingIdLast;
      else this.setDefaultAddress();

      if (this.selectedShippingId) {
        this.getDeliveries();
      }
    } else {
      this.retiroFlag = false;
    }

    let invitado = this.guestStorage.get();
    if (invitado) {
      invitado.deliveryType = 'RC';
      this.guestStorage.remove();
      this.guestStorage.set(invitado);
      this.usuarioInv = this.guestStorage.get()!;

      this.getDeliveries();
    }
    //poner RC a cliente
    this.shippingDays = [];
    this.cardShippingActive = 0;
    //this.selectedShippingId = null;
    this.shippingSelected = null;
    this.loadingResumen = false;
  }

  usuarioVisita(invitado: any): void {
    this.usuarioInvitado = true;
    invitado.tipoEnvio = '';
    this.guestStorage.set(invitado);
    this.setNotificationContact();
    window.scrollTo({ top: 0 });
  }

  // evento ejecutado cuando un invitado agrega una nueva direccion.
  async direccionVisita(direccion: any, removeShipping = true) {
    this.showAddress = true;
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

    const result = await firstValueFrom(
      this.customerService.createGuest(createGuestRequest)
    );

    const addresses = result.addresses;

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

    const response = await firstValueFrom(
      this.cart.logisticPromise({
        shoppingCartId: this.cartSession._id!.toString(),
        user: this.cartSession.user ?? '',
        deliveryMode: DeliveryType.DELIVERY,
        destination: destination,
        addressId: address?.id ?? '',
        address: address?.address ?? '',
      })
    );
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

  removeDespacho(): void {
    this.cart.removeTotalShipping();
  }

  removeAddressInvitado() {
    this.showAddress = false;
    this.shippingSelected = null;
    this.selectedShippingId = null;
    this.shippingDays = [];
  }

  // Ocultar el resumen de la compra cuando se esta seleccionando direccion de envio.
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
  getDireccionName(shippingType: string) {
    var direccion: any;
    if (shippingType !== 'TIENDA') {
      this.tituloDespacho = 'Dirección de despacho';
      this.tituloRecibe = 'Persona que recibe';
      if (this.isLoggedIn) {
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

    this.direccionName = direccion || '';
  }

  // Metodo que permite controlar cuando se muestran todas las direcciones de un usuario logeado.
  viewAllAddress() {
    this.showAllAddress = true;
    this.selectedShippingId = null;
    this.shippingSelected = null;
  }

  /**
   * Seleccionar dirección para despacho a domicilio.
   * @param addressId
   * @returns
   */
  selectDeliveryAddress(addressId: string): void {
    if (!addressId) return;

    this.selectedShippingId = addressId;
    this.showAllAddress = false;
    this.showDetalleProductos = false;
    this.getDeliveries();
    window.scrollTo({ top: 0 });
    const selectedAddress = this.addresses.find(
      (address) => address.id == this.selectedShippingId
    );
    if (selectedAddress) this.addressCustomerSelected = selectedAddress;
  }

  // permite setear los valores necesarios para modificar la direccion desde el boton de modificar direccion que solo aparece para pantallas mobiles.
  modificarSelectedAddress() {
    this.shippingSelected = null;
    if (!this.selectedShippingIdStore) {
      this.selectedShippingIdStore = this.tempShippingIdStore;
      this.loadStores();
    }

    if (this.isLoggedIn) {
      this.setDefaultAddress();
      this.getDeliveries();
    } else {
      this.showAddress = false;
    }
    this.showDetalleProductos = false;
    this.onSelectShippingType(null, 'retiro');
  }

  private setSelectedStore(
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
   * @desc Verificar si la fecha de la semana
   * @params item de grupo
   * @return
   */
  setSeleccionarEnvio(item: any, i: any) {
    if (this.shippingType == 'despacho') {
      if (this.isLoggedIn || this.usuarioInvitado)
        this.seleccionaDespacho(item, i);
      //else if (this.usuarioInvitado) this.seleccionaDespachoInvitado(item, i);
    } else {
      if (this.isLoggedIn || this.usuarioInvitado)
        this.seleccionaRetiro(item, i);
      //else if () this.seleccionaRetiro(item, i);
    }
  }

  /**
   * Verificar si la fecha de la semana...
   * @params item de grupo
   * @return
   */
  setSeleccionarEnvioMobile(item: any, i: any): void {
    if (!this.grupos) this.grupos = this.grupos + 1;
    else if (this.grupos != 0 && this.indexTemp != i)
      this.grupos = this.grupos + 1;

    if (this.shippingType == 'despacho') {
      this.seleccionaDespacho(item, i);
      while (this.obj_fecha.length > this.shippingDays.length) {
        this.obj_fecha.splice(this.obj_fecha.length - 1, 1);
      }
      if (this.shippingDays.length === this.grupos) {
        this.confirmar = true;
        this.openModal();
      }
    } else {
      this.seleccionaRetiro(item, i);
      while (this.obj_fecha.length > this.shippingDaysStore.length) {
        this.obj_fecha.splice(this.obj_fecha.length - 1, 1);
      }
      if (this.shippingDaysStore.length === this.grupos) {
        this.confirmar = true;
        this.openModal();
      }
    }
    this.indexTemp = i;
  }

  /**
   * @desc V
   * @params item de grupo
   * @return
   */
  eliminarGrupo(index: any): void {
    this.loadingShipping = true;
    this.loadingResumen = true;

    let branch;
    if (this.shippingType === ShippingType.DESPACHO) {
      const selectedAddress = this.addresses.find(
        (address) => address.id === this.selectedShippingId
      );
      branch = selectedAddress?.city;
    } else {
      const selectedStore = this.stores.find(
        (item) => item.id == this.selectedShippingIdStore
      );
      branch = selectedStore?.code;
    }

    this.cart
      .removeGroup({ user: this.userSession.username, id: index, branch })
      .subscribe(() => {
        this.cart.load();
        this.shippingDaysStore = [];
        this.shippingDays = [];
        this.getDeliveries();
        this.loadStores();
      });
  }

  /**
   * Generar cotización.
   */
  generateQuotation(): void {
    this.loadingCotizacion = true;
    const shoppingCartId = this.cartSession._id!.toString();
    this.cart.generateQuotation(shoppingCartId).subscribe({
      next: (response) => {
        this.loadingCotizacion = false;
        this.cart.load();
        this.router.navigate([
          '/carro-compra/comprobante-de-cotizacion',
          response.shoppingCart.salesId,
        ]);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Ha ocurrido un error al generar la cotización.');
      },
    });
  }

  /***
   * Establecer dirección de despacho por defecto, siendo seleccionada la que tenga el id más alto (última añadida).
   */
  setDefaultAddress(): void {
    if (this.selectedShippingId) return;
    const addressIds = this.addresses.map((address) => Number(address.id));
    this.selectedShippingId = String(Math.max(...addressIds));
  }

  /**
   * Eliminar dirección de despacho a domicilio.
   * @param address
   */
  deleteDeliveryAddress(address: any) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> esta direccion?<br><br>
                  Calle: <strong>${address.street}</strong><br>
                  Número: <strong>${address.number}</strong>`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
      ignoreBackdropClick: true,
    });
    bsModalRef.content.event.subscribe((res: any) => {
      if (res) {
        this.customerAddressApiService
          .deleteAddress(this.userSession.documentId, address.id)
          .subscribe({
            next: () => {
              this.toast.success('Dirección eliminada exitosamente.');
              this.respuesta(true, true);
              if (this.direccionConfigurada.deliveryAddress?.id === address.id)
                this.updatePreferredDeliveryAddress(address.id);
            },
            error: (err: IError) => {
              this.toast.error(err.message);
            },
          });
      }
    });
  }

  /**
   * Actualizar la dirección de despacho a domicilio preferida del cliente si se elimina la dirección actual preferida.
   * @param recid
   */
  updatePreferredDeliveryAddress(addressId: string): void {
    const preferences = this.customerPreferencesStorage.get();
    let preferredDeliveryAddressId =
      this.addresses.find((address) => address.id !== addressId) || null;
    preferences.deliveryAddress = preferredDeliveryAddressId;
    this.customerPreferencesStorage.set(preferences);
  }
}
