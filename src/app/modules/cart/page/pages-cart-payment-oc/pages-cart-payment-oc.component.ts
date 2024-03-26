import {
  Component,
  OnInit,
  Inject,
  Input,
  ViewChild,
  TemplateRef,
  PLATFORM_ID,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductCart } from '../../../../shared/interfaces/cart-item';
import { RootService } from '../../../../shared/services/root.service';

import { ActivatedRoute, Router } from '@angular/router';
import { Banner } from '../../../../shared/interfaces/banner';
import { HostListener } from '@angular/core';
import { environment } from '@env/environment';
import { isVacio } from '../../../../shared/utils/utilidades';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { PaymentMethodPurchaseOrderRequestService } from '@core/services-v2/payment-method-purchase-order-request.service';
import { CartService } from '@core/services-v2/cart.service';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { firstValueFrom } from 'rxjs';
import {
  IShoppingCart,
  IShoppingCartProduct,
  IShoppingCartTripDate,
} from '@core/models-v2/cart/shopping-cart.interface';
import { DeliveryType } from '@core/enums/delivery-type.enum';
import { CustomerService } from '@core/services-v2/customer.service';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { ShoppingCartStatusType } from '@core/enums/shopping-cart-status.enum';
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { ITotals } from '@core/models-v2/cart/totals.interface';
import { ShippingService } from '@shared/interfaces/address';

@Component({
  selector: 'app-pages-cart-payment-oc',
  templateUrl: './pages-cart-payment-oc.component.html',
  styleUrls: ['./pages-cart-payment-oc.component.scss'],
})
export class PagesCartPaymentOcComponent implements OnInit {
  @ViewChild('modalRefuse', { static: false }) modalRefuse!: TemplateRef<any>;
  modalRefuseRef!: BsModalRef;

  cartSession!: IShoppingCart;
  items: IShoppingCartProduct[] = [];
  propietario = true;
  loadingPage = false;
  shippingType: string = '';
  fechas: ShippingService[][] = [];
  fecha_entrega: any = [];
  productCart: IShoppingCartProduct[] = [];
  productoDisponible: IShoppingCartProduct[] = [];
  fecha_actual = moment().startOf('day').toISOString();
  saveTimer: any;
  direccion?: ICustomerAddress | IStore;
  innerWidth: number;
  banners: Banner[] = [];
  verificar_oc = false;
  loadingText = '';
  IVA = environment.IVA;
  isVacio = isVacio;
  @Input() id: any;
  user!: ISession | null;
  usuario: IEcommerceUser[] = [];
  sinStock: boolean = false;
  isB2B!: boolean;
  addingToCart = false;
  total: ITotals = {
    subtotal: 0,
    iva: 0,
    shipment: 0,
    total: 0,
  };
  credito = false;
  shippingDaysStore: any = [];
  carouselOptions = {
    items: 5,
    nav: false,
    dots: true,
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    responsive: {
      1100: { items: 5 },
      920: { items: 5 },
      680: { items: 3 },
      500: { items: 2 },
      0: { items: 2 },
    },
  };
  usuarioTemp!: boolean;
  obsRefuse = '';

  purchaseOrderId!: string;
  showresumen = true;
  firstCharge: number = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  constructor(
    public root: RootService,
    private localS: LocalStorageService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionStorage: SessionStorageService,
    private readonly customerService: CustomerService,
    private readonly customerAddressService: CustomerAddressApiService,
    private readonly geolocationApiService: GeolocationApiService,
    public readonly cartService: CartService,
    private readonly paymentMethodPurchaseOrderRequestService: PaymentMethodPurchaseOrderRequestService
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.id = params['cart_id'] ? params['cart_id'] : params['cart-id'];
    this.user = this.sessionStorage.get();

    let consulta = await firstValueFrom(this.cartService.getOneById(this.id));

    this.cartSession = consulta.shoppingCart;
    this.total = consulta.totals;

    const status = this.cartSession.status ?? '';
    if (
      ![
        ShoppingCartStatusType.OPEN.toString(),
        ShoppingCartStatusType.PENDING.toString(),
      ].includes(status)
    ) {
      return;
    }

    await this.verificar_usuario();

    this.productCart = this.cartSession.products;
    this.shippingType =
      this.cartSession.shipment?.deliveryMode ?? DeliveryType.DELIVERY;
    await this.getDireccion();
    this.cartSession.products.map((producto) => {
      //asignando producto al carro
      producto.quantity = producto.quantity;
      this.items.push(producto);
    });
    (this.cartSession.groups ?? []).forEach((item) => {
      this.fecha_entrega.push(item.shipment.requestedDate);
    });
    this.verificar_fechas();
  }

  async getDireccion() {
    const documentId = this.cartSession.customer?.documentId ?? '';
    if (this.cartSession.shipment?.deliveryMode === DeliveryType.DELIVERY) {
      const addresses = await firstValueFrom(
        this.customerAddressService.getDeliveryAddresses(documentId)
      );
      if (addresses.length) {
        this.direccion = addresses.find(
          (item) => item.id == this.cartSession.shipment?.addressId
        );
      }
    } else {
      const stores = await firstValueFrom(
        this.geolocationApiService.getStores()
      );
      this.direccion = stores.find(
        (item) => item.code == this.cartSession.branchCode
      );
    }
  }

