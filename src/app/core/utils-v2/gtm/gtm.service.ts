// Angular
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
// Models
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { IGtagData } from '@core/models-v2/cart/gtag-data.interface';
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { IProductCart } from 'src/app/modules/cart/page/page-cart/product-cart.interface';

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  /**
   * Este evento significa que se mostró parte del contenido al usuario. Usa este evento para descubrir los artículos más populares vistos.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   * @param product
   */
  viewItem(dataLayer: any, product: IArticleResponse): void {
    const { firstCategory, secondCategory, thirdCategory } =
      product.categories.reduce(
        (acc, el) => {
          if (el.level === 1) acc.firstCategory = el.name || '';
          else if (el.level === 2) acc.secondCategory = el.name || '';
          else if (el.level === 3) acc.thirdCategory = el.name || '';
          return acc;
        },
        { firstCategory: '', secondCategory: '', thirdCategory: '' }
      );

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
    const gtmProducts = products.map(({ ProductCart: product }) => {
      return {
        item_id: product.sku,
        item_name: product.name,
        discount:
          product.commonPrice &&
          product.price &&
          product.commonPrice > product.price
            ? product.commonPrice - product.price
            : 0,
        item_brand: product.brand,
        item_category: '',
        item_category2: '',
        item_category3: '',
        location_id: '',
        price: product.price,
        quantity: product.quantity,
      };
    });
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
  purchase(dataLayer: any, purchase: IGtagData) {
    console.log('gtmPurchase: ', purchase);
    const data = purchase.purchase;
    const transactionDetail = data.actionField;
    dataLayer.push({
      event: 'purchase',
      currency: 'CLP',
      value: transactionDetail.revenue,
      transaction_id: transactionDetail.id,
      shipping: transactionDetail.shipping,
      tax: transactionDetail.tax,
      items: data.products.map((product) => ({
        item_id: product.id,
        item_name: product.name,
        //discount: product.,
        item_brand: product.brand,
        item_category: product.category,
        //item_category2: '',
        //item_category3: '',
        price: product.price,
        quantity: product.quantity,
      })),
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
  addToCart(dataLayer: any, product: Partial<IArticleResponse>) {
    console.log('addToCart: ', product);

    const { firstCategory, secondCategory, thirdCategory } = (
      product.categories || []
    ).reduce(
      (acc, el) => {
        if (el.level === 1) acc.firstCategory = el.name || '';
        else if (el.level === 2) acc.secondCategory = el.name || '';
        else if (el.level === 3) acc.thirdCategory = el.name || '';
        return acc;
      },
      { firstCategory: '', secondCategory: '', thirdCategory: '' }
    );

    dataLayer.push({
      event: 'add_to_cart',
      currency: 'CLP',
      value: product.priceInfo?.customerPrice,
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
          quantity: 1,
        },
      ],
    });
  }

  /**
   * Este evento significa que se quitó un artículo del carrito.
   * TODO: pendiente enviar categorías y obtener location_id.
   * @param dataLayer
   */
  removeFromCart(dataLayer: any, product: IShoppingCartProduct) {
    console.log('check: ', product);
    dataLayer.push({
      event: 'remove_from_cart',
      currency: 'CLP',
      value: product.quantity * product.price,
      items: [
        {
          item_id: product.sku,
          item_name: product.name,
          discount:
            product.commonPrice &&
            product.price &&
            product.commonPrice > product.price
              ? product.commonPrice - product.price
              : 0,
          item_brand: product.brand,
          item_category: '',
          item_category2: '',
          item_category3: '',
          location_id: '',
          price: product.price,
          quantity: product.quantity,
        },
      ],
    });
  }
}
