// Angular
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Env
import { environment } from '@env/environment';
// Rxjs
import { catchError, map } from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  lastValueFrom,
} from 'rxjs';
// Models
import {
  ICartTotal,
  IShoppingCart,
  IShoppingCartGroup,
  IShoppingCartGuest,
  IShoppingCartProduct,
  IShoppingCartProductOrigin,
} from '@core/models-v2/cart/shopping-cart.interface';
import { ISession } from '@core/models-v2/auth/session.interface';
// Services
import { GeolocationServiceV2 } from './geolocation/geolocation.service';
import { SessionStorageService } from '@core/storage/session-storage.service';

import { DatePipe } from '@angular/common';
import { ShoppingCartStorageService } from '@core/storage/shopping-cart-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { ToastrService } from 'ngx-toastr';

import { GuestStorageService } from '@core/storage/guest-storage.service';
import { IGuest } from '@core/models-v2/storage/guest.interface';
import { ReceiveStorageService } from '@core/storage/receive-storage.service';
import { IReceive } from '@core/models-v2/storage/receive.interface';
import { PurshaseOrderLoadedStorageService } from '@core/storage/pruchase-order-loaded-storage.service';
import { IRemoveGroupRequest } from '@core/models-v2/requests/cart/remove-group.request';
import { ResponseApi } from '@shared/interfaces/response-api';
import { RootService } from '@shared/services/root.service';
import { IValidateShoppingCartStockResponse } from '@core/models-v2/cart/validate-stock-response.interface';
import { IShoppingCartDetail } from '@core/models-v2/cart/shopping-cart-detail.interface';
import { StorageKey } from '@core/storage/storage-keys.enum';
import { IThanksForYourPurchase } from '@core/models-v2/cart/thanks-for-your-purchase.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { AddNotificacionContactRequest } from '@core/models-v2/requests/cart/add-notification-contact.request';
import {
  GetLogisticPromiseRequest,
  SetLogisticPromiseRequest,
} from '@core/models-v2/requests/cart/logistic-promise-request';
import { GetLogisticPromiseResponse } from '@core/models-v2/responses/logistic-promise-responses';
import { TransferShoppingCartRequest } from '@core/models-v2/requests/cart/transfer-shopping-cart.request';
import { ShoppingCartOmniStorageService } from '@core/storage/shopping-cart-omni-storage.service';
import { DeliveryType } from '@core/enums/delivery-type.enum';
import { IProduct } from '@core/models-v2/oms/order.interface';
import { IOrderDetailResponse, IShoppingCartResponse } from '@core/models-v2/cart/order-details.interface';
import { UserRoleType } from '@core/enums/user-role-type.enum';
import { IUploadResponse } from '@core/models-v2/responses/file-upload.response';
import { LocalStorageService } from '@core/modules/local-storage/local-storage.service';
import { IComparedProduct } from './product/models/formatted-product-compare-response.interface';
import { DefaultBranch } from '@core/utils-v2/default-branch.service';

