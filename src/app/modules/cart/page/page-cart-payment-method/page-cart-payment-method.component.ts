// Angular
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  EventEmitter,
  PLATFORM_ID,
  Inject,
  Renderer2,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
// Env
import { environment } from '@env/environment';
// Rxjs
import { Observable, Subject, Subscription, firstValueFrom } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { filter } from 'rxjs/internal/operators/filter';
// Libs
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { v1 as uuidv1 } from 'uuid';
// Models
import { ShippingAddress } from '../../../../shared/interfaces/address';
import { Usuario } from '../../../../shared/interfaces/login';
import { TransBankToken } from '../../../../shared/interfaces/payment-method';
import { ICostCenter } from '@core/models-v2/customer/customer-cost-center.interface';
import { IError } from '@core/models-v2/error/error.interface';
import { IPaymentPurchaseOrder } from '@core/models-v2/payment-method/payment-purchase-order.interface';
import { IBusinessLine } from '@core/services-v2/customer-business-line/business-line.interface';
import { ICity } from '@core/services-v2/geolocation/models/city.interface';
import { ISession } from '@core/models-v2/auth/session.interface';
import { IPaymentMethod } from '@core/models-v2/payment-method/payment-method.interface';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { InvoiceType } from '@core/enums/invoice-type.enum';
import { IValidateShoppingCartStockLineResponse } from '@core/models-v2/cart/validate-stock-response.interface';
import { IKhipuBank } from '@core/models-v2/payment-method/khipu-bank.interface';
import { IShoppingCart } from '@core/models-v2/cart/shopping-cart.interface';
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import { ICreateGuest } from '@core/models-v2/customer/create-guest.interface';
// Services
import {
  calculaIcono,
  dataURLtoFile,
  isVacio,
} from '../../../../shared/utils/utilidades';

import { AgregarCentroCostoComponent } from '../../components/agregar-centro-costo/agregar-centro-costo.component';

import { DireccionMap } from 'src/app/shared/components/map/map.component';
import { LocalStorageService } from '@core/modules/local-storage/local-storage.service';

import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { PaymentMethodService } from '@core/services-v2/payment-method.service';

import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { StorageKey } from '@core/storage/storage-keys.enum';

import { UserRoleType } from '@core/enums/user-role-type.enum';
import {
  PaymentMethodCodeType,
  PaymentMethodType,
} from '@core/enums/payment-method.enum';
import { CartService } from '@core/services-v2/cart.service';

import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { PaymentMethodPurchaseOrderRequestService } from '@core/services-v2/payment-method-purchase-order-request.service';
import { DocumentType } from '@core/enums/document-type.enum';
import { CustomerService } from '@core/services-v2/customer.service';
import { DeliveryType } from '@core/enums/delivery-type.enum';

import { GuestStorageService } from '@core/storage/guest-storage.service';
import { IGuest } from '@core/models-v2/storage/guest.interface';
import { ReceiveStorageService } from '@core/storage/receive-storage.service';
import { CustomerCostCenterService } from '@core/services-v2/customer-cost-center.service';

import { CustomerBusinessLineApiService } from '@core/services-v2/customer-business-line/customer-business-line.api.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';
import { DocumentValidator } from '@core/validators/document-form.validator';

// declare const $: any;
export interface Archivo {
  archivo: File;
  nombre: string;
  icon: string;
  extension: string;
}

@Component({
  selector: 'app-page-cart-payment-method',
  templateUrl: './page-cart-payment-method.component.html',
  styleUrls: ['./page-cart-payment-method.component.scss'],
})
export class PageCartPaymentMethodComponent implements OnInit, OnDestroy {
  @ViewChild('idArchivoInput') idArchivoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('idArchivoInputMobile')
  idArchivoInputMobile!: ElementRef<HTMLInputElement>;
  @ViewChild('openModalButton') openModalButton!: ElementRef;
  private destroy$: Subject<void> = new Subject();
  isInvoice!: boolean;
  items: any[] = [];
  inconsistencia = false;
  QUOTATION_TYPE = 1;
  propagar = new EventEmitter<any>();
  nuevoCentroCosto: boolean = false;
  files: any = [];
  loadingPage = false;
  loadingText = 'Generando orden de compra...';
  userSession!: ISession;
  cartSession: IShoppingCart;
  uploadedFiles!: File;
  documentType = 'factura';
  totalCarro = 0;
  paymentMethods: IPaymentMethod[] = [];
  paymentMethodActive: string | null = null;
  bloqueoCliente: any;
  clienteBloqueado = false;
  getBloqueoError = false;
  paymentWebpayForm = false;
  @ViewChild('bankmodal', { static: false }) content: any;
  @ViewChild('formWp', { static: false }) tref!: ElementRef;
  formOv!: FormGroup;
  alertCart: any;
  alertCartShow = false;
  rejectedCode!: number | null;
  btnWebpayPost = false;
  guest: IGuest;
  formVisita!: FormGroup;
  validado!: boolean;
  innerWidth: number;
  transBankToken!: TransBankToken;
  productosSinStock: IValidateShoppingCartStockLineResponse[] = [];
  loadkhipu: boolean = false;
  recibe: Usuario;