  async verificar_usuario() {
    if (!this.user?.login_temp) {
      const documetId = this.user?.documentId!;
      let consulta = await firstValueFrom(
        this.customerService.getSupervisors(documetId)
      );
      this.usuario = consulta.users.filter(
        (item) => item.username == this.user?.username
      );
      if (this.usuario.length == 0) {
        this.propietario = false;
        return;
      }

      if (this.usuario[0].creditLine) {
        if (
          this.total.total >= this.usuario[0].creditLine.fromAmount &&
          (this.total.total < this.usuario[0].creditLine.toAmount ||
            this.usuario[0].creditLine.toAmount === -1)
        ) {
          this.credito = false;
        } else {
          this.credito = true;
        }
      } else {
        this.credito = true;
      }
    } else {
      this.localS.set(StorageKey.ruta, [
        '/',
        'carro-compra',
        `confirmar-orden-oc`,
      ]);
      this.localS.set(StorageKey.queryParams, { cart_id: this.id });
      this.usuarioTemp = true;
    }
  }

  async validaLogin($event: any) {
    if ($event) {
      this.usuarioTemp = !$event;
      // this.user = this.localS.get('usuario');
      this.user = this.sessionStorage.get();
      await this.verificar_usuario();
    }
  }

  async aceptar_compra() {
    await this.confirmar(true);
    /*let formOv = {
      userRole: this.user?.userRole,
      shoppingCartId: this.cartSession._id,
      file: this.cartSession.ordenCompra.file,
      costCenter: this.cartSession.ordenCompra.centroCosto,
      number: this.cartSession.ordenCompra.folio,
      amount: this.cartSession.ordenCompra.monto,
      credit: true,
    };

    this.paymentMethodPurchaseOrderRequestService.upload(formOv).subscribe({
      next: (r) => {
        this.purchaseOrderId = r._id.toString();
        this.verificar_oc = true;
      },
      error: (e) => {
        console.error(e);
        this.toastr.error('No se pudo aceptar la orden de compra');
      }
    });*/
  }

  async confirmar(event: any) {
    this.verificar_oc = event;
    if (this.verificar_oc) await this.confirmar_compra();
  }

  async confirmar_compra() {
    this.loadingText = 'Confirmando orden de compra...';
    this.loadingPage = true;
    //modificar pasos

    try {
      const r = await firstValueFrom(
        this.paymentMethodPurchaseOrderRequestService.approve({
          shoppingCartId: this.cartSession._id!.toString(),
        })
      );

      this.purchaseOrderId = r._id.toString();
      this.loadingPage = false;

      let params = {
        status: 'approved',
        paymentMethod: 'OC',
        shoppingCartId: this.cartSession._id!.toString(),
        shoppingCartNumber: this.cartSession.cartNumber,
      };

      this.router.navigate(['/', 'carro-compra', 'gracias-por-tu-compra'], {
        queryParams: { ...params },
      });
    } catch (e) {
      console.error(e);
      this.toastr.error('No se pudo confirmar la orden de compra');
    }
  }

  agregar_lista(event: IShoppingCartProduct[]) {
    this.productoDisponible = event;
  }

  addList() {
    this.addingToCart = true;

    const listaResp = this.cartService.addLista(this.productoDisponible);
    if (listaResp) {
      listaResp.subscribe({
        next: () => {
          this.addingToCart = false;
          this.toastr.success('producto añadido para solicitar nueva compra');
        },
        error: (e) => {
          console.error(e);
        },
      });
    }
  }

  verificarOc(event: any) {
    this.sinStock = event;
  }

  verificar_fechas() {
    const groups = this.cartSession.groups ?? [];
    groups.forEach((item) => {});
  }

  Ver_fecha(event: any) {
    this.fechas = event;
    if (this.firstCharge === 0) this.showresumen = !this.showresumen;
    this.firstCharge++;
  }
  setSeleccionarEnvio(event: any, i: any) {
    if (this.cartSession && this.cartSession.groups) {
      this.cartSession.groups[i].shipment.requestedDate = event.fecha;
      this.fecha_entrega[i] = event.fecha;
    }
  }

  refuseOrder() {
    this.modalRefuseRef = this.modalService.show(this.modalRefuse);
  }

  confirmRefuseOrder() {
    const data = {
      shoppingCartId: this.cartSession._id!.toString(),
      observation: this.obsRefuse,
    };

    this.loadingPage = true;
    this.paymentMethodPurchaseOrderRequestService.reject(data).subscribe({
      next: (r) => {
        this.purchaseOrderId = r._id.toString();
        this.loadingPage = false;

        this.toastr.success('Solicitud rechazada correctamente');
        this.modalRefuseRef.hide();
        this.router.navigate(['/', 'inicio']);
      },
      error: (e) => {
        console.error(e);
        this.toastr.error(
          'Ha ocurrido un error al rechazar la orden de venta'
        );
      },
    });
  }
}