const API_CART = `${environment.apiEcommerce}/api/v1/shopping-cart`;

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private geolocationService = inject(GeolocationServiceV2);
  private sessionStorage = inject(SessionStorageService);
  private shoppingCartStorage = inject(ShoppingCartStorageService);
  private shoppingCartOmniStorage = inject(ShoppingCartOmniStorageService);
  private guestStorage = inject(GuestStorageService);
  private receiveStorage = inject(ReceiveStorageService);
  private purchaseOrderLoadedStorage = inject(
    PurshaseOrderLoadedStorageService
  );
  private sessionService = inject(SessionService);
  private datePipe = inject(DatePipe);
  private toastrServise = inject(ToastrService);
  private root = inject(RootService);
  private localS = inject(LocalStorageService);

  private data: IShoppingCart = {
    products: [],
    quantity: 0,
    subtotal: 0,
    totals: [],
    total: 0,
  };
  private CartData!: IShoppingCart;
  private cartTempData!: IShoppingCart;
  shipping!: ICartTotal | null;
  discount: ICartTotal | null = null;
  private shippingType!: string;
  private isLoadingCart!: boolean;

  private itemsSubject$: BehaviorSubject<IShoppingCartProduct[]> =
    new BehaviorSubject(this.data.products);
  private quantitySubject$: BehaviorSubject<number> = new BehaviorSubject(
    this.data.quantity
  );
  private subtotalSubject$: BehaviorSubject<number | undefined> =
    new BehaviorSubject(this.data.subtotal);
  private totalsSubject$: BehaviorSubject<ICartTotal[] | undefined> =
    new BehaviorSubject(this.data.totals);
  private totalSubject$: BehaviorSubject<number | undefined> =
    new BehaviorSubject(this.data.total);
  private onAddingSubject$: Subject<IShoppingCartProduct> = new Subject();
  private shippingTypeSubject$: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );
  private shippingValidateProductsSubject$: BehaviorSubject<[]> =
    new BehaviorSubject([]);
  private onAddingMovilButtonSubject$: Subject<IShoppingCartProduct | null> =
    new Subject();

  /* dropdown */
  public dropCartActive$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public cartDataSubject$: BehaviorSubject<IShoppingCart> =
    new BehaviorSubject(this.CartData);

  readonly items$: Observable<IShoppingCartProduct[] | undefined> =
    this.itemsSubject$.asObservable();
  readonly quantity$: Observable<number> =
    this.quantitySubject$.asObservable();
  readonly subtotal$: Observable<number | undefined> =
    this.subtotalSubject$.asObservable();
  readonly totals$: Observable<ICartTotal[] | undefined> =
    this.totalsSubject$.asObservable();
  readonly total$: Observable<number | undefined> =
    this.totalSubject$.asObservable();
  readonly onAdding$: Observable<IShoppingCartProduct> =
    this.onAddingSubject$.asObservable();
  readonly isDropCartActive$: Observable<any> =
    this.dropCartActive$.asObservable();
  readonly shippingType$: Observable<any> =
    this.shippingTypeSubject$.asObservable();
  readonly shippingValidateProducts$: Observable<any> =
    this.shippingValidateProductsSubject$.asObservable();
  readonly onAddingmovilButton$: Observable<IShoppingCartProduct | null> =
    this.onAddingMovilButtonSubject$.asObservable();

  /**
   * Añadir producto al carro de compras.
   * @param product
   * @param quantity
   * @returns
   */
  async add(
    product: IArticle | IProduct | IComparedProduct, // sku, name, origin, images, quantity
    quantity: number
  ): Promise<IShoppingCart | undefined> {
    const { code: storeCode } = this.geolocationService.getSelectedStore();
    const { username, email, documentId } = this.sessionService.getSession();

    const cart = this.shoppingCartStorage.get();
    const currentQuantity =
      (cart?.products || []).find((item) => item.sku === product.sku)
        ?.quantity || 0;

    let response;
    try {
      response = await lastValueFrom(
        this.http.post<IShoppingCart>(`${API_CART}/article`, {
          documentId,
          branch: storeCode,
          user: username || email,
          products: [
            {
              sku: product.sku,
              quantity: currentQuantity + quantity,
              origin: product.origin || null,
            },
          ],
        })
      );
      this.CartData = response;

      const productoCart: IShoppingCartProduct = {
        name: product.name,
        sku: product.sku,
        quantity: quantity,
        image: this.root.getUrlImagenMiniatura150(product),
        price: 0,
      };

      this.onAddingSubject$.next(productoCart);
      this.data.products = this.CartData.products;
      /* se limpia OV cargada */
      this.purchaseOrderLoadedStorage.remove();
      this.save();
      this.calc();
    } catch (error) {
      // console.log('error', JSON.stringify(error));
      this.data.products = [];
    }

    return response;
  }

  load(): void {
    if (this.isLoadingCart) return;

    this.isLoadingCart = true;
    const usuario = this.sessionStorage.get();
    if (!usuario) {
      return;
    }

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;
    if (!usuario.hasOwnProperty('documentId')) usuario.documentId = '0';

    // Sucursal
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = DefaultBranch.getBranchCode(tiendaSeleccionada.code);

    this.http
      .get<IShoppingCart>(
        `${API_CART}?user=${usuario.username}&branch=${sucursal}&documentId=${usuario.documentId}`
      )
      .subscribe({
        next: (response: IShoppingCart) => {
          this.recalculateShoppingCart(response);
        },
        error: (error: any) => {
          this.isLoadingCart = false;
          this.data.products = [];
          this.calc();
          this.save();
          // if (error.errorCode !== 'SHOPPING_CART_NOT_FOUND') {
          //   this.toastrServise.error(error.message);
          // }
        },
      });
  }

  recalculateShoppingCart(response: IShoppingCart) {
    this.isLoadingCart = false;
    const usuario = this.sessionStorage.get();
    if (!usuario) {
      return;
    }

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;
    if (!usuario.hasOwnProperty('documentId')) usuario.documentId = '0';


    this.CartData = response;
    this.cartTempData = response;
    this.cartDataSubject$.next(this.CartData);
    this.data.products = this.CartData.products;

    // obtenemos el despacho desde el carro
    const shipment = this.CartData.shipment;
    if (shipment) {
      let nombre = '';
      const isPickup =
        shipment.serviceType == 'TIENDA' ||
        shipment.deliveryMode === DeliveryType.PICKUP;
      const isDelivery =
        shipment.serviceType != 'TIENDA' ||
        shipment.deliveryMode === DeliveryType.DELIVERY;
      if (isPickup) {
        if (this.cartTempData.groups && this.cartTempData.groups.length > 1) {
          //ver quien tiene la mayor fecha para el despacho
          let temp: any[] = [];

          this.cartTempData.groups.forEach((item: IShoppingCartGroup) => {
            temp.push(item.shipment.requestedDate);
          });

          temp = temp.sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          );

          nombre =
            `Retiro en tienda ` +
            this.datePipe.transform(temp[0], 'EEEE dd MMM');
        } else {
          nombre =
            `Retiro en tienda ` +
            this.datePipe.transform(shipment.requestedDate, 'EEEE dd MMM');
        }

        this.updateShippingType('retiro');
      } else if (isDelivery) {
        if (this.cartTempData.groups && this.cartTempData.groups.length > 1) {
          //ver quien tiene la mayor fecha para el despacho
          let temp: any[] = [];
          this.cartTempData.groups.forEach((item: IShoppingCartGroup) => {
            temp.push(item.shipment.requestedDate);
          });

          temp = temp.sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          );

          nombre =
            `Despacho ` + this.datePipe.transform(temp[0], 'EEEE dd MMM');
          this.updateShippingType('despacho');
        } else {
          nombre =
            `Despacho ` +
            this.datePipe.transform(shipment.requestedDate, 'EEEE dd MMM');
          this.updateShippingType('despacho');
        }
      } else if (shipment.serviceType == '') {
        nombre = `Seleccione Fecha `;
      }

      let suma = 0;
      let array_precio: any = [];
      if (
        shipment.serviceType == 'STD' ||
        shipment.serviceType == 'TIENDA' ||
        shipment.serviceType == 'EXP'
      ) {
        this.cartTempData.groups?.forEach((item: IShoppingCartGroup) => {
          let precio: number = 0;
          suma = Number(suma + item.shipment.price);

          // calculando el total
          item.products.forEach((prod: IShoppingCartProduct) => {
            precio = Number(precio + prod.price * prod.quantity);
          });

          array_precio.push(precio);
        });
      }

      this.shipping = {
        price: suma,
        title: nombre,
        type: 'shipping',
      };

      // si existe descuento de despacho se agrega
      let descuento = 0;
      this.discount = null;
      let index = 0;
      this.cartTempData.groups?.forEach((item: IShoppingCartGroup) => {
        if (
          array_precio[index] >= 60000 ||
          (usuario.userRole != 'compradorb2c' &&
            usuario.userRole != 'temp' &&
            usuario.userRole != UserRoleType.BUYER)
        ) {
          descuento = descuento + item.shipment.discount;
        }

        index = index + 1;
      });

      if (
        descuento > 0 &&
        (shipment.serviceType == 'STD' ||
          shipment.serviceType == 'TIENDA' ||
          shipment.serviceType == 'EXP')
      ) {
        this.discount = {
          price: descuento * -1,
          title: 'Descuento Despacho',
          type: 'discount',
        };
      }
    }

    this.calc();
    this.save();
  }

  getOneById(id: string): Observable<IShoppingCartDetail> {
    const url = `${API_CART}/${id}`;
    return this.http.get<IShoppingCartDetail>(url);
  }

  addLista(
    products: IShoppingCartProduct[] | IProduct[]
  ): Observable<IShoppingCart> {
    // Sucursal
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;

    const cartSession = this.shoppingCartStorage.get();
    if (!cartSession) {
      // return;
      throw new Error('No se ha encontrado el carro');
    }
    let productoCarro;
    const productos: any[] = [];

    (products || []).forEach((producto) => {
      if (cartSession == null) {
        productoCarro = { quantity: 0 };
      } else {
        productoCarro = (cartSession.products || []).find(
          (item) => item.sku === producto.sku
        ) || { quantity: 0 };
      }

      productos.push({
        sku: producto.sku,
        quantity: (productoCarro.quantity || 0) + 1,
        origin: producto.origin || null,
      });
    });

    const usuario = this.sessionService.getSession();

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;

    const data = {
      user: usuario.username,
      documentId: usuario.documentId,
      branch: sucursal,
      products: productos,
    };

    return this.http.post<IShoppingCart>(`${API_CART}/article`, data).pipe(
      map((r) => {
        this.CartData = r;

        this.data.products = this.CartData.products;
        /* se limpia OV cargada */
        this.purchaseOrderLoadedStorage.remove();
        this.save();
        this.calc();

        return r;
      }),
      catchError((e) => {
        this.toastrServise.error(e.message);
        throw new Error(e.message);
      })
    );
  }

  logisticPromise(
    request: GetLogisticPromiseRequest
  ): Observable<GetLogisticPromiseResponse> {
    return this.http
      .post<GetLogisticPromiseResponse>(
        `${API_CART}/logistic-promise`,
        request
      )
      .pipe(
        map((r) => {
          this.CartData = r.shoppingCart;

          this.data.products = this.CartData.products;
          this.recalculateShoppingCart(this.CartData);
          /* se limpia OV cargada */
          this.save();
          this.calc();

          return r;
        }),
        catchError((e) => {
          throw new Error(e.message);
        })
      );
  }

  updateShippingType(type: any) {
    this.shippingTypeSubject$.next(type);
    this.shippingType = type;
    this.calc();
  }

  private save(): void {
    this.shoppingCartStorage.set(this.CartData);
  }

  updateShipping(indexGroup: number, indexTripDate: number) {
    // Sucursal

    const usuario: ISession = this.sessionService.getSession();

    const data: SetLogisticPromiseRequest = {
      user: usuario.username ? usuario.username : usuario.email,
      group: indexGroup,
      tripDate: indexTripDate,
    };

    return this.http
      .put<GetLogisticPromiseResponse>(`${API_CART}/group/trip-date`, data)
      .pipe(
        map((r) => {
          const shoppingCart = r.shoppingCart;
          this.recalculateShoppingCart(shoppingCart);
          return r;
        })
      );
  }

  calc(totalesFull = false): void {
    // let quantity = 0;
    let subtotal = 0;
    let totalNeto = 0;

    if (document.URL.indexOf('/carro-compra/resumen') > 0) {
      (this.data.products || []).forEach((item) => {
        if (totalesFull) {
          subtotal += (item.price || 0) * (item.quantity || 0);
        } else {
          subtotal += (item.price || 0) * (item.quantity || 0);
        }
      });
    } else {
      (this.data.products || []).forEach((item) => {
        if (totalesFull) {
          subtotal += (item.price || 0) * (item.quantity || 0);
        } else {
          if (this.shippingType === 'retiro') {
            if (!item.pickupConflict) {
              subtotal += (item.price || 0) * (item.quantity || 0);
            }
          } else {
            if (!item.deliveryConflict) {
              subtotal += (item.price || 0) * (item.quantity || 0);
            }
          }
        }
      });
    }

    const totals: ICartTotal[] = [];
    totalNeto = subtotal;
    subtotal = subtotal / 1.19;

    if (this.shipping !== undefined && this.shipping != null) {
      // if (!this.shipping.price) {
      //   this.shipping.price = 0;
      //   this.shipping.title = 'Seleccione Fecha ';
      // }
      totals.push(this.shipping);
    }

    if (this.discount != null && this.shipping != null) {
      if (this.shipping.price !== 0) {
        totals.push(this.discount);
      }
    }

    totals.push({
      title: 'IVA',
      price: totalNeto - subtotal,
      type: 'tax',
    });

    const total =
      subtotal +
      totals.reduce((acc, eachTotal) => acc + (eachTotal.price || 0), 0);
    this.data.quantity = this.data.products?.length || 0;
    this.data.subtotal = subtotal;
    this.data.totals = totals;
    this.data.total = total;

    this.itemsSubject$.next(this.data.products);
    this.quantitySubject$.next(this.data.quantity);
    this.subtotalSubject$.next(this.data.subtotal);
    this.totalsSubject$.next(this.data.totals);
    this.totalSubject$.next(this.data.total);
  }

  updateCart(items: IShoppingCartProduct[]) {
    this.CartData.products = items;
    this.calc();
    this.save();
  }

  saveCart(products: IShoppingCartProduct[]) {
    // Sucursal
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;
    const usuario = this.sessionService.getSession();

    if (!usuario.hasOwnProperty('username')) usuario.username = usuario.email;
    const data = {
      user: usuario.username,
      documentId: usuario.documentId,
      branch: sucursal,
      products,
    };

    return this.http.post<IShoppingCart>(`${API_CART}/article`, data).pipe(
      map((r) => {
        this.CartData.shipment = r.shipment;

        let nombre = '';
        if (
          this.CartData.shipment?.serviceType == 'TIENDA' ||
          this.CartData.shipment?.deliveryMode === DeliveryType.PICKUP
        ) {
          nombre =
            `Retiro en tienda ` +
            this.datePipe.transform(
              this.CartData.shipment?.requestedDate,
              'EEEE dd MMM'
            );
          this.updateShippingType('retiro');
        } else {
          nombre =
            `Despacho ` +
            this.datePipe.transform(
              this.CartData.shipment?.requestedDate,
              'EEEE dd MMM'
            );
          this.updateShippingType('despacho');
        }

        this.shipping = {
          price: this.CartData.shipment?.price,
          title: nombre,
          type: 'shipping',
        };
        return r;
      })
    );
  }

  setSaveCart(id: string | undefined, status: string): Observable<boolean> {
    const usuario = this.sessionStorage.get();
    if (usuario?.login_temp) {
      this.toastrServise.warning('Debe iniciar sesion para guardar el carro');
      throw Error('Debe iniciar sesion para guardar el carro');
    }

    return this.http.put<boolean>(
      `${API_CART}/${id}/status/${status}`,
      undefined
    );
  }

  setNotificationContact(id: string, data: AddNotificacionContactRequest) {
    return this.http.put(`${API_CART}/notification-contact/${id}`, data);
  }

  /**
   * Setear usuario invitado a un carro de compras.
   * @param user
   * @param data
   * @returns
   */
  setGuestUser(user: string, data: IShoppingCartGuest) {
    return this.http.put(`${API_CART}/guest/${user}`, data);
  }

  emitValidateProducts(products: any): void {
    this.shippingValidateProductsSubject$.next(products);
  }

  addTotalShipping(envio: ICartTotal) {
    this.shipping = envio;
    this.calc();
  }

  removeTotalShipping() {
    this.shipping = null;
    this.calc();
  }

  addTotaldiscount(envio: ICartTotal) {
    this.discount = envio;
    this.calc();
  }

  addProductfromMovilButton() {
    this.onAddingMovilButtonSubject$.next(null);
  }

  removeTotalDiscount() {
    this.discount = null;
    this.calc();
  }

  remove(item: IShoppingCartProduct): void {
    const carro: IShoppingCart =
      this.shoppingCartStorage.get() as IShoppingCart;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        sku: item.sku,
        user: carro.user,
        documentId: carro.customer?.documentId,
        branch: carro.branchCode,
      },
    };

    this.http.delete<IShoppingCart>(`${API_CART}/article`, options).subscribe({
      next: (r: IShoppingCart) => {
        this.CartData = r;

        this.data.products = this.CartData.products;
        /* se limpia OV cargada */
        this.purchaseOrderLoadedStorage.remove();
        this.save();
        this.calc();
        return r;
      },
      error: (error: any) => {
        console.log('error', JSON.stringify(error));
      },
    });
  }

  removeGroup(request: IRemoveGroupRequest): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: request,
    };
    return this.http.delete(`${API_CART}/group`, options).pipe(
      map((r: any) => {
        if (!r.error) {
          if (r.data == null) {
            this.CartData.products = [];
          } else {
            this.CartData = r.data;
          }

          this.data.products = this.CartData.products;
          /* se limpia OV cargada */
          this.purchaseOrderLoadedStorage.remove();
          this.save();
          this.calc();
        }

        return r;
      })
    );
  }

  transferShoppingCart(
    data: TransferShoppingCartRequest
  ): Observable<IShoppingCart> {
    return this.http.put<IShoppingCart>(`${API_CART}/transfer`, data);
  }

  getPriceArticle(params: {
    sku: string;
    branch: string;
    documentId: string;
  }) {
    return this.http.get(API_CART, {
      params,
    });
  }

  generaOrdenDeCompra(data: any): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(
      environment.apiShoppingCart + `generar`,
      data
    );
  }

  validateStock(params: {
    shoppingCartId: string;
  }): Observable<IValidateShoppingCartStockResponse> {
    return this.http.post<IValidateShoppingCartStockResponse>(
      `${API_CART}/validate-stock`,
      {
        shoppingCartId: params.shoppingCartId,
      }
    );
  }

  saveTemp(params: {
    shoppingCartId: string;
    documentId: string;
    email: string;
  }) {
    return this.http.post(`${API_CART}/save-temp`, {
      shoppingCartId: params.shoppingCartId,
      documentId: params.documentId,
      email: params.email,
    });
  }

  prepay(params: {
    shoppingCartId: string;
    invoiceType: string; // invoice, receipt
    street?: string;
    number?: string;
    city?: string;
    businessLine?: string;
  }) {
    return this.http.post(`${API_CART}/prepay`, {
      shoppingCartId: params.shoppingCartId,
      invoiceType: params.invoiceType,
      street: params.street,
      number: params.number,
      city: params.city,
      businessLine: params.businessLine,
    });
  }

  /**
   * @description Update thans for your purchase param
   * @param idCarro
   * Ejemplo de respuesta:
   * {
   *    "isFirstVisit": false,
   *    "shoppingCart": {...}
   * }
   */
  thanksForYourPurchase(params: {
    shoppingCartId: string;
  }): Observable<IThanksForYourPurchase> {
    const { shoppingCartId } = params;
    const url = `${API_CART}/${shoppingCartId}/thanksForYourPurchase`;
    return this.http.put<IThanksForYourPurchase>(url, undefined);
  }

  generateQuotation(params: {
    shoppingCartId: string;
  }): Observable<IShoppingCartDetail> {
    const { shoppingCartId } = params;
    const url = `${API_CART}/${shoppingCartId}/generate-quotation`;
    return this.http.post<IShoppingCartDetail>(url, undefined);
  }

  /*********************************
   * Inicio métodos OMNI
   *********************************/
  getOmniShoppingCart(
    shoppingCartId: string
  ): Observable<IShoppingCartDetail> {
    const url = `${API_CART}/${shoppingCartId}/omni`;
    return this.http.get<IShoppingCartDetail>(url);
  }

  async loadOmni(id: string) {
    this.isLoadingCart = false;

    if (this.isLoadingCart) return;

    this.isLoadingCart = true;

    const r = await firstValueFrom(this.getOmniShoppingCart(id));
    this.isLoadingCart = false;

    this.CartData = r.shoppingCart;
    this.cartTempData = r.shoppingCart;
    this.cartDataSubject$.next(this.CartData);
    if (r.shoppingCart.products && r.shoppingCart.products.length) {
      this.data.products = this.CartData.products;

      // obtenemos el despacho desde el carro
      const shipment = this.CartData.shipment;
      if (shipment) {
        let nombre = '';
        const isPickup =
          shipment.serviceType == 'TIENDA' ||
          shipment.deliveryMode === DeliveryType.PICKUP;
        const isDelivery =
          shipment.serviceType != 'TIENDA' ||
          shipment.deliveryMode === DeliveryType.DELIVERY;
        if (isPickup) {
          const groups = this.cartTempData.groups ?? [];
          if (groups.length > 1) {
            //ver quien tiene la mayor fecha para el despacho
            let temp: Date[] = [];

            groups.forEach((item) => {
              temp.push(item.shipment.requestedDate);
            });

            temp = (temp || []).sort(
              (a, b) => new Date(b).getTime() - new Date(a).getTime()
            );

            nombre =
              `Retiro en tienda ` +
              this.datePipe.transform(temp[0], 'EEEE dd MMM');
          } else {
            nombre =
              `Retiro en tienda ` +
              this.datePipe.transform(shipment.requestedDate, 'EEEE dd MMM');
          }

          this.updateShippingType('retiro');
        } else if (isDelivery) {
          const groups = this.cartTempData.groups ?? [];
          if (groups.length > 1) {
            //ver quien tiene la mayor fecha para el despacho
            let temp: Date[] = [];
            groups.forEach((item) => {
              temp.push(item.shipment.requestedDate);
            });

            temp = temp.sort(
              (a, b) => new Date(b).getTime() - new Date(a).getTime()
            );

            nombre =
              `Despacho ` + this.datePipe.transform(temp[0], 'EEEE dd MMM');
            this.updateShippingType('despacho');
          } else {
            nombre =
              `Despacho ` +
              this.datePipe.transform(shipment.requestedDate, 'EEEE dd MMM');
            this.updateShippingType('despacho');
          }
        } else if (shipment.deliveryMode == '') {
          nombre = `Seleccione Fecha `;
        }

        let suma = 0;
        let array_precio = [];
        if (
          shipment.serviceType == 'STD' ||
          shipment.serviceType == 'TIENDA' ||
          shipment.serviceType == 'EXP'
        ) {
          const groups = this.cartTempData.groups ?? [];
          groups.forEach((item) => {
            let precio: number = 0;
            suma = Number(suma + item.shipment.price);

            // calculando el total
            item.products.forEach((prod) => {
              precio = Number(precio + prod.price * prod.quantity);
            });

            array_precio.push(precio);
          });
        }

        this.shipping = {
          price: suma,
          title: nombre,
          type: 'shipping',
        };

        // si existe descuento de despacho se agrega
        let descuento = 0;
        this.discount = null;
        let index = 0;
        (this.cartTempData.groups ?? []).forEach((item) => {
          descuento = descuento + item.shipment.discount;

          index = index + 1;
        });

        if (
          descuento > 0 &&
          (shipment.serviceType == 'STD' ||
            shipment.serviceType == 'TIENDA' ||
            shipment.serviceType == 'EXP')
        ) {
          this.discount = {
            price: descuento * -1,
            title: 'Descuento Despacho',
            type: 'discount',
          };
        }
      }
    } else {
      this.data.products = [];
    }
    this.calc();
    this.saveOmni();
  }

  private saveOmni(): void {
    this.shoppingCartOmniStorage.set(this.CartData);
  }

  getOrderDetails(params: {
    user: string;
    salesDocumentType?: number;
    search?: string;
    statuses?: string[];
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<IOrderDetailResponse> {
    return this.http.get<IOrderDetailResponse>(`${API_CART}/order-details`, {
      params,
    });
  }

  quotationToOpenShoppingCart(salesId: string, user: string) {
    return this.http.put(`${API_CART}/quotationToOpenShoppingCart`, {
      salesId,
      user,
    });
  }

  updateStatusShoppingCart(id: string, status: string, observation: string) {
    return this.http.put(`${API_CART}/${id}/status/${status}`, {
      observation,
    });
  }

  updateReceive(params: {
    shoppingCartId: string;
    receive?: {
      documentId?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  }): Observable<IShoppingCart> {
    const { shoppingCartId } = params;
    return this.http.put<IShoppingCart>(
      `${API_CART}/${shoppingCartId}/receive`,
      {
        receive: params.receive,
      }
    );
  }

  uploadExcel(data: any): Observable<IUploadResponse> {
    const formData: FormData = new FormData();
    formData.append('username', data.username);
    formData.append('branch', data.branch);
    formData.append('documentId', data.documentId);
    formData.append('action', data.action);
    if (data.file) {
      formData.append('file', data.file);
    }
    return this.http.post<IUploadResponse>(
      `${API_CART}/upload-article-excel`,
      formData
    );
  }

  async setProducOrigin_cartDinamyc(product: any, tipoCat: string) {
    let catalogo: any = this.localS.get(StorageKey.catalogo);
    const origin: IShoppingCartProductOrigin = {
      origin: 'catalogo-dinamico',
      subOrigin: catalogo ? catalogo.nombre : '',
      section: tipoCat ? tipoCat : '',
      recommended: '',
      sheet: false,
      cyber: 0,
    };
    product.origin = origin;
    return product;
  }

  getAllOrderGenerated(params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }):Observable<IShoppingCartResponse>{
    // return this.http.get<IOrderDetailResponse>(`${API_CART}/all-order-details`, {
    //   params,
    // });
    return this.http.get<IShoppingCartResponse>(`http://localhost:3200/api/v1/shopping-cart/all-order-details`, {
      params,
    });
  }
}
