// Angular
import { Injectable, inject } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
// Models
import {
  CategoryDetail,
  IArticleResponse,
} from '@core/models-v2/article/article-response.interface';
import { IGtagData } from '@core/models-v2/cart/gtag-data.interface';
import {
  IShoppingCart,
  IShoppingCartProduct,
} from '@core/models-v2/cart/shopping-cart.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { IProductCart } from 'src/app/modules/cart/page/page-cart/product-cart.interface';
import { IProductGtm } from './product-gtm.interface';
import { CartTagService } from '@core/services-v2/cart-tag.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  private readonly cartTagService: CartTagService = inject(CartTagService);
  /**
   * Este evento significa que se mostró parte del contenido al usuario. Usa este evento para descubrir los artículos más populares vistos.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   * @param product
   */
  viewItem(dataLayer: any, product: IArticleResponse): void {
    const { firstCategory, secondCategory, thirdCategory } =
      this.formatCategories(product.categories);

    dataLayer.push({
      event: 'view_item',
      currency: 'CLP',
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
      this.formatGtmProduct(product)
    );
    const total = products.reduce(
      (acc, el) => acc + el.ProductCart.price * el.ProductCart.quantity,
      0
    );
    dataLayer.push({
      event: 'view_cart',
      currency: 'CLP',
      value: total,
      items: gtmProducts,
    });
  }

  /**
   * Este evento indica que un usuario compra uno o más artículos.
   * @param dataLayer
   */
  purchase(dataLayer: any, shoppingCart: IShoppingCart): void {
    if (!shoppingCart._id) return;

    const { products, total, tax } = shoppingCart.products.reduce(
      (acc, el) => {
        const netPrice = Math.round(
          el.price / (1 + (el.iva || environment.IVA))
        );
        const tax = Math.round(el.price - netPrice);
        const gtmProduct = this.formatGtmProduct(el);
        acc.products.push(gtmProduct);
        acc.total += netPrice * el.quantity;
        acc.tax += tax * el.quantity;
        return acc;
      },
      { products: [] as IProductGtm[], total: 0, tax: 0 }
    );

    const shipping = shoppingCart.groups
      ? shoppingCart.groups?.reduce(
          (acc, el) => acc + (el.shipment.price - el.shipment.discount),
          0
        )
      : (shoppingCart.shipment?.price || 0) -
        (shoppingCart.shipment?.discount || 0);

    const obje = {
      event: 'purchase',
      currency: 'CLP',
      value: total,
      transaction_id: shoppingCart.cartNumber,
      shipping,
      tax,
      items: products,
    };
    console.log('formatted: ', obje);
    dataLayer.push(obje);
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
  beginCheckout(dataLayer: any) {}

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
      this.formatCategories(product.categories || []);

    dataLayer.push({
      event: 'add_to_cart',
      currency: 'CLP',
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
    });
  }

  /**
   * Este evento significa que se quitó un artículo del carrito.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   */
  removeFromCart(dataLayer: any, product: IShoppingCartProduct): void {
    const gtmProduct = this.formatGtmProduct(product);
    dataLayer.push({
      event: 'remove_from_cart',
      currency: 'CLP',
      value: product.quantity * product.price,
      items: [gtmProduct],
    });
  }

  /**
   * Formatear categorías para gtm.
   * @param categories
   * @returns
   */
  private formatCategories(categories: CategoryDetail[]): {
    firstCategory: string;
    secondCategory: string;
    thirdCategory: string;
  } {
    return categories.reduce(
      (acc, el) => {
        if (el.level === 1) acc.firstCategory = el.name || '';
        else if (el.level === 2) acc.secondCategory = el.name || '';
        else if (el.level === 3) acc.thirdCategory = el.name || '';
        return acc;
      },
      { firstCategory: '', secondCategory: '', thirdCategory: '' }
    );
  }

  /**
   * Formatear producto para gtm.
   * @param product
   * @returns
   */
  formatGtmProduct(product: IShoppingCartProduct): IProductGtm {
    /*const netPrice = Math.round(
      product.price / (1 + (product.iva || environment.IVA))
    );*/
    return {
      item_id: product.sku,
      item_name: product.name,
      discount:
        product.commonPrice &&
        product.price &&
        product.commonPrice > product.price
          ? product.commonPrice - product.price
          : /* Math.round((el.commonPrice - el.price) / (1 + (el.iva || environment.IVA))*/
            0,
      item_brand: product.brand || 'IMPLEMENTOS',
      item_category: '',
      item_category2: '',
      item_category3: '',
      location_id: '',
      price: product.price, //netPrice
      quantity: product.quantity,
    };
  }
}
