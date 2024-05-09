// Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Libs
import { BsModalService } from 'ngx-bootstrap/modal';
// Rxjs
import { firstValueFrom } from 'rxjs';
// Models
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import {
  IShoppingCart,
  IShoppingCartProduct,
} from '@core/models-v2/cart/shopping-cart.interface';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { IPaymentMethod } from '@core/models-v2/payment-method/payment-method.interface';
import { ShoppingCartStatusType } from '@core/enums/shopping-cart-status.enum';
// Services
import { PaymentMethodOmniService } from '@core/services-v2/payment-method-omni.service';
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-page-omni-cart-payment-method',
  templateUrl: './page-omni-cart-payment-method.component.html',
  styleUrls: ['./page-omni-cart-payment-method.component.scss'],
})
export class PageOmniCartPaymentMethodComponent implements OnInit {
  @ViewChild('bankmodal', { static: false }) content: any;

  shoppingCartId: string | undefined;
  shoppingCart!: IShoppingCart;

  shippingType: string = '';
  productCart: IShoppingCartProduct[] = [];
  isLoadingCart!: boolean;
  isInvalidPaymentLink!: boolean;
  direccion: ICustomerAddress | IStore | undefined = undefined;
  selectedPaymentMethod: IPaymentMethod | undefined;
  transBankToken: any = null;
  alertCart: any;
  alertCartShow = false;
  rejectedCode!: number;

  totalCarro: any = '0';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private readonly cartService: CartService,
    private readonly paymentMethodOmniService: PaymentMethodOmniService
  ) {
    this.isLoadingCart = true;
    this.isInvalidPaymentLink = false;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.shoppingCartId = params['cart_id'] || params['shoppingCartId'];
      if (this.shoppingCartId) {
        await this.loadData(this.shoppingCartId);
      } else {
        this.isInvalidPaymentLink = true;
      }
    });

    this.cartService.total$.subscribe((r) => (this.totalCarro = r));
    this.paymentMethodOmniService.banco$.subscribe((r) => {
      this.paymentKhipu(r);
    });

    this.route.queryParams.subscribe((query) => {
      if (query['status']) {
        this.showRejectedMsg(query);
      }
      // if (query.site_id === 'MLC' && query.external_reference) this.manejarAlertaMercadoPagoSiEsNecesario(query);
    });
  }

  async loadData(shoppingCartId: string) {
    try {
      const resp = await firstValueFrom(
        this.cartService.getOmniShoppingCart(shoppingCartId)
      );
      this.shoppingCart = resp.shoppingCart;
      if (this.shoppingCart.status === ShoppingCartStatusType.OPEN) {
        this.shippingType = this.shoppingCart.shipment?.deliveryMode ?? '';
        this.productCart = this.shoppingCart.products;
        console.log('products: ', this.shoppingCart.products);
        this.setDireccion(this.shoppingCart);
        await this.cartService.loadOmni(shoppingCartId);
        this.isLoadingCart = false;
        this.isInvalidPaymentLink = false;
      } else {
        this.isLoadingCart = false;
        this.isInvalidPaymentLink = true;
      }
    } catch (e) {
      console.error(e);
      this.isLoadingCart = false;
      this.isInvalidPaymentLink = true;
    }
  }

  /*fetchShoppinCart(shoppingCartId: string): void {
    this.cartService.getOmniShoppingCart(shoppingCartId).subscribe({
      next: (res) => {
        this.shoppingCart = res.shoppingCart;
        if (this.shoppingCart.status === ShoppingCartStatusType.OPEN) {
          this.shippingType = this.shoppingCart.shipment?.deliveryMode ?? '';
          this.productCart = this.shoppingCart.products; 
          this.setDireccion(this.shoppingCart);
          // TODO: refactorizar este método.
          await this.cartService.loadOmni(this.shoppingCartId);
          this.isLoadingCart = false;
        } else {
          this.isLoadingCart = false;
          this.linkNoValido = true;
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoadingCart = false;
        this.linkNoValido = true;
      },
    });
  }*/

  setDireccion(shoppingCart: IShoppingCart): void {
    const shipment = shoppingCart.shipment;
    this.direccion = {
      address: shipment?.address ?? '',
      city: '',
      country: '',
      departmentHouse: '',
      id: shipment?.addressId ?? '',
      lat: '',
      lng: '',
      location: '',
      number: '',
      province: '',
      reference: '',
      region: '',
      street: '',
      type: '',
      typeCode: 0,
    };
  }

  /**
   * Seleccionar método de pago.
   * @param paymentMethod
   */
  selectPaymentMethod(paymentMethod: IPaymentMethod): void {
    this.selectedPaymentMethod = paymentMethod;
  }

  /**
   * Redirigir a la pasarela de pago.
   */
  goToPaymentGateway(shoppingCartId: string): void {
    if (this.selectedPaymentMethod?.code == 'mercadopago') {
      this.paymentMethodOmniService.redirectToMercadoPagoTransaction({
        shoppingCartId,
      });
    } else if (this.selectedPaymentMethod?.code == 'webPay') {
      this.paymentMethodOmniService.redirectToWebpayTransaction({
        shoppingCartId,
      });
    } else if (this.selectedPaymentMethod?.code == 'khipu') {
      this.modalService.show(this.content, {
        backdrop: 'static',
        keyboard: false,
      });
    }
  }

  //proceso khipu
  private paymentKhipu(banco: any): void {
    this.paymentMethodOmniService.redirectToKhipuTransaction({
      shoppingCartId: this.shoppingCart._id!.toString(),
      bankId: banco ? banco.bankId : '',
      bankName: banco ? banco.name : '',
      payerName: this.shoppingCart.notification?.email ?? undefined,
      payerEmail: this.shoppingCart.notification?.email ?? undefined,
    });
  }

  private showRejectedMsg(query: any): void {
    this.alertCartShow = false;

    if (query.status === 'rejected') {
      this.rejectedCode = query.codRejected;
      this.alertCart = {
        pagoValidado: false,
        detalleMensaje: query.message,
        mostrarBotonVolverIntentar: true,
      };
      this.alertCartShow = true;
    }
  }

  intentarPagoNuevamente(): void {
    this.alertCartShow = false;
    this.alertCart = null;
    this.rejectedCode = 0;
    this.router.navigate(['/', 'carro-compra', 'omni-forma-de-pago'], {
      queryParams: { cart_id: this.shoppingCartId },
    });
  }
}