  isCollapsedDespacho: boolean = false;
  addresses: ShippingAddress[] = [];
  direccionDespacho!: ICustomerAddress; //ShippingAddress;
  shippingType = '';
  tiendaRetiro?: IStore = undefined;
  pagoKhipu = null;
  esBoleta: boolean = false;
  showresumen: boolean = false;
  fechas_entregas: any = [];
  modalRef!: BsModalRef;
  archivo!: Archivo | null;
  idArchivo!: string;
  idArchivoMobile!: string | null;
  centrosCosto: ICostCenter[] = [];
  //crear nuevo centro de costo
  codigo_cc: string | null = null;
  nombre_cc: string | null = null;
  veritficar_cc: boolean = false;
  isVacio = isVacio;
  cd_ver: boolean = false;

  selectedDocument!: string;
  documentOptions = [{ id: InvoiceType.RECEIPT, name: 'BOLETA' }];
  girosOptions: IBusinessLine[] = [];
  selectedGiro!: string;
  isB2B!: boolean;
  cargandoGiros!: boolean;
  giros$!: Observable<any[]>;

  userRoleType = UserRoleType;
  invoiceType = InvoiceType;

  purchaseOrderId!: string;

  subscriptions: Subscription = new Subscription();
  config!: IConfig;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localS: LocalStorageService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    // Services V2
    private readonly sessionStorage: SessionStorageService,
    private readonly guestStorage: GuestStorageService,
    private readonly sessionService: SessionService,
    private readonly receiveStorageService: ReceiveStorageService,
    private readonly geolocationApiService: GeolocationApiService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly paymentMethodPurchaseOrderRequestService: PaymentMethodPurchaseOrderRequestService,
    public readonly cartService: CartService,
    private readonly customerService: CustomerService,
    private readonly customerBusinessLineApiService: CustomerBusinessLineApiService,
    private readonly customerAddressService: CustomerAddressApiService,
    private readonly customerCostCenterService: CustomerCostCenterService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.formDefault();
    this.guest = this.guestStorage.get() as IGuest;
    if (this.guest) {
      this.formVisita.setValue({
        rut: this.guest.documentId,
        nombre: this.guest.firstName,
        apellido: this.guest.lastName,
        telefono: (this.guest.phone || '').slice(-8),
      });
    }

