/**
 * Google Tag Manager Service
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events?hl=es-419&client_type=gtag#add_to_cart
 */

// Angular
import { Injectable, inject } from '@angular/core';
// Services
import { CartTagService } from '@core/services-v2/cart-tag.service';
import { GtmUtils } from './gtm-utils.service';
import { ConfigService } from '@core/config/config.service';
// Models
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import {
  IShoppingCart,
  IShoppingCartProduct,
} from '@core/models-v2/cart/shopping-cart.interface';
import { IProductCart } from 'src/app/modules/cart/page/page-cart/product-cart.interface';
import { GtmEvent } from './gtm-events.enum';

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  private readonly cartTagService: CartTagService = inject(CartTagService);
  private readonly configService: ConfigService = inject(ConfigService);

  currency!: string;

  constructor() {
    const config = this.configService.getConfig();
    this.currency = config.googleTagManager.currency;
  }

  /**
   * Este evento significa que se mostró parte del contenido al usuario. Usa este evento para descubrir los artículos más populares vistos.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   * @param product
   */
  viewItem(dataLayer: any, product: IArticleResponse): void {
    const { firstCategory, secondCategory, thirdCategory } =
      GtmUtils.formatCategories(product.categories);

    dataLayer.push({
      event: GtmEvent.VIEW_ITEM,
      ecommerce: {
        currency: this.currency,
        value: product.priceInfo.customerPrice,
        items: [
          {
            item_id: product.sku,
            item_name: product.name,
            discount: product.priceInfo.discount || 0,
            item_brand: product.brand,
            item_category: firstCategory,
            item_category2: secondCategory,
            item_category3: thirdCategory,
            location_id: '', // "ChIJIQBpAG2ahYAR_6128GcTUEo",
            price: product.priceInfo.customerPrice,
            quantity: 1,
          },
        ],
      },
    });
  }

  /**
   * Este evento significa que un usuario vio su carrito.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   * @param products
   */
  viewCart(dataLayer: any, products: IProductCart[]): void {
    const gtmProducts = products.map(({ ProductCart: product }) =>
      GtmUtils.formatGtmProduct(product)
    );
    const total = products.reduce(
      (acc, el) => acc + el.ProductCart.price * el.ProductCart.quantity,
      0
    );
    dataLayer.push({
      event: GtmEvent.VIEW_CART,
      ecommerce: {
        currency: this.currency,
        value: total,
        items: gtmProducts,
      },
    });
  }

  /**
   * Este evento indica que un usuario compra uno o más artículos.
   * @param dataLayer
   */
  purchase(dataLayer: any, shoppingCart: IShoppingCart): void {
    if (!shoppingCart._id) return;

    const { products, total, tax, shipping } =
      GtmUtils.formatGtmCart(shoppingCart);

    dataLayer.push({
      event: GtmEvent.PURCHASE,
      ecommerce: {
        currency: this.currency,
        value: total,
        transaction_id: shoppingCart.cartNumber,
        shipping,
        tax,
        items: products,
      },
    });

    this.cartTagService
      .markGtag({
        shoppingCartId: shoppingCart._id?.toString() || '',
      })
      .subscribe({
        error: (e) => console.error(e),
      });
  }

  /**
   * Este evento significa que un usuario comenzó una confirmación de la compra.
   * @param dataLayer
   */
  beginCheckout(dataLayer: any, shoppingCart: IShoppingCart) {
    if (!shoppingCart._id) return;

    const { products, total } = GtmUtils.formatGtmCart(shoppingCart);
    dataLayer.push({
      event: GtmEvent.BEGIN_CHECKOUT,
      ecommerce: {
        currency: this.currency,
        value: total,
        items: products,
      },
    });
  }

  /**
   * Este evento significa que un artículo se agregó al carrito para su compra.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   */
  addToCart(
    dataLayer: any,
    product: Partial<IArticleResponse>,
    quantity: number = 1
  ) {
    const { firstCategory, secondCategory, thirdCategory } =
      GtmUtils.formatCategories(product.categories || []);

    dataLayer.push({
      event: GtmEvent.ADD_TO_CART,
      ecommerce: {
        currency: this.currency,
        value: product.priceInfo?.customerPrice
          ? quantity * product.priceInfo?.customerPrice
          : 0,
        items: [
          {
            item_id: product.sku,
            item_name: product.name,
            discount: product.priceInfo?.discount || 0,
            item_brand: product.brand,
            item_category: firstCategory,
            item_category2: secondCategory,
            item_category3: thirdCategory,
            location_id: '',
            price: product.priceInfo?.customerPrice,
            quantity,
          },
        ],
      },
    });
  }

  /**
   * Este evento significa que se quitó un artículo del carrito.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   */
  removeFromCart(dataLayer: any, product: IShoppingCartProduct): void {
    const gtmProduct = GtmUtils.formatGtmProduct(product);
    dataLayer.push({
      event: GtmEvent.REMOVE_FROM_CART,
      ecommerce: {
        currency: this.currency,
        value: product.quantity * product.price,
        items: [gtmProduct],
      },
    });
  }

  /**
   * Este evento significa que un usuario envió su información de envío en un proceso de confirmación de la compra de comercio electrónico
   */
  addShippingInfo(dataLayer: any, shoppingCart: IShoppingCart): void {
    if (!shoppingCart._id) return;

    const { products, total } = GtmUtils.formatGtmCart(shoppingCart);
    dataLayer.push({
      event: GtmEvent.ADD_SHIPPING_INFO,
      ecommerce: {
        currency: this.currency,
        value: total,
        shipping_tier: 'Ground',
        items: products,
      },
    });
  }

  /**
   * Este evento significa que un usuario envió su información de pago en un proceso de confirmación de la compra de comercio electrónico.
   * @param dataLayer
   * @param shoppingCart
   * @returns
   */
  addPaymentInfo({
    dataLayer,
    shoppingCart,
    paymentType,
    methodType,
  }: {
    dataLayer: any;
    shoppingCart: IShoppingCart;
    paymentType: string;
    methodType: string;
  }): void {
    if (!shoppingCart._id) return;

    const { products, total } = GtmUtils.formatGtmCart(shoppingCart);
    dataLayer.push({
      event: GtmEvent.ADD_PAYMENT_INFO,
      ecommerce: {
        currency: this.currency,
        value: total,
        payment_type: paymentType, // Debit Card , Bank Transfer, Credit line
        method_type: methodType,
        items: products,
      },
    });
  }
}