    this.recibe = this.receiveStorageService.get()!;
    this.cartSession = this.localS.get(StorageKey.carroCompraB2B);
  }

  ngDoCheck() {
    this.userSession = this.sessionService.getSession();
    // this.userSession['requiereValidacion'] = true;
    this.cartSession = this.localS.get(StorageKey.carroCompraB2B);
    this.fechas_entregas = this.localS.get(StorageKey.fechas);
  }

  onBlur() {
    // this.obtenerGiros();
  }

  isValidRut(rut: string) {
    return rut.length > 8;
  }

  formatRut(rut: string): string {
    return rut.length > 7 ? rut.slice(0, -1) + '-' + rut.slice(-1) : rut;
  }

  obtenerGiros(): void {
    this.girosOptions = [];
    let rut = this.userSession?.documentId;
    if (this.guest) {
      let formattedRut = this.formVisita.value.rut.includes('-')
        ? this.formVisita.value.rut
        : this.formatRut(this.formVisita.value.rut);
      rut = formattedRut;
    }

    if (this.isValidRut(rut ?? '')) {
      this.cargandoGiros = true;
      this.customerBusinessLineApiService
        .getLegalBusinessLines(rut)
        .subscribe({
          next: (res) => {
            this.girosOptions = res.businessLines || [];

            if (this.girosOptions.length) {
              this.documentOptions = [
                { id: InvoiceType.RECEIPT, name: 'BOLETA' },
                { id: InvoiceType.INVOICE, name: 'FACTURA' },
              ];
            } else {
              this.toastr.info(
                'No se han encontrado giros disponibles para su rut.'
              );
              this.documentOptions = [
                { id: InvoiceType.RECEIPT, name: 'BOLETA' },
              ];
              this.selectedDocument = InvoiceType.RECEIPT;
            }

            this.cargandoGiros = false;
          },
          error: (e) => {
            console.error(e);
            // this.toastr.error('Ha ocurrido un error al obtener los giros.');
            this.cargandoGiros = false;
          },
        });
    } else {
      this.documentOptions = [{ id: InvoiceType.RECEIPT, name: 'BOLETA' }];
      this.selectedDocument = InvoiceType.RECEIPT;
    }
  }

  async ngOnInit() {
    this.userSession = this.sessionService.getSession();
    this.isB2B = this.sessionService.isB2B();
    if (this.isB2B || this.userSession.businessLine) {
      this.documentOptions.push({ id: InvoiceType.INVOICE, name: 'FACTURA' });
    }
    if (this.guest) {
      this.getCities();
      this.tienda = null;
      this.buildForm();
    }

    this.idArchivo = uuidv1();
    this.idArchivoMobile = uuidv1();
    this.formVisita.statusChanges
      .pipe(filter(() => this.formVisita.valid))
      .subscribe(() => this.validForm());

    this.fechas_entregas = this.localS.get(StorageKey.fechas);
    this.pagoKhipu = this.localS.get(StorageKey.Metodo) || null;
    this.esBoleta =
      this.userSession?.businessLine == '' ||
      this.userSession?.businessLine == null;
    this.selectedDocument = this.userSession?.businessLine
      ? InvoiceType.INVOICE
      : InvoiceType.RECEIPT;

    this.cartService.load();

    const subscription = this.cartService.cartDataSubject$.subscribe(
      async (cartSession) => {
        if (cartSession) {
          this.cartSession = cartSession;
          this.formOV();
          await this.updateReceive();
          this.setDireccionOrTiendaRetiro();
        }
      }
    );
    this.subscriptions.add(subscription);

    this.cartService.total$.subscribe((r) => {
      this.totalCarro = r || 0;
    });
    this.cartService.items$
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
    this.cartSession = this.localS.get(StorageKey.carroCompraB2B);
    await this.updateReceive();
    if (this.cartSession == null || this.cartSession.products?.length === 0) {
      this.router.navigate(['/', 'carro-compra']);
    }

    this.setMethodPayment();

    this.cartService.load();
    this.cartService.total$.subscribe((r) => {
      this.totalCarro = r || 0;
      this.formOv.get('amount')?.setValue(r);
      this.formOv.get('number')?.setValue(this.idArchivo.split('-')[0]);
    });
    /* Se setean datos de la OC cargados en localStorage */
    const OC: any = this.localS.get(StorageKey.ordenCompraCargada);
    if (!isVacio(OC)) {
      this.archivo = this.cargaArchivo(dataURLtoFile(OC.pdf, OC.nombre));
      this.formOv.get('number')?.setValue(OC.numero);
      this.formOv.get('amount')?.setValue(OC.total);
    }

    /* Se cargan los centros de costo */
    const documentId = this.userSession?.documentId ?? '';
    if (!this.guest) {
      this.customerCostCenterService.getCostCenters(documentId).subscribe({
        next: (costCenters) => {
          this.centrosCosto = costCenters;
        },
        error: (e) => {
          console.error(e);
        },
      });
    }

    setTimeout(() => {
      this.cartService.dropCartActive$.next(false);
    });

    this.route.queryParams.subscribe((query) => {
      if (query['status']) this.showRejectedMsg(query);
      const paymentMethod = query['paymentMethod'];
      if (paymentMethod === PaymentMethodType.MERCADOPAGO) {
        this.manejarAlertaMercadoPago(query);
      }
    });

    // hilo para escuchar el close del modal
    this.paymentMethodService.closemodal$.subscribe((r) => {
      if (r) {
        this.modalRef.hide();
        this.paymentMethodActive = null;
      }
    });

    this.paymentMethodService.banco$.subscribe((r) => {
      this.paymentKhipu(r);
    });
    if (
      this.userSession?.userRole !== UserRoleType.SUPERVISOR &&
      this.userSession?.userRole !== UserRoleType.BUYER
    ) {
      this.gtmService.pushTag({
        event: 'payment',
        pagePath: window.location.href,
      });
    }
    if (!this.userSession?.businessLine && !this.guest) {
      this.obtenerGiros();
    }
  }

  private async updateReceive() {
    if (!this.cartSession) {
      return;
    }
    const shoppingCartId = this.cartSession._id!.toString();
    const receive = this.receiveStorageService.get();
    const shoppingCart = await firstValueFrom(
      this.cartService.updateReceive({
        shoppingCartId,
        receive: receive?.documentId
          ? {
              documentId: receive.documentId,
              firstName: receive.firstName ?? '',
              lastName: receive.lastName ?? '',
              phone: receive.phone ?? '',
            }
          : {},
      })
    );
    this.cartSession = shoppingCart;
  }

  private setDireccionOrTiendaRetiro() {
    // LOGICA PARA OBTENER DESPACHO A MOSTRAR
    if (!this.cartSession || !this.cartSession.shipment) {
      return;
    }
    const shipment = this.cartSession.shipment;
    switch (shipment && shipment.deliveryMode) {
      case 'TIENDA':
      case DeliveryType.PICKUP: //RETIRO EN TIENDA
        //se revisa si existe la informacion en el localstor  age desde el paso anterior
        this.tiendaRetiro = this.localS.get(StorageKey.tiendaRetiro);

        if (!this.tiendaRetiro && shipment) {
          //si no se encontró, se obtiene llamando a la api
          this.obtieneTiendaSegunRecid(shipment.addressId);
        }
        break;
      case 'EXP': //DESPACHO DOMICILIO
      case DeliveryType.DELIVERY:
      default:
        if (this.cartSession.customer?.documentId != '0') {
          //si está la informacion del cliente, se busca la direccion del usuario indicada en el despacho
          this.obtieneDireccionCliente();
          break;
        }
        if (this.guest) {
          //si es usuario invitado, se obtiene la direccion
          this.direccionDespacho.street = this.guest?.street ?? '';
          this.direccionDespacho.city = this.guest?.commune ?? '';
          this.direccionDespacho.number = this.guest?.number ?? '';
          break;
        }
        break;
    }
  }

  manejarAlertaMercadoPago(query: any) {
    const message = query.message;
    const reason = message;
    this.alertCartShow = true;
    this.alertCart = {
      detalleMensaje: `No se ha podido completar la transacción con Mercadopago debido a ${reason} del pago. Si el error persiste, por favor comunicate con soporte técnico.`,
      mostrarBotonVolverIntentar: true,
      proceso: 'Anulado',
    };
  }

  obtieneTiendaSegunRecid(recid: any) {
    this.geolocationApiService.getStores().subscribe({
      next: (data) => {
        this.tiendaRetiro = data.find(
          (x) => x.id.toString() === recid.toString()
        );
        if (this.tiendaRetiro) {
          this.localS.set(StorageKey.tiendaRetiro, this.tiendaRetiro);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          'Ha ocurrido un error en servicio al obtener las direccion de la tienda'
        );
      },
    });
  }

  obtieneDireccionCliente() {
    if (!this.cartSession?.shipment?.addressId) return;
    const currentCartDeliveryAddress =
      this.cartSession.shipment.addressId.toString();
    const { documentId } = this.sessionService.getSession();
    this.customerAddressService.getDeliveryAddresses(documentId).subscribe({
      next: (addresses) => {
        const cartDeliveryAddress = addresses.find(
          (address) => address.id === currentCartDeliveryAddress
        );
        if (cartDeliveryAddress) {
          this.direccionDespacho = cartDeliveryAddress;
        }
      },
      error: () => {
        this.toastr.error(
          'Ha ocurrido un error en servicio al obtener las direcciones'
        );
      },
    });
  }

  ngOnDestroy() {
    this.alertCartShow = false;
    this.alertCart = null;
    this.rejectedCode = null;
    this.btnWebpayPost = false;
    setTimeout(() => {
      this.cartService.dropCartActive$.next(false);
    });
    this.subscriptions.unsubscribe();
  }

  async setMethodPayment() {
    const documentId = this.sessionService.getSession().documentId ?? '';
    const username = this.sessionService.getSession().username ?? '';
    this.paymentMethodService.getPaymentMethods({ username }).subscribe({
      next: (data) => {
        const hasOC = data.some((r) => r.code === PaymentMethodType.OC);
        if (hasOC) {
          this.customerService.getCustomerBlocked(documentId).subscribe({
            next: (resp) => {
              if (resp.isBlocked) {
                this.bloqueoCliente = 'Línea de crédito bloqueada';
                this.clienteBloqueado = true;
                this.getBloqueoError = true;
                data = data.filter((r) => r.code !== 'OC');
              }
              this.paymentMethods = data;

              if (this.paymentMethods.length > 0)
                this.activepaymentMethod(this.paymentMethods[0]);
            },
            error: (e) => {
              console.error(e);
              this.bloqueoCliente = 'No pudo verificarse línea de crédito';
              this.clienteBloqueado = true;
              this.getBloqueoError = true;
              data = data.filter((r) => r.code !== 'OC');
              this.paymentMethods = data;

              if (this.paymentMethods.length > 0)
                this.activepaymentMethod(this.paymentMethods[0]);
            },
          });
        } else {
          this.paymentMethods = data;

          if (this.paymentMethods.length > 0)
            this.activepaymentMethod(this.paymentMethods[0]);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('No se pudo cargar los métodos de pago');
      },
    });
  }

  formOV() {
    this.formOv = this.fb.group({
      userRole: this.userSession?.userRole,
      shoppingCartId: this.cartSession._id!.toString(),
      file: [null],
      costCenter: [''],
      number: ['', Validators.required],
      amount: ['', Validators.required],
    });
  }

  // Funcion que se encarga de seleccionar el primer metodo de pago cuando existe un solo metodo y el formulario de invitado esta validado
  validForm() {
    if (this.paymentMethods.length == 1) {
      this.activepaymentMethod(this.paymentMethods[0]);
    }
  }

  onFileChange(event: any) {
    let files = event.target.files;
    if (files.length) {
      this.archivo = this.cargaArchivo(files[0]);
      if (isPlatformBrowser(this.platformId)) {
        this.renderer.setProperty(this.idArchivoInput, 'value', null);
        this.renderer.setProperty(this.idArchivoInputMobile, 'value', null);
      }
    }
  }

  cargaArchivo(file: File) {
    const partes = file.name.split('.');
    const extension = partes[partes.length - 1];
    const aux: Archivo = {
      archivo: file,
      nombre: file.name,
      icon: calculaIcono(extension),
      extension,
    };

    return aux;
  }

  eliminaArchivo() {
    this.archivo = null;
    // this.idArchivoMobile = null;
  }

  extensionValida(extension: string) {
    if (extension.toLowerCase() === 'pdf') {
      return true;
    } else {
      return false;
    }
  }

  Confirmar(event: IPaymentPurchaseOrder | null) {
    this.cd_ver = event ? true : false;
    this.loadingPage = event ? true : false;
    if (event) this.finishPaymentOv(event);
  }

  private async finishPaymentOv(
    paymentPurchaseOrder: IPaymentPurchaseOrder | null
  ): Promise<void> {
    if (!paymentPurchaseOrder) {
      return;
    }

    let params = {
      status: 'approved',
      paymentMethod: 'OC',
      shoppingCartId: this.cartSession._id!.toString(),
      shoppingCartNumber: this.cartSession.cartNumber,
    };

    this.cartService.load();

    this.purchaseOrderId = paymentPurchaseOrder._id.toString();
    if (!params.shoppingCartNumber) {
      params.shoppingCartNumber = paymentPurchaseOrder.shoppingCartNumber;
    }
    this.router.navigate(['/', 'carro-compra', 'gracias-por-tu-compra'], {
      queryParams: { ...params },
    });
  }

  /**
   * Generar cotización.
   */
  finishQuotation(): void {
    const shoppingCartId = this.cartSession._id!.toString();

    this.loadingPage = true;
    this.loadingText = 'Generando cotización...';

    this.cartService
      .generateQuotation({
        shoppingCartId,
      })
      .subscribe({
        next: (r) => {
          this.loadingPage = false;

          const number = r.shoppingCart.salesId;

          this.cartService.load();
          this.router.navigate([
            '/carro-compra/comprobante-de-cotizacion',
            number,
          ]);
        },
        error: (e) => {
          console.error(e);
          this.toastr.error('Ha ocurrido un error al generar la cotización');
        },
      });
  }

  //  Sube documento y genera la solicitud
  purchaseRequestAll() {
    this.loadingPage = true
    const data = this.formOv.value;
    data.file = this.archivo !== undefined ? this.archivo?.archivo : null;
    this.paymentMethodPurchaseOrderRequestService
      .upload(this.formOv.value)
      .subscribe({
        next: (r) => {
          this.purchaseOrderId = r._id.toString();
          this.purchaseRequest();
          this.archivo = null;
        },
        error: (e) => {
          console.error(e);
          this.toastr.error('No se pudo subir la orden de compra');
        },
      });
  }

  purchaseRequest() {
    this.loadingPage = true;
    this.loadingText = 'Generando solicitud de compra...';
    this.paymentMethodPurchaseOrderRequestService
      .requestApproval({
        shoppingCartId: this.cartSession._id!.toString(),
        salesDocumentType: DocumentType.SALES_ORDER,
      })
      .subscribe({
        next: () => {
          this.loadingPage = false;

          this.cartService.load();
          this.router.navigate([
            '/',
            'carro-compra',
            'comprobante-de-solicitud',
          ]);
        },
        error: (e) => {
          console.error(e);
          this.toastr.error('No se pudo generar solicitud de compra');
        },
      });
  }

  setDocumentType(type: string): void {
    this.documentType = type;
  }

  /**
   * Seleccionar pago.
   * @param item
   */
  activepaymentMethod(item: IPaymentMethod) {
    if (item.code === 'OC') {
      this.selectedDocument = InvoiceType.INVOICE;
    }
    this.paymentMethodActive = item.code;
    let active_khipu = false;

    if (!this.guest) {
      active_khipu = true;
    }

    if (this.formVisita.valid) {
      this.validado = true;

      // let invitado: any = this.localS.get('invitado');
      let invitado = this.guestStorage.get() as IGuest;
      invitado.documentId = this.getValidRutFormat(this.formVisita.value.rut);
      invitado.cartId = this.cartSession._id || '';
      invitado.deliveryType =
        this.cartSession.shipment?.deliveryMode === 'VEN- DPCLI' ||
        this.cartSession.shipment?.deliveryMode === DeliveryType.DELIVERY
          ? 'DES'
          : 'RC';
      this.guestStorage.remove();
      this.guestStorage.set(invitado);
      this.guest = this.guestStorage.get() as IGuest;
      active_khipu = true;
    }

    if (this.paymentMethodActive == 'khipu' && active_khipu) {
      this.openModal();
    }
  }

  getValidRutFormat(rut: string) {
    if (rut.indexOf('-') != -1) return rut.trim();

    let dv = rut.slice(rut.length - 1, rut.length);
    let strRut = rut.slice(0, rut.length - 1);

    return `${strRut}-${dv}`.trim();
  }

  formDefault() {
    this.formVisita = this.fb.group({
      rut: [
        ,
        [
          Validators.required,
          DocumentValidator.isValidDocumentId,
          Validators.minLength(6),
        ],
      ],
      nombre: [, Validators.required],
      apellido: [, Validators.required],
      telefono: [
        ,
        [
          Validators.required,
          Validators.pattern(/^[0-9]{8}$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ],
      ],
    });
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  openAbrirCentroCosto() {}

  /**
   * Actualiza carro.
   * + Si es invitado se guarda.
   */
  async prepararCarroPrePago(): Promise<void> {
    if (this.guest) {
      try {
        this.guest.documentId = this.getValidRutFormat(
          this.guest.documentId ?? ''
        );

        const isValidAddress =
          this.selectedDocument === InvoiceType.INVOICE &&
          this.formDireccion &&
          this.formDireccion.value &&
          this.formDireccion.value.calle &&
          this.formDireccion.value.numero &&
          this.formDireccion.value.comuna;
        if (isValidAddress) {
          this.guest.street = this.formDireccion.value.calle;
          this.guest.number = this.formDireccion.value.numero;
          this.guest.completeComune = this.formDireccion.value.comuna;
        }

        this.guest.businessLine = this.selectedGiro || '';

        const createGuestRequest: ICreateGuest = {
          email: this.guest.email ?? '',
          documentId: this.guest.documentId ?? '',
          documentType: environment.country.toUpperCase(),
          firstName: this.guest.firstName ?? '',
          lastName: this.guest.lastName ?? '',
          phone: this.guest.phone ?? '',
          address: {
            location: '',
            city: '',
            region: '',
            province: '',
            number: '',
            street: '',
            departmentOrHouse: '',
            reference: '',
            latitude: 0,
            longitude: 0,
          },
        };

        await firstValueFrom(
          this.customerService.createGuest(createGuestRequest)
        );

        let user: IGuest = this.guest;

        await firstValueFrom(
          this.cartService.saveTemp({
            shoppingCartId: user.cartId ? user.cartId.toString() : '',
            documentId: user.documentId,
            email: user.email,
          })
        );
        //* Esta informacion cambia el user
        // let userCambio = this.sessionService.getSession();
        // // let userCambio: any = this.root.getDataSesionUsuario();
        // //userCambio._id = user.email;
        // userCambio.email = user.email;
        // userCambio.userRole = UserRoleType.B2C;
        // userCambio.documentId = user.documentId;
        // userCambio.login_temp = true;
        // userCambio.firstName = this.formVisita.value.nombre || '';
        // userCambio.lastName = this.formVisita.value.apellido || '';
        // this.sessionStorage.set(userCambio);
        // // this.localS.set('usuario', userCambio);
      } catch (e) {
        console.error(e);
        this.toastr.error('No puedo guardarse los datos del invitado');

        throw e;
      }
    }
  }

  async showRejectedMsg(query: any) {
    this.alertCartShow = false;

    if (query.status === 'rejected') {
      const message = query.message;
      this.alertCart = {
        pagoValidado: false,
        detalleMensaje: message,
        mostrarBotonVolverIntentar: true,
      };
      this.alertCartShow = true;
    }
  }

  intentarPagoNuevamente() {
    this.alertCartShow = false;
    this.alertCart = null;
    this.rejectedCode = null;
    this.router.navigate(['/', 'carro-compra', 'forma-de-pago']);
  }

  async validarStockActual() {
    let consultaStock = await firstValueFrom(
      this.cartService.validateStock({
        shoppingCartId: this.cartSession._id!.toString(),
      })
    );
    if (consultaStock.stockProblem && consultaStock.stockProblemLines) {
      this.productosSinStock = consultaStock.stockProblemLines;
      this.renderer
        .selectRootElement(this.openModalButton.nativeElement)
        .click();
    }
    return consultaStock.stockProblem;
  }

  VolverPaginaCarro() {
    this.router.navigate(['/', 'carro-compra']);
  }

  openModal() {
    this.modalRef = this.modalService.show(this.content, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  openModalCentroCosto() {
    const modal = this.modalService.show(AgregarCentroCostoComponent, {
      backdrop: 'static',
      keyboard: false,
    });

    modal.content?.event.subscribe(async (res) => {
      //recargar el selec centro de costo
      const documentId = this.userSession?.documentId ?? '';
      const costCenter: ICostCenter = {
        code: res.codigo,
        name: res.nombre,
      };
      try {
        await firstValueFrom(
          this.customerCostCenterService.createCostCenter(
            costCenter,
            documentId
          )
        );
        this.centrosCosto = [...this.centrosCosto, costCenter];
        this.formOv.controls['costCenter'].setValue(costCenter.code);
        modal.hide();
      } catch (e) {
        console.error(e);
        this.toastr.error(
          (e as IError)?.message ?? 'No se pudo crear el centro de costo'
        );
        modal.hide();
      }
    });
  }

  async verificar_carro() {
    await this.cartService.load();
    this.cartSession = this.localS.get(StorageKey.carroCompraB2B);
    this.fechas_entregas = [];
    (this.cartSession.groups ?? []).forEach((item) => {
      this.fechas_entregas.push(item.shipment.requestedDate);
    });

    this.localS.set(StorageKey.fechas, this.fechas_entregas);
  }

  private updateCartAndUserTurn(): Promise<any> {
    const isValidAddress =
      this.selectedDocument === InvoiceType.INVOICE &&
      this.formDireccion &&
      this.formDireccion.value;
    const params = {
      shoppingCartId: this.cartSession._id!,
      street:
        isValidAddress && this.formDireccion.value.calle
          ? this.formDireccion.value.calle
          : null,
      number:
        isValidAddress && this.formDireccion.value.numero
          ? this.formDireccion.value.numero
          : null,
      city:
        isValidAddress && this.formDireccion.value.comuna
          ? this.formDireccion.value.comuna.split('@')[0]
          : null,
      invoiceType: this.selectedDocument,
      businessLine: this.selectedGiro || undefined,
    };
    return firstValueFrom(this.cartService.prepay(params));
  }

  /*********************************************************************
   * Métodos de pago
   *********************************************************************/
  /**
   * Continuar pago con Webpay.
   */
  async creteateTransactionTransBank() {
    try {
      if (this.btnWebpayPost) return;

      this.btnWebpayPost = true;
      this.paymentWebpayForm = true;

      if (await this.validarStockActual()) return;
      await this.verificar_carro();
      await this.updateCartAndUserTurn();
      await this.prepararCarroPrePago();

      this.paymentMethodService.redirectToWebpayTransaction({
        shoppingCartId: this.cartSession._id!.toString(),
      });
    } catch (err) {
      this.toastr.error('Ha ocurrido un error al gestionar el pago.');
      this.btnWebpayPost = false;
    }
  }

  /**
   * Continuar pago con MercadoPago.
   */
  async paymentMercadopago() {
    try {
      if (this.btnWebpayPost) {
        return;
      }

      this.btnWebpayPost = true;

      if (await this.validarStockActual()) return;
      await this.verificar_carro();
      await this.updateCartAndUserTurn();
      await this.prepararCarroPrePago();

      this.paymentMethodService.redirectToMercadoPagoTransaction({
        shoppingCartId: this.cartSession._id!.toString(),
      });
    } catch (err) {
      this.toastr.error('Ha ocurrido un error al gestionar el pago.');
      this.btnWebpayPost = false;
    }
  }

  /**
   * Continuar pago con Khipu.
   */
  async paymentKhipu(banco?: IKhipuBank) {
    try {
      this.localS.set(StorageKey.Metodo, PaymentMethodCodeType.KHIPU);
      this.localS.set(StorageKey.idCarro, this.cartSession._id);
      if (this.btnWebpayPost) {
        return;
      }
      this.loadkhipu = true;
      this.btnWebpayPost = true;
      if (await this.validarStockActual()) return;
      await this.verificar_carro();
      await this.updateCartAndUserTurn();
      await this.prepararCarroPrePago();

      this.loadkhipu = false;
      this.paymentMethodService.redirectToKhipuTransaction({
        shoppingCartId: this.cartSession._id!.toString(),
        bankId: banco ? banco.bankId : '',
        bankName: banco ? banco.name : '',
        payerName: this.userSession.email,
        payerEmail: this.userSession.email,
      });
    } catch (err) {
      this.toastr.error('Ha ocurrido un error al gestionar el pago.');
      this.loadkhipu = false;
      this.btnWebpayPost = false;
    }
  }

  /**
   * Continuar pago con XXX.
   */
  async paymentOv() {
    try {
      if (await this.validarStockActual()) return;

      if (
        this.archivo !== undefined &&
        !this.extensionValida(this.archivo?.extension || '')
      ) {
        this.toastr.error('Debe seleccionar un archivo de tipo PDF.');
        return;
      }
      await this.updateCartAndUserTurn();

      // guarda documento
      this.loadingPage = true;
      this.loadingText = 'Subiendo OC...';

      const data: any = this.formOv.value;
      data.file = this.archivo !== undefined ? this.archivo?.archivo : null;

      this.paymentMethodPurchaseOrderRequestService
        .upload(this.formOv.value)
        .subscribe({
          next: async (r) => {
            this.purchaseOrderId = r._id.toString();
            await this.updateCartAndUserTurn();
            await this.prepararCarroPrePago();
            await this.finishPaymentOv(r);
            // aqui se pone el cambio para la mensajeria
            this.archivo = null;
            this.loadingPage = false;
          },
          error: (e) => {
            console.error(e);
            this.toastr.error('No se pudo subir la orden de compra');
          },
        });
    } catch (err) {
      this.toastr.error('Ha ocurrido un error al gestionar el pago.');
      this.loadingPage = false;
    }
  }

  /**
   * Continuar pago con XXX.
   * - habilitar funcion mundo buses.
   */
  async paymentOvSms() {
    try {
      if (await this.validarStockActual()) return;

      if (
        this.archivo !== undefined &&
        !this.extensionValida(this.archivo?.extension || '')
      ) {
        this.toastr.error('Debe seleccionar un archivo de tipo PDF.');
        return;
      }

      // guarda documento
      this.loadingPage = true;
      this.loadingText = 'Subiendo OC...';
      this.cd_ver = false;
      let data: any = this.formOv.value;
      data.file = this.archivo !== undefined ? this.archivo?.archivo : null;
      if (this.userSession.creditLine) {
        if (
          this.totalCarro >= this.userSession.creditLine.fromAmount &&
          (this.totalCarro < this.userSession.creditLine.toAmount ||
            this.userSession.creditLine.toAmount == -1)
        ) {
          data.credito = true;
        } else {
          data.credito = false;
        }
        this.cd_ver = true;
      }

      data.file = this.archivo !== undefined ? this.archivo?.archivo : null;
      this.paymentMethodPurchaseOrderRequestService.upload(data).subscribe({
        next: (r) => {
          this.purchaseOrderId = r._id.toString();
          if (!data.credito) {
            this.purchaseRequest();
          }
          this.archivo = null;
        },
        error: (e) => {
          console.error(e);
          this.toastr.error('No se pudo subir la orden de compra');
        },
      });

      this.loadingPage = false;
    } catch (err) {
      this.toastr.error('Ha ocurrido un error al gestionar el pago.');
      this.loadingPage = false;
    }
  }

  /*********************************************************************
   * Dirección
   *********************************************************************/
  cities!: ICity[];
  localidades!: any[];
  formDireccion!: FormGroup;
  tienda!: DireccionMap | null;
  coleccionComuna!: any[];
  autocompletado = true;
  loadingForm = false;

  buildForm() {
    this.formDireccion = this.fb.group({
      calle: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
      depto: new FormControl(null),
      numero: new FormControl(null),
      comuna: new FormControl(null, { validators: [Validators.required] }),
      localizacion: new FormControl(null, {
        validators: [Validators.required],
      }),
      latitud: new FormControl(null),
      longitud: new FormControl(null),
      referencia: new FormControl(null),
    });
  }

  getAddress(address_components: any[], tipo: string): string {
    let value = '';
    address_components.forEach((element) => {
      if (element.types[0] == tipo) {
        value = element.long_name;
        return;
      }
    });
    return value;
  }

  setAddress(data: any[]): void {
    this.clearAddress();
    if (this.getAddress(data[0], 'street_number')) {
      this.formDireccion.controls['calle'].enable();

      if (this.getAddress(data[0], 'locality')) {
        this.formDireccion.controls['comuna'].setValue(
          this.findCommune(this.getAddress(data[0], 'locality'))
        );
      } else {
        this.formDireccion.controls['comuna'].setValue(
          this.findCommune(
            this.getAddress(data[0], 'administrative_area_level_3')
          )
        );
      }
      this.formDireccion.controls['calle'].setValue(
        this.getAddress(data[0], 'route')
      );
      this.formDireccion.controls['numero'].setValue(
        this.getAddress(data[0], 'street_number')
      );
      this.formDireccion.controls['latitud'].setValue(data[1].lat);
      this.formDireccion.controls['longitud'].setValue(data[1].lng);

      this.cargarDireccion();
    }
  }

  cargarDireccion() {
    this.tienda = null;
    if (!this.formDireccion.valid) {
      return;
    }
    const { calle, numero, comuna, localizacion } = this.formDireccion.value;
    const comunaArr = comuna.split('@');

    this.tienda = {
      direccion: `${calle} ${numero}`,
      zona: `${comunaArr[0]} ${localizacion}`,
    };
  }

  obtenerLocalidades(event: any) {
    const localidades: any[] = [];
    const comunaArr = event.id.split('@');
    const comunas = this.cities.filter(
      (comuna) => comuna.city == comunaArr[0]
    );
    comunas.map((comuna) =>
      (comuna.localities as any[]).map((localidad) =>
        localidades.push(localidad)
      )
    );
    this.localidades = localidades;
  }

  /**
   * Obtener ciudades.
   */
  private getCities(): void {
    this.geolocationApiService.getCities().subscribe({
      next: (cities) => (this.cities = cities),
    });
  }

  findCommune(nombre: string) {
    if (!nombre) return '';
    nombre = this.quitarAcentos(nombre);

    var result = this.cities.find(
      (item) => this.quitarAcentos(item.city) === nombre
    );

    if (result && result.id) {
      this.obtenerLocalidades(result);
      this.findComunaLozalizacion(result.city);
      return result.id;
    } else {
      return '';
    }
    // } else {
    //   return '';
    // }
  }

  clearAddress(): void {
    this.formDireccion.setValue({
      calle: '',
      depto: '',
      numero: '',
      comuna: '',
      localizacion: '',
      referencia: '',
      latitud: '',
      longitud: '',
    });
  }

  quitarAcentos(cadena: string): string {
    // Definimos los caracteres que queremos eliminar
    var specialChars = '!@#$^&%*()+=-[]/{}|:<>?,.';

    // Los eliminamos todos
    for (var i = 0; i < specialChars.length; i++) {
      cadena = cadena.replace(new RegExp('\\' + specialChars[i], 'gi'), '');
    }

    // Lo queremos devolver limpio en minusculas
    cadena = cadena.toLowerCase();

    // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
    cadena = cadena.replace(/ /g, '_');

    // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
    cadena = cadena.replace(/á/gi, 'a');
    cadena = cadena.replace(/é/gi, 'e');
    cadena = cadena.replace(/í/gi, 'i');
    cadena = cadena.replace(/ó/gi, 'o');
    cadena = cadena.replace(/ú/gi, 'u');
    cadena = cadena.replace(/ñ/gi, 'n');

    return cadena;
  }

  findComunaLozalizacion(nombre: string) {
    if (nombre != '') {
      nombre = this.quitarAcentos(nombre);

      var result = this.localidades.find(
        (data) => this.quitarAcentos(data.localidad) === nombre
      );

      if (result && result.localidad) {
        this.formDireccion.controls['localizacion'].setValue(result.localidad);
      }
    }
  }

  geolocalizacion(event: any): void {
    this.formDireccion.controls['latitud'].setValue(event.lat);
    this.formDireccion.controls['longitud'].setValue(event.lng);
  }

  addAddress() {
    const dataSave = { ...this.formDireccion.value };
    const arr = dataSave.comuna.split('@');

    const direccion = {
      calle: dataSave.calle,
      comunaCompleta: dataSave.comuna,
      comuna: arr[0],
      numero: dataSave.numero,
      depto: dataSave.depto,
    };

    // let invitado: any = this.localS.get('invitado');
    let invitado = this.guestStorage.get() as IGuest;

    invitado.street = direccion.calle;
    invitado.commune = direccion.comuna;
    invitado.completeComune = direccion.comunaCompleta;
    invitado.number = direccion.numero;
    invitado.department = direccion.depto ? direccion.depto : 0;

    // this.localS.remove('invitado');
    this.guestStorage.remove();
    // this.localS.set('invitado', invitado);
    this.guestStorage.set(invitado);

    /*
    invitado.rut = this.getValidRutFormat(this.formVisita.value.rut);
    invitado.carro_id = this.cartSession._id;
    invitado.tipoEnvio = this.cartSession.despacho.codTipo === 'VEN- DPCLI' ? 'DES' : 'RC';*/
    // this.invitado = this.localS.get('invitado');
    this.guest = this.guestStorage.get() as IGuest;
  }
}
